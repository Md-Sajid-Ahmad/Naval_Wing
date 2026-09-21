package com.example.bncc.ui.screens.attendance

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.bncc.data.model.AttendanceRecord
import com.example.bncc.data.model.Cadet
import com.example.bncc.data.repository.BNCCRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class AttendanceUiState(
    val selectedDate: String,
    val formattedDisplayDate: String,
    val cadets: List<Cadet> = emptyList(),
    val attendanceMap: Map<String, String> = emptyMap(), // cadetId -> status
    val presentCount: Int = 0,
    val absentCount: Int = 0,
    val lateCount: Int = 0,
    val excusedCount: Int = 0
)

@OptIn(ExperimentalCoroutinesApi::class)
class AttendanceViewModel(
    private val repository: BNCCRepository
) : ViewModel() {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    private val displayFormat = SimpleDateFormat("dd MMMM yyyy, EEEE", Locale.US)

    private val _currentCalendar = MutableStateFlow(Calendar.getInstance())
    private val _selectedDate = MutableStateFlow(dateFormat.format(Date()))

    val uiState: StateFlow<AttendanceUiState> = combine(
        repository.allCadets,
        _selectedDate.flatMapLatest { date -> repository.getAttendanceForDate(date) },
        _selectedDate
    ) { allCadets, records, date ->
        val activeCadets = allCadets.filter { it.status == "active" }
        val map = records.associate { it.cadetId to it.status }

        val pCount = records.count { it.status == "present" }
        val aCount = records.count { it.status == "absent" }
        val lCount = records.count { it.status == "late" }
        val eCount = records.count { it.status == "excused" }

        val parsedDate = runCatching { dateFormat.parse(date) }.getOrNull() ?: Date()
        val displayDate = displayFormat.format(parsedDate)

        AttendanceUiState(
            selectedDate = date,
            formattedDisplayDate = displayDate,
            cadets = activeCadets,
            attendanceMap = map,
            presentCount = pCount,
            absentCount = aCount,
            lateCount = lCount,
            excusedCount = eCount
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = AttendanceUiState(
            selectedDate = dateFormat.format(Date()),
            formattedDisplayDate = displayFormat.format(Date())
        )
    )

    fun previousDay() {
        val cal = _currentCalendar.value
        cal.add(Calendar.DAY_OF_YEAR, -1)
        _currentCalendar.value = cal
        _selectedDate.value = dateFormat.format(cal.time)
    }

    fun nextDay() {
        val cal = _currentCalendar.value
        cal.add(Calendar.DAY_OF_YEAR, 1)
        _currentCalendar.value = cal
        _selectedDate.value = dateFormat.format(cal.time)
    }

    fun goToToday() {
        val cal = Calendar.getInstance()
        _currentCalendar.value = cal
        _selectedDate.value = dateFormat.format(cal.time)
    }

    fun toggleStatus(cadetId: String, status: String) {
        val currentDate = _selectedDate.value
        val currentStatus = uiState.value.attendanceMap[cadetId]
        viewModelScope.launch {
            if (currentStatus == status) {
                // Tapping already active status clears it
                repository.clearAttendance(cadetId, currentDate)
            } else {
                repository.setAttendance(cadetId, currentDate, status)
            }
        }
    }

    fun markAllPresent() {
        val currentDate = _selectedDate.value
        val activeCadets = uiState.value.cadets
        viewModelScope.launch {
            activeCadets.forEach { cadet ->
                repository.setAttendance(cadet.id, currentDate, "present")
            }
        }
    }

    class Factory(private val repository: BNCCRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return AttendanceViewModel(repository) as T
        }
    }
}

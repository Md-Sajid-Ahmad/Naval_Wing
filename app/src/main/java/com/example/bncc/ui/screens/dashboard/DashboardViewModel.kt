package com.example.bncc.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.bncc.data.model.AttendanceRecord
import com.example.bncc.data.model.Cadet
import com.example.bncc.data.repository.BNCCRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class DashboardUiState(
    val greeting: String = "শুভ দিন, কমান্ডার",
    val formattedDate: String = "",
    val totalCadets: Int = 0,
    val activeCadetsCount: Int = 0,
    val batchCount: Int = 0,
    val rankCount: Int = 0,
    val dismissedCount: Int = 0,
    val todayPresentCount: Int = 0,
    val todayTotalRecorded: Int = 0,
    val recentCadets: List<Cadet> = emptyList()
)

class DashboardViewModel(
    private val repository: BNCCRepository
) : ViewModel() {

    private val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())

    val uiState: StateFlow<DashboardUiState> = combine(
        repository.allCadets,
        repository.getAttendanceForDate(today)
    ) { cadets, todayAttendance ->
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val greeting = when {
            hour in 5..11 -> "শুভ সকাল, কমান্ডার"
            hour in 12..16 -> "শুভ দুপুর, কমান্ডার"
            hour in 17..19 -> "শুভ অপরাহ্ন, কমান্ডার"
            else -> "শুভ সন্ধ্যা, কমান্ডার"
        }

        val dateFormat = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.US)
        val formattedDate = dateFormat.format(Date())

        val activeCadets = cadets.filter { it.status == "active" }
        val dismissedCadets = cadets.filter { it.status == "inactive" }
        val batches = activeCadets.map { it.batch }.distinct()
        val ranks = activeCadets.map { it.rank }.distinct()

        val presentCount = todayAttendance.count { it.status == "present" }

        DashboardUiState(
            greeting = greeting,
            formattedDate = formattedDate,
            totalCadets = cadets.size,
            activeCadetsCount = activeCadets.size,
            batchCount = batches.size,
            rankCount = ranks.size,
            dismissedCount = dismissedCadets.size,
            todayPresentCount = presentCount,
            todayTotalRecorded = todayAttendance.size,
            recentCadets = activeCadets.take(5)
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DashboardUiState()
    )

    class Factory(private val repository: BNCCRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return DashboardViewModel(repository) as T
        }
    }
}

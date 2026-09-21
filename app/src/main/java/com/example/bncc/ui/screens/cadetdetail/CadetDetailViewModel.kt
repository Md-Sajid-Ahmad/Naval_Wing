package com.example.bncc.ui.screens.cadetdetail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.bncc.data.model.AttendanceRecord
import com.example.bncc.data.model.Cadet
import com.example.bncc.data.repository.BNCCRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class CadetDetailUiState(
    val cadet: Cadet? = null,
    val recentAttendance: List<AttendanceRecord> = emptyList(),
    val attendanceRatePercent: Int = 0
)

class CadetDetailViewModel(
    private val cadetId: String,
    private val repository: BNCCRepository
) : ViewModel() {

    private val cadetFlow = repository.getCadetById(cadetId)

    val uiState: StateFlow<CadetDetailUiState> = combine(
        cadetFlow,
        repository.getRecentAttendanceForCadet(cadetId)
    ) { cadet, history ->
        val presentCount = history.count { it.status == "present" }
        val rate = if (history.isNotEmpty()) (presentCount * 100) / history.size else 0
        CadetDetailUiState(
            cadet = cadet,
            recentAttendance = history,
            attendanceRatePercent = rate
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = CadetDetailUiState()
    )

    fun toggleDismissedStatus() {
        val currentCadet = uiState.value.cadet ?: return
        viewModelScope.launch {
            val newStatus = if (currentCadet.status == "active") "inactive" else "active"
            val updated = currentCadet.copy(status = newStatus)
            repository.updateCadet(updated)
        }
    }

    class Factory(
        private val cadetId: String,
        private val repository: BNCCRepository
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return CadetDetailViewModel(cadetId, repository) as T
        }
    }
}

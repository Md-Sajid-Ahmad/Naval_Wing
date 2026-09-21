package com.example.bncc.ui.screens.reports

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.bncc.data.model.AttendanceRecord
import com.example.bncc.data.model.Cadet
import com.example.bncc.data.repository.BNCCRepository
import com.example.bncc.util.BanglaUtils
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

data class RankDistribution(
    val rank: String,
    val rankBn: String,
    val count: Int,
    val percentage: Float
)

data class ReportsUiState(
    val totalCadets: Int = 0,
    val activeCadets: Int = 0,
    val totalAttendanceRecords: Int = 0,
    val overallAttendanceRate: Int = 0,
    val maleCount: Int = 0,
    val femaleCount: Int = 0,
    val rankDistributions: List<RankDistribution> = emptyList()
)

class ReportsViewModel(
    private val repository: BNCCRepository
) : ViewModel() {

    val uiState: StateFlow<ReportsUiState> = combine(
        repository.allCadets,
        repository.getAllAttendance()
    ) { cadets, records ->
        val active = cadets.filter { it.status == "active" }
        val males = active.count { it.gender == "male" }
        val females = active.count { it.gender == "female" }

        val presentRecords = records.count { it.status == "present" }
        val rate = if (records.isNotEmpty()) (presentRecords * 100) / records.size else 0

        val ranks = listOf("CUO", "SGT", "CPL", "LCPL", "Cadet")
        val distributions = ranks.map { rank ->
            val count = active.count { it.rank.equals(rank, ignoreCase = true) }
            val pct = if (active.isNotEmpty()) count.toFloat() / active.size else 0f
            RankDistribution(
                rank = rank,
                rankBn = BanglaUtils.getRankBangla(rank),
                count = count,
                percentage = pct
            )
        }

        ReportsUiState(
            totalCadets = cadets.size,
            activeCadets = active.size,
            totalAttendanceRecords = records.size,
            overallAttendanceRate = rate,
            maleCount = males,
            femaleCount = females,
            rankDistributions = distributions
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = ReportsUiState()
    )

    class Factory(private val repository: BNCCRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return ReportsViewModel(repository) as T
        }
    }
}

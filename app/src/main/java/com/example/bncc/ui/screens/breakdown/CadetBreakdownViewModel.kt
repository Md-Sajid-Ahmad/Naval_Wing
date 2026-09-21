package com.example.bncc.ui.screens.breakdown

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.bncc.data.model.Cadet
import com.example.bncc.data.repository.BNCCRepository
import com.example.bncc.util.BanglaUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

enum class GenderFilter { ALL, MALE, FEMALE }

data class RankGroup(
    val rank: String,
    val rankBn: String,
    val cadets: List<Cadet>
)

data class BreakdownUiState(
    val genderFilter: GenderFilter = GenderFilter.ALL,
    val totalFilteredCount: Int = 0,
    val rankGroups: List<RankGroup> = emptyList()
)

class CadetBreakdownViewModel(
    private val repository: BNCCRepository
) : ViewModel() {

    private val _genderFilter = MutableStateFlow(GenderFilter.ALL)

    val uiState: StateFlow<BreakdownUiState> = combine(
        repository.allCadets,
        _genderFilter
    ) { allCadets, filter ->
        val activeCadets = allCadets.filter { it.status == "active" }
        val filtered = when (filter) {
            GenderFilter.ALL -> activeCadets
            GenderFilter.MALE -> activeCadets.filter { it.gender == "male" }
            GenderFilter.FEMALE -> activeCadets.filter { it.gender == "female" }
        }

        // Ordered by military hierarchy: CUO, SGT, CPL, LCPL, Cadet
        val hierarchy = listOf("CUO", "SGT", "CPL", "LCPL", "Cadet")
        val groups = hierarchy.map { rank ->
            val matching = filtered.filter { it.rank.equals(rank, ignoreCase = true) }
            RankGroup(
                rank = rank,
                rankBn = BanglaUtils.getRankBangla(rank),
                cadets = matching
            )
        }.filter { it.cadets.isNotEmpty() }

        BreakdownUiState(
            genderFilter = filter,
            totalFilteredCount = filtered.size,
            rankGroups = groups
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = BreakdownUiState()
    )

    fun setGenderFilter(filter: GenderFilter) {
        _genderFilter.value = filter
    }

    class Factory(private val repository: BNCCRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return CadetBreakdownViewModel(repository) as T
        }
    }
}

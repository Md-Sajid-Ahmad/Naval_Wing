package com.example.bncc.ui.screens.dismissed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.bncc.data.model.Cadet
import com.example.bncc.data.repository.BNCCRepository
import com.example.bncc.ui.screens.breakdown.GenderFilter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DismissedUiState(
    val dismissedCadets: List<Cadet> = emptyList(),
    val genderFilter: GenderFilter = GenderFilter.ALL,
    val totalDismissed: Int = 0
)

class DismissedCadetsViewModel(
    private val repository: BNCCRepository
) : ViewModel() {

    private val _genderFilter = MutableStateFlow(GenderFilter.ALL)

    val uiState: StateFlow<DismissedUiState> = combine(
        repository.dismissedCadets,
        _genderFilter
    ) { dismissedList, filter ->
        val filtered = when (filter) {
            GenderFilter.ALL -> dismissedList
            GenderFilter.MALE -> dismissedList.filter { it.gender == "male" }
            GenderFilter.FEMALE -> dismissedList.filter { it.gender == "female" }
        }

        DismissedUiState(
            dismissedCadets = filtered,
            genderFilter = filter,
            totalDismissed = dismissedList.size
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DismissedUiState()
    )

    fun setGenderFilter(filter: GenderFilter) {
        _genderFilter.value = filter
    }

    fun reactivateCadet(cadet: Cadet) {
        viewModelScope.launch {
            repository.updateCadet(cadet.copy(status = "active"))
        }
    }

    class Factory(private val repository: BNCCRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return DismissedCadetsViewModel(repository) as T
        }
    }
}

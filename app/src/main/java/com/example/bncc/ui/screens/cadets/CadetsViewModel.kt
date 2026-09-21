package com.example.bncc.ui.screens.cadets

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.bncc.data.model.Cadet
import com.example.bncc.data.repository.BNCCRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class CadetsUiState(
    val cadets: List<Cadet> = emptyList(),
    val totalCount: Int = 0,
    val searchQuery: String = "",
    val selectedRankFilter: String? = null,
    val isAddFormVisible: Boolean = false
)

class CadetsViewModel(
    private val repository: BNCCRepository
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    private val _selectedRankFilter = MutableStateFlow<String?>(null)
    private val _isAddFormVisible = MutableStateFlow(false)

    val uiState: StateFlow<CadetsUiState> = combine(
        repository.allCadets,
        _searchQuery,
        _selectedRankFilter,
        _isAddFormVisible
    ) { allCadets, query, rankFilter, showAdd ->
        val filtered = allCadets.filter { cadet ->
            val matchesQuery = query.isBlank() ||
                    cadet.fullName.contains(query, ignoreCase = true) ||
                    cadet.cadetId.contains(query, ignoreCase = true) ||
                    cadet.rank.contains(query, ignoreCase = true)

            val matchesRank = rankFilter == null || cadet.rank.equals(rankFilter, ignoreCase = true)

            matchesQuery && matchesRank
        }

        CadetsUiState(
            cadets = filtered,
            totalCount = allCadets.size,
            searchQuery = query,
            selectedRankFilter = rankFilter,
            isAddFormVisible = showAdd
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = CadetsUiState()
    )

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun onRankFilterSelected(rank: String?) {
        _selectedRankFilter.value = rank
    }

    fun toggleAddForm() {
        _isAddFormVisible.value = !_isAddFormVisible.value
    }

    fun addCadet(
        cadetId: String,
        fullName: String,
        rank: String,
        batch: String,
        ward: String,
        gender: String,
        phone: String?
    ) {
        viewModelScope.launch {
            val newCadet = Cadet(
                cadetId = cadetId.trim(),
                fullName = fullName.trim(),
                rank = rank,
                batch = batch.trim().ifEmpty { "2024" },
                ward = ward.trim().ifEmpty { "A" },
                gender = gender,
                phone = phone?.trim()?.ifEmpty { null },
                status = "active",
                joinedOn = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())
            )
            repository.insertCadet(newCadet)
            _isAddFormVisible.value = false
        }
    }

    class Factory(private val repository: BNCCRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return CadetsViewModel(repository) as T
        }
    }
}

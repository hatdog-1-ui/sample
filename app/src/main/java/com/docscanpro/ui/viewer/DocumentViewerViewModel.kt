package com.docscanpro.ui.viewer

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.docscanpro.data.model.Document
import com.docscanpro.data.model.Page
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.util.FileStorageHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DocumentViewerViewModel @Inject constructor(
    private val repository: DocumentRepository,
    private val fileStorageHelper: FileStorageHelper,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val documentId: String = checkNotNull(savedStateHandle["documentId"])

    private val _document = MutableStateFlow<Document?>(null)
    val document: StateFlow<Document?> = _document.asStateFlow()

    private val _pages = MutableStateFlow<List<Page>>(emptyList())
    val pages: StateFlow<List<Page>> = _pages.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadDocument()
    }

    private fun loadDocument() {
        viewModelScope.launch {
            _isLoading.value = true
            _document.value = repository.getDocument(documentId)
            repository.getPagesForDocument(documentId).collect { pageList ->
                _pages.value = pageList
                _isLoading.value = false
            }
        }
    }

    fun deletePage(pageId: String) {
        viewModelScope.launch {
            repository.deletePage(pageId)
        }
    }

    fun deleteDocument() {
        viewModelScope.launch {
            repository.deleteDocument(documentId)
        }
    }
}

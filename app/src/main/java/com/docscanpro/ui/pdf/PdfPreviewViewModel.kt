package com.docscanpro.ui.pdf

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.docscanpro.data.model.Document
import com.docscanpro.data.model.Page
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.pdf.PdfGenerator
import com.docscanpro.util.FileStorageHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PdfPreviewViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: DocumentRepository,
    private val pdfGenerator: PdfGenerator,
    private val fileStorageHelper: FileStorageHelper
) : ViewModel() {

    private val documentId: String = checkNotNull(savedStateHandle["documentId"])

    private val _document = MutableStateFlow<Document?>(null)
    val document: StateFlow<Document?> = _document

    val pages: StateFlow<List<Page>> = repository.getPagesForDocument(documentId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedPageSize = MutableStateFlow(PdfGenerator.PageSize.A4)
    val selectedPageSize: StateFlow<PdfGenerator.PageSize> = _selectedPageSize

    private val _selectedQuality = MutableStateFlow(PdfGenerator.Quality.MEDIUM)
    val selectedQuality: StateFlow<PdfGenerator.Quality> = _selectedQuality

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating: StateFlow<Boolean> = _isGenerating

    private val _generatedPdfPath = MutableStateFlow<String?>(null)
    val generatedPdfPath: StateFlow<String?> = _generatedPdfPath

    init {
        viewModelScope.launch {
            _document.value = repository.getDocument(documentId)
        }
    }

    fun setPageSize(size: PdfGenerator.PageSize) {
        _selectedPageSize.value = size
    }

    fun setQuality(quality: PdfGenerator.Quality) {
        _selectedQuality.value = quality
    }

    fun generatePdf() {
        viewModelScope.launch {
            _isGenerating.value = true
            val doc = _document.value ?: repository.getDocument(documentId)
            val pageList = pages.value
            if (doc != null && pageList.isNotEmpty()) {
                val fileName = "${doc.name.ifBlank { "document" }}_${System.currentTimeMillis()}.pdf"
                val path = pdfGenerator.generatePdf(
                    pages = pageList,
                    pageSize = _selectedPageSize.value,
                    quality = _selectedQuality.value,
                    fileName = fileName
                )
                val totalSize = fileStorageHelper.getFileSize(path)
                val updatedDoc = doc.copy(
                    pdfPath = path,
                    updatedAt = System.currentTimeMillis(),
                    totalSizeBytes = totalSize
                )
                repository.saveDocument(updatedDoc)
                _document.value = updatedDoc
                _generatedPdfPath.value = path
            }
            _isGenerating.value = false
        }
    }
}

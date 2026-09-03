package com.docscanpro.ui.save

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.docscanpro.data.model.Document
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.pdf.PdfGenerator
import com.docscanpro.util.FileStorageHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class ExportFormat {
    PDF, JPG, PNG
}

@HiltViewModel
class SaveExportViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: DocumentRepository,
    private val pdfGenerator: PdfGenerator,
    private val fileStorageHelper: FileStorageHelper
) : ViewModel() {

    private val documentId: String = checkNotNull(savedStateHandle["documentId"])

    private var loadedDocument: Document? = null

    private val _fileName = MutableStateFlow("")
    val fileName: StateFlow<String> = _fileName

    private val _selectedFormat = MutableStateFlow(ExportFormat.PDF)
    val selectedFormat: StateFlow<ExportFormat> = _selectedFormat

    private val _saveLocation = MutableStateFlow("Internal Storage / Documents")
    val saveLocation: StateFlow<String> = _saveLocation

    private val _isSaving = MutableStateFlow(false)
    val isSaving: StateFlow<Boolean> = _isSaving

    init {
        viewModelScope.launch {
            val document = repository.getDocument(documentId)
            loadedDocument = document
            _fileName.value = document?.name ?: ""
        }
    }

    fun setFileName(name: String) {
        _fileName.value = name
    }

    fun setFormat(format: ExportFormat) {
        _selectedFormat.value = format
    }

    fun saveDocument(onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            _isSaving.value = true
            val document = loadedDocument ?: repository.getDocument(documentId)
            if (document == null) {
                _isSaving.value = false
                onResult(false)
                return@launch
            }

            val name = _fileName.value.ifBlank { document.name }
            val success = try {
                when (_selectedFormat.value) {
                    ExportFormat.PDF -> {
                        val pageList = repository.getPagesForDocument(documentId).first()
                        val path = pdfGenerator.generatePdf(
                            pages = pageList,
                            pageSize = PdfGenerator.PageSize.A4,
                            quality = PdfGenerator.Quality.MEDIUM,
                            fileName = "$name.pdf"
                        )
                        val size = fileStorageHelper.getFileSize(path)
                        repository.saveDocument(
                            document.copy(
                                name = name,
                                pdfPath = path,
                                totalSizeBytes = size,
                                updatedAt = System.currentTimeMillis()
                            )
                        )
                    }
                    ExportFormat.JPG, ExportFormat.PNG -> {
                        // Images are already stored on disk per-page; just rename/update metadata.
                        repository.saveDocument(
                            document.copy(
                                name = name,
                                updatedAt = System.currentTimeMillis()
                            )
                        )
                    }
                }
                true
            } catch (e: Exception) {
                false
            }

            _isSaving.value = false
            onResult(success)
        }
    }
}

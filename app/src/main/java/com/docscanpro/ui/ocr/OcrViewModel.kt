package com.docscanpro.ui.ocr

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.docscanpro.data.model.Page
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.ocr.TextRecognitionHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OcrViewModel @Inject constructor(
    private val repository: DocumentRepository,
    private val textRecognitionHelper: TextRecognitionHelper,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val pageId: String = checkNotNull(savedStateHandle["pageId"])

    private val _page = MutableStateFlow<Page?>(null)
    val page: StateFlow<Page?> = _page.asStateFlow()

    private val _extractedText = MutableStateFlow("")
    val extractedText: StateFlow<String> = _extractedText.asStateFlow()

    private val _isProcessing = MutableStateFlow(false)
    val isProcessing: StateFlow<Boolean> = _isProcessing.asStateFlow()

    init {
        viewModelScope.launch {
            val loadedPage = repository.getPage(pageId)
            _page.value = loadedPage
            if (loadedPage != null) {
                if (!loadedPage.ocrText.isNullOrBlank()) {
                    _extractedText.value = loadedPage.ocrText
                } else {
                    processOcr()
                }
            }
        }
    }

    fun processOcr() {
        val currentPage = _page.value ?: return
        viewModelScope.launch {
            _isProcessing.value = true
            val text = textRecognitionHelper.recognizeText(currentPage.imagePath)
            _extractedText.value = text
            _isProcessing.value = false
            saveOcrResult()
        }
    }

    fun saveOcrResult() {
        val currentPage = _page.value ?: return
        viewModelScope.launch {
            val updated = currentPage.copy(ocrText = _extractedText.value)
            repository.savePage(updated)
            _page.value = updated
        }
    }
}

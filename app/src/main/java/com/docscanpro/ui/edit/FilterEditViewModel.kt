package com.docscanpro.ui.edit

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.docscanpro.data.model.Page
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.util.FileStorageHelper
import com.docscanpro.util.ImageFilters
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

enum class FilterType {
    ORIGINAL, BW, MAGIC, GRAY
}

@HiltViewModel
class FilterEditViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: DocumentRepository,
    private val fileStorageHelper: FileStorageHelper
) : ViewModel() {

    private val documentId: String = checkNotNull(savedStateHandle["documentId"])

    val pages: StateFlow<List<Page>> = repository.getPagesForDocument(documentId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _currentPageIndex = MutableStateFlow(0)
    val currentPageIndex: StateFlow<Int> = _currentPageIndex

    private val _currentFilter = MutableStateFlow(FilterType.ORIGINAL)
    val currentFilter: StateFlow<FilterType> = _currentFilter

    private val _brightness = MutableStateFlow(65f)
    val brightness: StateFlow<Float> = _brightness

    private val _contrast = MutableStateFlow(50f)
    val contrast: StateFlow<Float> = _contrast

    private val _rotation = MutableStateFlow(0f)
    val rotation: StateFlow<Float> = _rotation

    private val _processedBitmap = MutableStateFlow<Bitmap?>(null)
    val processedBitmap: StateFlow<Bitmap?> = _processedBitmap

    private var sourceBitmap: Bitmap? = null

    init {
        viewModelScope.launch {
            pages.collect { pageList ->
                if (pageList.isNotEmpty() && _currentPageIndex.value < pageList.size) {
                    loadPage(pageList[_currentPageIndex.value])
                }
            }
        }
    }

    private fun loadPage(page: Page) {
        viewModelScope.launch {
            val bitmap = withContext(Dispatchers.IO) {
                BitmapFactory.decodeFile(page.imagePath)
            }
            sourceBitmap = bitmap
            reprocess()
        }
    }

    fun selectPage(index: Int) {
        val pageList = pages.value
        if (index < 0 || index >= pageList.size) return
        _currentPageIndex.value = index
        _currentFilter.value = FilterType.ORIGINAL
        _brightness.value = 65f
        _contrast.value = 50f
        _rotation.value = 0f
        loadPage(pageList[index])
    }

    fun applyFilter(filter: FilterType) {
        _currentFilter.value = filter
        reprocess()
    }

    fun setBrightness(value: Float) {
        _brightness.value = value
        reprocess()
    }

    fun setContrast(value: Float) {
        _contrast.value = value
        reprocess()
    }

    fun rotateImage() {
        _rotation.value = (_rotation.value + 90f) % 360f
        reprocess()
    }

    private fun reprocess() {
        val base = sourceBitmap ?: return
        viewModelScope.launch {
            val result = withContext(Dispatchers.IO) {
                processBitmap(base)
            }
            _processedBitmap.value = result
        }
    }

    private fun processBitmap(base: Bitmap): Bitmap {
        var result = when (_currentFilter.value) {
            FilterType.ORIGINAL -> ImageFilters.applyOriginal(base)
            FilterType.BW -> ImageFilters.applyBlackAndWhite(base)
            FilterType.MAGIC -> ImageFilters.applyMagicColor(base)
            FilterType.GRAY -> ImageFilters.applyGrayscale(base)
        }
        // Brightness/contrast sliders are centered at 50 (contrast) / 65 (brightness)
        // defaults; convert to the -100..100 range the filter functions expect.
        val brightnessDelta = _brightness.value - 65f
        val contrastDelta = _contrast.value - 50f
        if (brightnessDelta != 0f) {
            result = ImageFilters.adjustBrightness(result, brightnessDelta)
        }
        if (contrastDelta != 0f) {
            result = ImageFilters.adjustContrast(result, contrastDelta)
        }
        if (_rotation.value != 0f) {
            result = ImageFilters.rotateBitmap(result, _rotation.value)
        }
        return result
    }

    fun saveChanges() {
        viewModelScope.launch {
            val currentPages = pages.value
            val index = _currentPageIndex.value
            if (index >= currentPages.size) return@launch
            val page = currentPages[index]
            val bitmap = _processedBitmap.value ?: return@launch

            val savedPath = withContext(Dispatchers.IO) {
                fileStorageHelper.saveImage(bitmap, "page_${page.id}_${System.currentTimeMillis()}.jpg")
            }

            repository.savePage(page.copy(imagePath = savedPath))

            val document = repository.getDocument(documentId)
            if (document != null) {
                repository.saveDocument(document.copy(updatedAt = System.currentTimeMillis()))
            }
        }
    }
}

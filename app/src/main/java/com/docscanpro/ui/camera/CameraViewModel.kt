package com.docscanpro.ui.camera

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.docscanpro.camera.CameraManager
import com.docscanpro.camera.FlashMode
import com.docscanpro.data.model.Document
import com.docscanpro.data.model.Page
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.util.FileStorageHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class CameraViewModel @Inject constructor(
    val cameraManager: CameraManager,
    private val documentRepository: DocumentRepository,
    private val fileStorageHelper: FileStorageHelper
) : ViewModel() {

    val flashMode: StateFlow<FlashMode> = cameraManager.flashMode

    private val _isBatchMode = MutableStateFlow(false)
    val isBatchMode: StateFlow<Boolean> = _isBatchMode.asStateFlow()

    private val _capturedPages = MutableStateFlow<List<Uri>>(emptyList())
    val capturedPages: StateFlow<List<Uri>> = _capturedPages.asStateFlow()

    private val _isCapturing = MutableStateFlow(false)
    val isCapturing: StateFlow<Boolean> = _isCapturing.asStateFlow()

    fun captureImage() {
        if (_isCapturing.value) return
        _isCapturing.value = true
        cameraManager.captureImage()
    }

    fun onImageCaptured(uri: Uri) {
        _isCapturing.value = false
        _capturedPages.value = _capturedPages.value + uri
    }

    fun toggleFlash() {
        cameraManager.toggleFlash()
    }

    fun toggleBatchMode() {
        _isBatchMode.value = !_isBatchMode.value
    }

    fun finishCapture(onComplete: (String) -> Unit) {
        viewModelScope.launch {
            val docId = UUID.randomUUID().toString()
            val now = System.currentTimeMillis()
            val pages = _capturedPages.value

            val document = Document(
                id = docId,
                name = "Scan ${java.text.SimpleDateFormat("MMM dd, HH:mm", java.util.Locale.getDefault()).format(java.util.Date(now))}",
                folderName = null,
                pageCount = pages.size,
                createdAt = now,
                updatedAt = now,
                thumbnailPath = pages.firstOrNull()?.path,
                pdfPath = null,
                totalSizeBytes = 0L
            )

            documentRepository.saveDocument(document)

            pages.forEachIndexed { index, uri ->
                val imagePath = uri.path ?: return@forEachIndexed
                val page = Page(
                    id = UUID.randomUUID().toString(),
                    documentId = docId,
                    pageNumber = index + 1,
                    imagePath = imagePath,
                    ocrText = null
                )
                documentRepository.savePage(page)
            }

            withContext(Dispatchers.Main) {
                onComplete(docId)
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        cameraManager.unbindAll()
    }
}

package com.docscanpro.ui.share

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.docscanpro.data.model.Document
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.util.FileStorageHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import java.util.Locale
import javax.inject.Inject
import kotlin.math.ln
import kotlin.math.pow

@HiltViewModel
class ShareViewModel @Inject constructor(
    private val repository: DocumentRepository,
    private val fileStorageHelper: FileStorageHelper,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val documentId: String = checkNotNull(savedStateHandle["documentId"])

    private val _document = MutableStateFlow<Document?>(null)
    val document: StateFlow<Document?> = _document.asStateFlow()

    private val _fileSizeText = MutableStateFlow("")
    val fileSizeText: StateFlow<String> = _fileSizeText.asStateFlow()

    init {
        viewModelScope.launch {
            val doc = repository.getDocument(documentId)
            _document.value = doc
            val path = doc?.pdfPath ?: doc?.thumbnailPath
            val sizeBytes = path?.let { fileStorageHelper.getFileSize(it) } ?: (doc?.totalSizeBytes ?: 0L)
            _fileSizeText.value = formatFileSize(sizeBytes)
        }
    }

    fun getShareUri(context: Context): Uri? {
        val doc = _document.value ?: return null
        val path = doc.pdfPath ?: doc.thumbnailPath ?: return null
        val file = fileStorageHelper.getFile(path) ?: File(path).takeIf { it.exists() } ?: return null
        return FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    }

    private fun formatFileSize(bytes: Long): String {
        if (bytes <= 0) return "0 B"
        val units = arrayOf("B", "KB", "MB", "GB")
        val digitGroups = (ln(bytes.toDouble()) / ln(1024.0)).toInt().coerceIn(0, units.size - 1)
        val value = bytes / 1024.0.pow(digitGroups.toDouble())
        return String.format(Locale.getDefault(), "%.1f %s", value, units[digitGroups])
    }
}

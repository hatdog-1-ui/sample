package com.docscanpro.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.pdf.PdfDocument
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FileStorageHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {

    fun getDocumentsDir(): File {
        val dir = File(context.filesDir, "documents")
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }

    fun getCacheDir(): File {
        val dir = context.cacheDir
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }

    suspend fun saveImage(bitmap: Bitmap, fileName: String): String = withContext(Dispatchers.IO) {
        val file = File(getDocumentsDir(), fileName)
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
        }
        file.absolutePath
    }

    suspend fun savePdf(document: PdfDocument, fileName: String): String = withContext(Dispatchers.IO) {
        val file = File(getDocumentsDir(), fileName)
        FileOutputStream(file).use { out ->
            document.writeTo(out)
        }
        file.absolutePath
    }

    suspend fun deleteFile(path: String): Boolean = withContext(Dispatchers.IO) {
        val file = File(path)
        if (file.exists()) file.delete() else false
    }

    fun getFile(path: String): File? {
        val file = File(path)
        return if (file.exists()) file else null
    }

    fun getFileSize(path: String): Long {
        val file = File(path)
        return if (file.exists()) file.length() else 0L
    }

    suspend fun createTempFile(prefix: String, suffix: String): File = withContext(Dispatchers.IO) {
        File.createTempFile(prefix, suffix, getCacheDir())
    }
}

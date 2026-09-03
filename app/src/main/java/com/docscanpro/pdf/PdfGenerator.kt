package com.docscanpro.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import com.docscanpro.data.model.Page
import com.docscanpro.util.FileStorageHelper
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Generates a PDF file from a document's scanned pages using the platform's
 * built-in [PdfDocument] APIs (no external library dependency).
 */
@Singleton
class PdfGenerator @Inject constructor(
    @ApplicationContext private val context: Context,
    private val fileStorageHelper: FileStorageHelper
) {

    /** Standard paper sizes expressed in points (72 dpi), portrait orientation. */
    enum class PageSize(val widthPt: Int, val heightPt: Int) {
        A4(595, 842),
        LETTER(612, 792),
        LEGAL(612, 1008)
    }

    /** Output image quality, mapped to a JPEG compression level. */
    enum class Quality(val jpegCompression: Int) {
        LOW(50),
        MEDIUM(75),
        HIGH(95)
    }

    fun getPageSizeDimensions(pageSize: PageSize): Pair<Int, Int> =
        pageSize.widthPt to pageSize.heightPt

    /**
     * Builds a PDF from [pages], scaling each page's image to fit [pageSize]
     * while preserving its aspect ratio, and saves it via [FileStorageHelper].
     * Returns the absolute path of the generated file.
     */
    suspend fun generatePdf(
        pages: List<Page>,
        pageSize: PageSize,
        quality: Quality,
        fileName: String
    ): String = withContext(Dispatchers.IO) {
        val (pageWidth, pageHeight) = getPageSizeDimensions(pageSize)
        val pdfDocument = PdfDocument()

        pages.sortedBy { it.pageNumber }.forEachIndexed { index, page ->
            val sourceBitmap = BitmapFactory.decodeFile(page.imagePath) ?: return@forEachIndexed

            val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, index + 1).create()
            val pdfPage = pdfDocument.startPage(pageInfo)
            val canvas = pdfPage.canvas

            // Scale bitmap to fit the page while maintaining aspect ratio.
            val scale = minOf(
                pageWidth.toFloat() / sourceBitmap.width,
                pageHeight.toFloat() / sourceBitmap.height
            )
            val scaledWidth = sourceBitmap.width * scale
            val scaledHeight = sourceBitmap.height * scale
            val left = (pageWidth - scaledWidth) / 2f
            val top = (pageHeight - scaledHeight) / 2f

            // Re-encode through the requested JPEG quality before drawing, so the
            // quality setting has a real effect on output fidelity/size.
            val compressedBitmap = compressForQuality(sourceBitmap, quality)

            val destRect = android.graphics.RectF(left, top, left + scaledWidth, top + scaledHeight)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
            canvas.drawBitmap(compressedBitmap, null, destRect, paint)

            pdfDocument.finishPage(pdfPage)

            if (compressedBitmap != sourceBitmap) compressedBitmap.recycle()
            sourceBitmap.recycle()
        }

        val path = fileStorageHelper.savePdf(pdfDocument, fileName)
        pdfDocument.close()
        path
    }

    private fun compressForQuality(bitmap: Bitmap, quality: Quality): Bitmap {
        val stream = java.io.ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, quality.jpegCompression, stream)
        val bytes = stream.toByteArray()
        return BitmapFactory.decodeByteArray(bytes, 0, bytes.size) ?: bitmap
    }
}

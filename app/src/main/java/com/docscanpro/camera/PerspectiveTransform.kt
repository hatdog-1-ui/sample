package com.docscanpro.camera

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.PointF
import kotlin.math.sqrt

/**
 * Performs perspective correction on a bitmap using Android's built-in Matrix
 * and Canvas APIs. Maps four arbitrary corner points to a rectangular output.
 */
object PerspectiveTransform {

    /**
     * Transform the region defined by [corners] (top-left, top-right, bottom-right, bottom-left)
     * into a rectangular bitmap of size [outputWidth] x [outputHeight].
     *
     * Uses [Matrix.setPolyToPoly] which supports 4-point (perspective) mapping.
     */
    fun transformPerspective(
        bitmap: Bitmap,
        corners: List<PointF>,
        outputWidth: Int,
        outputHeight: Int
    ): Bitmap {
        require(corners.size == 4) { "Exactly 4 corner points required" }

        val (tl, tr, br, bl) = corners

        // Source points: the document corners in the original image
        val src = floatArrayOf(
            tl.x, tl.y,
            tr.x, tr.y,
            br.x, br.y,
            bl.x, bl.y
        )

        // Destination points: the rectangle corners
        val dst = floatArrayOf(
            0f, 0f,
            outputWidth.toFloat(), 0f,
            outputWidth.toFloat(), outputHeight.toFloat(),
            0f, outputHeight.toFloat()
        )

        val matrix = Matrix()
        matrix.setPolyToPoly(src, 0, dst, 0, 4)

        val output = Bitmap.createBitmap(outputWidth, outputHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(output)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
        canvas.drawBitmap(bitmap, matrix, paint)

        return output
    }

    /**
     * Compute a reasonable output size based on the corner positions.
     * Returns Pair(width, height).
     */
    fun computeOutputSize(corners: List<PointF>): Pair<Int, Int> {
        require(corners.size == 4)
        val (tl, tr, br, bl) = corners

        val topWidth = distance(tl, tr)
        val bottomWidth = distance(bl, br)
        val leftHeight = distance(tl, bl)
        val rightHeight = distance(tr, br)

        val width = maxOf(topWidth, bottomWidth).toInt().coerceAtLeast(1)
        val height = maxOf(leftHeight, rightHeight).toInt().coerceAtLeast(1)

        return Pair(width, height)
    }

    private fun distance(a: PointF, b: PointF): Float {
        val dx = b.x - a.x
        val dy = b.y - a.y
        return sqrt(dx * dx + dy * dy)
    }
}

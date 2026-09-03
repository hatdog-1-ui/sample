package com.docscanpro.util

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.Matrix
import android.graphics.Paint

/**
 * Bitmap filter utilities used by the filter/edit screen.
 * All functions are pure: they return a new [Bitmap] and never mutate the input.
 */
object ImageFilters {

    private fun applyMatrix(bitmap: Bitmap, matrix: ColorMatrix): Bitmap {
        val output = Bitmap.createBitmap(bitmap.width, bitmap.height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(output)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            colorFilter = android.graphics.ColorMatrixColorFilter(matrix)
        }
        canvas.drawBitmap(bitmap, 0f, 0f, paint)
        return output
    }

    /** Returns an unmodified copy of [bitmap]. */
    fun applyOriginal(bitmap: Bitmap): Bitmap {
        return bitmap.copy(bitmap.config ?: Bitmap.Config.ARGB_8888, true)
    }

    /** Desaturates and pushes contrast hard for a scanned black & white document look. */
    fun applyBlackAndWhite(bitmap: Bitmap): Bitmap {
        val desaturate = ColorMatrix().apply { setSaturation(0f) }

        val contrastValue = 2.2f
        val translate = (-0.5f * contrastValue + 0.5f) * 255f
        val contrast = ColorMatrix(
            floatArrayOf(
                contrastValue, 0f, 0f, 0f, translate,
                0f, contrastValue, 0f, 0f, translate,
                0f, 0f, contrastValue, 0f, translate,
                0f, 0f, 0f, 1f, 0f
            )
        )

        desaturate.postConcat(contrast)
        return applyMatrix(bitmap, desaturate)
    }

    /** Boosts saturation and contrast slightly for a vivid "magic color" scan. */
    fun applyMagicColor(bitmap: Bitmap): Bitmap {
        val saturate = ColorMatrix().apply { setSaturation(1.4f) }

        val contrastValue = 1.15f
        val translate = (-0.5f * contrastValue + 0.5f) * 255f
        val contrast = ColorMatrix(
            floatArrayOf(
                contrastValue, 0f, 0f, 0f, translate,
                0f, contrastValue, 0f, 0f, translate,
                0f, 0f, contrastValue, 0f, 0f + translate,
                0f, 0f, 0f, 1f, 0f
            )
        )

        saturate.postConcat(contrast)
        return applyMatrix(bitmap, saturate)
    }

    /** Standard grayscale desaturation. */
    fun applyGrayscale(bitmap: Bitmap): Bitmap {
        val matrix = ColorMatrix().apply { setSaturation(0f) }
        return applyMatrix(bitmap, matrix)
    }

    /**
     * Adjusts brightness by translating each color channel.
     * [value] ranges from -100 to 100.
     */
    fun adjustBrightness(bitmap: Bitmap, value: Float): Bitmap {
        val translate = (value / 100f) * 255f
        val matrix = ColorMatrix(
            floatArrayOf(
                1f, 0f, 0f, 0f, translate,
                0f, 1f, 0f, 0f, translate,
                0f, 0f, 1f, 0f, translate,
                0f, 0f, 0f, 1f, 0f
            )
        )
        return applyMatrix(bitmap, matrix)
    }

    /**
     * Adjusts contrast by scaling each color channel around the midpoint.
     * [value] ranges from -100 to 100.
     */
    fun adjustContrast(bitmap: Bitmap, value: Float): Bitmap {
        val scale = 1f + (value / 100f)
        val translate = (-0.5f * scale + 0.5f) * 255f
        val matrix = ColorMatrix(
            floatArrayOf(
                scale, 0f, 0f, 0f, translate,
                0f, scale, 0f, 0f, translate,
                0f, 0f, scale, 0f, translate,
                0f, 0f, 0f, 1f, 0f
            )
        )
        return applyMatrix(bitmap, matrix)
    }

    /** Rotates [bitmap] by [degrees] around its center. */
    fun rotateBitmap(bitmap: Bitmap, degrees: Float): Bitmap {
        if (degrees % 360f == 0f) return applyOriginal(bitmap)
        val matrix = Matrix().apply { postRotate(degrees) }
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
    }
}

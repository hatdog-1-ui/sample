package com.docscanpro.camera

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.PointF

/**
 * Simple edge detection using Android built-in APIs.
 * Converts the image to grayscale, applies a threshold, and scans for the
 * largest high-contrast rectangular region. Falls back to a 10% inset rectangle
 * when no clear boundary is found.
 */
object EdgeDetector {

    /**
     * Detect the four corner points of a document in the given bitmap.
     * Returns points in order: top-left, top-right, bottom-right, bottom-left.
     */
    fun detectEdges(bitmap: Bitmap): List<PointF> {
        val width = bitmap.width
        val height = bitmap.height

        // Down-sample for performance
        val scale = 0.25f
        val smallW = (width * scale).toInt().coerceAtLeast(1)
        val smallH = (height * scale).toInt().coerceAtLeast(1)
        val small = Bitmap.createScaledBitmap(bitmap, smallW, smallH, true)

        // Convert to grayscale pixel array
        val pixels = IntArray(smallW * smallH)
        small.getPixels(pixels, 0, smallW, 0, 0, smallW, smallH)
        val gray = IntArray(pixels.size) { i ->
            val c = pixels[i]
            (0.299 * Color.red(c) + 0.587 * Color.green(c) + 0.114 * Color.blue(c)).toInt()
        }

        // Compute an adaptive threshold using the mean brightness
        val mean = gray.average()
        val threshold = (mean * 0.7).toInt().coerceIn(30, 200)

        // Build a binary mask: 1 = likely foreground (document), 0 = background
        // Assumes the document is brighter than the background surface
        val binary = BooleanArray(gray.size) { gray[it] > threshold }

        // Scan from each edge inward to find where the foreground starts
        val topEdge = scanFromTop(binary, smallW, smallH)
        val bottomEdge = scanFromBottom(binary, smallW, smallH)
        val leftEdge = scanFromLeft(binary, smallW, smallH)
        val rightEdge = scanFromRight(binary, smallW, smallH)

        // Validate that the detected region is reasonable (at least 20% of image in each dimension)
        val regionWidth = rightEdge - leftEdge
        val regionHeight = bottomEdge - topEdge
        val isValid = regionWidth > smallW * 0.2f && regionHeight > smallH * 0.2f
                && leftEdge < rightEdge && topEdge < bottomEdge

        if (small != bitmap) {
            small.recycle()
        }

        return if (isValid) {
            val sx = width.toFloat() / smallW
            val sy = height.toFloat() / smallH
            listOf(
                PointF(leftEdge * sx, topEdge * sy),
                PointF(rightEdge * sx, topEdge * sy),
                PointF(rightEdge * sx, bottomEdge * sy),
                PointF(leftEdge * sx, bottomEdge * sy)
            )
        } else {
            defaultCorners(width, height)
        }
    }

    /** Returns corners with 10% inset from each edge. */
    private fun defaultCorners(width: Int, height: Int): List<PointF> {
        val mx = width * 0.1f
        val my = height * 0.1f
        return listOf(
            PointF(mx, my),
            PointF(width - mx, my),
            PointF(width - mx, height - my),
            PointF(mx, height - my)
        )
    }

    // --- Edge scanning helpers ---
    // Each scans rows/columns and returns the coordinate where >50% of the line is foreground.

    private fun scanFromTop(binary: BooleanArray, w: Int, h: Int): Int {
        for (y in 0 until h) {
            var count = 0
            for (x in 0 until w) {
                if (binary[y * w + x]) count++
            }
            if (count > w * 0.5) return y
        }
        return (h * 0.1).toInt()
    }

    private fun scanFromBottom(binary: BooleanArray, w: Int, h: Int): Int {
        for (y in h - 1 downTo 0) {
            var count = 0
            for (x in 0 until w) {
                if (binary[y * w + x]) count++
            }
            if (count > w * 0.5) return y
        }
        return (h * 0.9).toInt()
    }

    private fun scanFromLeft(binary: BooleanArray, w: Int, h: Int): Int {
        for (x in 0 until w) {
            var count = 0
            for (y in 0 until h) {
                if (binary[y * w + x]) count++
            }
            if (count > h * 0.5) return x
        }
        return (w * 0.1).toInt()
    }

    private fun scanFromRight(binary: BooleanArray, w: Int, h: Int): Int {
        for (x in w - 1 downTo 0) {
            var count = 0
            for (y in 0 until h) {
                if (binary[y * w + x]) count++
            }
            if (count > h * 0.5) return x
        }
        return (w * 0.9).toInt()
    }
}

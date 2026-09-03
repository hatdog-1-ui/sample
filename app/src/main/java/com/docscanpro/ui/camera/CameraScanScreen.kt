package com.docscanpro.ui.camera

import android.net.Uri
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FlashAuto
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import com.docscanpro.camera.FlashMode

private val DarkBg = Color(0xFF0A0A0A)
private val AccentBlue = Color(0xFF2563EB)

@Composable
fun CameraScanScreen(
    onImageCaptured: (String) -> Unit,
    onBatchComplete: (String) -> Unit,
    onClose: () -> Unit,
    viewModel: CameraViewModel = hiltViewModel()
) {
    val flashMode by viewModel.flashMode.collectAsState()
    val isBatchMode by viewModel.isBatchMode.collectAsState()
    val capturedPages by viewModel.capturedPages.collectAsState()
    val isCapturing by viewModel.isCapturing.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current
    val context = LocalContext.current

    // Set up the image-captured callback
    DisposableEffect(isBatchMode) {
        viewModel.cameraManager.unbindAll()

        val previewView = PreviewView(context)
        viewModel.cameraManager.bindCamera(lifecycleOwner, previewView) { uri ->
            viewModel.onImageCaptured(uri)
            if (!isBatchMode) {
                val encoded = Uri.encode(uri.toString())
                onImageCaptured(encoded)
            }
        }
        onDispose { }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
    ) {
        // Camera preview
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).also { preview ->
                    viewModel.cameraManager.bindCamera(lifecycleOwner, preview) { uri ->
                        viewModel.onImageCaptured(uri)
                        if (!isBatchMode) {
                            val encoded = Uri.encode(uri.toString())
                            onImageCaptured(encoded)
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Top bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 48.dp, start = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Close button
            IconButton(onClick = onClose) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = Color.White,
                    modifier = Modifier.size(28.dp)
                )
            }

            // Batch mode toggle
            Row(
                modifier = Modifier
                    .border(
                        width = 1.dp,
                        color = if (isBatchMode) AccentBlue else Color.White.copy(alpha = 0.5f),
                        shape = RoundedCornerShape(20.dp)
                    )
                    .background(
                        color = if (isBatchMode) AccentBlue.copy(alpha = 0.2f) else Color.Transparent,
                        shape = RoundedCornerShape(20.dp)
                    )
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { viewModel.toggleBatchMode() },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Layers,
                        contentDescription = "Batch mode",
                        tint = if (isBatchMode) AccentBlue else Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                if (isBatchMode && capturedPages.isNotEmpty()) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${capturedPages.size}",
                        color = AccentBlue,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Scan frame overlay
        Box(
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .height(340.dp)
                .align(Alignment.Center)
        ) {
            // Dashed border rectangle
            Canvas(modifier = Modifier.fillMaxSize()) {
                drawRoundRect(
                    color = Color.White.copy(alpha = 0.6f),
                    style = Stroke(
                        width = 2.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(
                            floatArrayOf(12.dp.toPx(), 8.dp.toPx()),
                            0f
                        )
                    ),
                    cornerRadius = CornerRadius(8.dp.toPx())
                )

                // 4 blue corner dots (14dp circles)
                val dotRadius = 7.dp.toPx()
                val corners = listOf(
                    androidx.compose.ui.geometry.Offset(0f, 0f),
                    androidx.compose.ui.geometry.Offset(size.width, 0f),
                    androidx.compose.ui.geometry.Offset(size.width, size.height),
                    androidx.compose.ui.geometry.Offset(0f, size.height)
                )
                corners.forEach { corner ->
                    drawCircle(
                        color = AccentBlue,
                        radius = dotRadius,
                        center = corner
                    )
                }
            }

            // Instruction text
            Text(
                text = "Position document within frame",
                color = Color.White.copy(alpha = 0.6f),
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .align(Alignment.Center)
                    .fillMaxWidth()
            )
        }

        // Bottom controls
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(bottom = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Batch finish button
            if (isBatchMode && capturedPages.isNotEmpty()) {
                TextButton(
                    onClick = {
                        viewModel.finishCapture { docId ->
                            onBatchComplete(docId)
                        }
                    }
                ) {
                    Text(
                        text = "Done (${capturedPages.size} pages)",
                        color = AccentBlue,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 16.sp
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Flash toggle
                IconButton(
                    onClick = { viewModel.toggleFlash() },
                    modifier = Modifier
                        .size(48.dp)
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.5f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = when (flashMode) {
                            FlashMode.OFF -> Icons.Default.FlashOff
                            FlashMode.ON -> Icons.Default.FlashOn
                            FlashMode.AUTO -> Icons.Default.FlashAuto
                        },
                        contentDescription = "Flash",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Capture button
                Box(
                    modifier = Modifier.size(72.dp),
                    contentAlignment = Alignment.Center
                ) {
                    // Outer ring
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        drawCircle(
                            color = Color.White,
                            style = Stroke(width = 4.dp.toPx())
                        )
                    }
                    // Inner filled circle
                    IconButton(
                        onClick = { viewModel.captureImage() },
                        enabled = !isCapturing,
                        modifier = Modifier
                            .size(58.dp)
                            .background(
                                color = if (isCapturing) Color.Gray else Color.White,
                                shape = CircleShape
                            )
                    ) {
                        // No icon — just the white circle button
                    }
                }

                // Gallery import button
                IconButton(
                    onClick = { /* Gallery import — not part of this task */ },
                    modifier = Modifier
                        .size(48.dp)
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.5f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.Image,
                        contentDescription = "Import from gallery",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }
    }
}

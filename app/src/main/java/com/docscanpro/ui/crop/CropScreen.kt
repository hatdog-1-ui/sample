package com.docscanpro.ui.crop

import android.graphics.BitmapFactory
import android.graphics.PointF
import android.net.Uri
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.docscanpro.camera.EdgeDetector
import com.docscanpro.camera.PerspectiveTransform
import com.docscanpro.data.model.Document
import com.docscanpro.data.model.Page
import com.docscanpro.data.repository.DocumentRepository
import com.docscanpro.util.FileStorageHelper
import dagger.hilt.android.EntryPointAccessors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID
import kotlin.math.roundToInt

private val AccentBlue = Color(0xFF2563EB)
private const val HANDLE_SIZE_DP = 22

// Hilt entry point to access repository and file helper from a composable without a ViewModel
@dagger.hilt.EntryPoint
@dagger.hilt.InstallIn(dagger.hilt.components.SingletonComponent::class)
interface CropScreenEntryPoint {
    fun documentRepository(): DocumentRepository
    fun fileStorageHelper(): FileStorageHelper
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CropScreen(
    imageUri: String,
    onConfirm: (String) -> Unit,
    onRetake: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current

    val entryPoint = remember {
        EntryPointAccessors.fromApplication(context, CropScreenEntryPoint::class.java)
    }
    val repository = remember { entryPoint.documentRepository() }
    val fileHelper = remember { entryPoint.fileStorageHelper() }

    // Decode the URI to get the file path
    val decodedUri = remember(imageUri) { Uri.decode(imageUri) }
    val filePath = remember(decodedUri) {
        val uri = Uri.parse(decodedUri)
        uri.path ?: ""
    }

    // Load bitmap and detect edges
    var bitmap by remember { mutableStateOf<android.graphics.Bitmap?>(null) }
    var detectedCorners by remember { mutableStateOf<List<PointF>>(emptyList()) }

    LaunchedEffect(filePath) {
        withContext(Dispatchers.IO) {
            val bmp = BitmapFactory.decodeFile(filePath)
            if (bmp != null) {
                bitmap = bmp
                detectedCorners = EdgeDetector.detectEdges(bmp)
            }
        }
    }

    // Track the view size for coordinate mapping
    var viewSize by remember { mutableStateOf(IntSize.Zero) }

    // Corner handle positions in view coordinates (updated when viewSize or detectedCorners change)
    // Order: top-left, top-right, bottom-right, bottom-left
    var cornerOffsets by remember { mutableStateOf(listOf(Offset.Zero, Offset.Zero, Offset.Zero, Offset.Zero)) }

    // Map detected corners to view coordinates when layout is known
    LaunchedEffect(detectedCorners, viewSize) {
        val bmp = bitmap ?: return@LaunchedEffect
        if (viewSize.width == 0 || viewSize.height == 0) return@LaunchedEffect
        if (detectedCorners.size != 4) return@LaunchedEffect

        val scaleX = viewSize.width.toFloat() / bmp.width
        val scaleY = viewSize.height.toFloat() / bmp.height

        cornerOffsets = detectedCorners.map { pt ->
            Offset(pt.x * scaleX, pt.y * scaleY)
        }
    }

    var isProcessing by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        "Crop & Adjust",
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onRetake) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(MaterialTheme.colorScheme.surface),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Image with crop handles
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .aspectRatio(3f / 4f)
                    .onSizeChanged { viewSize = it },
                contentAlignment = Alignment.Center
            ) {
                // Display the captured image
                bitmap?.let { bmp ->
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        drawImage(
                            image = bmp.asImageBitmap(),
                            dstSize = androidx.compose.ui.unit.IntSize(
                                size.width.toInt(),
                                size.height.toInt()
                            )
                        )
                    }
                }

                // Dashed border connecting corners
                if (cornerOffsets.size == 4) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val dashEffect = PathEffect.dashPathEffect(
                            floatArrayOf(10.dp.toPx(), 6.dp.toPx()),
                            0f
                        )
                        val stroke = Stroke(width = 2.dp.toPx(), pathEffect = dashEffect)

                        for (i in 0 until 4) {
                            val start = cornerOffsets[i]
                            val end = cornerOffsets[(i + 1) % 4]
                            drawLine(
                                color = AccentBlue,
                                start = start,
                                end = end,
                                strokeWidth = 2.dp.toPx(),
                                pathEffect = dashEffect
                            )
                        }
                    }

                    // Draggable corner handles
                    val handleSizePx = with(density) { HANDLE_SIZE_DP.dp.toPx() }
                    val halfHandle = handleSizePx / 2f

                    cornerOffsets.forEachIndexed { index, offset ->
                        Box(
                            modifier = Modifier
                                .offset {
                                    IntOffset(
                                        (offset.x - halfHandle).roundToInt(),
                                        (offset.y - halfHandle).roundToInt()
                                    )
                                }
                                .size(HANDLE_SIZE_DP.dp)
                                .shadow(4.dp, CircleShape)
                                .background(AccentBlue, CircleShape)
                                .border(2.dp, Color.White, CircleShape)
                                .pointerInput(index) {
                                    detectDragGestures { change, dragAmount ->
                                        change.consume()
                                        val newOffset = Offset(
                                            x = (cornerOffsets[index].x + dragAmount.x)
                                                .coerceIn(0f, viewSize.width.toFloat()),
                                            y = (cornerOffsets[index].y + dragAmount.y)
                                                .coerceIn(0f, viewSize.height.toFloat())
                                        )
                                        cornerOffsets = cornerOffsets
                                            .toMutableList()
                                            .apply { set(index, newOffset) }
                                    }
                                }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Bottom buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedButton(
                    onClick = onRetake,
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.onSurface
                    )
                ) {
                    Text("Retake", fontWeight = FontWeight.Medium)
                }

                Button(
                    onClick = {
                        if (isProcessing) return@Button
                        isProcessing = true

                        scope.launch {
                            val bmp = bitmap ?: return@launch
                            val docId = withContext(Dispatchers.IO) {
                                // Map view coordinates back to bitmap coordinates
                                val scaleX = bmp.width.toFloat() / viewSize.width
                                val scaleY = bmp.height.toFloat() / viewSize.height

                                val bitmapCorners = cornerOffsets.map { offset ->
                                    PointF(offset.x * scaleX, offset.y * scaleY)
                                }

                                // Compute output dimensions and apply perspective transform
                                val (outW, outH) = PerspectiveTransform.computeOutputSize(bitmapCorners)
                                val corrected = PerspectiveTransform.transformPerspective(
                                    bmp, bitmapCorners, outW, outH
                                )

                                // Save corrected image
                                val fileName = "doc_${System.currentTimeMillis()}.jpg"
                                val savedPath = fileHelper.saveImage(corrected, fileName)

                                // Create document and page
                                val id = UUID.randomUUID().toString()
                                val now = System.currentTimeMillis()

                                val document = Document(
                                    id = id,
                                    name = "Scan ${
                                        java.text.SimpleDateFormat(
                                            "MMM dd, HH:mm",
                                            java.util.Locale.getDefault()
                                        ).format(java.util.Date(now))
                                    }",
                                    folderName = null,
                                    pageCount = 1,
                                    createdAt = now,
                                    updatedAt = now,
                                    thumbnailPath = savedPath,
                                    pdfPath = null,
                                    totalSizeBytes = fileHelper.getFileSize(savedPath)
                                )
                                repository.saveDocument(document)

                                val page = Page(
                                    id = UUID.randomUUID().toString(),
                                    documentId = id,
                                    pageNumber = 1,
                                    imagePath = savedPath,
                                    ocrText = null
                                )
                                repository.savePage(page)

                                corrected.recycle()
                                id
                            }
                            onConfirm(docId)
                        }
                    },
                    enabled = !isProcessing && bitmap != null,
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AccentBlue
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Confirm", fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

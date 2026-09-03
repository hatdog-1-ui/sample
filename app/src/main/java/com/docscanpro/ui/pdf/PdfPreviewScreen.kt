package com.docscanpro.ui.pdf

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.docscanpro.pdf.PdfGenerator

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfPreviewScreen(
    documentId: String,
    onSave: () -> Unit,
    onShare: () -> Unit,
    onBack: () -> Unit,
    viewModel: PdfPreviewViewModel = hiltViewModel()
) {
    val pages by viewModel.pages.collectAsState()
    val selectedPageSize by viewModel.selectedPageSize.collectAsState()
    val selectedQuality by viewModel.selectedQuality.collectAsState()
    val isGenerating by viewModel.isGenerating.collectAsState()

    val pageCount = pages.size.coerceAtLeast(1)

    Scaffold(
        containerColor = MaterialTheme.colorScheme.surface,
        topBar = {
            TopAppBar(
                title = { Text("PDF Preview", fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // PDF page preview card
            Card(
                modifier = Modifier
                    .fillMaxWidth(0.62f)
                    .aspectRatio(1f / 1.414f),
                shape = RoundedCornerShape(4.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        repeat(8) { index ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(if (index == 7) 0.5f else 1f)
                                    .height(6.dp)
                                    .padding(vertical = 3.dp)
                                    .background(MaterialTheme.colorScheme.outline, RoundedCornerShape(2.dp))
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                    }
                    Text(
                        text = "1 / $pageCount",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 10.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Page size selector
            Text(
                text = "Page Size",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                val sizes = PdfGenerator.PageSize.values()
                sizes.forEachIndexed { index, size ->
                    SegmentedButton(
                        selected = selectedPageSize == size,
                        onClick = { viewModel.setPageSize(size) },
                        shape = SegmentedButtonDefaults.itemShape(index = index, count = sizes.size),
                        colors = SegmentedButtonDefaults.colors(
                            activeContainerColor = MaterialTheme.colorScheme.primary,
                            activeContentColor = MaterialTheme.colorScheme.onPrimary
                        )
                    ) {
                        Text(
                            text = when (size) {
                                PdfGenerator.PageSize.A4 -> "A4"
                                PdfGenerator.PageSize.LETTER -> "Letter"
                                PdfGenerator.PageSize.LEGAL -> "Legal"
                            },
                            fontSize = 13.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Quality selector
            Text(
                text = "Quality",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                val qualities = PdfGenerator.Quality.values()
                qualities.forEachIndexed { index, quality ->
                    SegmentedButton(
                        selected = selectedQuality == quality,
                        onClick = { viewModel.setQuality(quality) },
                        shape = SegmentedButtonDefaults.itemShape(index = index, count = qualities.size),
                        colors = SegmentedButtonDefaults.colors(
                            activeContainerColor = MaterialTheme.colorScheme.primary,
                            activeContentColor = MaterialTheme.colorScheme.onPrimary
                        )
                    ) {
                        Text(
                            text = when (quality) {
                                PdfGenerator.Quality.LOW -> "Low"
                                PdfGenerator.Quality.MEDIUM -> "Medium"
                                PdfGenerator.Quality.HIGH -> "High"
                            },
                            fontSize = 13.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = {
                        viewModel.generatePdf()
                        onSave()
                    },
                    enabled = !isGenerating,
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    shape = RoundedCornerShape(50),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Download,
                        contentDescription = null,
                        modifier = Modifier.width(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Save")
                }

                OutlinedButton(
                    onClick = {
                        viewModel.generatePdf()
                        onShare()
                    },
                    enabled = !isGenerating,
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    shape = RoundedCornerShape(50)
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = null,
                        modifier = Modifier.width(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Share")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

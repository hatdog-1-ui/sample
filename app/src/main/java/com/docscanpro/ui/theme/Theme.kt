package com.docscanpro.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = Blue600,
    onPrimary = White,
    primaryContainer = Blue100,
    onPrimaryContainer = Blue700,
    secondary = Blue500,
    onSecondary = White,
    secondaryContainer = Blue50,
    onSecondaryContainer = Blue700,
    surface = Slate50,
    onSurface = Slate900,
    onSurfaceVariant = Slate500,
    surfaceVariant = Slate100,
    background = White,
    onBackground = Slate900,
    outline = Slate200,
    outlineVariant = Slate200,
    error = Red500,
    onError = White
)

@Composable
fun DocScanProTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}

package com.docscanpro.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DocScanLightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    primaryContainer = PrimaryContainer,
    onPrimaryContainer = OnSurface,
    secondaryContainer = SecondaryContainer,
    onSecondaryContainer = OnSurface,
    surface = Surface,
    onSurface = OnSurface,
    onSurfaceVariant = OnSurfaceVariant,
    background = Background,
    onBackground = OnSurface,
    outline = Outline,
    error = Error,
)

/**
 * DocScan Pro app theme.
 *
 * Dynamic color is intentionally disabled so the app always renders the
 * brand's fixed light color scheme, matching the web design exactly.
 */
@Composable
fun DocScanProTheme(
    // Dynamic color is deliberately not exposed as an option here.
    content: @Composable () -> Unit
) {
    val colorScheme = DocScanLightColorScheme
    val darkTheme = isSystemInDarkTheme()

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.surface.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

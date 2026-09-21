package com.example.bncc.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = SignalRed,
    onPrimary = PaperText,
    primaryContainer = SignalRedDim,
    onPrimaryContainer = PaperText,
    secondary = NavalCyan,
    onSecondary = NavyBackground,
    secondaryContainer = NavySurfaceVariant,
    onSecondaryContainer = PaperText,
    background = NavyBackground,
    onBackground = PaperText,
    surface = NavySurface,
    onSurface = PaperText,
    surfaceVariant = NavySurfaceVariant,
    onSurfaceVariant = SteelText,
    outline = NavyGlassBorder
)

@Composable
fun BNCCTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = NavyBackground.toArgb()
            window.navigationBarColor = NavyBackground.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

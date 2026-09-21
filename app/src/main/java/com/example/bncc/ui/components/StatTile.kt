package com.example.bncc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.theme.NavyGlassBorder
import com.example.bncc.ui.theme.NavySurface
import com.example.bncc.ui.theme.PaperText
import com.example.bncc.ui.theme.SignalRed
import com.example.bncc.ui.theme.SteelText

@Composable
fun StatTile(
    label: String,
    value: String,
    caption: String,
    modifier: Modifier = Modifier,
    accentColor: Color = SignalRed,
    icon: ImageVector? = null,
    testTag: String = "stat_tile",
    onClick: (() -> Unit)? = null
) {
    val shape = RoundedCornerShape(12.dp)
    val clickModifier = if (onClick != null) {
        Modifier.clickable { onClick() }
    } else Modifier

    Box(
        modifier = modifier
            .testTag(testTag)
            .clip(shape)
            .background(NavySurface)
            .border(1.dp, NavyGlassBorder, shape)
            .then(clickModifier)
            .padding(14.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(accentColor)
                    )
                    Text(
                        text = " $label",
                        style = MaterialTheme.typography.labelMedium,
                        color = SteelText,
                        fontFamily = FontFamily.Monospace
                    )
                }
                if (onClick != null) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "View detail",
                        tint = SteelText.copy(alpha = 0.6f),
                        modifier = Modifier.size(14.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = value,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = PaperText,
                lineHeight = 32.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = caption,
                style = MaterialTheme.typography.bodyMedium,
                color = SteelText,
                fontSize = 12.sp
            )
        }
    }
}

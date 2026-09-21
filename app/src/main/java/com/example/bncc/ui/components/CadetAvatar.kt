package com.example.bncc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.bncc.ui.theme.NavyGlassBorder
import com.example.bncc.ui.theme.NavySurfaceVariant
import com.example.bncc.ui.theme.PaperText
import com.example.bncc.util.BanglaUtils

@Composable
fun CadetAvatar(
    name: String,
    photoUrl: String?,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp,
    shape: RoundedCornerShape = RoundedCornerShape(10.dp)
) {
    val context = LocalContext.current
    val drawableResId = if (!photoUrl.isNullOrBlank()) {
        context.resources.getIdentifier(photoUrl, "drawable", context.packageName)
    } else 0

    Box(
        modifier = modifier
            .size(size)
            .clip(shape)
            .background(NavySurfaceVariant)
            .border(1.dp, NavyGlassBorder, shape),
        contentAlignment = Alignment.Center
    ) {
        if (drawableResId != 0) {
            androidx.compose.foundation.Image(
                painter = painterResource(id = drawableResId),
                contentDescription = name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.matchParentSize()
            )
        } else if (!photoUrl.isNullOrBlank() && (photoUrl.startsWith("http://") || photoUrl.startsWith("https://"))) {
            AsyncImage(
                model = photoUrl,
                contentDescription = name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.matchParentSize()
            )
        } else {
            val initial = BanglaUtils.getInitial(name)
            Text(
                text = initial,
                color = PaperText,
                fontSize = (size.value * 0.42).sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

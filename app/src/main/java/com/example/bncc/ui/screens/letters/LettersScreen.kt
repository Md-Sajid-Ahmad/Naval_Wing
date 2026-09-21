package com.example.bncc.ui.screens.letters

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.theme.NavalCyan
import com.example.bncc.ui.theme.NavyBackground
import com.example.bncc.ui.theme.NavyGlassBorder
import com.example.bncc.ui.theme.NavySurface
import com.example.bncc.ui.theme.PaperText
import com.example.bncc.ui.theme.SteelText

@Composable
fun LettersScreen(
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(NavyBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "OFFICIAL CORRESPONDENCE",
                style = MaterialTheme.typography.labelMedium,
                color = SteelText,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "চিঠি ও দাপ্তরিক নথি",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = PaperText
            )
        }

        item {
            val cardShape = RoundedCornerShape(14.dp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(cardShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, cardShape)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(NavalCyan.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mail,
                            contentDescription = "Letters",
                            tint = NavalCyan,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Text(
                        text = "চিঠি ব্যবস্থাপনা মডিউল",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = PaperText
                    )

                    Text(
                        text = "দাপ্তরিক পত্র প্রস্তুতকরণ, স্মারক নম্বর ও ডিজিটাল অনুমোদন ব্যবস্থাপনা পরবর্তী সংস্করণে যুক্ত হবে।",
                        color = SteelText,
                        fontSize = 13.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 20.sp
                    )
                }
            }
        }

        item {
            Text(
                text = "প্রস্তাবিত পত্র টেমপ্লেটসমূহ",
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = PaperText
            )
        }

        val templates = listOf(
            "মহড়া ও প্রশিক্ষণ অনুমতি পত্র" to "নৌ উইং বার্ষিক ক্যাম্প ও বিশেষ প্রশিক্ষণ মহড়া",
            "ছুটি ও অনুপস্থিতির আবেদন" to "ক্যাডেটদের প্রাতিষ্ঠানিক ও মেডিকেল ছুটির অনুমোদন",
            "ক্যাডেট পদোন্নতি সুপারিশ পত্র" to "যোগ্য ক্যাডেটদের পদমর্যাদা উন্নীতকরণ সুপারিশ"
        )

        items(templates.size) { index ->
            val (title, subtitle) = templates[index]
            val rowShape = RoundedCornerShape(10.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(rowShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, rowShape)
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Description,
                    contentDescription = null,
                    tint = NavalCyan,
                    modifier = Modifier.size(24.dp)
                )
                Column {
                    Text(
                        text = title,
                        color = PaperText,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = subtitle,
                        color = SteelText,
                        fontSize = 12.sp
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

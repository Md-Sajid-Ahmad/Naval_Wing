package com.example.bncc.ui.screens.dismissed

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.components.CadetAvatar
import com.example.bncc.ui.screens.breakdown.GenderFilter
import com.example.bncc.ui.theme.NavalCyan
import com.example.bncc.ui.theme.NavyBackground
import com.example.bncc.ui.theme.NavyGlassBorder
import com.example.bncc.ui.theme.NavySurface
import com.example.bncc.ui.theme.NavySurfaceVariant
import com.example.bncc.ui.theme.PaperText
import com.example.bncc.ui.theme.SignalRed
import com.example.bncc.ui.theme.SteelText
import com.example.bncc.ui.theme.SuccessGreen
import com.example.bncc.util.BanglaUtils

@Composable
fun DismissedCadetsScreen(
    viewModel: DismissedCadetsViewModel,
    onBack: () -> Unit,
    onSelectCadet: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(NavyBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier
                    .testTag("btn_back_dismissed")
                    .clickable { onBack() }
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = NavalCyan,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "ড্যাশবোর্ডে ফিরে যান",
                    color = NavalCyan,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "DISMISSED CADETS LIST",
                style = MaterialTheme.typography.labelMedium,
                color = SignalRed,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "বহিষ্কার ও নিষ্ক্রিয় ক্যাডেট তালিকা",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = PaperText
            )
        }

        // Gender Tabs
        item {
            val barShape = RoundedCornerShape(10.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(barShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, barShape)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                val filters = listOf(
                    GenderFilter.ALL to "সব (${BanglaUtils.bn(state.totalDismissed)})",
                    GenderFilter.MALE to "পুরুষ",
                    GenderFilter.FEMALE to "নারী"
                )

                filters.forEach { (filter, title) ->
                    val isSelected = state.genderFilter == filter
                    Box(
                        modifier = Modifier
                            .testTag("filter_dismissed_${filter.name.lowercase()}")
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) SignalRed else NavySurfaceVariant)
                            .clickable { viewModel.setGenderFilter(filter) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = title,
                            color = if (isSelected) PaperText else SteelText,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }
        }

        if (state.dismissedCadets.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "কোনো বহিষ্কৃত বা নিষ্ক্রিয় ক্যাডেট নেই", color = SteelText, fontSize = 14.sp)
                }
            }
        } else {
            items(state.dismissedCadets, key = { it.id }) { cadet ->
                val cardShape = RoundedCornerShape(12.dp)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(cardShape)
                        .background(NavySurface)
                        .border(1.dp, SignalRed.copy(alpha = 0.3f), cardShape)
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { onSelectCadet(cadet.id) }
                        ) {
                            CadetAvatar(name = cadet.fullName, photoUrl = cadet.photoUrl, size = 44.dp)
                            Column {
                                Text(
                                    text = cadet.fullName,
                                    color = PaperText,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = "${cadet.cadetId} · ${BanglaUtils.getRankBangla(cadet.rank)} · ব্যাচ ${BanglaUtils.bn(cadet.batch)}",
                                    color = SteelText,
                                    fontSize = 12.sp
                                )
                            }
                        }

                        Button(
                            onClick = { viewModel.reactivateCadet(cadet) },
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.testTag("btn_reactivate_${cadet.cadetId}")
                        ) {
                            Text("সক্রিয় করুন", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

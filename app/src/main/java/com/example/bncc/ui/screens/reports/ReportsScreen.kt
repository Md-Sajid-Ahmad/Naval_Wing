package com.example.bncc.ui.screens.reports

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.components.StatTile
import com.example.bncc.ui.theme.NavalCyan
import com.example.bncc.ui.theme.NavyBackground
import com.example.bncc.ui.theme.NavyGlassBorder
import com.example.bncc.ui.theme.NavySurface
import com.example.bncc.ui.theme.NavySurfaceVariant
import com.example.bncc.ui.theme.PaperText
import com.example.bncc.ui.theme.SignalRed
import com.example.bncc.ui.theme.SteelText
import com.example.bncc.ui.theme.SuccessGreen
import com.example.bncc.ui.theme.WarningAmber
import com.example.bncc.util.BanglaUtils

@Composable
fun ReportsScreen(
    viewModel: ReportsViewModel,
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
            Text(
                text = "OPERATIONAL REPORTS",
                style = MaterialTheme.typography.labelMedium,
                color = SteelText,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "সার্বিক পরিসংখ্যান ও রিপোর্ট",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = PaperText
            )
        }

        // Summary Metric Tiles
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatTile(
                        label = "TOTAL CADETS",
                        value = "${BanglaUtils.bn(state.totalCadets)} জন",
                        caption = "সক্রিয়: ${BanglaUtils.bn(state.activeCadets)} জন",
                        accentColor = NavalCyan,
                        modifier = Modifier.weight(1f)
                    )

                    StatTile(
                        label = "ATTENDANCE RATE",
                        value = "${BanglaUtils.bn(state.overallAttendanceRate)}%",
                        caption = "গড় হাজিরা অনুপাত",
                        accentColor = SuccessGreen,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatTile(
                        label = "SESSIONS RECORDED",
                        value = "${BanglaUtils.bn(state.totalAttendanceRecords)} টি",
                        caption = "সর্বমোট হাজিরা এন্ট্রি",
                        accentColor = WarningAmber,
                        modifier = Modifier.weight(1f)
                    )

                    StatTile(
                        label = "GENDER RATIO",
                        value = "${BanglaUtils.bn(state.maleCount)} : ${BanglaUtils.bn(state.femaleCount)}",
                        caption = "পুরুষ ও নারী অনুপাত",
                        accentColor = SignalRed,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Rank Breakdown Title
        item {
            Text(
                text = "পদমর্যাদাভিত্তিক বিন্যাস",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = PaperText
            )
        }

        // Rank Progress distributions
        items(state.rankDistributions) { dist ->
            val cardShape = RoundedCornerShape(10.dp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(cardShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, cardShape)
                    .padding(14.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${dist.rank} (${dist.rankBn})",
                            color = PaperText,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "${BanglaUtils.bn(dist.count)} জন · ${BanglaUtils.bn((dist.percentage * 100).toInt())}%",
                            color = SteelText,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    LinearProgressIndicator(
                        progress = { dist.percentage },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = NavalCyan,
                        trackColor = NavySurfaceVariant,
                        strokeCap = StrokeCap.Round
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

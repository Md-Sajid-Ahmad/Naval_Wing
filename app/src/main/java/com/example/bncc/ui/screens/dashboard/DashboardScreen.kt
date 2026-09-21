package com.example.bncc.ui.screens.dashboard

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.components.CadetAvatar
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
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToBreakdown: () -> Unit,
    onNavigateToDismissed: () -> Unit,
    onNavigateToCadets: () -> Unit,
    onNavigateToAttendance: () -> Unit,
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
            // Live Status Indicator & Operational Title
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(SuccessGreen)
                )
                Text(
                    text = "BNCC NAVAL WING · LIVE SYSTEM",
                    style = MaterialTheme.typography.labelMedium,
                    color = SteelText,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = state.greeting,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = PaperText
            )

            Text(
                text = "অপারেশন ড্যাশবোর্ড · ${BanglaUtils.bn(state.formattedDate)}",
                style = MaterialTheme.typography.bodyMedium,
                color = SteelText
            )
        }

        // 4 Primary Metric Tiles in 2x2 Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatTile(
                        label = "TOTAL CADETS",
                        value = "${BanglaUtils.bn(state.activeCadetsCount)} জন",
                        caption = "ক্যাডেট বিস্তারিত দেখুন",
                        accentColor = NavalCyan,
                        testTag = "stat_total_cadets",
                        onClick = onNavigateToBreakdown,
                        modifier = Modifier.weight(1f)
                    )

                    StatTile(
                        label = "BATCHES",
                        value = "${BanglaUtils.bn(state.batchCount)} টি",
                        caption = "সর্বমোট সক্রিয় ব্যাচ",
                        accentColor = SuccessGreen,
                        testTag = "stat_batches",
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatTile(
                        label = "RANKS",
                        value = "${BanglaUtils.bn(state.rankCount)} টি",
                        caption = "পদমর্যাদা বিভাজন",
                        accentColor = WarningAmber,
                        testTag = "stat_ranks",
                        modifier = Modifier.weight(1f)
                    )

                    StatTile(
                        label = "DISMISSED",
                        value = "${BanglaUtils.bn(state.dismissedCount)} জন",
                        caption = "বহিষ্কার ক্যাডেট লিস্ট",
                        accentColor = SignalRed,
                        testTag = "stat_dismissed",
                        onClick = onNavigateToDismissed,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Today's Muster / Quick Attendance Overview
        item {
            val cardShape = RoundedCornerShape(14.dp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(cardShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, cardShape)
                    .padding(16.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "TODAY'S MUSTER · আজকের হাজিরা",
                            style = MaterialTheme.typography.labelMedium,
                            color = SteelText,
                            fontFamily = FontFamily.Monospace
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(SuccessGreen.copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "${BanglaUtils.bn(state.todayPresentCount)} / ${BanglaUtils.bn(state.activeCadetsCount)} উপস্থিত",
                                color = SuccessGreen,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = onNavigateToAttendance,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SignalRed
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .testTag("btn_today_attendance")
                                .weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("হাজিরা দিন", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = onNavigateToCadets,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .testTag("btn_add_cadet")
                                .weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PersonAdd,
                                contentDescription = null,
                                tint = PaperText,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("ক্যাডেট তালিকা", color = PaperText, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Recent Cadets preview header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "সক্রিয় ক্যাডেটগণ",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PaperText
                )
                Text(
                    text = "সব দেখুন >",
                    fontSize = 12.sp,
                    color = NavalCyan,
                    modifier = Modifier.clickable { onNavigateToCadets() }
                )
            }
        }

        // List of recent active cadets
        items(state.recentCadets) { cadet ->
            val cardShape = RoundedCornerShape(10.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(cardShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, cardShape)
                    .clickable { onSelectCadet(cadet.id) }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    CadetAvatar(name = cadet.fullName, photoUrl = cadet.photoUrl, size = 42.dp)
                    Column {
                        Text(
                            text = cadet.fullName,
                            color = PaperText,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "${cadet.cadetId} · ${BanglaUtils.getRankBangla(cadet.rank)} · ব্যাচ ${BanglaUtils.bn(cadet.batch)}",
                            color = SteelText,
                            fontSize = 12.sp
                        )
                    }
                }

                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Details",
                    tint = SteelText.copy(alpha = 0.5f),
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

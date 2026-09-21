package com.example.bncc.ui.screens.cadetdetail

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
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.WorkspacePremium
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.components.CadetAvatar
import com.example.bncc.ui.theme.ExcusedPurple
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
fun CadetDetailScreen(
    viewModel: CadetDetailViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val cadet = state.cadet

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(NavyBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(12.dp))
            // Back Button Bar
            Row(
                modifier = Modifier
                    .testTag("btn_back_cadet_detail")
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
                    text = "ক্যাডেট তালিকায় ফিরে যান",
                    color = NavalCyan,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        if (cadet == null) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "ক্যাডেট তথ্য লোড হচ্ছে...", color = SteelText)
                }
            }
        } else {
            // Cadet Profile Header Card
            item {
                val cardShape = RoundedCornerShape(14.dp)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(cardShape)
                        .background(NavySurface)
                        .border(1.dp, NavyGlassBorder, cardShape)
                        .padding(18.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        CadetAvatar(
                            name = cadet.fullName,
                            photoUrl = cadet.photoUrl,
                            size = 68.dp,
                            shape = RoundedCornerShape(12.dp)
                        )

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = cadet.cadetId,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = SteelText,
                                    fontFamily = FontFamily.Monospace
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(
                                            if (cadet.gender == "female") SignalRed.copy(alpha = 0.15f)
                                            else NavalCyan.copy(alpha = 0.15f)
                                        )
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = if (cadet.gender == "female") "নারী" else "পুরুষ",
                                        color = if (cadet.gender == "female") SignalRed else NavalCyan,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = cadet.fullName,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = PaperText
                            )

                            Text(
                                text = "${cadet.rank} · ${BanglaUtils.getRankBangla(cadet.rank)}",
                                color = NavalCyan,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }

            // 4 Info Tiles in 2x2 Grid
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        InfoCard(
                            label = "BATCH · ব্যাচ",
                            value = "${BanglaUtils.bn(cadet.batch)} (ওয়ার্ড ${cadet.ward})",
                            icon = Icons.Default.WorkspacePremium,
                            modifier = Modifier.weight(1f)
                        )

                        val isDismissed = cadet.status == "inactive"
                        InfoCard(
                            label = "STATUS · অবস্থা",
                            value = BanglaUtils.getStatusBangla(cadet.status),
                            valueColor = if (isDismissed) SignalRed else SuccessGreen,
                            icon = Icons.Default.Shield,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        InfoCard(
                            label = "CONTACT · ফোন",
                            value = if (cadet.phone.isNullOrBlank()) "দেওয়া নেই" else BanglaUtils.bn(cadet.phone),
                            icon = Icons.Default.Phone,
                            modifier = Modifier.weight(1f)
                        )

                        InfoCard(
                            label = "JOINED · ভর্তি",
                            value = BanglaUtils.bn(cadet.joinedOn),
                            icon = Icons.Default.CalendarToday,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Toggle Dismissed / Active Status Button
            item {
                val isDismissed = cadet.status == "inactive"
                Button(
                    onClick = { viewModel.toggleDismissedStatus() },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isDismissed) SuccessGreen else SignalRed
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .testTag("btn_toggle_dismissed")
                        .fillMaxWidth()
                ) {
                    Text(
                        text = if (isDismissed) "পুনরায় সক্রিয় করুন" else "ক্যাডেট বহিষ্কার / নিষ্ক্রিয় করুন",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }

            // Attendance Muster History Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "সাম্প্রতিক উপস্থিতি রেকর্ড",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PaperText
                    )
                    Text(
                        text = "গড় হার: ${BanglaUtils.bn(state.attendanceRatePercent)}%",
                        style = MaterialTheme.typography.labelMedium,
                        color = SteelText,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            if (state.recentAttendance.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "কোনো উপস্থিতির রেকর্ড নেই", color = SteelText, fontSize = 13.sp)
                    }
                }
            } else {
                items(state.recentAttendance) { record ->
                    val rowShape = RoundedCornerShape(8.dp)
                    val statusColor = when (record.status) {
                        "present" -> SuccessGreen
                        "absent" -> SignalRed
                        "late" -> WarningAmber
                        "excused" -> ExcusedPurple
                        else -> SteelText
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(rowShape)
                            .background(NavySurface)
                            .border(1.dp, NavyGlassBorder, rowShape)
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = BanglaUtils.bn(record.sessionDate),
                            color = PaperText,
                            fontSize = 13.sp,
                            fontFamily = FontFamily.Monospace
                        )

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(statusColor.copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = BanglaUtils.getStatusBangla(record.status),
                                color = statusColor,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun InfoCard(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier,
    valueColor: Color = PaperText
) {
    val shape = RoundedCornerShape(10.dp)
    Box(
        modifier = modifier
            .clip(shape)
            .background(NavySurface)
            .border(1.dp, NavyGlassBorder, shape)
            .padding(12.dp)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = SteelText,
                    modifier = Modifier.size(14.dp)
                )
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelMedium,
                    color = SteelText,
                    fontFamily = FontFamily.Monospace
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = valueColor
            )
        }
    }
}

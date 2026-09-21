package com.example.bncc.ui.screens.attendance

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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
fun AttendanceScreen(
    viewModel: AttendanceViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(NavyBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "ATTENDANCE MUSTER",
                        style = MaterialTheme.typography.labelMedium,
                        color = SteelText,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "উপস্থিতি হাজিরা",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = PaperText
                    )
                }

                Button(
                    onClick = { viewModel.markAllPresent() },
                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.testTag("btn_mark_all_present")
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("সবাই উপস্থিত", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Date Picker & Switcher Bar
        item {
            val barShape = RoundedCornerShape(12.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(barShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, barShape)
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { viewModel.previousDay() },
                    modifier = Modifier.testTag("btn_prev_date")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Previous Day",
                        tint = NavalCyan
                    )
                }

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.clickable { viewModel.goToToday() }
                ) {
                    Text(
                        text = BanglaUtils.bn(state.formattedDisplayDate),
                        color = PaperText,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Text(
                        text = "তারিখ: ${BanglaUtils.bn(state.selectedDate)} (আজকের তারিখ দেখতে চাপুন)",
                        color = SteelText,
                        fontSize = 11.sp
                    )
                }

                IconButton(
                    onClick = { viewModel.nextDay() },
                    modifier = Modifier.testTag("btn_next_date")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Next Day",
                        tint = NavalCyan
                    )
                }
            }
        }

        // 4 Summary Status Indicators
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatusCounter(
                    count = state.presentCount,
                    label = "উপস্থিত",
                    color = SuccessGreen,
                    modifier = Modifier.weight(1f)
                )
                StatusCounter(
                    count = state.absentCount,
                    label = "অনুপস্থিত",
                    color = SignalRed,
                    modifier = Modifier.weight(1f)
                )
                StatusCounter(
                    count = state.lateCount,
                    label = "দেরি",
                    color = WarningAmber,
                    modifier = Modifier.weight(1f)
                )
                StatusCounter(
                    count = state.excusedCount,
                    label = "ছুটি",
                    color = ExcusedPurple,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Instructions
        item {
            Text(
                text = "ভুল হলে অন্য চিহ্ন চাপুন; নির্বাচিত চিহ্নে আবার চাপলে তা মুছে যাবে।",
                color = SteelText,
                fontSize = 12.sp,
                modifier = Modifier.padding(horizontal = 4.dp)
            )
        }

        // Cadet Attendance List
        items(state.cadets, key = { it.id }) { cadet ->
            val currentStatus = state.attendanceMap[cadet.id]
            val rowShape = RoundedCornerShape(10.dp)

            Row(
                modifier = Modifier
                    .testTag("attendance_row_${cadet.cadetId}")
                    .fillMaxWidth()
                    .clip(rowShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, rowShape)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    CadetAvatar(name = cadet.fullName, photoUrl = cadet.photoUrl, size = 40.dp)

                    Column {
                        Text(
                            text = cadet.fullName,
                            color = PaperText,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "${cadet.cadetId} · ${BanglaUtils.getRankBangla(cadet.rank)}",
                            color = SteelText,
                            fontSize = 11.sp
                        )
                    }
                }

                // 4 Status action toggle buttons: P, A, L, E
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    StatusToggleButton(
                        symbol = "P",
                        label = "উপস্থিত",
                        isSelected = currentStatus == "present",
                        activeColor = SuccessGreen,
                        onClick = { viewModel.toggleStatus(cadet.id, "present") }
                    )
                    StatusToggleButton(
                        symbol = "A",
                        label = "অনুপস্থিত",
                        isSelected = currentStatus == "absent",
                        activeColor = SignalRed,
                        onClick = { viewModel.toggleStatus(cadet.id, "absent") }
                    )
                    StatusToggleButton(
                        symbol = "L",
                        label = "দেরি",
                        isSelected = currentStatus == "late",
                        activeColor = WarningAmber,
                        onClick = { viewModel.toggleStatus(cadet.id, "late") }
                    )
                    StatusToggleButton(
                        symbol = "E",
                        label = "ছুটি",
                        isSelected = currentStatus == "excused",
                        activeColor = ExcusedPurple,
                        onClick = { viewModel.toggleStatus(cadet.id, "excused") }
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun StatusCounter(
    count: Int,
    label: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    val shape = RoundedCornerShape(8.dp)
    Box(
        modifier = modifier
            .clip(shape)
            .background(NavySurface)
            .border(1.dp, NavyGlassBorder, shape)
            .padding(vertical = 8.dp, horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = BanglaUtils.bn(count),
                color = color,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = label,
                color = SteelText,
                fontSize = 10.sp
            )
        }
    }
}

@Composable
private fun StatusToggleButton(
    symbol: String,
    label: String,
    isSelected: Boolean,
    activeColor: Color,
    onClick: () -> Unit
) {
    val shape = RoundedCornerShape(6.dp)
    Box(
        modifier = Modifier
            .size(34.dp)
            .clip(shape)
            .background(if (isSelected) activeColor else NavySurfaceVariant)
            .border(1.dp, if (isSelected) activeColor else NavyGlassBorder, shape)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = symbol,
            color = if (isSelected) PaperText else SteelText,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

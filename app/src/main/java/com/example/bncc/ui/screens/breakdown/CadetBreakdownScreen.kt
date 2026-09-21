package com.example.bncc.ui.screens.breakdown

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
import com.example.bncc.ui.theme.NavalCyan
import com.example.bncc.ui.theme.NavyBackground
import com.example.bncc.ui.theme.NavyGlassBorder
import com.example.bncc.ui.theme.NavySurface
import com.example.bncc.ui.theme.NavySurfaceVariant
import com.example.bncc.ui.theme.PaperText
import com.example.bncc.ui.theme.SignalRed
import com.example.bncc.ui.theme.SteelText
import com.example.bncc.util.BanglaUtils

@Composable
fun CadetBreakdownScreen(
    viewModel: CadetBreakdownViewModel,
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
                    .testTag("btn_back_breakdown")
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
                text = "CADET BREAKDOWN",
                style = MaterialTheme.typography.labelMedium,
                color = SteelText,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "ক্যাডেট বিভাজন ও সংখ্যাতত্ত্ব",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = PaperText
            )
        }

        // 3 Segmented Gender Tabs: Total / Male / Female
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
                    GenderFilter.ALL to "মোট ক্যাডেট",
                    GenderFilter.MALE to "পুরুষ ক্যাডেট",
                    GenderFilter.FEMALE to "নারী ক্যাডেট"
                )

                filters.forEach { (filter, title) ->
                    val isSelected = state.genderFilter == filter
                    Box(
                        modifier = Modifier
                            .testTag("filter_${filter.name.lowercase()}")
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

        // Count Summary
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "মোট ক্যাডেট সংখ্যা:",
                    color = SteelText,
                    fontSize = 13.sp
                )
                Text(
                    text = "${BanglaUtils.bn(state.totalFilteredCount)} জন",
                    color = PaperText,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Rank Groups
        items(state.rankGroups) { group ->
            val sectionShape = RoundedCornerShape(12.dp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(sectionShape)
                    .background(NavySurface)
                    .border(1.dp, NavyGlassBorder, sectionShape)
                    .padding(14.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = group.rank,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = PaperText
                            )
                            Text(
                                text = "· ${group.rankBn}",
                                fontSize = 13.sp,
                                color = NavalCyan
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(NavySurfaceVariant)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "${BanglaUtils.bn(group.cadets.size)} জন",
                                color = PaperText,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Cadets belonging to this rank
                    group.cadets.forEach { cadet ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(NavySurfaceVariant.copy(alpha = 0.5f))
                                .clickable { onSelectCadet(cadet.id) }
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                CadetAvatar(
                                    name = cadet.fullName,
                                    photoUrl = cadet.photoUrl,
                                    size = 32.dp
                                )
                                Column {
                                    Text(
                                        text = cadet.fullName,
                                        color = PaperText,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Text(
                                        text = "${cadet.cadetId} · ব্যাচ ${BanglaUtils.bn(cadet.batch)}",
                                        color = SteelText,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = SteelText.copy(alpha = 0.5f),
                                modifier = Modifier.size(14.dp)
                            )
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

package com.example.bncc.ui.screens.cadets

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.components.CadetAvatar
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
fun CadetsScreen(
    viewModel: CadetsViewModel,
    onSelectCadet: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    // Add form local inputs
    var inputCadetId by remember { mutableStateOf("") }
    var inputFullName by remember { mutableStateOf("") }
    var inputRank by remember { mutableStateOf("Cadet") }
    var inputBatch by remember { mutableStateOf("2024") }
    var inputWard by remember { mutableStateOf("A") }
    var inputGender by remember { mutableStateOf("male") }
    var inputPhone by remember { mutableStateOf("") }

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
                        text = "CADET REGISTER",
                        style = MaterialTheme.typography.labelMedium,
                        color = SteelText,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "ক্যাডেট তালিকা",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = PaperText
                    )
                }

                Button(
                    onClick = { viewModel.toggleAddForm() },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (state.isAddFormVisible) NavySurfaceVariant else SignalRed
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.testTag("btn_toggle_add_cadet")
                ) {
                    Icon(
                        imageVector = if (state.isAddFormVisible) Icons.Default.Close else Icons.Default.Add,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (state.isAddFormVisible) "বাতিল" else "যোগ করুন",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Add Cadet Form Box
        item {
            AnimatedVisibility(visible = state.isAddFormVisible) {
                val boxShape = RoundedCornerShape(12.dp)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(boxShape)
                        .background(NavySurface)
                        .border(1.dp, SignalRed.copy(alpha = 0.5f), boxShape)
                        .padding(16.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "নতুন ক্যাডেট নিবন্ধন",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = PaperText
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = inputCadetId,
                                onValueChange = { inputCadetId = it },
                                label = { Text("আইডি (BN-XXXX)", fontSize = 12.sp) },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = SignalRed,
                                    unfocusedBorderColor = NavyGlassBorder,
                                    focusedTextColor = PaperText,
                                    unfocusedTextColor = PaperText
                                ),
                                modifier = Modifier
                                    .testTag("input_cadet_id")
                                    .weight(1f)
                            )

                            OutlinedTextField(
                                value = inputBatch,
                                onValueChange = { inputBatch = it },
                                label = { Text("ব্যাচ", fontSize = 12.sp) },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = SignalRed,
                                    unfocusedBorderColor = NavyGlassBorder,
                                    focusedTextColor = PaperText,
                                    unfocusedTextColor = PaperText
                                ),
                                modifier = Modifier
                                    .testTag("input_batch")
                                    .weight(1f)
                            )
                        }

                        OutlinedTextField(
                            value = inputFullName,
                            onValueChange = { inputFullName = it },
                            label = { Text("ক্যাডেটের পুরো নাম (বাংলায়)", fontSize = 12.sp) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = SignalRed,
                                unfocusedBorderColor = NavyGlassBorder,
                                focusedTextColor = PaperText,
                                unfocusedTextColor = PaperText
                            ),
                            modifier = Modifier
                                .testTag("input_full_name")
                                .fillMaxWidth()
                        )

                        // Rank Selector Pills
                        Text(
                            text = "পদমর্যাদা (Rank):",
                            fontSize = 12.sp,
                            color = SteelText
                        )
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            BanglaUtils.RANKS.forEach { r ->
                                val selected = inputRank == r
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (selected) SignalRed else NavySurfaceVariant)
                                        .border(
                                            1.dp,
                                            if (selected) SignalRed else NavyGlassBorder,
                                            RoundedCornerShape(6.dp)
                                        )
                                        .clickable { inputRank = r }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = "$r · ${BanglaUtils.getRankBangla(r)}",
                                        color = if (selected) PaperText else SteelText,
                                        fontSize = 11.sp,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }

                        // Gender Selector Pills
                        Text(
                            text = "লিঙ্গ (Gender):",
                            fontSize = 12.sp,
                            color = SteelText
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("male" to "পুরুষ", "female" to "নারী").forEach { (key, label) ->
                                val selected = inputGender == key
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (selected) SignalRed else NavySurfaceVariant)
                                        .border(
                                            1.dp,
                                            if (selected) SignalRed else NavyGlassBorder,
                                            RoundedCornerShape(6.dp)
                                        )
                                        .clickable { inputGender = key }
                                        .padding(horizontal = 14.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = label,
                                        color = if (selected) PaperText else SteelText,
                                        fontSize = 12.sp,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }

                        OutlinedTextField(
                            value = inputPhone,
                            onValueChange = { inputPhone = it },
                            label = { Text("ফোন নম্বর (ঐচ্ছিক)", fontSize = 12.sp) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = SignalRed,
                                unfocusedBorderColor = NavyGlassBorder,
                                focusedTextColor = PaperText,
                                unfocusedTextColor = PaperText
                            ),
                            modifier = Modifier
                                .testTag("input_phone")
                                .fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Button(
                            onClick = {
                                if (inputCadetId.isNotBlank() && inputFullName.isNotBlank()) {
                                    viewModel.addCadet(
                                        cadetId = inputCadetId,
                                        fullName = inputFullName,
                                        rank = inputRank,
                                        batch = inputBatch,
                                        ward = inputWard,
                                        gender = inputGender,
                                        phone = inputPhone
                                    )
                                    inputCadetId = ""
                                    inputFullName = ""
                                    inputPhone = ""
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SignalRed),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .testTag("btn_save_cadet")
                                .fillMaxWidth()
                        ) {
                            Text("সংরক্ষণ করুন", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Search Bar
        item {
            OutlinedTextField(
                value = state.searchQuery,
                onValueChange = { viewModel.onSearchQueryChanged(it) },
                placeholder = { Text("নাম, আইডি বা পদমর্যাদা দিয়ে খুঁজুন...", color = SteelText, fontSize = 13.sp) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = SteelText,
                        modifier = Modifier.size(18.dp)
                    )
                },
                trailingIcon = {
                    if (state.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Clear",
                                tint = SteelText,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SignalRed,
                    unfocusedBorderColor = NavyGlassBorder,
                    focusedTextColor = PaperText,
                    unfocusedTextColor = PaperText,
                    focusedContainerColor = NavySurface,
                    unfocusedContainerColor = NavySurface
                ),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .testTag("search_cadets")
                    .fillMaxWidth()
            )
        }

        // Rank Filter Chips
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // "All" chip
                val isAllSelected = state.selectedRankFilter == null
                Box(
                    modifier = Modifier
                        .testTag("filter_rank_all")
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isAllSelected) SignalRed else NavySurface)
                        .border(1.dp, if (isAllSelected) SignalRed else NavyGlassBorder, RoundedCornerShape(8.dp))
                        .clickable { viewModel.onRankFilterSelected(null) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "সব (${BanglaUtils.bn(state.totalCount)})",
                        color = if (isAllSelected) PaperText else SteelText,
                        fontSize = 12.sp,
                        fontWeight = if (isAllSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }

                BanglaUtils.RANKS.forEach { rank ->
                    val isSelected = state.selectedRankFilter == rank
                    Box(
                        modifier = Modifier
                            .testTag("filter_rank_$rank")
                            .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) SignalRed else NavySurface)
                        .border(1.dp, if (isSelected) SignalRed else NavyGlassBorder, RoundedCornerShape(8.dp))
                        .clickable { viewModel.onRankFilterSelected(rank) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = rank,
                            color = if (isSelected) PaperText else SteelText,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }
        }

        // Cadets Count Indicator
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${BanglaUtils.bn(state.cadets.size)} / ${BanglaUtils.bn(state.totalCount)} CADETS",
                    style = MaterialTheme.typography.labelMedium,
                    color = SteelText,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // Cadet List Items
        if (state.cadets.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "কোনো ক্যাডেট পাওয়া যায়নি",
                        color = SteelText,
                        fontSize = 14.sp
                    )
                }
            }
        } else {
            items(state.cadets, key = { it.id }) { cadet ->
                val cardShape = RoundedCornerShape(12.dp)
                val isDismissed = cadet.status == "inactive"
                Row(
                    modifier = Modifier
                        .testTag("cadet_item_${cadet.cadetId}")
                        .fillMaxWidth()
                        .clip(cardShape)
                        .background(NavySurface)
                        .border(
                            1.dp,
                            if (isDismissed) SignalRed.copy(alpha = 0.4f) else NavyGlassBorder,
                            cardShape
                        )
                        .clickable { onSelectCadet(cadet.id) }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        CadetAvatar(
                            name = cadet.fullName,
                            photoUrl = cadet.photoUrl,
                            size = 46.dp
                        )

                        Column {
                            Text(
                                text = cadet.fullName,
                                color = PaperText,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${cadet.cadetId} · ${BanglaUtils.getRankBangla(cadet.rank)} · ব্যাচ ${BanglaUtils.bn(cadet.batch)}",
                                color = SteelText,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(
                                    if (isDismissed) SignalRed.copy(alpha = 0.15f)
                                    else SuccessGreen.copy(alpha = 0.15f)
                                )
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = BanglaUtils.getStatusBangla(cadet.status),
                                color = if (isDismissed) SignalRed else SuccessGreen,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = "View Details",
                            tint = SteelText.copy(alpha = 0.4f),
                            modifier = Modifier.size(16.dp)
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

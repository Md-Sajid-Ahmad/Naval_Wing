package com.example.bncc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.bncc.ui.theme.NavyGlassBorder
import com.example.bncc.ui.theme.NavySurface
import com.example.bncc.ui.theme.SignalRed
import com.example.bncc.ui.theme.SteelText

enum class NavTab(val route: String, val titleBn: String, val icon: ImageVector) {
    DASHBOARD("dashboard", "ড্যাশবোর্ড", Icons.Default.GridView),
    CADETS("cadets", "ক্যাডেট", Icons.Default.People),
    ATTENDANCE("attendance", "উপস্থিতি", Icons.Default.CheckCircle),
    LETTERS("letters", "চিঠি", Icons.Default.Mail),
    REPORTS("reports", "রিপোর্ট", Icons.Default.Assessment)
}

@Composable
fun BNCCBottomBar(
    currentRoute: String,
    onTabSelected: (NavTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(NavySurface)
            .border(1.dp, NavyGlassBorder, RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            .padding(horizontal = 8.dp, vertical = 6.dp)
            .height(60.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        NavTab.entries.forEach { tab ->
            val isSelected = currentRoute == tab.route
            val itemColor = if (isSelected) SignalRed else SteelText

            Column(
                modifier = Modifier
                    .testTag("nav_tab_${tab.route}")
                    .weight(1f)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { onTabSelected(tab) },
                horizontalAlignment = Alignment.CenterVertically,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = tab.icon,
                    contentDescription = tab.titleBn,
                    tint = itemColor,
                    modifier = Modifier.size(22.dp)
                )
                Text(
                    text = tab.titleBn,
                    fontSize = 11.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = itemColor,
                    maxLines = 1,
                    modifier = Modifier.padding(top = 3.dp)
                )
            }
        }
    }
}

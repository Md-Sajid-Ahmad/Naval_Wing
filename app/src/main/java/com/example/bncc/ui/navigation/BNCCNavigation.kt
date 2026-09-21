package com.example.bncc.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.bncc.data.repository.BNCCRepository
import com.example.bncc.ui.components.BNCCBottomBar
import com.example.bncc.ui.components.NavTab
import com.example.bncc.ui.screens.attendance.AttendanceScreen
import com.example.bncc.ui.screens.attendance.AttendanceViewModel
import com.example.bncc.ui.screens.breakdown.CadetBreakdownScreen
import com.example.bncc.ui.screens.breakdown.CadetBreakdownViewModel
import com.example.bncc.ui.screens.cadetdetail.CadetDetailScreen
import com.example.bncc.ui.screens.cadetdetail.CadetDetailViewModel
import com.example.bncc.ui.screens.cadets.CadetsScreen
import com.example.bncc.ui.screens.cadets.CadetsViewModel
import com.example.bncc.ui.screens.dashboard.DashboardScreen
import com.example.bncc.ui.screens.dashboard.DashboardViewModel
import com.example.bncc.ui.screens.dismissed.DismissedCadetsScreen
import com.example.bncc.ui.screens.dismissed.DismissedCadetsViewModel
import com.example.bncc.ui.screens.letters.LettersScreen
import com.example.bncc.ui.screens.reports.ReportsScreen
import com.example.bncc.ui.screens.reports.ReportsViewModel
import com.example.bncc.ui.theme.NavyBackground

object Routes {
    const val DASHBOARD = "dashboard"
    const val CADETS = "cadets"
    const val ATTENDANCE = "attendance"
    const val LETTERS = "letters"
    const val REPORTS = "reports"
    const val CADET_DETAIL = "cadet_detail/{cadetId}"
    const val CADET_BREAKDOWN = "cadet_breakdown"
    const val DISMISSED_CADETS = "dismissed_cadets"

    fun cadetDetail(id: String) = "cadet_detail/$id"
}

@Composable
fun BNCCNavigation(
    repository: BNCCRepository,
    navController: NavHostController = rememberNavController()
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Routes.DASHBOARD

    val showBottomBar = currentRoute in listOf(
        Routes.DASHBOARD,
        Routes.CADETS,
        Routes.ATTENDANCE,
        Routes.LETTERS,
        Routes.REPORTS
    )

    Scaffold(
        containerColor = NavyBackground,
        bottomBar = {
            if (showBottomBar) {
                BNCCBottomBar(
                    currentRoute = currentRoute,
                    onTabSelected = { tab ->
                        navController.navigate(tab.route) {
                            popUpTo(Routes.DASHBOARD) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.DASHBOARD,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Routes.DASHBOARD) {
                val vm: DashboardViewModel = viewModel(factory = DashboardViewModel.Factory(repository))
                DashboardScreen(
                    viewModel = vm,
                    onNavigateToBreakdown = { navController.navigate(Routes.CADET_BREAKDOWN) },
                    onNavigateToDismissed = { navController.navigate(Routes.DISMISSED_CADETS) },
                    onNavigateToCadets = { navController.navigate(Routes.CADETS) },
                    onNavigateToAttendance = { navController.navigate(Routes.ATTENDANCE) },
                    onSelectCadet = { cadetId -> navController.navigate(Routes.cadetDetail(cadetId)) }
                )
            }

            composable(Routes.CADETS) {
                val vm: CadetsViewModel = viewModel(factory = CadetsViewModel.Factory(repository))
                CadetsScreen(
                    viewModel = vm,
                    onSelectCadet = { cadetId -> navController.navigate(Routes.cadetDetail(cadetId)) }
                )
            }

            composable(Routes.ATTENDANCE) {
                val vm: AttendanceViewModel = viewModel(factory = AttendanceViewModel.Factory(repository))
                AttendanceScreen(viewModel = vm)
            }

            composable(Routes.LETTERS) {
                LettersScreen()
            }

            composable(Routes.REPORTS) {
                val vm: ReportsViewModel = viewModel(factory = ReportsViewModel.Factory(repository))
                ReportsScreen(viewModel = vm)
            }

            composable(
                route = Routes.CADET_DETAIL,
                arguments = listOf(navArgument("cadetId") { type = NavType.StringType })
            ) { backStackEntry ->
                val cadetId = backStackEntry.arguments?.getString("cadetId") ?: ""
                val vm: CadetDetailViewModel = viewModel(factory = CadetDetailViewModel.Factory(cadetId, repository))
                CadetDetailScreen(
                    viewModel = vm,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Routes.CADET_BREAKDOWN) {
                val vm: CadetBreakdownViewModel = viewModel(factory = CadetBreakdownViewModel.Factory(repository))
                CadetBreakdownScreen(
                    viewModel = vm,
                    onBack = { navController.popBackStack() },
                    onSelectCadet = { cadetId -> navController.navigate(Routes.cadetDetail(cadetId)) }
                )
            }

            composable(Routes.DISMISSED_CADETS) {
                val vm: DismissedCadetsViewModel = viewModel(factory = DismissedCadetsViewModel.Factory(repository))
                DismissedCadetsScreen(
                    viewModel = vm,
                    onBack = { navController.popBackStack() },
                    onSelectCadet = { cadetId -> navController.navigate(Routes.cadetDetail(cadetId)) }
                )
            }
        }
    }
}

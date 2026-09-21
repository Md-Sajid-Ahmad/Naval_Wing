package com.example.bncc

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.bncc.ui.navigation.BNCCNavigation
import com.example.bncc.ui.theme.BNCCTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as BNCCApp
        setContent {
            BNCCTheme {
                BNCCNavigation(repository = app.repository)
            }
        }
    }
}

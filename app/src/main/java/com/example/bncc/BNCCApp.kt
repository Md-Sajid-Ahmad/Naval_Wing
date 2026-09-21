package com.example.bncc

import android.app.Application
import com.example.bncc.data.local.BNCCDatabase
import com.example.bncc.data.repository.BNCCRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob

class BNCCApp : Application() {
    private val applicationScope = CoroutineScope(SupervisorJob())

    val database by lazy { BNCCDatabase.getDatabase(this, applicationScope) }
    val repository by lazy { BNCCRepository(database.cadetDao(), database.attendanceDao()) }

    override fun onCreate() {
        super.onCreate()
    }
}

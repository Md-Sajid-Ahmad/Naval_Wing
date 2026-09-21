package com.example.bncc.data.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(
    tableName = "attendance",
    indices = [
        Index(value = ["cadetId", "sessionDate"], unique = true)
    ]
)
data class AttendanceRecord(
    @PrimaryKey
    val id: String = java.util.UUID.randomUUID().toString(),
    val cadetId: String,
    val sessionDate: String, // YYYY-MM-DD
    val status: String, // present, absent, late, excused
    val createdAt: Long = System.currentTimeMillis()
)

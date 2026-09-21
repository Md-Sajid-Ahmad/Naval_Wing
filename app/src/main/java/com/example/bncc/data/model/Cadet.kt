package com.example.bncc.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "cadets")
data class Cadet(
    @PrimaryKey
    val id: String = java.util.UUID.randomUUID().toString(),
    val cadetId: String,
    val fullName: String,
    val rank: String = "Cadet",
    val batch: String = "2024",
    val ward: String = "A",
    val gender: String = "male", // male or female
    val phone: String? = null,
    val status: String = "active", // active, inactive, passed_out
    val photoUrl: String? = null,
    val joinedOn: String = "2024-01-15",
    val createdAt: Long = System.currentTimeMillis()
)

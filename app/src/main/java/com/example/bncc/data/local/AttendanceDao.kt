package com.example.bncc.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.bncc.data.model.AttendanceRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface AttendanceDao {
    @Query("SELECT * FROM attendance WHERE sessionDate = :date")
    fun getAttendanceForDate(date: String): Flow<List<AttendanceRecord>>

    @Query("SELECT * FROM attendance WHERE cadetId = :cadetId ORDER BY sessionDate DESC LIMIT 10")
    fun getRecentAttendanceForCadet(cadetId: String): Flow<List<AttendanceRecord>>

    @Query("SELECT * FROM attendance")
    fun getAllAttendance(): Flow<List<AttendanceRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(record: AttendanceRecord)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecords(records: List<AttendanceRecord>)

    @Query("DELETE FROM attendance WHERE cadetId = :cadetId AND sessionDate = :date")
    suspend fun deleteAttendance(cadetId: String, date: String)

    @Query("SELECT COUNT(*) FROM attendance")
    suspend fun getCount(): Int
}

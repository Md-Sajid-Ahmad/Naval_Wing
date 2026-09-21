package com.example.bncc.data.repository

import com.example.bncc.data.local.AttendanceDao
import com.example.bncc.data.local.CadetDao
import com.example.bncc.data.model.AttendanceRecord
import com.example.bncc.data.model.Cadet
import kotlinx.coroutines.flow.Flow

class BNCCRepository(
    private val cadetDao: CadetDao,
    private val attendanceDao: AttendanceDao
) {
    val allCadets: Flow<List<Cadet>> = cadetDao.getAllCadets()
    val dismissedCadets: Flow<List<Cadet>> = cadetDao.getDismissedCadets()

    fun getCadetById(id: String): Flow<Cadet?> = cadetDao.getCadetById(id)

    suspend fun insertCadet(cadet: Cadet) = cadetDao.insertCadet(cadet)

    suspend fun updateCadet(cadet: Cadet) = cadetDao.updateCadet(cadet)

    suspend fun deleteCadet(cadet: Cadet) = cadetDao.deleteCadet(cadet)

    fun getAttendanceForDate(date: String): Flow<List<AttendanceRecord>> =
        attendanceDao.getAttendanceForDate(date)

    fun getRecentAttendanceForCadet(cadetId: String): Flow<List<AttendanceRecord>> =
        attendanceDao.getRecentAttendanceForCadet(cadetId)

    fun getAllAttendance(): Flow<List<AttendanceRecord>> =
        attendanceDao.getAllAttendance()

    suspend fun setAttendance(cadetId: String, date: String, status: String) {
        val record = AttendanceRecord(
            cadetId = cadetId,
            sessionDate = date,
            status = status
        )
        attendanceDao.insertOrUpdate(record)
    }

    suspend fun clearAttendance(cadetId: String, date: String) {
        attendanceDao.deleteAttendance(cadetId, date)
    }
}

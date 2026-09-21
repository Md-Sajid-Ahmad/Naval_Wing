package com.example.bncc.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.bncc.data.model.AttendanceRecord
import com.example.bncc.data.model.Cadet
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Database(
    entities = [Cadet::class, AttendanceRecord::class],
    version = 1,
    exportSchema = false
)
abstract class BNCCDatabase : RoomDatabase() {
    abstract fun cadetDao(): CadetDao
    abstract fun attendanceDao(): AttendanceDao

    companion object {
        @Volatile
        private var INSTANCE: BNCCDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): BNCCDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    BNCCDatabase::class.java,
                    "bncc_naval_hub.db"
                )
                    .addCallback(DatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialData(database.cadetDao(), database.attendanceDao())
                    }
                }
            }

            suspend fun populateInitialData(cadetDao: CadetDao, attendanceDao: AttendanceDao) {
                val seedCadets = listOf(
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111101",
                        cadetId = "BN-2214",
                        fullName = "রায়হান হোসেন",
                        rank = "Cadet",
                        batch = "2024",
                        ward = "A",
                        gender = "male",
                        phone = "01711000001",
                        status = "active",
                        photoUrl = "cadet_m1",
                        joinedOn = "2024-01-15"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111102",
                        cadetId = "BN-2198",
                        fullName = "নুসরাত জাহান",
                        rank = "Cadet",
                        batch = "2024",
                        ward = "A",
                        gender = "female",
                        phone = "01711000002",
                        status = "active",
                        photoUrl = "cadet_f1",
                        joinedOn = "2024-01-15"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111103",
                        cadetId = "BN-2201",
                        fullName = "সারোয়ার মিয়া",
                        rank = "LCPL",
                        batch = "2023",
                        ward = "B",
                        gender = "male",
                        phone = "01711000003",
                        status = "active",
                        photoUrl = "cadet_m2",
                        joinedOn = "2023-02-10"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111104",
                        cadetId = "BN-2176",
                        fullName = "তানভীর আহমেদ",
                        rank = "Cadet",
                        batch = "2024",
                        ward = "B",
                        gender = "male",
                        phone = "01711000004",
                        status = "active",
                        photoUrl = null,
                        joinedOn = "2024-01-20"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111105",
                        cadetId = "BN-2150",
                        fullName = "সুমাইয়া আক্তার",
                        rank = "CPL",
                        batch = "2023",
                        ward = "A",
                        gender = "female",
                        phone = "01711000005",
                        status = "active",
                        photoUrl = "cadet_f2",
                        joinedOn = "2023-03-05"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111106",
                        cadetId = "BN-2143",
                        fullName = "রফিক ইসলাম",
                        rank = "SGT",
                        batch = "2022",
                        ward = "C",
                        gender = "male",
                        phone = "01711000006",
                        status = "active",
                        photoUrl = null,
                        joinedOn = "2022-08-11"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111107",
                        cadetId = "BN-2131",
                        fullName = "নাদিয়া হোসেন",
                        rank = "CPL",
                        batch = "2023",
                        ward = "C",
                        gender = "female",
                        phone = "01711000007",
                        status = "active",
                        photoUrl = null,
                        joinedOn = "2023-04-19"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111108",
                        cadetId = "BN-2120",
                        fullName = "আরিফুল ইসলাম",
                        rank = "Cadet",
                        batch = "2025",
                        ward = "B",
                        gender = "male",
                        phone = "01711000008",
                        status = "active",
                        photoUrl = null,
                        joinedOn = "2025-01-12"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111109",
                        cadetId = "BN-2112",
                        fullName = "মেহেদী হাসান",
                        rank = "Cadet",
                        batch = "2025",
                        ward = "A",
                        gender = "male",
                        phone = "01711000009",
                        status = "active",
                        photoUrl = null,
                        joinedOn = "2025-01-12"
                    ),
                    Cadet(
                        id = "c1111111-1111-1111-1111-111111111110",
                        cadetId = "BN-2099",
                        fullName = "ফারহানা ইয়াসমিন",
                        rank = "CUO",
                        batch = "2022",
                        ward = "C",
                        gender = "female",
                        phone = "01711000010",
                        status = "inactive", // Dismissed / inactive
                        photoUrl = null,
                        joinedOn = "2022-09-01"
                    )
                )
                cadetDao.insertCadets(seedCadets)

                val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
                val yesterday = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(System.currentTimeMillis() - 86400000L))

                val initialAttendance = mutableListOf<AttendanceRecord>()
                // Populate attendance for active cadets
                seedCadets.filter { it.status == "active" }.forEachIndexed { idx, cadet ->
                    val statusToday = if (idx % 4 == 0) "absent" else if (idx % 5 == 0) "late" else "present"
                    initialAttendance.add(
                        AttendanceRecord(
                            cadetId = cadet.id,
                            sessionDate = today,
                            status = statusToday
                        )
                    )
                    val statusYesterday = if (idx % 3 == 0) "present" else "present"
                    initialAttendance.add(
                        AttendanceRecord(
                            cadetId = cadet.id,
                            sessionDate = yesterday,
                            status = statusYesterday
                        )
                    )
                }
                attendanceDao.insertRecords(initialAttendance)
            }
        }
    }
}

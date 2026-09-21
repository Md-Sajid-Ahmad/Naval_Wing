package com.example.bncc.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.bncc.data.model.Cadet
import kotlinx.coroutines.flow.Flow

@Dao
interface CadetDao {
    @Query("SELECT * FROM cadets ORDER BY cadetId ASC")
    fun getAllCadets(): Flow<List<Cadet>>

    @Query("SELECT * FROM cadets WHERE id = :id LIMIT 1")
    fun getCadetById(id: String): Flow<Cadet?>

    @Query("SELECT * FROM cadets WHERE status = 'inactive' ORDER BY cadetId ASC")
    fun getDismissedCadets(): Flow<List<Cadet>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCadet(cadet: Cadet)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCadets(cadets: List<Cadet>)

    @Update
    suspend fun updateCadet(cadet: Cadet)

    @Delete
    suspend fun deleteCadet(cadet: Cadet)

    @Query("SELECT COUNT(*) FROM cadets")
    suspend fun getCount(): Int
}

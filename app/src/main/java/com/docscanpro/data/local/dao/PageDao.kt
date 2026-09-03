package com.docscanpro.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.docscanpro.data.local.entity.PageEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PageDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(page: PageEntity)

    @Update
    suspend fun update(page: PageEntity)

    @Delete
    suspend fun delete(page: PageEntity)

    @Query("SELECT * FROM pages WHERE documentId = :documentId ORDER BY pageNumber ASC")
    fun getPagesForDocument(documentId: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE id = :pageId LIMIT 1")
    suspend fun getPageById(pageId: String): PageEntity?

    @Query("SELECT COUNT(*) FROM pages WHERE documentId = :documentId")
    suspend fun getPageCount(documentId: String): Int

    @Query("DELETE FROM pages WHERE documentId = :documentId")
    suspend fun deletePagesForDocument(documentId: String)

    @Query("DELETE FROM pages WHERE id = :pageId")
    suspend fun deletePageById(pageId: String)
}

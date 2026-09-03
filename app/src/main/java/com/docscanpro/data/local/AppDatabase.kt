package com.docscanpro.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.docscanpro.data.local.dao.DocumentDao
import com.docscanpro.data.local.dao.FolderDao
import com.docscanpro.data.local.dao.PageDao
import com.docscanpro.data.local.entity.DocumentEntity
import com.docscanpro.data.local.entity.FolderEntity
import com.docscanpro.data.local.entity.PageEntity

@Database(
    entities = [DocumentEntity::class, PageEntity::class, FolderEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun documentDao(): DocumentDao
    abstract fun pageDao(): PageDao
    abstract fun folderDao(): FolderDao

    companion object {
        const val DATABASE_NAME = "docscanpro.db"
    }
}

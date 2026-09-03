package com.docscanpro.data.repository

import com.docscanpro.data.local.dao.DocumentDao
import com.docscanpro.data.local.dao.FolderDao
import com.docscanpro.data.local.dao.PageDao
import com.docscanpro.data.local.entity.FolderEntity
import com.docscanpro.data.model.Document
import com.docscanpro.data.model.Folder
import com.docscanpro.data.model.Page
import com.docscanpro.data.model.toDomain
import com.docscanpro.data.model.toEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DocumentRepository @Inject constructor(
    private val documentDao: DocumentDao,
    private val pageDao: PageDao,
    private val folderDao: FolderDao
) {

    fun getAllDocuments(): Flow<List<Document>> =
        documentDao.getAllDocuments().map { list -> list.map { it.toDomain() } }

    suspend fun getDocument(id: String): Document? = withContext(Dispatchers.IO) {
        documentDao.getDocumentById(id)?.toDomain()
    }

    suspend fun saveDocument(document: Document) = withContext(Dispatchers.IO) {
        documentDao.insert(document.toEntity())
    }

    suspend fun deleteDocument(id: String) = withContext(Dispatchers.IO) {
        val entity = documentDao.getDocumentById(id) ?: return@withContext
        pageDao.deletePagesForDocument(id)
        documentDao.delete(entity)
    }

    fun searchDocuments(query: String): Flow<List<Document>> =
        documentDao.searchDocuments(query).map { list -> list.map { it.toDomain() } }

    fun getAllFolders(): Flow<List<Folder>> =
        folderDao.getAllFolders().map { list -> list.map { it.toDomain() } }

    suspend fun createFolder(name: String): Folder = withContext(Dispatchers.IO) {
        val existing = folderDao.getFolderByName(name)
        if (existing != null) {
            return@withContext existing.toDomain()
        }
        val entity = FolderEntity(name = name)
        folderDao.insert(entity)
        entity.toDomain()
    }

    fun getDocumentsByFolder(folderName: String): Flow<List<Document>> =
        documentDao.getDocumentsByFolder(folderName).map { list -> list.map { it.toDomain() } }

    fun getPagesForDocument(documentId: String): Flow<List<Page>> =
        pageDao.getPagesForDocument(documentId).map { list -> list.map { it.toDomain() } }

    suspend fun getPage(pageId: String): Page? = withContext(Dispatchers.IO) {
        pageDao.getPageById(pageId)?.toDomain()
    }

    suspend fun savePage(page: Page) = withContext(Dispatchers.IO) {
        pageDao.insert(page.toEntity())
    }

    suspend fun deletePage(pageId: String) = withContext(Dispatchers.IO) {
        pageDao.deletePageById(pageId)
    }

    suspend fun reorderPages(documentId: String, pages: List<Page>) = withContext(Dispatchers.IO) {
        pages.forEachIndexed { index, page ->
            pageDao.update(page.copy(pageNumber = index + 1).toEntity())
        }
    }
}

package com.docscanpro.ui.folder

import androidx.lifecycle.ViewModel
import com.docscanpro.data.model.Document
import com.docscanpro.data.repository.DocumentRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

@HiltViewModel
class FolderViewViewModel @Inject constructor(
    private val repository: DocumentRepository
) : ViewModel() {

    fun getDocuments(folderName: String): Flow<List<Document>> =
        repository.getDocumentsByFolder(folderName)
}

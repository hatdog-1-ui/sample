package com.docscanpro.data.model

import com.docscanpro.data.local.entity.FolderEntity

data class Folder(
    val id: String,
    val name: String,
    val documentCount: Int
)

fun FolderEntity.toDomain(): Folder = Folder(
    id = id,
    name = name,
    documentCount = documentCount
)

fun Folder.toEntity(): FolderEntity = FolderEntity(
    id = id,
    name = name,
    documentCount = documentCount
)

package com.docscanpro.data.model

import com.docscanpro.data.local.entity.DocumentEntity

data class Document(
    val id: String,
    val name: String,
    val folderName: String?,
    val pageCount: Int,
    val createdAt: Long,
    val updatedAt: Long,
    val thumbnailPath: String?,
    val pdfPath: String?,
    val totalSizeBytes: Long
)

fun DocumentEntity.toDomain(): Document = Document(
    id = id,
    name = name,
    folderName = folderName,
    pageCount = pageCount,
    createdAt = createdAt,
    updatedAt = updatedAt,
    thumbnailPath = thumbnailPath,
    pdfPath = pdfPath,
    totalSizeBytes = totalSizeBytes
)

fun Document.toEntity(): DocumentEntity = DocumentEntity(
    id = id,
    name = name,
    folderName = folderName,
    pageCount = pageCount,
    createdAt = createdAt,
    updatedAt = updatedAt,
    thumbnailPath = thumbnailPath,
    pdfPath = pdfPath,
    totalSizeBytes = totalSizeBytes
)

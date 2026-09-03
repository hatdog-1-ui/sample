package com.docscanpro.data.model

import com.docscanpro.data.local.entity.PageEntity

data class Page(
    val id: String,
    val documentId: String,
    val pageNumber: Int,
    val imagePath: String,
    val ocrText: String?
)

fun PageEntity.toDomain(): Page = Page(
    id = id,
    documentId = documentId,
    pageNumber = pageNumber,
    imagePath = imagePath,
    ocrText = ocrText
)

fun Page.toEntity(): PageEntity = PageEntity(
    id = id,
    documentId = documentId,
    pageNumber = pageNumber,
    imagePath = imagePath,
    ocrText = ocrText
)

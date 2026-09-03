import { getDatabase, generateId } from './db';
import type { Document, Page, Folder } from '../types';

export async function getAllDocuments(): Promise<Document[]> {
  const db = await getDatabase();
  return db.getAllAsync<Document>('SELECT * FROM documents ORDER BY updatedAt DESC');
}

export async function getDocument(id: string): Promise<Document | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Document>('SELECT * FROM documents WHERE id = ?', [id]);
}

export async function searchDocuments(query: string): Promise<Document[]> {
  const db = await getDatabase();
  return db.getAllAsync<Document>(
    'SELECT * FROM documents WHERE name LIKE ? ORDER BY updatedAt DESC',
    [`%${query}%`]
  );
}

export async function getDocumentsByFolder(folderName: string): Promise<Document[]> {
  const db = await getDatabase();
  return db.getAllAsync<Document>(
    'SELECT * FROM documents WHERE folderName = ? ORDER BY updatedAt DESC',
    [folderName]
  );
}

export async function saveDocument(doc: Partial<Document> & { name: string }): Promise<string> {
  const db = await getDatabase();
  const id = doc.id || generateId();
  const now = Date.now();
  await db.runAsync(
    `INSERT OR REPLACE INTO documents (id, name, folderName, pageCount, createdAt, updatedAt, thumbnailUri, pdfUri, totalSizeBytes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, doc.name, doc.folderName ?? null, doc.pageCount ?? 1, doc.createdAt ?? now, now,
     doc.thumbnailUri ?? null, doc.pdfUri ?? null, doc.totalSizeBytes ?? 0]
  );
  return id;
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  fields.push('updatedAt = ?');
  values.push(Date.now());
  values.push(id);
  await db.runAsync(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pages WHERE documentId = ?', [id]);
  await db.runAsync('DELETE FROM documents WHERE id = ?', [id]);
}

export async function getPagesForDocument(documentId: string): Promise<Page[]> {
  const db = await getDatabase();
  return db.getAllAsync<Page>(
    'SELECT * FROM pages WHERE documentId = ? ORDER BY pageNumber ASC',
    [documentId]
  );
}

export async function getPage(pageId: string): Promise<Page | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Page>('SELECT * FROM pages WHERE id = ?', [pageId]);
}

export async function savePage(page: Partial<Page> & { documentId: string; imageUri: string }): Promise<string> {
  const db = await getDatabase();
  const id = page.id || generateId();
  const now = Date.now();
  await db.runAsync(
    `INSERT OR REPLACE INTO pages (id, documentId, pageNumber, imageUri, ocrText, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, page.documentId, page.pageNumber ?? 1, page.imageUri, page.ocrText ?? null, page.createdAt ?? now]
  );
  return id;
}

export async function updatePage(pageId: string, updates: Partial<Page>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  values.push(pageId);
  await db.runAsync(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deletePage(pageId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pages WHERE id = ?', [pageId]);
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDatabase();
  return db.getAllAsync<Folder>('SELECT * FROM folders ORDER BY name ASC');
}

export async function createFolder(name: string): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  await db.runAsync('INSERT OR IGNORE INTO folders (id, name, documentCount) VALUES (?, ?, 0)', [id, name]);
  return id;
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM folders WHERE id = ?', [id]);
}

export interface Document {
  id: string;
  name: string;
  folderName: string | null;
  pageCount: number;
  createdAt: number;
  updatedAt: number;
  thumbnailUri: string | null;
  pdfUri: string | null;
  totalSizeBytes: number;
}

export interface Page {
  id: string;
  documentId: string;
  pageNumber: number;
  imageUri: string;
  ocrText: string | null;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  documentCount: number;
}

export type FilterType = 'original' | 'bw' | 'magic' | 'grayscale';
export type PageSize = 'A4' | 'Letter' | 'Legal';
export type ExportFormat = 'PDF' | 'JPG' | 'PNG';
export type Quality = 'Low' | 'Medium' | 'High';

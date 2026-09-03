import * as Print from 'expo-print';
import type { Page, PageSize } from '../types';

const PAGE_DIMENSIONS: Record<PageSize, { w: number; h: number }> = {
  A4: { w: 595, h: 842 },
  Letter: { w: 612, h: 792 },
  Legal: { w: 612, h: 1008 },
};

export async function generatePdf(pages: Page[], pageSize: PageSize = 'A4'): Promise<string> {
  const { w, h } = PAGE_DIMENSIONS[pageSize];

  const html = `
    <html><body style="margin:0;padding:0;">
      ${pages
        .map(
          (page, i) => `
        <div style="page-break-after:${i < pages.length - 1 ? 'always' : 'auto'};width:${w}px;height:${h}px;display:flex;justify-content:center;align-items:center;">
          <img src="${page.imageUri}" style="max-width:100%;max-height:100%;object-fit:contain;" />
        </div>
      `
        )
        .join('')}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, width: w, height: h });
  return uri;
}

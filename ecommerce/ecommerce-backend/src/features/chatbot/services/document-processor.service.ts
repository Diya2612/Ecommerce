/**
 * Document Processor Service
 * Extracts text from various document formats (PDF, DOCX, TXT, MD).
 */

import mammoth from 'mammoth';
import { logger } from '../../../utils';
import { HttpException } from '../../../utils';
import { downloadFromStorageAsBuffer } from '../../../utils/supabase/storage';

let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfjs() {
  if (!pdfjsLib) pdfjsLib = await import('pdfjs-dist');
  return pdfjsLib;
}

/** Extracts text from a document stored in S3/Supabase Storage. */
export async function extractTextFromDocument(filePath: string, mimeType: string): Promise<string> {
  try {
    const fileBuffer = await downloadFromStorageAsBuffer(filePath);
    let text: string;

    switch (mimeType) {
      case 'application/pdf':
        text = await extractTextFromPDF(fileBuffer);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await extractTextFromDOCX(fileBuffer);
        break;
      case 'text/plain':
      case 'text/markdown':
        text = fileBuffer.toString('utf-8');
        break;
      default:
        throw new HttpException(400, `Unsupported file type: ${mimeType}`);
    }

    return cleanText(text);
  } catch (error) {
    logger.error('❌ Text extraction failed:', error);
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      500,
      `Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Extracts text directly from a file buffer. */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    let text: string;

    switch (mimeType) {
      case 'application/pdf':
        text = await extractTextFromPDF(buffer);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await extractTextFromDOCX(buffer);
        break;
      case 'text/plain':
      case 'text/markdown':
        text = buffer.toString('utf-8');
        break;
      default:
        throw new HttpException(400, `Unsupported file type: ${mimeType}`);
    }

    return cleanText(text);
  } catch (error) {
    logger.error('❌ Text extraction from buffer failed:', error);
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      500,
      `Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Parses PDF content into text using pdf.js. */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await getPdfjs();
    const data = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    const textParts: string[] = [];
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n\n');
  } catch (error) {
    logger.error('Error extracting text from PDF:', error);
    throw new HttpException(
      500,
      `PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Parses DOCX content into text using mammoth. */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    logger.error('Error extracting text from DOCX:', error);
    throw new HttpException(
      500,
      `DOCX text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Normalizes whitespace and removes redundant formatting. */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export {
  isValidFileType,
  isValidFileSize,
  getExtensionFromMimeType,
} from './document-utils.service';

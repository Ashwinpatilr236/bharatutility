import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

// ==========================================
// 1. PDF TO TEXT EXTRACTION (CLIENT-SIDE)
// ==========================================

export async function extractTextFromPdf(file: File | ArrayBuffer): Promise<{ text: string; pages: number }> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const uint8 = new Uint8Array(arrayBuffer);
  
  // Convert binary to string safely in chunks to avoid call stack overflow
  let rawPdf = '';
  const chunkSize = 65536;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, i + chunkSize);
    rawPdf += String.fromCharCode.apply(null, Array.from(chunk));
  }

  // Count pages from /Type /Page (excluding /Pages)
  const pageMatches = rawPdf.match(/\/Type\s*\/Page[^s]/g) || [];
  const pageCount = Math.max(1, pageMatches.length);

  // Extract text tokens from PDF streams
  // Standard text blocks reside between BT (Begin Text) and ET (End Text)
  const extractedLines: string[] = [];
  const btEtRegex = /BT[\s\S]*?ET/g;
  const btBlocks = rawPdf.match(btEtRegex) || [];

  if (btBlocks.length > 0) {
    for (const block of btBlocks) {
      // Look for (string) Tj or [(array)] TJ
      const textMatches = block.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g) || [];
      const lineParts: string[] = [];
      for (const tm of textMatches) {
        if (tm.endsWith('Tj')) {
          const str = tm.slice(1, tm.lastIndexOf(')'));
          lineParts.push(cleanPdfString(str));
        } else if (tm.endsWith('TJ')) {
          const inside = tm.slice(1, tm.lastIndexOf(']'));
          const subStrings = inside.match(/\((.*?)\)/g) || [];
          const combined = subStrings.map(s => cleanPdfString(s.slice(1, -1))).join('');
          lineParts.push(combined);
        }
      }
      if (lineParts.length > 0) {
        extractedLines.push(lineParts.join(' '));
      }
    }
  }

  // Fallback if streams are encoded/compressed: extract readable text spans
  let fullText = extractedLines.join('\n').trim();
  if (!fullText || fullText.length < 20) {
    // Look for parenthesized string literals across the PDF
    const literalMatches = rawPdf.match(/\(([A-Za-z0-9\s.,!?:;@#$%^&*()_+\-=[\]{}|'"]{3,})\)/g) || [];
    const fallbackLines: string[] = [];
    for (const match of literalMatches) {
      const clean = cleanPdfString(match.slice(1, -1));
      if (clean.length > 2 && !clean.startsWith('/') && !clean.includes('CreationDate')) {
        fallbackLines.push(clean);
      }
    }
    if (fallbackLines.length > 0) {
      fullText = fallbackLines.join('\n');
    }
  }

  if (!fullText) {
    fullText = 'Could not extract raw text stream from this PDF. It may contain scanned raster images (OCR required) or encrypted font encodings.';
  }

  return {
    text: fullText,
    pages: pageCount
  };
}

function cleanPdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '')
    .replace(/\\f/g, '')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .trim();
}


// ==========================================
// 2. WORD (.DOCX) TO TEXT EXTRACTION
// ==========================================

export async function extractTextFromDocx(file: File | ArrayBuffer): Promise<{ text: string; paragraphs: string[] }> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const uint8 = new Uint8Array(arrayBuffer);

  // A .docx file is a ZIP archive containing word/document.xml
  // Search for the local file header of word/document.xml
  const xmlContent = await extractXmlFromZip(uint8, 'word/document.xml');
  
  if (!xmlContent) {
    throw new Error('Could not find word/document.xml inside this .docx file.');
  }

  // Parse XML using DOMParser
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  // Find all paragraphs <w:p>
  const paragraphNodes = xmlDoc.getElementsByTagName('w:p');
  const paragraphs: string[] = [];

  for (let i = 0; i < paragraphNodes.length; i++) {
    const pNode = paragraphNodes[i];
    const textNodes = pNode.getElementsByTagName('w:t');
    let pText = '';
    for (let j = 0; j < textNodes.length; j++) {
      pText += textNodes[j].textContent || '';
    }
    if (pText.trim()) {
      paragraphs.push(pText.trim());
    }
  }

  const fullText = paragraphs.join('\n\n');
  return {
    text: fullText,
    paragraphs
  };
}

// Lightweight in-browser ZIP unbundler for word/document.xml
async function extractXmlFromZip(zipBytes: Uint8Array, targetFileName: string): Promise<string | null> {
  const targetBytes = new TextEncoder().encode(targetFileName);
  let pos = 0;

  while (pos < zipBytes.length - 30) {
    // Check for Local File Header Signature 0x04034b50 ("PK\x03\x04")
    if (zipBytes[pos] === 0x50 && zipBytes[pos + 1] === 0x4B && zipBytes[pos + 2] === 0x03 && zipBytes[pos + 3] === 0x04) {
      const compressionMethod = zipBytes[pos + 8] | (zipBytes[pos + 9] << 8);
      const compressedSize = zipBytes[pos + 18] | (zipBytes[pos + 19] << 8) | (zipBytes[pos + 20] << 16) | (zipBytes[pos + 21] << 24);
      const uncompressedSize = zipBytes[pos + 22] | (zipBytes[pos + 23] << 8) | (zipBytes[pos + 24] << 16) | (zipBytes[pos + 25] << 24);
      const fileNameLength = zipBytes[pos + 26] | (zipBytes[pos + 27] << 8);
      const extraFieldLength = zipBytes[pos + 28] | (zipBytes[pos + 29] << 8);

      const fileNameBytes = zipBytes.subarray(pos + 30, pos + 30 + fileNameLength);
      const fileName = new TextDecoder().decode(fileNameBytes);

      const dataOffset = pos + 30 + fileNameLength + extraFieldLength;

      if (fileName === targetFileName || fileName.endsWith(targetFileName)) {
        const compressedData = zipBytes.subarray(dataOffset, dataOffset + compressedSize);

        if (compressionMethod === 0) {
          // Uncompressed
          return new TextDecoder().decode(compressedData);
        } else if (compressionMethod === 8) {
          // Deflate compressed: use native DecompressionStream
          if (typeof DecompressionStream !== 'undefined') {
            try {
              const stream = new Response(compressedData).body?.pipeThrough(new DecompressionStream('deflate-raw'));
              if (stream) {
                const decompressedBuffer = await new Response(stream).arrayBuffer();
                return new TextDecoder().decode(decompressedBuffer);
              }
            } catch (e) {
              console.warn('DecompressionStream error:', e);
            }
          }
        }
      }

      pos = dataOffset + compressedSize;
    } else {
      pos++;
    }
  }

  // Fallback: search for XML string pattern directly if stored uncompressed
  const rawString = new TextDecoder('utf-8', { fatal: false }).decode(zipBytes);
  const docXmlStart = rawString.indexOf('<w:document');
  const docXmlEnd = rawString.indexOf('</w:document>');
  if (docXmlStart !== -1 && docXmlEnd !== -1) {
    return rawString.slice(docXmlStart, docXmlEnd + 13);
  }

  return null;
}


// ==========================================
// 3. TEXT TO PDF GENERATOR (CLIENT-SIDE)
// ==========================================

export interface TextToPdfOptions {
  title?: string;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  fontSize?: number;
  lineHeightMultiplier?: number;
  margin?: number;
  fontFamily?: 'Helvetica' | 'TimesRoman' | 'Courier';
  includePageNumbers?: boolean;
}

export async function generatePdfFromText(text: string, options: TextToPdfOptions = {}): Promise<Uint8Array> {
  const {
    title = 'Document',
    pageSize = 'A4',
    fontSize = 11,
    lineHeightMultiplier = 1.4,
    margin = 40,
    fontFamily = 'Helvetica',
    includePageNumbers = true
  } = options;

  const pdfDoc = await PDFDocument.create();
  
  let standardFont = StandardFonts.Helvetica;
  let boldFont = StandardFonts.HelveticaBold;
  if (fontFamily === 'TimesRoman') {
    standardFont = StandardFonts.TimesRoman;
    boldFont = StandardFonts.TimesRomanBold;
  } else if (fontFamily === 'Courier') {
    standardFont = StandardFonts.Courier;
    boldFont = StandardFonts.CourierBold;
  }

  const regular = await pdfDoc.embedFont(standardFont);
  const bold = await pdfDoc.embedFont(boldFont);

  const pageDimensions = pageSize === 'Letter' ? PageSizes.Letter : pageSize === 'Legal' ? PageSizes.Legal : PageSizes.A4;
  const [pageWidth, pageHeight] = pageDimensions;

  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;
  const lineHeight = fontSize * lineHeightMultiplier;

  // Split text into paragraphs and wrap lines to fit contentWidth
  const paragraphs = text.split(/\r?\n/);
  const wrappedLines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      wrappedLines.push(''); // Empty line for spacing
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = regular.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= contentWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  // Draw lines across pages
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Draw Title Header on First Page
  if (title && title !== 'Document') {
    currentPage.drawText(title, {
      x: margin,
      y: currentY - 14,
      size: 16,
      font: bold,
      color: rgb(0.1, 0.1, 0.15)
    });
    currentY -= 36;
  }

  const pagesList = [currentPage];

  for (const line of wrappedLines) {
    if (currentY - lineHeight < margin + 20) {
      // Need a new page
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pagesList.push(currentPage);
      currentY = pageHeight - margin;
    }

    if (line !== '') {
      currentPage.drawText(line, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: regular,
        color: rgb(0.15, 0.15, 0.15)
      });
    }
    currentY -= lineHeight;
  }

  // Draw footer page numbers
  if (includePageNumbers) {
    const totalPages = pagesList.length;
    pagesList.forEach((page, idx) => {
      const pageNumStr = `Page ${idx + 1} of ${totalPages}`;
      const numWidth = regular.widthOfTextAtSize(pageNumStr, 9);
      page.drawText(pageNumStr, {
        x: (pageWidth - numWidth) / 2,
        y: margin - 15,
        size: 9,
        font: regular,
        color: rgb(0.5, 0.5, 0.5)
      });
    });
  }

  return await pdfDoc.save();
}


// ==========================================
// 4. CSV <-> JSON CONVERTERS
// ==========================================

export function parseCsvToJson(csvText: string, delimiter: string = ','): any[] {
  if (!csvText.trim()) return [];
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0], delimiter);
  const result: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCsvLine(line, delimiter);
    const obj: Record<string, any> = {};

    headers.forEach((h, idx) => {
      let val = values[idx] !== undefined ? values[idx] : '';
      // Try to parse numbers or booleans
      if (!isNaN(Number(val)) && val !== '') {
        obj[h] = Number(val);
      } else if (val.toLowerCase() === 'true') {
        obj[h] = true;
      } else if (val.toLowerCase() === 'false') {
        obj[h] = false;
      } else {
        obj[h] = val;
      }
    });

    result.push(obj);
  }

  return result;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

export function parseJsonToCsv(jsonArray: any[], delimiter: string = ','): string {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) return '';

  const headers = Array.from(new Set(jsonArray.flatMap(obj => Object.keys(obj))));
  const csvLines: string[] = [];

  // Header row
  csvLines.push(headers.map(h => escapeCsvValue(h, delimiter)).join(delimiter));

  // Value rows
  for (const item of jsonArray) {
    const row = headers.map(h => {
      const val = item[h] !== undefined ? String(item[h]) : '';
      return escapeCsvValue(val, delimiter);
    });
    csvLines.push(row.join(delimiter));
  }

  return csvLines.join('\n');
}

function escapeCsvValue(val: string, delimiter: string): string {
  if (val.includes(delimiter) || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

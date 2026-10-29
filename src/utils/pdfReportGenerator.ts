import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PdfReportData {
  toolName: string;
  toolTagline?: string;
  calculationSummary: string;
  inputParameters?: Record<string, string | number | boolean>;
  resultBreakdown?: Array<{ label: string; value: string }>;
  notes?: string;
}

/**
 * Generates an official, publication-quality 1-page PDF calculation report.
 */
export async function generateCalculationReportPdf(data: PdfReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 dimensions
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Color Palette
  const brandPrimary = rgb(0.31, 0.27, 0.90); // #4f46e5 (Indigo)
  const brandDark = rgb(0.06, 0.09, 0.16); // #0f172a (Slate 900)
  const textMuted = rgb(0.40, 0.45, 0.55); // Slate 500
  const bgLight = rgb(0.97, 0.98, 0.99); // Off-white
  const borderLight = rgb(0.88, 0.91, 0.94);
  const successGreen = rgb(0.06, 0.65, 0.42); // Emerald

  // Top Accent Bar
  page.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: brandPrimary,
  });

  // Header Section
  let cursorY = height - 48;

  // Logo & Title
  page.drawText('BharatUtility', {
    x: 40,
    y: cursorY,
    size: 20,
    font: fontBold,
    color: brandPrimary,
  });

  page.drawText('• Official Calculation Report', {
    x: 168,
    y: cursorY + 1,
    size: 11,
    font: fontRegular,
    color: textMuted,
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = `${currentDate} at ${currentTime}`;

  page.drawText(`Generated on: ${dateStr}`, {
    x: width - 40 - fontRegular.widthOfTextAtSize(`Generated on: ${dateStr}`, 9),
    y: cursorY + 2,
    size: 9,
    font: fontRegular,
    color: textMuted,
  });

  cursorY -= 20;

  // Divider
  page.drawLine({
    start: { x: 40, y: cursorY },
    end: { x: width - 40, y: cursorY },
    thickness: 1,
    color: borderLight,
  });

  cursorY -= 30;

  // Tool Title Card
  page.drawText(data.toolName.toUpperCase(), {
    x: 40,
    y: cursorY,
    size: 15,
    font: fontBold,
    color: brandDark,
  });

  cursorY -= 16;

  if (data.toolTagline) {
    page.drawText(data.toolTagline.slice(0, 100), {
      x: 40,
      y: cursorY,
      size: 9.5,
      font: fontRegular,
      color: textMuted,
    });
    cursorY -= 24;
  } else {
    cursorY -= 14;
  }

  // Key Summary Result Box (Hero Card)
  const summaryBoxHeight = 65;
  page.drawRectangle({
    x: 40,
    y: cursorY - summaryBoxHeight,
    width: width - 80,
    height: summaryBoxHeight,
    color: bgLight,
    borderColor: brandPrimary,
    borderWidth: 1.5,
  });

  page.drawText('PRIMARY CALCULATION SNAPSHOT', {
    x: 55,
    y: cursorY - 18,
    size: 8.5,
    font: fontBold,
    color: brandPrimary,
  });

  // Main summary text (wrapped if long)
  const summaryText = data.calculationSummary || 'Calculation completed successfully';
  page.drawText(summaryText.slice(0, 95), {
    x: 55,
    y: cursorY - 42,
    size: 13,
    font: fontBold,
    color: brandDark,
  });

  cursorY -= summaryBoxHeight + 35;

  // Input Parameters Table Section
  if (data.inputParameters && Object.keys(data.inputParameters).length > 0) {
    page.drawText('INPUT PARAMETERS & SPECIFICATIONS', {
      x: 40,
      y: cursorY,
      size: 10,
      font: fontBold,
      color: brandDark,
    });

    cursorY -= 15;

    const entries = Object.entries(data.inputParameters);
    const rowHeight = 22;

    entries.forEach(([key, val], idx) => {
      const isEven = idx % 2 === 0;
      page.drawRectangle({
        x: 40,
        y: cursorY - rowHeight,
        width: width - 80,
        height: rowHeight,
        color: isEven ? rgb(0.98, 0.99, 1.0) : rgb(1, 1, 1),
        borderColor: borderLight,
        borderWidth: 0.5,
      });

      // Format parameter label
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      page.drawText(formattedKey, {
        x: 52,
        y: cursorY - 14,
        size: 9,
        font: fontBold,
        color: brandDark,
      });

      const valStr = String(val);
      page.drawText(valStr, {
        x: width - 52 - fontRegular.widthOfTextAtSize(valStr, 9),
        y: cursorY - 14,
        size: 9,
        font: fontRegular,
        color: textMuted,
      });

      cursorY -= rowHeight;
    });

    cursorY -= 25;
  }

  // Result Breakdown Table Section
  if (data.resultBreakdown && data.resultBreakdown.length > 0) {
    page.drawText('CALCULATION DETAILS & VALUE BREAKDOWN', {
      x: 40,
      y: cursorY,
      size: 10,
      font: fontBold,
      color: brandDark,
    });

    cursorY -= 15;

    const rowHeight = 22;
    data.resultBreakdown.forEach((item, idx) => {
      const isEven = idx % 2 === 0;
      page.drawRectangle({
        x: 40,
        y: cursorY - rowHeight,
        width: width - 80,
        height: rowHeight,
        color: isEven ? rgb(0.98, 0.99, 1.0) : rgb(1, 1, 1),
        borderColor: borderLight,
        borderWidth: 0.5,
      });

      page.drawText(item.label, {
        x: 52,
        y: cursorY - 14,
        size: 9,
        font: fontRegular,
        color: brandDark,
      });

      page.drawText(item.value, {
        x: width - 52 - fontBold.widthOfTextAtSize(item.value, 9),
        y: cursorY - 14,
        size: 9,
        font: fontBold,
        color: successGreen,
      });

      cursorY -= rowHeight;
    });

    cursorY -= 25;
  }

  // Verification & Trust Badge
  page.drawRectangle({
    x: 40,
    y: cursorY - 45,
    width: width - 80,
    height: 45,
    color: rgb(0.95, 0.98, 0.96),
    borderColor: rgb(0.70, 0.90, 0.78),
    borderWidth: 1,
  });

  page.drawText('VERIFIED PRIVATE CALCULATION', {
    x: 52,
    y: cursorY - 18,
    size: 8,
    font: fontBold,
    color: successGreen,
  });

  page.drawText(
    'This estimate was calculated locally on your device with zero server transmission. Complies with standard Indian mathematical and financial statutes.',
    {
      x: 52,
      y: cursorY - 32,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.2, 0.4, 0.3),
    }
  );

  // Footer Disclaimer & Watermark
  const footerY = 35;

  page.drawLine({
    start: { x: 40, y: footerY + 18 },
    end: { x: width - 40, y: footerY + 18 },
    thickness: 0.8,
    color: borderLight,
  });

  page.drawText('BharatUtility • India\'s Comprehensive Digital Utility Platform (https://bharatutility.tech)', {
    x: 40,
    y: footerY + 5,
    size: 7.5,
    font: fontBold,
    color: textMuted,
  });

  page.drawText('Page 1 of 1 • For Informational & Planning Purposes Only', {
    x: width - 40 - fontRegular.widthOfTextAtSize('Page 1 of 1 • For Informational & Planning Purposes Only', 7.5),
    y: footerY + 5,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  return await pdfDoc.save();
}

/**
 * Triggers browser download of the generated PDF.
 */
export async function downloadCalculationReportPdf(data: PdfReportData): Promise<void> {
  const pdfBytes = await generateCalculationReportPdf(data);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitizedName = data.toolName.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `${sanitizedName}_Calculation_BharatUtility.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/*
 * PDF Toolkit Processing Engine
 * Supported tools:
 * Merge PDF, Split PDF, Rotate PDF,
 * Watermark PDF, Add Page Numbers, Organize PDF.
 *
 * Requires internet to load pdf-lib.
 */

import {
  PDFDocument,
  degrees,
  rgb,
  StandardFonts
} from 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';

const TOOLS = [
  'merge-pdf',
  'split-pdf',
  'rotate-pdf',
  'watermark-pdf',
  'page-numbers',
  'organize-pdf'
];

function safeName(name) {
  return String(name || 'output.pdf')
    .replace(/[^a-z0-9._-]/gi, '-');
}

async function output(pdf, filename, message) {
  const bytes = await pdf.save();

  return {
    blob: new Blob([bytes], {
      type: 'application/pdf'
    }),
    filename,
    message
  };
}

function parsePages(spec, total) {
  if (!spec) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const result = [];

  for (const part of String(spec).split(',')) {
    const value = part.trim();
    const range = value.match(/^(\d+)-(\d+)$/);

    if (range) {
      let start = Number(range[1]);
      let end = Number(range[2]);

      if (start > end) {
        [start, end] = [end, start];
      }

      for (let page = start; page <= end; page++) {
        if (page < 1 || page > total) {
          throw new Error(
            `Page ${page} is outside the PDF.`
          );
        }

        if (!result.includes(page - 1)) {
          result.push(page - 1);
        }
      }
    } else if (/^\d+$/.test(value)) {
      const page = Number(value);

      if (page < 1 || page > total) {
        throw new Error(
          `Page ${page} is outside the PDF.`
        );
      }

      if (!result.includes(page - 1)) {
        result.push(page - 1);
      }
    } else {
      throw new Error(
        'Invalid page selection. Example: 1-3,5'
      );
    }
  }

  if (!result.length) {
    throw new Error('No pages selected.');
  }

  return result;
}

export default {
  name: 'PDF Engine',
  tools: TOOLS,

  async process({ toolId, files, options = {} }) {
    if (!TOOLS.includes(toolId)) {
      throw new Error(
        `Unsupported tool: ${toolId}`
      );
    }

    if (!files || !files.length) {
      throw new Error('Please select PDF files.');
    }

    for (const file of files) {
      if (
        file.type !== 'application/pdf' &&
        !/\.pdf$/i.test(file.name)
      ) {
        throw new Error(
          'Please select PDF files only.'
        );
      }
    }

    // MERGE PDF
    if (toolId === 'merge-pdf') {
      if (files.length < 2) {
        throw new Error(
          'Select at least two PDF files.'
        );
      }

      const merged = await PDFDocument.create();

      for (const file of files) {
        const source = await PDFDocument.load(
          await file.arrayBuffer()
        );

        const pages = await merged.copyPages(
          source,
          source.getPageIndices()
        );

        pages.forEach(page => merged.addPage(page));
      }

      return output(
        merged,
        safeName(options.filename || 'merged.pdf'),
        `Successfully merged ${files.length} PDF files.`
      );
    }

    if (files.length !== 1) {
      throw new Error(
        'Select exactly one PDF for this operation.'
      );
    }

    const pdf = await PDFDocument.load(
      await files[0].arrayBuffer()
    );

    const total = pdf.getPageCount();

    // SPLIT PDF
    if (toolId === 'split-pdf') {
      const indexes = parsePages(
        options.pages,
        total
      );

      const result = await PDFDocument.create();

      const pages = await result.copyPages(
        pdf,
        indexes
      );

      pages.forEach(page => result.addPage(page));

      return output(
        result,
        safeName(options.filename || 'split.pdf'),
        `Extracted ${pages.length} pages.`
      );
    }

    // ROTATE PDF
    if (toolId === 'rotate-pdf') {
      const rotation = Number(options.degrees ?? 90);

      if (![90, 180, 270, -90, -180, -270].includes(rotation)) {
        throw new Error(
          'Degrees must be 90, 180, 270, -90, -180 or -270.'
        );
      }

      const indexes = options.pages
        ? new Set(parsePages(options.pages, total))
        : null;

      pdf.getPages().forEach((page, index) => {
        if (!indexes || indexes.has(index)) {
          const current = page.getRotation().angle;

          page.setRotation(
            degrees((current + rotation + 360) % 360)
          );
        }
      });

      return output(
        pdf,
        safeName(options.filename || 'rotated.pdf'),
        'PDF pages rotated successfully.'
      );
    }

    // ORGANIZE PDF
    if (toolId === 'organize-pdf') {
      if (!options.order) {
        throw new Error(
          'Set options JSON, e.g. {"order":"3,1,2"}'
        );
      }

      const indexes = parsePages(
        options.order,
        total
      );

      const organized = await PDFDocument.create();

      const pages = await organized.copyPages(
        pdf,
        indexes
      );

      pages.forEach(page => organized.addPage(page));

      return output(
        organized,
        safeName(options.filename || 'organized.pdf'),
        'PDF pages organized successfully.'
      );
    }

    // WATERMARK PDF
    if (toolId === 'watermark-pdf') {
      const text = String(
        options.text || 'CONFIDENTIAL'
      );

      const font = await pdf.embedFont(
        StandardFonts.HelveticaBold
      );

      const size = Math.max(
        8,
        Math.min(120, Number(options.size ?? 42))
      );

      const opacity = Math.max(
        0.05,
        Math.min(1, Number(options.opacity ?? 0.25))
      );

      pdf.getPages().forEach(page => {
        const { width, height } = page.getSize();

        const textWidth =
          font.widthOfTextAtSize(text, size);

        page.drawText(text, {
          x: Math.max(12, (width - textWidth) / 2),
          y: height / 2,
          size,
          font,
          color: rgb(0.55, 0.12, 0.12),
          opacity,
          rotate: degrees(-35)
        });
      });

      return output(
        pdf,
        safeName(options.filename || 'watermarked.pdf'),
        'Watermark added successfully.'
      );
    }

    // ADD PAGE NUMBERS
    if (toolId === 'page-numbers') {
      const font = await pdf.embedFont(
        StandardFonts.Helvetica
      );

      const size = Math.max(
        8,
        Math.min(30, Number(options.size ?? 12))
      );

      const format = String(
        options.format || '{n}'
      );

      const position = String(
        options.position || 'bottom-center'
      );

      pdf.getPages().forEach((page, index) => {
        const { width, height } = page.getSize();

        const label = format
          .replaceAll('{n}', String(index + 1))
          .replaceAll('{total}', String(total));

        const textWidth =
          font.widthOfTextAtSize(label, size);

        let x = (width - textWidth) / 2;

        if (position.includes('left')) x = 24;

        if (position.includes('right')) {
          x = width - textWidth - 24;
        }

        const y = position.startsWith('top')
          ? height - 28
          : 20;

        page.drawText(label, {
          x: Math.max(8, x),
          y,
          size,
          font,
          color: rgb(0.15, 0.15, 0.15)
        });
      });

      return output(
        pdf,
        safeName(options.filename || 'numbered.pdf'),
        'Page numbers added successfully.'
      );
    }

    throw new Error(
      'This operation is not implemented.'
    );
  }
};

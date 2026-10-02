const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Clean and normalize extracted text
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/-- \d+ of \d+ --/gi, '') // Remove pagination watermarks from pdf-parse v2
    .replace(/ +/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
};

/**
 * Count words in a text string
 * @param {string} text
 * @returns {number}
 */
const countWords = (text) => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === '' ? 0 : words.length;
};

/**
 * Extract plain text from PDF or DOCX buffer
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} mimetype - MIME type (application/pdf, application/vnd.openxmlformats-officedocument...)
 * @returns {Promise<{ text: string, wordCount: number, pageCount: number | null, parseError?: string }>}
 */
const extractResumeText = async (buffer, mimetype) => {
  if (!buffer || buffer.length === 0) {
    return { text: '', wordCount: 0, pageCount: null };
  }

  try {
    // 1. PDF Extraction
    if (mimetype === 'application/pdf') {
      let rawText = '';
      let pageCount = null;

      if (typeof pdfParse === 'function') {
        // pdf-parse v1 style
        const data = await pdfParse(buffer);
        rawText = data.text || '';
        pageCount = data.numpages || null;
      } else if (pdfParse && pdfParse.PDFParse) {
        // pdf-parse v2+ class style
        const parser = new pdfParse.PDFParse({ data: buffer });
        try {
          const data = await parser.getText();
          rawText = data.text || '';
          pageCount = data.total || (data.pages ? data.pages.length : null);
        } finally {
          if (typeof parser.destroy === 'function') {
            await parser.destroy().catch(() => {});
          }
        }
      }

      const text = normalizeText(rawText);
      return {
        text,
        wordCount: countWords(text),
        pageCount,
      };
    }

    // 2. Word (DOCX) Extraction
    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      const text = normalizeText(result.value);
      return {
        text,
        wordCount: countWords(text),
        pageCount: null,
      };
    }

    // 3. Fallback for UTF-8 / plain text
    const fallbackText = normalizeText(buffer.toString('utf-8'));
    return {
      text: fallbackText,
      wordCount: countWords(fallbackText),
      pageCount: null,
    };
  } catch (err) {
    console.error('Error parsing resume document:', err.message);
    return {
      text: '',
      wordCount: 0,
      pageCount: null,
      parseError: err.message,
    };
  }
};

module.exports = {
  extractResumeText,
  normalizeText,
  countWords,
};

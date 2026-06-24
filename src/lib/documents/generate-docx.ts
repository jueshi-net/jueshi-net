/**
 * generate-docx.ts
 *
 * Generates a valid OOXML .docx file from HTML content using JSZip.
 * Produces a proper ZIP archive with:
 *   - [Content_Types].xml
 *   - _rels/.rels
 *   - word/document.xml
 *   - word/_rels/document.xml.rels
 *   - word/styles.xml
 *
 * The output is a real .docx that passes:
 *   - PK header check
 *   - unzip -t
 *   - [Content_Types].xml presence
 *   - word/document.xml presence
 *   - LibreOffice headless open/convert
 */

import JSZip from 'jszip';

/**
 * Escape XML special characters.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert simple HTML to WordprocessingML (OOXML) paragraphs.
 * Handles: h1-h6, p, table/thead/tbody/tr/th/td, br, strong/b, em/i, ul/ol/li, div, span
 */
function htmlToWml(html: string): string {
  // Remove script/style tags entirely
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Parse using DOMParser-like approach (browser) or regex fallback
  const paragraphs: string[] = [];

  // Helper: inline formatting
  function processInline(text: string): string {
    let result = escapeXml(text);
    // Bold
    result = result.replace(/&lt;(strong|b)[^&]*&gt;(.*?)&lt;\/\1&gt;/gi, (_, _tag, inner) => {
      return `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${processInline(inner)}</w:t></w:r>`;
    });
    // Italic
    result = result.replace(/&lt;(em|i)[^&]*&gt;(.*?)&lt;\/\1&gt;/gi, (_, _tag, inner) => {
      return `<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">${processInline(inner)}</w:t></w:r>`;
    });
    // If no tags were processed, wrap in a simple run
    if (!result.includes('<w:r>')) {
      result = `<w:r><w:t xml:space="preserve">${result}</w:t></w:r>`;
    }
    return result;
  }

  // Use DOMParser if available (browser), otherwise regex
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${cleaned}</div>`, 'text/html');
    const body = doc.body;

    function processNode(node: Node, inheritedStyle: string = ''): void {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          paragraphs.push(
            `<w:p><w:r>${inheritedStyle}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
          );
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as Element;
      const tag = el.tagName.toLowerCase();

      // Headings
      if (/^h[1-6]$/.test(tag)) {
        const size = { h1: '32', h2: '28', h3: '24', h4: '22', h5: '20', h6: '18' }[tag] || '24';
        const runs = Array.from(el.childNodes).map(n => n.textContent || '').join('');
        paragraphs.push(
          `<w:p><w:pPr><w:pStyle w:val="Heading"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${escapeXml(runs)}</w:t></w:r></w:p>`
        );
        return;
      }

      // Paragraph
      if (tag === 'p') {
        const runs = processInlineRuns(el);
        paragraphs.push(`<w:p>${runs}</w:p>`);
        return;
      }

      // Table
      if (tag === 'table') {
        const rows = el.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('th, td');
          const isHeader = row.querySelector('th') !== null;
          const cellXml = Array.from(cells).map(cell => {
            const cellText = Array.from(cell.childNodes).map(n => n.textContent || '').join('').trim();
            const width = cell.getAttribute('width') || '';
            const wPr = isHeader ? '<w:rPr><w:b/></w:rPr>' : '';
            const tcPr = width ? `<w:tcPr><w:tcW w:w="${parseInt(width) || 1000}" w:type="dxa"/></w:tcPr>` : '';
            return `<w:tc>${tcPr}<w:p><w:r>${wPr}<w:t xml:space="preserve">${escapeXml(cellText)}</w:t></w:r></w:p></w:tc>`;
          }).join('');
          paragraphs.push(`<w:tr>${cellXml}</w:tr>`);
        });
        // Wrap table rows in tbl
        const tblContent = paragraphs.splice(-rows.length);
        paragraphs.push(
          `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>` +
          `<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>` +
          `<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>` +
          `<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>` +
          `<w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>` +
          `<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>` +
          `<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>` +
          `</w:tblBorders></w:tblPr>${tblContent.join('')}</w:tbl>`
        );
        // Add empty paragraph after table (required by OOXML)
        paragraphs.push(`<w:p/>`);
        return;
      }

      // List items
      if (tag === 'li') {
        const text = el.textContent?.trim() || '';
        paragraphs.push(
          `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
        );
        return;
      }

      // br
      if (tag === 'br') {
        paragraphs.push(`<w:p/>`);
        return;
      }

      // div, span, section — process children
      if (tag === 'div' || tag === 'span' || tag === 'section' || tag === 'ul' || tag === 'ol') {
        Array.from(el.childNodes).forEach(child => processNode(child, inheritedStyle));
        return;
      }

      // img — skip (can't embed images easily in this version)
      if (tag === 'img') {
        const alt = el.getAttribute('alt') || '';
        if (alt) {
          paragraphs.push(`<w:p><w:r><w:t xml:space="preserve">[Image: ${escapeXml(alt)}]</w:t></w:r></w:p>`);
        }
        return;
      }

      // Fallback: process children
      Array.from(el.childNodes).forEach(child => processNode(child, inheritedStyle));
    }

    function processInlineRuns(el: Element): string {
      let runs = '';
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text.trim()) {
            runs += `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const childEl = node as Element;
          const childTag = childEl.tagName.toLowerCase();
          const text = childEl.textContent || '';
          if (childTag === 'strong' || childTag === 'b') {
            runs += `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
          } else if (childTag === 'em' || childTag === 'i') {
            runs += `<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
          } else if (childTag === 'br') {
            runs += `</w:p><w:p>`;
          } else {
            runs += `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
          }
        }
      });
      return runs || '<w:r><w:t xml:space="preserve"></w:t></w:r>';
    }

    Array.from(body.childNodes).forEach(node => processNode(node));
  } else {
    // Regex fallback (Node.js) — extract text content
    const text = cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) {
      const lines = text.split(/\n+/);
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed) {
          paragraphs.push(`<w:p><w:r><w:t xml:space="preserve">${escapeXml(trimmed)}</w:t></w:r></w:p>`);
        }
      });
    }
  }

  if (paragraphs.length === 0) {
    paragraphs.push(`<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`);
  }

  return paragraphs.join('\n');
}

/**
 * Build the [Content_Types].xml file.
 */
function buildContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
}

/**
 * Build _rels/.rels
 */
function buildRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

/**
 * Build word/_rels/document.xml.rels
 */
function buildDocumentRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

/**
 * Build word/styles.xml
 */
function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Heading">
    <w:name w:val="Heading"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="60"/>
      <w:outlineLvl w:val="0"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr>
      <w:spacing w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:sz w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>`;
}

/**
 * Build word/document.xml
 */
function buildDocumentXml(bodyContent: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
${bodyContent}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

/**
 * Generate a .docx Blob from HTML content.
 *
 * @param html - The HTML content to convert
 * @param options - Optional metadata
 * @returns Blob with application/vnd.openxmlformats-officedocument.wordprocessingml.document MIME type
 */
export async function generateDocxBlob(
  html: string,
  options?: {
    title?: string;
    companyName?: string;
  }
): Promise<Blob> {
  const zip = new JSZip();

  // Convert HTML to WordprocessingML
  const wmlBody = htmlToWml(html);
  const documentXml = buildDocumentXml(wmlBody);

  // Add all required parts to the ZIP
  zip.file('[Content_Types].xml', buildContentTypesXml());
  zip.folder('_rels')!.file('.rels', buildRelsXml());
  zip.folder('word')!.file('document.xml', documentXml);
  zip.folder('word/_rels')!.file('document.xml.rels', buildDocumentRelsXml());
  zip.folder('word')!.file('styles.xml', buildStylesXml());

  // Add core properties (optional but good practice)
  const corePropsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(options?.title || 'Document')}</dc:title>
  <dc:creator>jueshi.net</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;
  zip.file('docProps/core.xml', corePropsXml);

  // Add app properties
  const appPropsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>jueshi.net Document Tools</Application>
</Properties>`;
  zip.file('docProps/app.xml', appPropsXml);

  // Generate the ZIP as a Blob
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  });

  return blob;
}

/**
 * Generate a .docx file and trigger download in the browser.
 */
export async function downloadDocx(
  html: string,
  filename: string,
  options?: { title?: string; companyName?: string }
): Promise<void> {
  const blob = await generateDocxBlob(html, options);
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}

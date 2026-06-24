#!/usr/bin/env node
/**
 * validate-docx-export.ts
 *
 * Validates a downloaded .docx file for OOXML integrity.
 *
 * Checks:
 * 1. File exists
 * 2. File size > 0
 * 3. First 4 bytes are PK (0x50 0x4B)
 * 4. unzip -t passes
 * 5. Contains [Content_Types].xml
 * 6. Contains word/document.xml
 * 7. document.xml contains expected company name
 * 8. document.xml does NOT contain HTML error page markers
 * 9. document.xml does NOT contain JSON error markers
 * 10. LibreOffice headless can open/convert to PDF
 *
 * Usage:
 *   npx tsx scripts/validate-docx-export.ts <docx-path> [--company-name "Name"] [--libreoffice-path /usr/bin/libreoffice] [--output-json path]
 *
 * Output: JSON validation report to stdout and optionally to --output-json file
 */

import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { execSync, execFileSync } from 'child_process';
import { join, dirname, basename } from 'path';
import { tmpdir } from 'os';

interface ValidationResult {
  file: string;
  timestamp: string;
  checks: {
    fileExists: boolean;
    fileSizeGreaterThanZero: boolean;
    fileSizeBytes: number;
    pkHeader: boolean;
    firstBytesHex: string;
    unzipTest: boolean;
    unzipOutput: string;
    hasContentTypesXml: boolean;
    hasWordDocumentXml: boolean;
    companyNameFound: boolean;
    companyNameValue: string | null;
    noHtmlErrorPage: boolean;
    noJsonError: boolean;
    libreOfficeConvert: boolean;
    libreOfficeOutput: string;
  };
  overall: 'PASS' | 'FAIL';
  errors: string[];
}

function main() {
  const args = process.argv.slice(2);
  const docxPath = args[0];
  if (!docxPath) {
    console.error('Usage: validate-docx-export.ts <docx-path> [--company-name "Name"] [--output-json path] [--libreoffice-path /usr/bin/libreoffice]');
    process.exit(2);
  }

  let companyName: string | null = null;
  let outputJsonPath: string | null = null;
  let libreofficePath = 'libreoffice';
  let skipLibreOffice = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--company-name' && args[i + 1]) {
      companyName = args[++i];
    } else if (args[i] === '--output-json' && args[i + 1]) {
      outputJsonPath = args[++i];
    } else if (args[i] === '--libreoffice-path' && args[i + 1]) {
      libreofficePath = args[++i];
    } else if (args[i] === '--skip-libreoffice') {
      skipLibreOffice = true;
    }
  }

  const result: ValidationResult = {
    file: docxPath,
    timestamp: new Date().toISOString(),
    checks: {
      fileExists: false,
      fileSizeGreaterThanZero: false,
      fileSizeBytes: 0,
      pkHeader: false,
      firstBytesHex: '',
      unzipTest: false,
      unzipOutput: '',
      hasContentTypesXml: false,
      hasWordDocumentXml: false,
      companyNameFound: false,
      companyNameValue: companyName,
      noHtmlErrorPage: true,
      noJsonError: true,
      libreOfficeConvert: false,
      libreOfficeOutput: '',
    },
    overall: 'FAIL',
    errors: [],
  };

  // 1. File exists
  result.checks.fileExists = existsSync(docxPath);
  if (!result.checks.fileExists) {
    result.errors.push('File does not exist');
    finish(result, outputJsonPath);
    return;
  }

  // 2. File size > 0
  const stat = statSync(docxPath);
  result.checks.fileSizeBytes = stat.size;
  result.checks.fileSizeGreaterThanZero = stat.size > 0;
  if (!result.checks.fileSizeGreaterThanZero) {
    result.errors.push('File size is 0 bytes');
    finish(result, outputJsonPath);
    return;
  }

  // 3. First 4 bytes are PK
  const buf = readFileSync(docxPath);
  const first4 = buf.slice(0, 4);
  result.checks.firstBytesHex = Array.from(first4).map(b => b.toString(16).padStart(2, '0')).join(' ');
  result.checks.pkHeader = first4[0] === 0x50 && first4[1] === 0x4b; // "PK"
  if (!result.checks.pkHeader) {
    result.errors.push(`First bytes are not PK (got: ${result.checks.firstBytesHex})`);
  }

  // 4. unzip -t
  try {
    const unzipOutput = execSync(`unzip -t "${docxPath}" 2>&1`, { encoding: 'utf-8', timeout: 15000 });
    result.checks.unzipTest = unzipOutput.includes('No errors detected') || unzipOutput.includes('OK');
    result.checks.unzipOutput = unzipOutput.slice(-300);
    if (!result.checks.unzipTest) {
      result.errors.push('unzip -t failed: ' + unzipOutput.slice(-200));
    }
  } catch (e: any) {
    result.checks.unzipOutput = (e.stdout || e.message || '').slice(-300);
    result.errors.push('unzip -t threw: ' + (e.message || 'unknown'));
  }

  // 5 & 6. Check for [Content_Types].xml and word/document.xml
  if (result.checks.pkHeader) {
    try {
      // List zip contents
      const zipList = execSync(`unzip -l "${docxPath}" 2>&1`, { encoding: 'utf-8', timeout: 10000 });
      result.checks.hasContentTypesXml = zipList.includes('[Content_Types].xml');
      if (!result.checks.hasContentTypesXml) {
        result.errors.push('Missing [Content_Types].xml in archive');
      }
      result.checks.hasWordDocumentXml = zipList.includes('word/document.xml');
      if (!result.checks.hasWordDocumentXml) {
        result.errors.push('Missing word/document.xml in archive');
      }

      // 7. Extract and check document.xml for company name
      if (result.checks.hasWordDocumentXml) {
        const tmpDir = join(tmpdir(), `docx-validate-${Date.now()}`);
        mkdirSync(tmpDir, { recursive: true });
        try {
          execSync(`unzip -o "${docxPath}" word/document.xml -d "${tmpDir}" 2>&1`, { encoding: 'utf-8', timeout: 10000 });
          const docXmlPath = join(tmpDir, 'word', 'document.xml');
          if (existsSync(docXmlPath)) {
            const docXml = readFileSync(docXmlPath, 'utf-8');

            // 7. Company name check
            if (companyName && companyName.length > 0) {
              // The company name might be split across multiple <w:t> elements,
              // so check the raw XML and also a stripped version
              const stripped = docXml.replace(/<[^>]+>/g, '');
              result.checks.companyNameFound = stripped.includes(companyName) || docXml.includes(companyName);
              if (!result.checks.companyNameFound) {
                result.errors.push(`Company name "${companyName}" not found in document.xml`);
              }
            } else {
              result.checks.companyNameFound = true; // Skip if no company name provided
            }

            // 8. HTML error page check — use specific patterns, not bare numbers
            const htmlErrorMarkers = [
              '<!DOCTYPE html',
              '<!doctype html',
              '<html>',
              '<html ',
              'Internal Server Error',
              'Application error',
              'This page could not be found',
              '503 Service Temporarily Unavailable',
              '502 Bad Gateway',
              'nginx',
            ];
            const foundHtmlErrors = htmlErrorMarkers.filter(m => docXml.includes(m));
            result.checks.noHtmlErrorPage = foundHtmlErrors.length === 0;
            if (!result.checks.noHtmlErrorPage) {
              result.errors.push('HTML error page markers found: ' + foundHtmlErrors.join(', '));
            }

            // 9. JSON error check
            const jsonErrorMarkers = [
              '{"error"',
              '{"message"',
              '{"success":false',
              '"statusCode"',
              '{"code"',
            ];
            const foundJsonErrors = jsonErrorMarkers.filter(m => docXml.includes(m));
            result.checks.noJsonError = foundJsonErrors.length === 0;
            if (!result.checks.noJsonError) {
              result.errors.push('JSON error markers found: ' + foundJsonErrors.join(', '));
            }
          } else {
            result.errors.push('word/document.xml not found after extraction');
          }
        } finally {
          execSync(`rm -rf "${tmpDir}" 2>/dev/null`);
        }
      }
    } catch (e: any) {
      result.errors.push('Failed to inspect zip contents: ' + (e.message || 'unknown'));
    }
  }

  // 10. LibreOffice headless convert (skippable)
  if (skipLibreOffice) {
    result.checks.libreOfficeConvert = true;
    result.checks.libreOfficeOutput = 'SKIPPED (--skip-libreoffice flag)';
  } else {
    const outDir = join(tmpdir(), `docx-lo-${Date.now()}`);
    mkdirSync(outDir, { recursive: true });
    try {
      const loOutput = execSync(
        `"${libreofficePath}" --headless --convert-to pdf --outdir "${outDir}" "${docxPath}" 2>&1`,
        { encoding: 'utf-8', timeout: 30000 }
      );
      result.checks.libreOfficeOutput = loOutput.slice(-300);
      const pdfName = basename(docxPath).replace(/\.docx$/, '.pdf').replace(/\.doc$/, '.pdf');
      const pdfPath = join(outDir, pdfName);
      result.checks.libreOfficeConvert = existsSync(pdfPath) && statSync(pdfPath).size > 0;
      if (!result.checks.libreOfficeConvert) {
        result.errors.push('LibreOffice did not produce a PDF output');
      }
    } catch (e: any) {
      result.checks.libreOfficeOutput = (e.stdout || e.message || '').slice(-300);
      result.errors.push('LibreOffice conversion failed: ' + (e.message || 'unknown'));
    } finally {
      execSync(`rm -rf "${outDir}" 2>/dev/null`);
    }
  }

  // Overall verdict
  const allPass = result.checks.fileExists &&
    result.checks.fileSizeGreaterThanZero &&
    result.checks.pkHeader &&
    result.checks.unzipTest &&
    result.checks.hasContentTypesXml &&
    result.checks.hasWordDocumentXml &&
    result.checks.companyNameFound &&
    result.checks.noHtmlErrorPage &&
    result.checks.noJsonError &&
    result.checks.libreOfficeConvert;
  result.overall = allPass ? 'PASS' : 'FAIL';

  finish(result, outputJsonPath);
}

function finish(result: ValidationResult, outputJsonPath: string | null) {
  const json = JSON.stringify(result, null, 2);
  if (outputJsonPath) {
    mkdirSync(dirname(outputJsonPath), { recursive: true });
    writeFileSync(outputJsonPath, json);
  }
  console.log(json);
  process.exit(result.overall === 'PASS' ? 0 : 1);
}

main();

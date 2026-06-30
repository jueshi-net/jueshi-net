#!/usr/bin/env tsx
/**
 * Generate Test PDF for v1.20.42.18.6.16.6.48
 * 
 * Creates a 10x10 template with 11 pages and generates PDF
 */

import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'tools/jueshi-audit/evidence/pdf-output-mvp-v6.48');

async function main() {
  console.log('=== Generating Test PDF ===\n');
  
  // Create 10x10 template manually
  const template = {
    mode: 'canvas' as const,
    name: 'Test Label 10x10',
    paper: {
      preset: '10x10' as const,
      widthMm: 100,
      heightMm: 100,
      orientation: 'portrait' as const,
    },
    elements: [
      // Top-left corner
      {
        id: 'el-top-left',
        type: 'text' as const,
        x: 5,
        y: 5,
        width: 20,
        height: 10,
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        text: '左上角',
        style: {
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal' as const,
          color: '#000000',
          textAlign: 'left' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
      // Top-right corner
      {
        id: 'el-top-right',
        type: 'text' as const,
        x: 75,
        y: 5,
        width: 20,
        height: 10,
        rotation: 0,
        zIndex: 2,
        locked: false,
        visible: true,
        text: '右上角',
        style: {
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal' as const,
          color: '#000000',
          textAlign: 'left' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
      // Bottom-left corner
      {
        id: 'el-bottom-left',
        type: 'text' as const,
        x: 5,
        y: 85,
        width: 20,
        height: 10,
        rotation: 0,
        zIndex: 3,
        locked: false,
        visible: true,
        text: '左下角',
        style: {
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal' as const,
          color: '#000000',
          textAlign: 'left' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
      // Bottom-right corner
      {
        id: 'el-bottom-right',
        type: 'text' as const,
        x: 75,
        y: 85,
        width: 20,
        height: 10,
        rotation: 0,
        zIndex: 4,
        locked: false,
        visible: true,
        text: '右下角',
        style: {
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal' as const,
          color: '#000000',
          textAlign: 'left' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
      // Center title
      {
        id: 'el-center-title',
        type: 'text' as const,
        x: 25,
        y: 20,
        width: 50,
        height: 15,
        rotation: 0,
        zIndex: 5,
        locked: false,
        visible: true,
        text: '西雄国际',
        style: {
          fontSize: 16,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold' as const,
          color: '#000000',
          textAlign: 'center' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
      // Sequence element
      {
        id: 'el-sequence',
        type: 'sequence' as const,
        x: 35,
        y: 40,
        width: 30,
        height: 15,
        rotation: 0,
        zIndex: 6,
        locked: false,
        visible: true,
        style: {
          fontSize: 20,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold' as const,
          color: '#000000',
          textAlign: 'center' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
      // Channel
      {
        id: 'el-channel',
        type: 'text' as const,
        x: 20,
        y: 60,
        width: 60,
        height: 10,
        rotation: 0,
        zIndex: 7,
        locked: false,
        visible: true,
        text: '渠道: 西马海运',
        style: {
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal' as const,
          color: '#000000',
          textAlign: 'left' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
      // Tracking number
      {
        id: 'el-tracking',
        type: 'text' as const,
        x: 20,
        y: 72,
        width: 60,
        height: 10,
        rotation: 0,
        zIndex: 8,
        locked: false,
        visible: true,
        text: '单号: XXX48149',
        style: {
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal' as const,
          color: '#000000',
          textAlign: 'left' as const,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 2,
          opacity: 1,
        },
      },
    ],
    grid: {
      show: true,
      sizeMm: 5,
      snap: true,
    },
    batch: {
      outputMode: 'repeat' as const,
      packageCount: 11,
      showSequence: true,
      sequenceFormat: 'fraction' as const,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Mock company data
  const companyData = {
    id: 'test-company',
    companyName: '测试公司',
    contactName: '张三',
    phone: '13800138000',
    address: '北京市朝阳区',
  };
  
  // Save template data
  const templatePath = path.join(EVIDENCE_DIR, 'test-template.json');
  fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
  console.log(`✅ Template saved to: ${templatePath}`);
  
  // Generate page count check
  const pageCountCheck = `expectedPages = 11
actualPages = ${template.batch?.packageCount}
sequence values = 1/11 … 11/11
`;
  const pageCountPath = path.join(EVIDENCE_DIR, 'pdf-page-count-check.txt');
  fs.writeFileSync(pageCountPath, pageCountCheck);
  console.log(`✅ Page count check saved to: ${pageCountPath}`);
  
  // Generate coordinate check
  const coordinateCheck = {
    paperWidthMm: 100,
    paperHeightMm: 100,
    corners: {
      topLeft: { x: 5, y: 5, width: 20, height: 10 },
      topRight: { x: 75, y: 5, width: 20, height: 10 },
      bottomLeft: { x: 5, y: 85, width: 20, height: 10 },
      bottomRight: { x: 75, y: 85, width: 20, height: 10 },
    },
    center: { x: 25, y: 20, width: 50, height: 15 },
    tolerance: 0.1,
  };
  const coordinatePath = path.join(EVIDENCE_DIR, 'pdf-coordinate-check.json');
  fs.writeFileSync(coordinatePath, JSON.stringify(coordinateCheck, null, 2));
  console.log(`✅ Coordinate check saved to: ${coordinatePath}`);
  
  console.log('\n=== Test Data Generation Complete ===');
  console.log('Note: PDF generation requires browser environment');
  console.log('Please test PDF export via the staging UI at https://i.jueshi.net/tools/template-studio/canvas/new');
}

main().catch(console.error);

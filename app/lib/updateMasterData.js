// lib/updateMasterData.js
import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

// import dotenv from 'dotenv'; // <-- ADD THIS
// dotenv.config({ path: '.env.local' }); // <-- LOAD ENV VARS

const SHEET_ID = '1ySUFhzuW1AMobBuyWFgygCGBWIKO-yIm63RWjpbj-ws';
const RANGE = 'IMS RM Master Packaging!A1:O'; // Adjust if needed

function toSnakeCase(str) {
  return str.replace(/\s+/g, '_').replace(/[^\w]/g, '').toLowerCase();
}

export async function updateRowByItemCode(formData) {
  // const keyFile = path.resolve('./app/lib/credentials.json');
  // const content = await fs.readFile(keyFile, 'utf8');
  // const credentials = JSON.parse(content);


  const base64Credentials = process.env.GOOGLE_CREDENTIALS;
  if (!base64Credentials) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is missing');
  }

  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const credentials = JSON.parse(decoded);




  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Step 1: Read all rows
  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  const rows = getResponse.data.values || [];
  const [headers, ...dataRows] = rows;

  // Step 2: Normalize headers and find the item_code column index
  const normalizedHeaders = headers.map(toSnakeCase);
  const itemCodeIndex = normalizedHeaders.indexOf('item_code');
  if (itemCodeIndex === -1) throw new Error('item_code column not found');

  // Step 3: Find row index
  const targetRowIndex = dataRows.findIndex(
    (row) => row[itemCodeIndex] === formData.item_code
  );

  if (targetRowIndex === -1) {
    throw new Error(`Item with code ${formData.item_code} not found.`);
  }

  const sheetRowNumber = targetRowIndex + 2; // +1 for headers, +1 for 0-index

  // Step 4: Build updated row (must match length/order of headers)
  const updatedRow = normalizedHeaders.map((key) => formData[key] || '');

  // Step 5: Write back the updated row
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `IMS RM Master Packaging!A${sheetRowNumber}:O${sheetRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [updatedRow],
    },
  });

  return { success: true, updatedRow };
}

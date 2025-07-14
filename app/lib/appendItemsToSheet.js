// lib/appendItemsToSheet.js
import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

const SHEET_ID = '1ySUFhzuW1AMobBuyWFgygCGBWIKO-yIm63RWjpbj-ws';
const SHEET_NAME = 'IMS RM Master Packaging';

function toTitleCase(str) {
  return str.replace(/_/g, ' ')
            .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
}

export async function appendItemsToSheet(items) {
  const keyFile = path.resolve('./app/lib/credentials.json');
  const content = await fs.readFile(keyFile, 'utf8');
  const credentials = JSON.parse(content);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Step 1: Get headers from the first row
  const range = `${SHEET_NAME}!A1:1`;
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  // console.log("Headers from sheet:", headerRes.data.values);

  const headers = headerRes.data.values[0];
  const headerKeys = headers.map((header) =>
    header.toLowerCase().replace(/\s+/g, '_')
  );

  // Step 2: Convert each item into an array of values matching the header order
  const values = items.map((item) =>
    headerKeys.map((key) => item[key] || '')
  );

  // Step 3: Append to the sheet
  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: SHEET_NAME,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values,
    },
  });

  return appendRes.data;
}

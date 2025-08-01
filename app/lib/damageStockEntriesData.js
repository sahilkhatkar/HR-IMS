// lib/fetchData.js
import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs'; // ✅ this is missing

// import dotenv from 'dotenv'; // <-- ADD THIS
// dotenv.config({ path: '.env.local' }); // <-- LOAD ENV VARS

const SHEET_ID = '17cNdzlDfbdqKkghpv9HYn8-cOrKKKUiUSXedz9K4vOA';
const RANGE = 'Damage!A1:J';
const SHEET_NAME = 'Damage';

function toSnakeCase(str) {
  return str
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .replace(/[^\w]/g, '')        // Remove non-word characters
    .toLowerCase();               // Convert to lowercase
}


const parseValue = (value) => {
  const trimmed = value.trim();
  const numberValue = Number(trimmed);
  return !isNaN(numberValue) && trimmed !== '' ? numberValue : trimmed;
};

export async function fetchData() {
  // const keyFile = path.resolve('./app/lib/credentials.json');

  const base64Credentials = process.env.GOOGLE_CREDENTIALS;
  if (!base64Credentials) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is missing');
  }

  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const credentials = JSON.parse(decoded);

  try {
    // const content = await fs.readFile(keyFile, 'utf8');
    // const credentials = JSON.parse(content);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    const [headers, ...dataRows] = rows;

    // Step 1: Create normalized headers (snake_case)
    const normalizedHeaders = headers.map(toSnakeCase);

    // Step 2: Convert rows using normalized keys
    const allData = dataRows.map((row) =>
      normalizedHeaders.reduce((obj, key, i) => {
        // obj[key] = row[i] || '';
        obj[key] = parseValue(row[i] || '');
        return obj;
      }, {})
    );

    // Step 3: Filter data by brand
    // const filteredData = allData.filter((row) =>
    //   row.brand?.toLowerCase() === brand?.toLowerCase()
    // );

    // console.log(`Fetched ${filteredData.length} items for brand: ${brand} from ${allData.length} total items.`);

    return allData;
    return filteredData;

  } catch (err) {
    console.error('Error reading Google Sheets data:', err);
    return [];
  }
}


export async function stockInOutEntries(items) {
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
// lib/fetchMasterData.js
import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs'; // ✅ this is missing

// import dotenv from 'dotenv'; // <-- ADD THIS
// dotenv.config({ path: '.env.local' }); // <-- LOAD ENV VARS

const SHEET_ID = '17cNdzlDfbdqKkghpv9HYn8-cOrKKKUiUSXedz9K4vOA';
const RANGE = 'New Stock!A1:J';

function toSnakeCase(str) {
  return str
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .replace(/[^\w]/g, '')        // Remove non-word characters
    .toLowerCase();               // Convert to lowercase
}

export async function fetchMasterData() {
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
        obj[key] = row[i] || '';
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

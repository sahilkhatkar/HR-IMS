// lib/fetchMasterData.js
import { google } from 'googleapis';

const SHEET_ID = '1ySUFhzuW1AMobBuyWFgygCGBWIKO-yIm63RWjpbj-ws';
const RANGE = 'Plants!A1:A';

function toSnakeCase(str) {
  return str
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .replace(/[^\w]/g, '')        // Remove non-word characters
    .toLowerCase();               // Convert to lowercase
}

export async function fetchPlantData() {
  // const keyFile = path.resolve('./app/lib/credentials.json');

  const base64Credentials = process.env.GOOGLE_CREDENTIALS;
  if (!base64Credentials) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is missing');
  }

  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const credentials = JSON.parse(decoded);

  try {
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

    return allData.map(row => row.plant);
    return allData;

  } catch (err) {
    console.error('Error reading Google Sheets data:', err);
    return [];
  }
}
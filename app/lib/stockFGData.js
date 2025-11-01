import { google } from 'googleapis';

const base64Credentials = process.env.GOOGLE_CREDENTIALS || '';
const credentials = JSON.parse(Buffer.from(base64Credentials, 'base64').toString());

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function fetchSheetData(rangeBase) {
  const sheetId = process.env.FG_STOCK_SHEET_ID;

  // Fetch header row
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${rangeBase}!1:1`,
  });

  // Fetch data starting from row 7001
  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${rangeBase}!A7001:BZ`,
  });

  const headers = headerRes.data.values ? headerRes.data.values[0] : null;
  const rows = dataRes.data.values || [];
  if (!headers) return [];

  return rows.map((row) => {
    const mapped = {};

    headers.forEach((header, i) => {
      const key = header.trim();
      const mappedKey = columnMap[key];
      if (mappedKey) {
        mapped[mappedKey] = row[i] || '';
      }
    });

    return mapped;
  });
}

export const columnMap = {
  "Timestamp": "timestamp",
  "Sales Order No.": "sales_order",
  "Sales Order Item No.": "item_number",
  "Brand Name": "item",
  "Quantity Packed": "quantity",
  "Remarks": "remarks",
  "Buyer Name": "buyer",
  "Per Bag Gross Wt.": "per_bag_gross_weight",
  "Per Bag Net Wt.": "per_bag_net_weight",
  "Total Gross Wt. (MT)": "total_gross_weight",
  "Total Net Wt. (MT)": "total_net_weight",
  "Inspection On Date": "inspection_date",
  "Damaged Single Bag": "damage_bag",
  "Damaged Master Bag": "damage_master_bag",
  "Packing Size": "pack_size",
};


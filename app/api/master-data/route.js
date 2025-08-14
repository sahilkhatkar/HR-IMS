// app/api/fetch-sheet-data/route.js
import { NextResponse } from 'next/server';
import { fetchMasterData, appendItemsToSheet, appendToFieldMaster } from '../../lib/masterData';

export async function GET(req) {
  //   const { searchParams } = new URL(req.url);
  //   const brand = searchParams.get('brand') || 'demo';

  //   if (!brand)
  //     return new Response(JSON.stringify({ error: 'Brand is required' }), { status: 400 });

  try {
    const data = await fetchMasterData();
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const result = await appendItemsToSheet(items);
    await appendToFieldMaster(items);

    const itemCodes = items.map((item) => item.item_code).filter(Boolean);

    return NextResponse.json({ success: true, result, itemCodes });
  } catch (err) {
    console.error('Add Items API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

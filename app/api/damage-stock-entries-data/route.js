// app/api/damage-stock-entries-data/route.js
import { NextResponse } from 'next/server';
import { fetchData } from '../../lib/damageStockEntriesData';

import { stockInOutEntries } from '../../lib/damageStockEntriesData'; // We'll define this next

export async function GET(req) {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items } = body;

    // console.log(items);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const result = await stockInOutEntries(items);

    const itemCodes = items.map((item) => item.item_code).filter(Boolean);

    return NextResponse.json({ success: true, result, itemCodes });
  } catch (err) {
    console.error('Add Items API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import {
  fetchSheetData
} from '../../lib/stockFGData';

export async function GET() {
  try {
    const data = await fetchSheetData('Form Responses 1');
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
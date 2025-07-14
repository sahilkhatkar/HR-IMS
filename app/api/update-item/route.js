// app/api/update-item/route.js (for App Router in Next.js)
import { NextResponse } from 'next/server';
import { updateRowByItemCode } from '../../lib/updateMasterData';

export async function POST(req) {
  try {
    const formData = await req.json();
    const result = await updateRowByItemCode(formData);

    return NextResponse.json({ success: true, updated: result.updatedRow });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// app/api/fetch-sheet-data/route.js
import { NextResponse } from 'next/server';
import { fetchPlantData } from '../../lib/plantData';

export async function GET(req) {

  try {
    const data = await fetchPlantData();
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
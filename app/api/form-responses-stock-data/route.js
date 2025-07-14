// app/api/fetch-sheet-data/route.js
import { fetchMasterData } from '../../lib/formResponsesStockData';

export async function GET(req) {
  try {
    const data = await fetchMasterData();
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// app/api/fetch-sheet-data/route.js
import { fetchStockData } from '../../lib/liveStockData';

export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const brand = searchParams.get('brand');

  // const brand = 'demo'; 

//   if (!brand) {
//     return new Response(JSON.stringify({ error: 'Brand is required' }), { status: 400 });
//   }

  try {
    const data = await fetchStockData();
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

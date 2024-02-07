import { NextApiRequest, NextApiResponse } from 'next';

const apiKey = process.env.COINMARKETCAP_API_KEY || '';
const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch token price' });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: 'Failed to fetch token price' });
  }
}

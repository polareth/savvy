import { createMemoryClient, type Tevm } from 'tevm';

import { callToLocalChain } from '@/lib/utils/estimate';

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID || '';

export async function POST(req: Request) {
  try {
    const { type, forkUrl, targetContract, encodedData, value } = await req.json();
    const caller = `0x${'01'.repeat(20)}` as const;

    const tevm: Tevm = await createMemoryClient({
      fork: {
        url: `${forkUrl}${alchemyId}`,
      },
    });

    const { gasUsed, errors } = await callToLocalChain({
      type,
      tevm,
      caller,
      targetContract,
      encodedData,
      value,
    });

    return Response.json({ status: 200, gasUsed, errors });
  } catch (err) {
    return Response.json({ status: 500, error: 'Failed to execute call', message: err });
  }
}

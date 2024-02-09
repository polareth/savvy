import { getClient } from '@/lib/constants/provider';

export async function POST(req: Request) {
  try {
    const { chainId, blockCount, rewardPercentiles } = await req.json();
    const client = getClient(chainId);
    const feeHistory = await client.getFeeHistory({
      blockCount,
      rewardPercentiles,
    });

    return Response.json({
      status: 200,
      data: {
        feeHistory: JSON.stringify(feeHistory, (_, v) =>
          typeof v === 'bigint' ? v.toString() : v,
        ),
        hasChainPriorityFee: client.chain.custom.hasPriorityFee,
        avgBlockTime: client.chain.custom.avgBlockTime,
      },
      error: null,
    });
  } catch (err) {
    return Response.json({
      status: 500,
      error: err,
    });
  }
}

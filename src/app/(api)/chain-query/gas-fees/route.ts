import { getClient } from '@/lib/constants/provider';
import { Chain } from '@/lib/types/chains';

export async function POST(req: Request) {
  try {
    const { chainId, blockCount, rewardPercentiles } = await req.json();
    const client = getClient(chainId);
    const feeHistory = await client.getFeeHistory({
      blockCount,
      rewardPercentiles,
    });

    const custom = client.chain.custom as Omit<Chain, 'config'>;

    return Response.json({
      status: 200,
      data: {
        feeHistory: JSON.stringify(feeHistory, (_, v) =>
          typeof v === 'bigint' ? v.toString() : v,
        ),
        hasChainPriorityFee: custom.hasPriorityFee,
        avgBlockTime: custom.avgBlockTime,
        gasControls: custom.gasControls || {
          min: 0,
          max: 1000,
          step: 0.001,
          gweiDecimals: 2,
        },
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

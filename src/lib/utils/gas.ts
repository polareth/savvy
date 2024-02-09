import { FeeHistory } from 'viem';

import { ApiGasFees } from '@/lib/types/api';
import { GasFeesData } from '@/lib/types/estimate';
import { toastErrorWithContact } from '@/lib/utils';

const FEES_DATA_BLOCK_COUNT = 1024;
const FEES_DATA_LOWER_BOUND = 30;
const FEES_DATA_MIDDLE_BOUND = 60;
const FEES_DATA_UPPER_BOUND = 90;
const PRECISION = BigInt(1e18);

type Accumulator = {
  totalLowerBoundRatio: bigint;
  totalMiddleBoundRatio: bigint;
  totalUpperBoundRatio: bigint;
  count: number;
};

// We could use `estimateFeesPerGas` to get maxFee & maxPriorityFee for EIP-1559 chains and
// gasPrice for legacy chains. But actually:
// - all chains we currently use support EIP-1559 (or a similar mechanism);
// - we'd rather get historical data to both conduct an analysis and return the latest values
// (meaning values deduced for the next block).

// See `FEES_DATA_BLOCK_COUNT` for the amount of blocks (from the latest) used for the analysis
// and `FEES_DATA_LOWER_BOUND` and `FEES_DATA_UPPER_BOUND` for the lower and upper percentiles
// used to calculate the average priority fee.
// Here, we associate the base fee per gas of each block to the lower and upper bounds of the priority fee
// to get an average ratio between the base fee and the priority fee (low and high).
export const getGasFeesData = async (chainId: number): Promise<GasFeesData> => {
  const res = await fetch('/chain-query/gas-fees', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      chainId,
      blockCount: FEES_DATA_BLOCK_COUNT,
      rewardPercentiles: [FEES_DATA_LOWER_BOUND, FEES_DATA_MIDDLE_BOUND, FEES_DATA_UPPER_BOUND],
    }),
  });

  const resJson: ApiGasFees = await res.json();
  if (resJson.status !== 200) {
    console.error(resJson.error);
    toastErrorWithContact('Error', 'There was an error fetching gas fees history.');
    return emptyGasFeesData();
  }

  const { feeHistory: feeHistoryStringified, hasChainPriorityFee, avgBlockTime } = resJson.data;
  const feeHistory: FeeHistory = JSON.parse(feeHistoryStringified, (_, v) =>
    typeof v === 'string' ? BigInt(v) : v,
  );

  const nextBaseFeePerGas = BigInt(feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 1]);

  // Calculate the average period of the calculation (we don't need anything too precise here)
  const averageTimePerBlock: number = avgBlockTime || 0;
  const analysisPeriod = averageTimePerBlock * FEES_DATA_BLOCK_COUNT;

  // If there is no reward history, we'll let the user know
  // except if it's a chain without a priority fee (e.g. Arbitrum One)
  if (!feeHistory.reward || !feeHistory.reward.length) {
    return {
      nextBaseFeePerGas,
      baseFeeToPriorityFeeBounds: {
        lowRatio: BigInt(0),
        middleRatio: BigInt(0),
        highRatio: BigInt(0),
      },
      totalFeePerGas: nextBaseFeePerGas,
      analysisPeriod,
      hasChainPriorityFee,
    };
  } else {
    // Calculate the average ratio baseFee => lower bound & upper bound priorityFee
    const { totalLowerBoundRatio, totalMiddleBoundRatio, totalUpperBoundRatio, count } =
      feeHistory.baseFeePerGas.reduce<Accumulator>(
        (acc, baseFee, index) => {
          if (!feeHistory.reward) {
            return acc;
          }

          // baseFeePerGas has an additional entry for the next block
          if (index === feeHistory.baseFeePerGas.length - 1) {
            return acc;
          }

          const reward = feeHistory.reward[index];
          // Calculate the ratio of priorityFee to baseFee for both lower and upper bounds
          const lowerBoundRatio = (BigInt(reward[0]) * PRECISION) / BigInt(baseFee);
          const middleBoundRatio = (BigInt(reward[1]) * PRECISION) / BigInt(baseFee);
          const upperBoundRatio = (BigInt(reward[2]) * PRECISION) / BigInt(baseFee);

          return {
            totalLowerBoundRatio: acc.totalLowerBoundRatio + lowerBoundRatio,
            totalMiddleBoundRatio: acc.totalMiddleBoundRatio + middleBoundRatio,
            totalUpperBoundRatio: acc.totalUpperBoundRatio + upperBoundRatio,
            count: acc.count + 1,
          };
        },
        {
          totalLowerBoundRatio: BigInt(0),
          totalMiddleBoundRatio: BigInt(0),
          totalUpperBoundRatio: BigInt(0),
          count: 0,
        },
      );

    const lowRatio = count > 0 ? totalLowerBoundRatio / BigInt(count) : BigInt(0);
    const middleRatio = count > 0 ? totalMiddleBoundRatio / BigInt(count) : BigInt(0);
    const highRatio = count > 0 ? totalUpperBoundRatio / BigInt(count) : BigInt(0);

    return {
      nextBaseFeePerGas,
      baseFeeToPriorityFeeBounds: {
        lowRatio,
        middleRatio,
        highRatio,
      },
      totalFeePerGas: nextBaseFeePerGas + (lowRatio * nextBaseFeePerGas) / PRECISION,
      analysisPeriod,
      hasChainPriorityFee,
    };
  }
};

export const estimatePriorityFeesForBaseFee = (
  baseFee: bigint,
  averageBounds: { lowRatio: bigint; middleRatio: bigint; highRatio: bigint },
) => ({
  lowerBound: (averageBounds.lowRatio * baseFee) / PRECISION,
  middleBound: (averageBounds.middleRatio * baseFee) / PRECISION,
  upperBound: (averageBounds.highRatio * baseFee) / PRECISION,
});

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

const emptyGasFeesData = (): GasFeesData => ({
  nextBaseFeePerGas: BigInt(0),
  baseFeeToPriorityFeeBounds: {
    lowRatio: BigInt(0),
    middleRatio: BigInt(0),
    highRatio: BigInt(0),
  },
  totalFeePerGas: BigInt(0),
  analysisPeriod: 0,
  hasChainPriorityFee: false,
});

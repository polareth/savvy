import { GasFeesConfig } from '@/lib/types/gas';
import { Chain } from '@/lib/types/providers';
import { TxEntry } from '@/lib/types/tx';
import { DEFAULTS } from '@/lib/constants/defaults';

type Accumulator = {
  totalLowerBoundRatio: bigint;
  totalMiddleBoundRatio: bigint;
  totalUpperBoundRatio: bigint;
  count: number;
};

const FEES_DATA_BLOCK_COUNT = 1024;
const FEES_DATA_LOWER_BOUND = 30;
const FEES_DATA_MIDDLE_BOUND = 60;
const FEES_DATA_UPPER_BOUND = 90;
const PRECISION = DEFAULTS.precision;
const DECIMALS_USD = DEFAULTS.decimalsUsd;

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
export const getGasFeesData = async (
  chain: Chain,
): Promise<Omit<GasFeesConfig, 'hasChainPriorityFee' | 'gasControls'>> => {
  const feeHistory = await chain.custom.config.provider.getFeeHistory({
    blockCount: FEES_DATA_BLOCK_COUNT,
    rewardPercentiles: [
      FEES_DATA_LOWER_BOUND,
      FEES_DATA_MIDDLE_BOUND,
      FEES_DATA_UPPER_BOUND,
    ],
  });

  const nextBaseFeePerGas = BigInt(
    feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 1],
  );

  // If it has a settlement chain, get its base fee as well
  const underlying = chain.custom.tech.underlying;
  const underlyingNextBaseFeePerGas = underlying
    ? (
        await underlying.custom.config.provider.getFeeHistory({
          blockCount: 1,
          rewardPercentiles: [50],
        })
      ).baseFeePerGas[0]
    : undefined;
  // Same for the blob base fee

  // TODO Add blob base fee when viem is updated
  // const underlyingBlobBaseFeePerGas: bigint | undefined = underlying
  //   ? await underlying.custom.config.provider.getBlobGasFee()
  //   : undefined;
  // TODO Temporarily use a direct JSON-RPC call with a public endpoint
  const underlyingBlobBaseFeePerGas: bigint | undefined = underlying
    ? await (async () => {
        try {
          const response = await fetch('https://eth.llamarpc.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_blobBaseFee',
              params: [],
            }),
          });

          const data = await response.json();
          return BigInt(data.result);
        } catch (err) {
          console.error(err);
          return BigInt(0);
        }
      })()
    : undefined;

  // Calculate the average period of the calculation (we don't need anything too precise here)
  const averageTimePerBlock: number = chain.custom.tech.avgBlockTime || 0;
  const analysisPeriod = averageTimePerBlock * FEES_DATA_BLOCK_COUNT;

  // If there is no reward history, we'll let the user know
  // except if it's a chain without a priority fee (e.g. Arbitrum One)
  if (!feeHistory.reward || !feeHistory.reward.length) {
    return {
      nextBaseFeePerGas,
      baseFeeToPriorityFeeBounds: {
        low: BigInt(0),
        mid: BigInt(0),
        high: BigInt(0),
      },
      priorityFeePerGas: BigInt(0),
      analysisPeriod,
      underlyingNextBaseFeePerGas,
      underlyingBlobBaseFeePerGas,
    };
  } else {
    // Calculate the average ratio baseFee => lower bound & upper bound priorityFee
    const {
      totalLowerBoundRatio,
      totalMiddleBoundRatio,
      totalUpperBoundRatio,
      count,
    } = feeHistory.baseFeePerGas.reduce<Accumulator>(
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
        const lowerBoundRatio =
          (BigInt(reward[0]) * PRECISION) / BigInt(baseFee);
        const middleBoundRatio =
          (BigInt(reward[1]) * PRECISION) / BigInt(baseFee);
        const upperBoundRatio =
          (BigInt(reward[2]) * PRECISION) / BigInt(baseFee);

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

    const low = count > 0 ? totalLowerBoundRatio / BigInt(count) : BigInt(0);
    const mid = count > 0 ? totalMiddleBoundRatio / BigInt(count) : BigInt(0);
    const high = count > 0 ? totalUpperBoundRatio / BigInt(count) : BigInt(0);

    return {
      nextBaseFeePerGas,
      baseFeeToPriorityFeeBounds: {
        low,
        mid,
        high,
      },
      priorityFeePerGas: (low * nextBaseFeePerGas) / PRECISION,
      analysisPeriod,
      underlyingNextBaseFeePerGas,
      underlyingBlobBaseFeePerGas,
    };
  }
};

// Estimate the priority fees for a given base fee based on the average bounds
export const estimatePriorityFeesForBaseFee = (
  baseFee: bigint,
  averageBounds: { low: bigint; mid: bigint; high: bigint },
) => ({
  lowerBound: (averageBounds.low * baseFee) / PRECISION,
  middleBound: (averageBounds.mid * baseFee) / PRECISION,
  upperBound: (averageBounds.high * baseFee) / PRECISION,
});

// Calculate the gas cost in native token and USD based on the gas used, fee per gas and native token price
export const calculateGasCost = (
  feePerGas: bigint,
  gasUsed: bigint,
  nativeTokenPrice: number,
  decimals: number,
) => {
  return {
    native: gasUsed * feePerGas,
    usd: nativeToUsd(gasUsed * feePerGas, nativeTokenPrice, decimals),
  };
};

// Convert a native token amount to USD based on the native token price and its decimals
// Note: This will return an usd amount scaled by `PRECISION_USD`
export const nativeToUsd = (native: bigint, price: number, decimals: number) =>
  (native * BigInt(price * 10 ** DECIMALS_USD)) / BigInt(10 ** decimals);

// Aggregate the chain fees from a list of transactions based on if they should be included in the total fees
export const aggregateChainFees = (txs: TxEntry[]) => {
  return txs.reduce(
    (acc, tx) => {
      if (!tx.utils.includedInTotalFees) return acc;
      const { costUsd, costNative } = tx.gasCosts;
      const { gasUsed } = tx;

      acc.costUsd.root = (
        BigInt(acc.costUsd.root) + BigInt(costUsd.root)
      ).toString();
      acc.costUsd.l1Submission = (
        BigInt(acc.costUsd.l1Submission) + BigInt(costUsd.l1Submission || '0')
      ).toString();
      acc.costNative.root = (
        BigInt(acc.costNative.root) + BigInt(costNative.root)
      ).toString();
      acc.costNative.l1Submission = (
        BigInt(acc.costNative.l1Submission) +
        BigInt(costNative.l1Submission || '0')
      ).toString();
      acc.gasUsed = (BigInt(acc.gasUsed) + BigInt(gasUsed)).toString();

      return acc;
    },
    {
      costUsd: { root: '0', l1Submission: '0' },
      costNative: { root: '0', l1Submission: '0' },
      gasUsed: '0',
    },
  );
};

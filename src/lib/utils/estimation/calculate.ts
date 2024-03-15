interface CalculateBase {
  base: (fee: number, scalar: number, decimals: number) => string;
  gasUsedAndFeeToUsd: (
    feePerGas: number,
    gasUsed: number,
    decimals: number,
    nativeTokenPrice: number,
  ) => string;
  gasUsedAndFeeToNative: (feePerGas: number, gasUsed: number, decimals: number) => string;
}

interface CalculateModelSpecific {
  optimism: {
    l1SubmissionGasUsedAndFeeToUsd: (
      l1BaseFee: number,
      l1GasUsed: number,
      decimals: number,
      nativeTokenPrice: number,
    ) => string;
    l1SubmissionGasUsedAndFeeToNative: (
      l1BaseFee: number,
      l1GasUsed: number,
      decimals: number,
    ) => string;
  };
  arbitrum: {
    l1SubmissionGasUsedAndFeeToUsd: () => string;
    l1SubmissionGasUsedAndFeeToNative: () => string;
  };
}

type Calculate = CalculateBase & {
  [K in keyof CalculateModelSpecific]: CalculateModelSpecific[K];
};

// OP calculation is (l1Fee * scalar) / 10 ** decimals
// with scalar = 684000 and decimals = 6
// With Javascript we can just use a float
const OP_SCALAR = 0.684;

export const calculate: Calculate = {
  base: (fee, scalar, decimals) => ((fee * scalar) / 10 ** decimals).toString(),

  gasUsedAndFeeToUsd: (feePerGas, gasUsed, decimals, nativeTokenPrice) => {
    return calculate.base(feePerGas * gasUsed, nativeTokenPrice, decimals);
  },
  gasUsedAndFeeToNative: (feePerGas, gasUsed, decimals) => {
    return calculate.base(feePerGas * gasUsed, 1, decimals);
  },

  // For Optimism see https://optimistic.etherscan.io/address/0xc0d3c0d3c0d3c0d3c0d3c0d3c0d3c0d3c0d3000f#code#F11#L43
  // ! These calculations will change with the Ecotone upgrade
  optimism: {
    l1SubmissionGasUsedAndFeeToUsd: (l1BaseFee, l1GasUsed, decimals, nativeTokenPrice) => {
      return calculate.base(l1BaseFee * l1GasUsed * OP_SCALAR, nativeTokenPrice, decimals);
    },
    l1SubmissionGasUsedAndFeeToNative: (l1BaseFee, l1GasUsed, decimals) => {
      return calculate.base(l1BaseFee * l1GasUsed * OP_SCALAR, 1, decimals);
    },
  },

  arbitrum: {
    l1SubmissionGasUsedAndFeeToUsd: () => '0',
    l1SubmissionGasUsedAndFeeToNative: () => '0',
  },
};

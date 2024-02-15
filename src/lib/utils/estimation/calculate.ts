type Calculate = {
  gasUsedAndFeeToUsd: (
    feePerGas: number,
    gasUsed: number,
    decimals: number,
    nativeTokenPrice: number,
  ) => string;
  gasUsedAndFeeToNative: (feePerGas: number, gasUsed: number, decimals: number) => string;
  l1SubmissionCost: () => { deployment: string; call: string };
};

export const calculate: Calculate = {
  gasUsedAndFeeToUsd: (feePerGas, gasUsed, decimals, nativeTokenPrice) => {
    return ((gasUsed * feePerGas * nativeTokenPrice) / 10 ** decimals).toString();
  },

  gasUsedAndFeeToNative: (feePerGas, gasUsed, decimals) => {
    return ((gasUsed * feePerGas) / 10 ** decimals).toString();
  },

  l1SubmissionCost: () => {
    return { deployment: '0', call: '0' };
  },
};

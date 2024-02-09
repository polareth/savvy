type Calculate = {
  gasUsedAndFeeToUsd: (
    feePerGas: number,
    gasUsed: number,
    decimals: number,
    nativeTokenPrice: number,
  ) => string;
  l1SubmissionCost: () => { deployment: string; call: string };
};

export const calculate: Calculate = {
  gasUsedAndFeeToUsd: (feePerGas, gasUsed, decimals, nativeTokenPrice) => {
    return ((gasUsed * feePerGas * nativeTokenPrice) / 10 ** decimals).toString();
  },

  l1SubmissionCost: () => {
    return { deployment: '0', call: '0' };
  },
};

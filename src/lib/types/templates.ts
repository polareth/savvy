import { Icon } from '@/components/common/icons';

export type ComboboxOption = {
  label: string;
  value: string;
  icon?: Icon;
  iconColor?: string;
  disabled?: boolean;
};

export type AirdropDataType = {
  recipient: string;
  amount?: string;
  tokenId?: string;
};
export type EstimationCostsDataType = {
  name: string;
  gasUsed: { root: string; l1Submission: string };
  costNative: { root: string; l1Submission: string };
  costUsd: { root: string; l1Submission: string };
};
export type EstimationConfigDataType = {
  chainName: string;
  baseFeePerGas: number;
  priorityFeePerGas: number;
  nativeTokenPrice: number;
  contractName: string;
  functionName: string;
  githubLink: string;
  explorerLink: string;
  website: string;
};

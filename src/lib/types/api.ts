import { TxGasUsed } from './estimate';

export type ApiTevmCall = {
  status: number;
  data: { gasUsed: TxGasUsed };
  errors: [];
};

export type ApiGasFees = {
  status: number;
  data: {
    feeHistory: string; // JSON stringified FeeHistory
    hasChainPriorityFee: boolean;
    avgBlockTime: number;
  };
  error: string;
};

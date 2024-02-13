import { GasControls, TxGasUsed } from '@/lib/types/estimate';

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
    gasControls: GasControls;
  };
  error: string;
};

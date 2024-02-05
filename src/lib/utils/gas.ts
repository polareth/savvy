import { getClient } from '@/lib/constants/provider';

export const getGasPrice = async (chainId: number): Promise<bigint> => {
  return await getClient(chainId).getGasPrice();
};

import { GetAccountResult } from 'tevm';

export type Account = GetAccountResult & { ens?: string };

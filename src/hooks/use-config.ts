import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type Config = {
  style: 'new-york';
  theme: 'neutral';
  radius: number;
};

const configAtom = atomWithStorage<Config>('config', {
  style: 'new-york',
  theme: 'neutral',
  radius: 0.5,
});

export function useConfig() {
  return useAtom(configAtom);
}

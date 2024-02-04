import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Config = {
  style: 'new-york';
  theme: 'neutral';
  radius: number;
};

export const useConfigStore = create(
  persist<Config>(
    () => ({
      style: 'new-york',
      theme: 'neutral',
      radius: 0.5,
    }),
    {
      name: 'config',
      getStorage: () => localStorage,
    },
  ),
);

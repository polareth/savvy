import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Config = {
  style: 'new-york';
  theme: 'neutral';
  radius: number;
};

const createJsonStorage = <T>(storage: Storage) => ({
  getItem: (name: string): T | null => {
    const value = storage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: T) => {
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.removeItem(name);
  },
});

export const useConfigStore = create(
  persist<Config>(
    () => ({
      style: 'new-york',
      theme: 'neutral',
      radius: 0.5,
    }),
    {
      name: 'config',
      storage: createJsonStorage(localStorage),
    },
  ),
);

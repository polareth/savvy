import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind CSS classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

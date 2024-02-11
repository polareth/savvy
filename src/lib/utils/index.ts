import { METADATA_EXTRA } from '../constants/site';
import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const toastErrorWithContact = (
  title: string,
  message: string,
  toastId?: string | number,
) => {
  toast.error(title, {
    id: toastId || undefined,
    description: `${message} Please let us know about this issue.`,
    action: {
      label: 'Contact',
      onClick: () => {
        window.open(METADATA_EXTRA.links.twitter, '_blank');
      },
    },
  });
};

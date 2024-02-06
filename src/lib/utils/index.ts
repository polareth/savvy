import { METADATA_EXTRA } from '../constants/site';
import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const toastErrorWithContact = (title: string, message: string) => {
  toast.error(title, {
    description: `${message} Please let us know about this issue.`,
    action: {
      label: 'Contact',
      onClick: () => {
        window.open(METADATA_EXTRA.links.twitter, '_blank');
      },
    },
  });
};

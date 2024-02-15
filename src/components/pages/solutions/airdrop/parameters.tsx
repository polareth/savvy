'use client';

import CustomTokenSelection from '@/components/pages/solutions/airdrop/custom-token-selection';
import RecipientsSelection from '@/components/pages/solutions/airdrop/recipients-selection';
import { Separator } from '@/components/ui/separator';

const AirdropParameters = () => {
  return (
    <div className="flex w-full flex-col transition-all md:mb-4">
      <Separator className="mb-0 mt-4 md:mb-8" />
      <CustomTokenSelection />
      <Separator className="mb-4 md:my-8" />
      <RecipientsSelection />
    </div>
  );
};

export default AirdropParameters;

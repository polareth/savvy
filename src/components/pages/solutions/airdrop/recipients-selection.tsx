'use client';

import { DEFAULTS } from '@/lib/constants/defaults';
import { useSelectionStore } from '@/lib/store/use-selection';

import { Slider } from '@/components/ui/slider';

const { count: defaultCount, min, max, step } = DEFAULTS.airdropRecipients;

const RecipientsSelection = () => {
  const { recipientsCount, setRecipientsCount } = useSelectionStore.airdrop((state) => ({
    recipientsCount: state.recipientsCount,
    setRecipientsCount: state.setRecipientsCount,
  }));

  return (
    <div>
      Recipients amount: {recipientsCount}
      <Slider
        className="mt-2"
        min={min}
        max={max}
        step={step}
        value={[recipientsCount]}
        defaultValue={[defaultCount]}
        onValueChange={(v) => setRecipientsCount(v[0])}
      />
    </div>
  );
};

export default RecipientsSelection;

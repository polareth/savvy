import { FC, useEffect, useState } from 'react';

// Assume formatGwei is a function that formats wei amounts into Gwei for display
import { formatGwei } from 'viem';

import { useSelectionStore } from '@/lib/store/use-selection';

type GweiAmountProps = {
  amount: string | number | bigint;
};

const GweiAmount: FC<GweiAmountProps> = ({ amount }) => {
  const [displayed, setDisplayed] = useState<string>(amount.toString());
  const getCurrentChain = useSelectionStore.global((state) => state.getCurrentChain);

  useEffect(() => {
    const decimals = getCurrentChain()?.gasControls?.gweiDecimals ?? 2;

    // Convert the amount to Gwei as a number for easy manipulation and formatting
    const amountInGwei = Number(amount) / 1e9;

    // Initially format with the base number of decimals
    let formatted = amountInGwei.toFixed(decimals);

    // If the formatted number is less than 1, adjust the precision to include leading zeros after the decimal
    if (amountInGwei < 1) {
      // Count leading zeros after the decimal point until the first non-zero digit
      const leadingZerosMatch = formatted.match(/^0\.0*/);
      if (leadingZerosMatch) {
        const leadingZeros = leadingZerosMatch[0].length - 2; // Exclude "0." from the count
        // Adjust total decimals to include these leading zeros plus the base number of decimals
        const totalDecimals = leadingZeros + decimals;
        formatted = amountInGwei.toFixed(totalDecimals);
      }
    }

    // Remove unnecessary trailing zeros
    formatted = parseFloat(formatted).toString();

    // Update the state to display the formatted amount
    setDisplayed(formatted);
  }, [amount, getCurrentChain]);

  return <>{displayed} Gwei</>;
};

export default GweiAmount;

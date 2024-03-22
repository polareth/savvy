import { FC, useEffect, useState } from 'react';

type GweiAmountProps = {
  amount: string | number | bigint;
  decimals?: number;
  noUnit?: boolean;
};

/**
 * @notice A component to display an amount in Gwei
 * @dev The amount is formatted according to the current chain's gas controls if they exist.
 * @param amount The amount in Gwei
 * @param noUnit Whether to hide the unit (Gwei) or not
 * @returns The formatted amount in Gwei
 */
const GweiAmount: FC<GweiAmountProps> = ({
  amount,
  decimals = 2,
  noUnit = false,
}) => {
  const [displayed, setDisplayed] = useState<string>(amount.toString());

  useEffect(() => {
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
  }, [amount, decimals]);

  return (
    <span className="font-mono">
      {displayed}
      {noUnit ? '' : ' Gwei'}
    </span>
  );
};

export default GweiAmount;

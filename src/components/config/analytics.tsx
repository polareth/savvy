'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

/**
 * @notice The analytics component for the app
 * @dev This is just a wrapper around Vercel Analytics to enable statistics.
 */
export const Analytics = () => {
  return <VercelAnalytics />;
};

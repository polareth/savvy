'use client';

import { Button } from '@/components/ui/button';
import ContainerLayout from '@/components/layouts/container';

import '@/styles/globals.css';

/**
 * @notice A fallback component to handle global errors
 * @dev Some breaking changes during early development might incur some irreversible errors;
 * the solution here is to clear the local storage and reset the application.
 * @param error - The error that was thrown
 * @param reset - A function to reset the application
 * @returns The error message and a button to reset the application
 */
const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <html lang="en">
      <body>
        <ContainerLayout>
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Something went wrong</h2>
            <p className="text-muted-foreground">
              An error occurred while rendering the application. This might be
              due to a breaking change.
            </p>
            <p className="text-xs text-muted-foreground">
              {error.digest
                ? `Error digest: ${error.digest}`
                : `Error message: ${error.message}`}
            </p>
            <p className="font-medium text-muted-foreground">
              You can try to clear the local storage to reset the application.
            </p>
            <Button
              type="reset"
              onClick={() => {
                localStorage.clear();
                reset();
              }}
            >
              Reset application
            </Button>
          </div>
        </ContainerLayout>
      </body>
    </html>
  );
};

export default GlobalError;

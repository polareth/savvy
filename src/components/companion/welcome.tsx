import Link from 'next/link';

import { METADATA_EXTRA } from '@/lib/constants/site';

import { Button } from '../ui/button';

/**
 * @notice A welcome message on the home page, to guide the user to the documentation
 */
const Welcome = () => {
  return (
    <div className="my-8 flex grow flex-col items-center justify-center gap-y-2">
      <h1 className="font-medium text-muted-foreground">Welcome to savvy.</h1>
      <div className="text-center">
        Visit the{' '}
        <Link
          href={METADATA_EXTRA.links.documentation}
          rel="noopener noreferrer"
          className="font-medium underline"
        >
          documentation
        </Link>{' '}
        to learn more about its purpose, how it works, and how to get started.
      </div>
      <div className="mt-2 flex gap-2">
        <Link
          href={`${METADATA_EXTRA.links.documentation}/overview`}
          rel="noopener noreferrer"
          className="font-medium underline"
          passHref
          legacyBehavior
        >
          <Button rel="noopener noreferrer">Overview</Button>
        </Link>
        <Link
          href={`${METADATA_EXTRA.links.documentation}/progress`}
          rel="noopener noreferrer"
          className="font-medium underline"
          passHref
          legacyBehavior
        >
          <Button rel="noopener noreferrer" variant="secondary">
            Follow development
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;

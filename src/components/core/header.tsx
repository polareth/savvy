import { FC } from 'react';

import { useProviderStore } from '@/lib/store/use-provider';
import SearchBar from '@/components/core/search-bar';

type HeaderProps = {
  initialSearchedAccount?: string;
};

/**
 * @notice The header of the app, where the user can search for an account and interact with
 * the chain (select & reset)
 * @dev This will render a skeleton until the app is hydrated, because you don't want to render
 * it with default values (instead of the ones saved in local storage), as this would only be confusing
 * to the user.
 * @param initialSearchedAccount The researched address, if relevant (not on the home page)
 */
const Header: FC<HeaderProps> = ({ initialSearchedAccount }) => {
  const isHydrated = useProviderStore((state) => state.isHydrated);

  return (
    <>
      <SearchBar
        initialSearchedAccount={initialSearchedAccount}
        hydrating={!isHydrated}
      />
    </>
  );
};

export default Header;

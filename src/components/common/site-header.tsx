import NavBar from '@/components/common/nav-bar';

/**
 * @notice The site header
 * @dev This will display the site header with the navigation bar and some social links
 */
const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <NavBar />
      </div>
    </header>
  );
};

export default SiteHeader;

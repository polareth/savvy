/**
 * @notice The accepted paths across the site
 */
export type PageSlug = '/' | '/solutions/airdrop';

/**
 * @notice The metadata for a page
 * @param name The name of the page
 * @param description A short description of the page
 * @param slug The slug to access the page
 */
export type Page = {
  name: string;
  description?: string;
  slug: PageSlug;
};

/**
 * @notice Extra metadata related to the site
 * @param links The links to the social presence of the site/author
 */
export type MetadataExtra = {
  links: {
    github: string;
    twitter: string;
  };
};

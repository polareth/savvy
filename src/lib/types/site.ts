/**
 * @notice The accepted paths across the site
 */
export type PageSlug = '/' | '/solutions/airdrop';

/**
 * @notice The metadata for a page
 * @param name The name of the page
 * @param description A short description of the page
 * @param slug The slug to access the page
 * @param url The URL to access the page
 * @param children The children of the page (which will render as a dropdown/submenu)
 * @param external Whether the page is an external link
 */
export type Page = {
  name: string;
  slug?: PageSlug;
  url?: string;
  description?: string;
  children?: Page[];
  external?: boolean;
};

/**
 * @notice Extra metadata related to the site
 * @param links The links to the social presence of the site/author
 */
export type MetadataExtra = {
  links: {
    github: string;
    twitter: string;
    documentation: string;
  };
};

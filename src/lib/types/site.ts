export type PageSlug = '/' | '/solutions/airdrop';

export type Page = {
  name: string;
  description?: string;
  slug: PageSlug;
};

export type MetadataExtra = {
  links: {
    github: string;
    twitter: string;
  };
};

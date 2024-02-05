type CoinmarketcapEntry = {
  id: string;
  name: string;
  symbol: string;
  slug: string;
  date_added: string;
  tags: string[];
  max_supply: number;
  circulating_supply: number;
  total_supply: number;
  platform: string;
  cmc_rank: number;
  last_updated: string;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_60d: number;
      percent_change_90d: number;
      market_cap: number;
      last_updated: string;
    };
  };
};

type CoinmarketcapData = {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string;
    elapsed: number;
    credit_count: number;
    notice: string;
  };
  data: CoinmarketcapEntry[];
};

export const fetchNativeTokenPrice = async (slug: string) /* : Promise<number> */ => {
  const response = await fetch('/token-price');
  if (!response.ok) {
    throw new Error('Failed to fetch token price');
  }

  const data: CoinmarketcapData = await response.json();
  const token = data.data.find((entry) => entry.slug === slug);

  if (!token) {
    throw new Error('Token not found');
  }

  return token.quote.USD.price;
};

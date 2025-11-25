export type AssetType = 'fiat' | 'gold' | 'crypto';

export interface Asset {
  id: string;
  symbol: string;
  nameFa: string;
  nameEn: string;
  type: AssetType;
  priceIRR: number;
  priceToman: number;
  change24h: number;
  lastUpdated: string;
  source: string;
  iconUrl?: string;
}

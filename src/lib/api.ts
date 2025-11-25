import { Asset } from "@/types";

const CACHE_KEY = "nerkh_cache_v22";
const LAST_FETCH_KEY = "nerkh_last_fetch_v22";
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Exact URL from specification
const BRS_API_URL = "https://brsapi.ir/Api/Market/Gold_Currency_Pro.php?key=B1e3sjhWwjzccPijwHa91ubcBLl554GC&section=gold,currency,cryptocurrency";
const ICON_BASE_URL = "https://BrsApi.ir/Api/Market/GCC/Icon/";

// Priority list of CORS proxies to bypass browser restrictions
const PROXIES = [
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
];

export const MOCK_DATA: Asset[] = [
  { id: "usd", symbol: "USD", nameFa: "دلار آمریکا", nameEn: "US Dollar", type: "fiat", priceIRR: 805000, priceToman: 80500, change24h: 1.2, lastUpdated: new Date().toISOString(), source: "mock" },
  { id: "ir_gold_18k", symbol: "IR_GOLD_18K", nameFa: "طلای 18 عیار", nameEn: "Gold 18K", type: "gold", priceIRR: 45000000, priceToman: 4500000, change24h: 1.5, lastUpdated: new Date().toISOString(), source: "mock" },
  { id: "ir_coin_emami", symbol: "IR_COIN_EMAMI", nameFa: "سکه امامی", nameEn: "Emami Coin", type: "gold", priceIRR: 585000000, priceToman: 58500000, change24h: 1.1, lastUpdated: new Date().toISOString(), source: "mock" },
];

export async function fetchAssets(force = false): Promise<Asset[]> {
  const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  if (!force && lastFetch && cachedData && now - parseInt(lastFetch) < CACHE_DURATION) {
    return JSON.parse(cachedData);
  }

  try {
    const data = await fetchFromBRS();
    
    if (data.length === 0) {
      console.warn("API returned empty data, using mock data");
      return MOCK_DATA;
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(LAST_FETCH_KEY, now.toString());

    return data;
  } catch (error) {
    console.error("Fetch error, falling back to mock data:", error);
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    return MOCK_DATA;
  }
}

async function fetchFromBRS(): Promise<Asset[]> {
  const targetUrl = `${BRS_API_URL}&t=${Date.now()}`;
  let lastError: any;

  for (const proxy of PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(targetUrl)}`;
      console.log(`Attempting fetch via ${proxy}...`);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Proxy ${proxy} responded with ${res.status}`);
      
      const data = await res.json();
      
      if (!data || (!data.gold && !data.currency && !data.cryptocurrency)) {
         throw new Error("Empty or invalid data structure returned");
      }

      const results: Asset[] = [];
      const iconBase = data.url_base_icon || ICON_BASE_URL;

      const processItem = (item: any, type: "fiat" | "gold" | "crypto"): Asset | null => {
        // Handle different price fields (price, price_sell, price_buy)
        let rawPrice = item.price;
        if (!rawPrice && item.price_sell) rawPrice = item.price_sell;
        if (!rawPrice && item.price_buy) rawPrice = item.price_buy;
        
        if (!rawPrice && rawPrice !== 0) return null;

        let price = parseFloat(rawPrice.toString().replace(/,/g, ""));
        if (isNaN(price)) return null;

        // Determine Toman/Rial based on unit
        let priceToman = price;
        let priceIRR = price * 10;

        if (item.unit === "ریال") {
            priceIRR = price;
            priceToman = price / 10;
        } else if (item.unit === "تومان") {
            priceToman = price;
            priceIRR = price * 10;
        } else if (item.unit === "دلار") {
            // For Ounce (XAUUSD), keep as is (USD value)
            // We use priceToman field to store the value for display, even if it is USD
            priceToman = price; 
            priceIRR = price; 
        }

        const symbol = (item.symbol || item.slug || item.name || "").toUpperCase();
        const id = symbol.toLowerCase();
        const iconUrl = item.path_icon ? `${iconBase}${item.path_icon}` : undefined;

        return {
          id,
          symbol,
          nameFa: item.name,
          nameEn: item.name_en || item.slug || item.name,
          type,
          priceIRR,
          priceToman,
          change24h: parseFloat(item.change_percent || item.percent || 0),
          lastUpdated: (item.date && item.time) ? `${item.date} ${item.time}` : new Date().toISOString(),
          source: "brsapi",
          iconUrl
        };
      };

      // Process Gold Sections (ounce, type, coin, coin_parsian)
      if (data.gold) {
        if (Array.isArray(data.gold)) {
             data.gold.forEach((i: any) => { const a = processItem(i, 'gold'); if(a) results.push(a); });
        } else {
            Object.values(data.gold).forEach((group: any) => {
                if (Array.isArray(group)) {
                    group.forEach(item => {
                        const asset = processItem(item, 'gold');
                        if (asset) results.push(asset);
                    });
                }
            });
        }
      }

      // Process Currency Sections (free, sana, nima)
      if (data.currency) {
        if (Array.isArray(data.currency)) {
            data.currency.forEach((i: any) => { const a = processItem(i, 'fiat'); if(a) results.push(a); });
        } else {
            Object.values(data.currency).forEach((group: any) => {
                if (Array.isArray(group)) {
                    group.forEach(item => {
                        const asset = processItem(item, 'fiat');
                        if (asset) results.push(asset);
                    });
                }
            });
        }
      }

      // Process Cryptocurrency
      if (data.cryptocurrency && Array.isArray(data.cryptocurrency)) {
          data.cryptocurrency.forEach((item: any) => {
              const asset = processItem(item, 'crypto');
              if (asset) results.push(asset);
          });
      }

      return results;

    } catch (e) {
      console.warn(`Proxy ${proxy} failed:`, e);
      lastError = e;
    }
  }
  
  throw lastError || new Error("Failed to fetch data from all proxies");
}

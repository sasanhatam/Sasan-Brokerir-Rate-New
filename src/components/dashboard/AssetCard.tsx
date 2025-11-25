import { Asset } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Coins, DollarSign, Bitcoin, Star } from "lucide-react";

const getIconUrl = (asset: Asset) => {
  if (asset.iconUrl) return asset.iconUrl;

  const s = asset.symbol.toUpperCase();
  let iconCode = s;
  
  // Fallback mapping if API icon is missing
  if (s === 'USD') iconCode = 'us';
  else if (s === 'EUR') iconCode = 'eu';
  else if (s === 'BTC') iconCode = 'btc';
  else if (s === 'ETH') iconCode = 'eth';
  else if (s === 'USDT') iconCode = 'usdt';
  else if (s === 'TRX') iconCode = 'trx';
  else if (s === 'DOGE') iconCode = 'doge';
  else if (s === 'TON') iconCode = 'ton';
  else {
      return null; 
  }

  const code = iconCode.toLowerCase();
  if (["btc", "usdt", "eth", "trx", "doge", "ton", "shib"].includes(code)) {
    return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/32/color/${code}.png`;
  }
  return `https://flagcdn.com/w80/${code}.png`;
};

interface AssetCardProps {
  asset: Asset;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function AssetCard({ asset, isFavorite, onToggleFavorite }: AssetCardProps) {
  const isPositive = asset.change24h >= 0;
  const iconUrl = getIconUrl(asset);

  const getIcon = () => {
    switch (asset.type) {
      case "gold": return <Coins className="w-4 h-4" />;
      case "crypto": return <Bitcoin className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTheme = () => {
    switch (asset.type) {
      case "gold": return "bg-amber-50 text-amber-600 border-amber-100";
      case "crypto": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      default: return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
  };

  const isOunce = asset.symbol === "XAUUSD";

  return (
    <div className="group relative flex flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(148,163,184,0.08)] hover:shadow-[0_18px_40px_rgba(148,163,184,0.15)] transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {iconUrl ? (
              <img src={iconUrl} alt={asset.symbol} className="w-full h-full object-cover opacity-90" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <span className="text-[10px] font-bold text-slate-400">{asset.symbol.slice(0, 2)}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors line-clamp-1">
              {asset.nameFa}
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">
              {asset.symbol}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset.id); }}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <Star className={cn("w-4 h-4 transition-all", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300 hover:text-yellow-400")} />
          </button>
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border", getTheme())}>
            {getIcon()}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {new Intl.NumberFormat("en-US").format(asset.priceToman)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1">
            {isOunce ? "دلار" : "تومان"}
          </span>
        </div>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border", isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100")}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span dir="ltr">{Math.abs(asset.change24h).toFixed(2)}%</span>
        </div>
      </div>
      
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none", isPositive ? "bg-emerald-400/10" : "bg-red-400/10")} />
    </div>
  );
}

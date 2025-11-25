import { useState } from "react";
import { Asset } from "@/types";
import { formatPrice, formatChange, cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, TrendingUp, TrendingDown, Star } from "lucide-react";

const getIconUrl = (asset: Asset) => {
  if (asset.iconUrl) return asset.iconUrl;
  
  const s = asset.symbol.toUpperCase();
  let iconCode = s;
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

interface AssetTableProps {
  assets: Asset[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export function AssetTable({ assets, favorites, onToggleFavorite }: AssetTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Asset; direction: 'asc' | 'desc' } | null>(null);

  const sortedAssets = [...assets].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Asset) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="text-right py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ارز / دارایی</TableHead>
            <TableHead className="text-right py-4">
              <Button variant="ghost" onClick={() => handleSort('priceToman')} className="h-8 px-2 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">
                قیمت
                <ArrowUpDown className="mr-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">تغییر ۲۴ ساعته</TableHead>
            <TableHead className="text-right hidden md:table-cell py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">بروزرسانی</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAssets.map((asset) => {
            const iconUrl = getIconUrl(asset);
            const isPositive = asset.change24h >= 0;
            const isOunce = asset.symbol === "XAUUSD";
            const isFav = favorites.includes(asset.id);

            return (
              <TableRow key={asset.id} className="border-slate-50 hover:bg-slate-50/80 transition-colors group">
                <TableCell className="py-4 text-center">
                  <button 
                    onClick={() => onToggleFavorite(asset.id)}
                    className="hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                  >
                    <Star className={cn("w-4 h-4 transition-all", isFav ? "fill-yellow-400 text-yellow-400" : "text-slate-300 hover:text-yellow-400")} />
                  </button>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {iconUrl ? (
                        <img src={iconUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">{asset.symbol.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">{asset.nameFa}</span>
                      <span className="text-[10px] font-mono text-slate-400">{asset.symbol}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-bold text-slate-900 text-base">
                  {new Intl.NumberFormat("en-US").format(asset.priceToman)}
                  <span className="text-[10px] text-slate-400 mr-1 font-normal font-vazir">
                    {isOunce ? "دلار" : "تومان"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-bold", isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50")}>
                    {isPositive ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                    <span dir="ltr">{formatChange(asset.change24h)}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-slate-400 text-xs font-mono" dir="ltr">
                  {asset.lastUpdated.split(' ')[1] || asset.lastUpdated}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Asset } from "@/types";
import { fetchAssets } from "@/lib/api";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AssetCard } from "@/components/dashboard/AssetCard";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { Widgets } from "@/components/widgets/Widgets";
import { Alerts } from "@/components/alerts/Alerts";
import { LayoutDashboard, CodeXml, Bell, RefreshCw, User, ExternalLink, TrendingUp, TrendingDown, LayoutGrid, List, Star } from "lucide-react";
import { cn, formatPrice, formatChange } from "@/lib/utils";
import { toast } from "sonner";

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");
  
  // Favorites state with LocalStorage persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("nerkh_favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("nerkh_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) 
        ? prev.filter(f => f !== id) 
        : [...prev, id];
      
      if (!prev.includes(id)) {
        toast.success("به لیست علاقه‌مندی‌ها اضافه شد");
      }
      return newFavorites;
    });
  };

  const refreshData = async (force = false) => {
    setLoading(true);
    try {
      const data = await fetchAssets(force);
      setAssets(data);
      setLastUpdated(new Date());
      if (force) {
        toast.success("اطلاعات با موفقیت بروزرسانی شد");
      }
    } catch {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Update every 5 minutes (300,000 ms)
    const interval = setInterval(() => refreshData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredAssets = assets.filter(a => {
    if (filter === "fav") return favorites.includes(a.id);
    return filter === "all" || a.type === filter;
  });
  
  // Top assets to display in the header ticker
  const topAssets = assets.filter(a => 
    ["usd", "ir_gold_18k", "ir_coin_emami"].includes(a.id)
  ).sort((a, b) => {
    const order = ["usd", "ir_gold_18k", "ir_coin_emami"];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });

  return (
    <div className="min-h-screen app-shell-bg font-vazir dir-rtl flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none">نرخ‌نما</span>
                <span className="text-[10px] font-medium text-slate-500 mt-1">داشبورد لحظه‌ای بازار آزاد ایران</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 text-xs overflow-hidden px-4 border-x border-slate-100 mx-4 flex-1 justify-center bg-slate-50/50 rounded-lg py-2">
              {topAssets.map(asset => (
                <div key={asset.id} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-slate-500 font-medium">{asset.nameFa}:</span>
                  <span className="text-slate-900 font-bold font-mono">{formatPrice(asset.priceToman).replace(" تومان", "")}</span>
                  <span className={cn("flex items-center font-medium", asset.change24h >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    <span dir="ltr">{formatChange(asset.change24h)}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] text-slate-400 font-medium">آخرین بروزرسانی</span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700">
                  {loading && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                  {lastUpdated.toLocaleTimeString("fa-IR")}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => refreshData(true)} disabled={loading} className="rounded-full hover:bg-slate-100 text-slate-500">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
              <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-500">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
              <NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard className="w-4 h-4" />}>داشبورد قیمت</NavButton>
              <NavButton active={activeTab === "widgets"} onClick={() => setActiveTab("widgets")} icon={<CodeXml className="w-4 h-4" />}>ساخت ویجت</NavButton>
              <NavButton active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")} icon={<Bell className="w-4 h-4" />}>هشدار قیمت</NavButton>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                {[
                  { id: "all", label: "همه" },
                  { id: "fav", label: "نشان‌ شده‌ها", icon: <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" /> },
                  { id: "gold", label: "طلا و سکه" },
                  { id: "fiat", label: "ارزها" },
                  { id: "crypto", label: "رمزارز" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center",
                      filter === f.id 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setViewMode("grid")} className={`h-8 rounded-lg ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400"}`}>
                  <LayoutGrid className="w-4 h-4 ml-2" /> شبکه
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className={`h-8 rounded-lg ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400"}`}>
                  <List className="w-4 h-4 ml-2" /> لیست
                </Button>
              </div>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-slate-300" />
                </div>
                <p>موردی برای نمایش وجود ندارد</p>
                {filter === "fav" && <p className="text-sm mt-2 text-slate-400">با کلیک روی ستاره، ارزها را به لیست علاقه‌مندی‌ها اضافه کنید</p>}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredAssets.map(asset => (
                  <AssetCard 
                    key={asset.id} 
                    asset={asset} 
                    isFavorite={favorites.includes(asset.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <AssetTable 
                assets={filteredAssets} 
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        )}

        {activeTab === "widgets" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Widgets assets={assets} />
          </div>
        )}

        {activeTab === "alerts" && (
          <Alerts assets={assets} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white/60 backdrop-blur-sm py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1.5">
            طراحی و توسعه اختصاصی برای وب‌سایت
            <a href="https://brokerir.com" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5 transition-colors">
              BrokerIR.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </footer>
      <Toaster position="bottom-left" dir="rtl" />
    </div>
  );
}

function NavButton({ active, children, onClick, icon }: { active: boolean; children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
        active ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

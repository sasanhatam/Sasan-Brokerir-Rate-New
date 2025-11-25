import { useState } from "react";
import { Asset } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function Widgets({ assets }: { assets: Asset[] }) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["usd", "eur", "gold_18k", "btc"]);
  const [widgetType, setWidgetType] = useState("grid");
  const [copied, setCopied] = useState(false);

  const toggleAsset = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const getEmbedCode = () => {
    const scriptUrl = `${window.location.origin}/widget-loader.js`;
    return `<!-- NerkhTrack Widget -->
<div 
  class="nerkh-widget" 
  data-type="${widgetType}" 
  data-assets="${selectedAssets.join(",")}"
  data-theme="light"
></div>
<script src="${scriptUrl}" async><\/script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    toast.success("کد ویجت کپی شد!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>تنظیمات ویجت</CardTitle>
            <CardDescription>ویجت قیمت را برای سایت خود شخصی‌سازی کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>نوع نمایش</Label>
              <Select value={widgetType} onValueChange={setWidgetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">کارت‌های شبکه (Grid)</SelectItem>
                  <SelectItem value="ticker">نوار متحرک (Ticker)</SelectItem>
                  <SelectItem value="table">جدول (Table)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>انتخاب ارزها</Label>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-3">
                  {assets.map(asset => (
                    <div key={asset.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id={`asset-${asset.id}`} 
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={() => toggleAsset(asset.id)}
                      />
                      <label 
                        htmlFor={`asset-${asset.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {asset.nameFa} <span className="text-muted-foreground text-xs">({asset.symbol})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-slate-50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Code className="w-4 h-4" />
              کد جایگذاری
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-slate-900 p-4 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all" dir="ltr">
                {getEmbedCode()}
              </pre>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-2 right-2 h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-[#E9E5E1] rounded-xl border shadow-sm h-full flex flex-col overflow-hidden">
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              پیش‌نمایش زنده
            </span>
          </div>
          <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center min-h-[500px]">
            <div className="text-center text-gray-500">
              <p>ویجت در اینجا نمایش داده می‌شود (شبیه‌سازی)</p>
              <p className="text-xs mt-2">نوع: {widgetType}</p>
              <p className="text-xs">تعداد ارز: {selectedAssets.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

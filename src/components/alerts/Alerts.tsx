import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Asset } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  assetId: z.string().min(1, "لطفا یک ارز انتخاب کنید"),
  targetPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "قیمت باید عدد معتبر باشد",
  }),
  condition: z.enum(["above", "below"]),
});

export function Alerts({ assets }: { assets: Asset[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetId: "",
      targetPrice: "",
      condition: "above",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setTimeout(() => {
      const asset = assets.find(a => a.id === values.assetId);
      console.log("Alert set:", values);
      toast.success("هشدار قیمت با موفقیت ثبت شد", {
        description: `وقتی قیمت ${asset?.nameFa} به ${values.targetPrice} تومان برسد به شما اطلاع میدهیم.`
      });
      setLoading(false);
      setOpen(false);
      form.reset();
    }, 1000);
  }

  return (
    <div className="max-w-md mx-auto mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
          <Bell className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">تنظیم هشدار قیمت</h2>
          <p className="text-slate-500 mt-2 text-sm">
            برای دریافت هشدار نوسان قیمت، ارز مورد نظر و قیمت هدف را مشخص کنید.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 w-full">
              <Bell className="w-4 h-4" />
              تنظیم هشدار جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>تنظیم هشدار جدید</DialogTitle>
              <DialogDescription>
                زمانی که قیمت به حد مشخص شده برسد، به شما اطلاع خواهیم داد.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>انتخاب ارز</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ارز مورد نظر را انتخاب کنید" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.nameFa} ({asset.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شرط</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="above">بیشتر از</SelectItem>
                            <SelectItem value="below">کمتر از</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قیمت هدف (تومان)</FormLabel>
                        <FormControl>
                          <Input placeholder="60000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
                    ثبت هشدار
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

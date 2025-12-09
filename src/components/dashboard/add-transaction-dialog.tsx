"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { usePortfolioStore } from "@/store/portfolio.store"
import { useTransactionStore } from "@/store/transaction.store"
import { toast } from "sonner"

const formSchema = z.object({
  type: z.enum(["BUY", "SELL", "DIVIDEND"]),
  symbol: z.string().min(1, "Asset is required"),
  quantity: z.string().optional(),
  price: z.string().optional(),
  totalAmount: z.string().optional(),
  date: z.date(),
  isDividendReinvested: z.boolean().optional(),
}).refine((data) => {
  if (data.type === "DIVIDEND") {
    const hasAmount = !!data.totalAmount && parseFloat(data.totalAmount) > 0;
    // If reinvested, also need price
    if (data.isDividendReinvested) {
      return hasAmount && !!data.price && parseFloat(data.price) > 0;
    }
    return hasAmount;
  }
  return !!data.quantity && !!data.price;
}, {
  message: "Please fill in all required fields",
  path: ["symbol"], // General error path
});

export function AddTransactionDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const { items, fetchPortfolio } = usePortfolioStore()
  const { refreshTransactions } = useTransactionStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: "BUY",
      symbol: "",
      quantity: "",
      price: "",
      totalAmount: "",
      date: new Date(),
      isDividendReinvested: false,
    },
  })

  const transactionType = form.watch("type")
  const isDividendReinvested = form.watch("isDividendReinvested")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const selectedAsset = items.find(item => item.symbol === values.symbol)
      if (!selectedAsset) {
        toast.error("Selected asset not found in portfolio")
        return
      }

      let quantity = 0;
      let price = 0;
      let total = 0;

      if (values.type === "DIVIDEND") {
        total = parseFloat(values.totalAmount || "0");
        if (isNaN(total) || total <= 0) {
          toast.error("Total amount must be a valid number greater than 0");
          return;
        }
        
        // If reinvested, also parse and validate price
        if (values.isDividendReinvested) {
          price = parseFloat(values.price || "0");
          if (isNaN(price) || price <= 0) {
            toast.error("Reinvestment price must be a valid number greater than 0");
            return;
          }
        }
      } else {
        // BUY or SELL
        quantity = parseFloat(values.quantity || "0");
        price = parseFloat(values.price || "0");

        if (isNaN(quantity) || quantity <= 0) {
          toast.error("Quantity must be a valid number greater than 0");
          return;
        }
  
        if (isNaN(price) || price <= 0) {
          toast.error("Price must be a valid number greater than 0");
          return;
        }
        total = quantity * price;
      }

      const transactionData = {
        userId,
        assetId: values.symbol,
        symbol: values.symbol,
        type: values.type,
        quantity,
        price,
        total,
        category: selectedAsset.category,
        date: values.date.getTime(),
        isDividendReinvested: values.type === "DIVIDEND" ? values.isDividendReinvested : undefined,
      }

      const { FirestoreService } = await import("@/lib/firestore.service");
      await FirestoreService.addTransaction(userId, transactionData);
      
      // Close dialog immediately for better UX
      toast.success("Transaction added successfully")
      setOpen(false)
      form.reset()
      
      // Refresh both portfolio and transactions in the background
      fetchPortfolio(userId);
      refreshTransactions(userId);
    } catch (error: any) {
      toast.error("Failed to add transaction: " + error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                      <SelectItem value="DIVIDEND">Dividend</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.symbol} value={item.symbol}>
                          {item.symbol} ({Math.floor(item.quantity)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {transactionType === "DIVIDEND" ? (
              <>
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Dividend Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDividendReinvested"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Reinvest this dividend
                        </FormLabel>
                        <FormDescription>
                          Check this if you used the dividend to buy more shares
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {isDividendReinvested && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reinvestment Price per Share</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormDescription>
                          Price at which dividend was reinvested
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Share</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full">Add Transaction</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

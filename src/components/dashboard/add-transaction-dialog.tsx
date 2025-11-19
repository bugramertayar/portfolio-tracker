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
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { usePortfolioStore } from "@/store/portfolio.store"
import { toast } from "sonner"
import { AssetCategory } from "@/types/portfolio.types"

const formSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  symbol: z.string().min(1, "Asset is required"),
  quantity: z.coerce.number().min(0.000001, "Quantity must be greater than 0"),
  price: z.coerce.number().min(0, "Price must be positive"),
  date: z.date(),
})

export function AddTransactionDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const { items, fetchPortfolio } = usePortfolioStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: "BUY",
      symbol: "",
      quantity: 0,
      price: 0,
      date: new Date(),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const selectedAsset = items.find(item => item.symbol === values.symbol)
      if (!selectedAsset) {
        toast.error("Selected asset not found in portfolio")
        return
      }

      const transactionData = {
        userId,
        assetId: values.symbol,
        symbol: values.symbol,
        type: values.type,
        quantity: values.quantity,
        price: values.price,
        total: values.quantity * values.price,
        category: selectedAsset.category,
        date: values.date.getTime(),
      }

      const { FirestoreService } = await import("@/lib/firestore.service");
      await FirestoreService.addTransaction(userId, transactionData);
      
      await fetchPortfolio(userId);
      
      toast.success("Transaction added successfully")
      setOpen(false)
      form.reset()
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.symbol} value={item.symbol}>
                          {item.symbol} ({item.quantity})
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
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
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
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Add Transaction</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

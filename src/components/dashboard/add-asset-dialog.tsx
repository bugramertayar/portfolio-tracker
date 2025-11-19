"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { AssetCategory } from "@/types/portfolio.types"
import { searchAssetsAction } from "@/app/actions/portfolio"
import { useTransactionStore } from "@/store/transaction.store"
import { usePortfolioStore } from "@/store/portfolio.store"
import { toast } from "sonner"

const formSchema = z.object({
  category: z.nativeEnum(AssetCategory),
  symbol: z.string().min(1, "Symbol is required"),
  quantity: z.coerce.number().min(0.000001, "Quantity must be greater than 0"),
  price: z.coerce.number().min(0, "Price must be positive"),
})

export function AddAssetDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [symbolOpen, setSymbolOpen] = useState(false)

  const { fetchPortfolio } = usePortfolioStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      category: AssetCategory.BIST100,
      symbol: "",
      quantity: 0,
      price: 0,
    },
  })

  const onSearch = async (query: string) => {
    if (query.length < 2) return
    setSearching(true)
    const result = await searchAssetsAction(query)
    if (result.success && result.data) {
      setSearchResults(result.data)
    }
    setSearching(false)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // We need userId. For now assuming we can get it or it's passed.
      // Actually stores usually need userId.
      // Let's assume we have a way to get userId, or we pass it.
      // For this implementation, I'll assume a hardcoded userId or context if not available.
      // But wait, the stores take userId as argument for fetch, but addTransaction in store doesn't take userId?
      // In transaction.store.ts: addTransaction: (transaction: Transaction) => void;
      // But that's optimistic update. The actual API call is in firestore service.
      // The store should probably handle the API call to be consistent.
      // But the plan said "Integration with Firestore service" in the dialog.
      
      // Let's use FirestoreService directly or via a store action if available.
      // The store only has `addTransaction` which updates state, not DB.
      // So we should call FirestoreService.addTransaction then update store.
      
      // userId is passed as prop

      const transactionData = {
        userId,
        assetId: values.symbol, // Using symbol as ID for now
        symbol: values.symbol,
        type: 'BUY' as const,
        quantity: values.quantity,
        price: values.price,
        total: values.quantity * values.price,
        category: values.category,
      }

      // We need to import FirestoreService. 
      // Since I can't import it easily if it's not exported or if I want to keep logic in components?
      // Better to use a Server Action for writing?
      // FirestoreService is client-side compatible (firebase/firestore).
      
      const { FirestoreService } = await import("@/lib/firestore.service");
      await FirestoreService.addTransaction(userId, transactionData);
      
      // Refresh portfolio
      await fetchPortfolio(userId);
      
      toast.success("Asset added successfully")
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast.error("Failed to add asset: " + error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Asset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AssetCategory.BIST100}>BIST 100</SelectItem>
                      <SelectItem value={AssetCategory.US_MARKETS}>US Markets</SelectItem>
                      <SelectItem value={AssetCategory.PRECIOUS_METALS}>Precious Metals</SelectItem>
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
                <FormItem className="flex flex-col">
                  <FormLabel>Symbol</FormLabel>
                  <Popover open={symbolOpen} onOpenChange={setSymbolOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Search symbol..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder="Search symbol..." 
                          onValueChange={onSearch}
                        />
                        <CommandList>
                          {searching && <CommandItem>Searching...</CommandItem>}
                          {!searching && searchResults.length === 0 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                          )}
                          {searchResults.map((result) => (
                            <CommandItem
                              key={result.symbol}
                              value={result.symbol}
                              onSelect={() => {
                                form.setValue("symbol", result.symbol)
                                setSymbolOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === result.symbol ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {result.symbol} - {result.shortname || result.longname}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
            <Button type="submit" className="w-full">Add Asset</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

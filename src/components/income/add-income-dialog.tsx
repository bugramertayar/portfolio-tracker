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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { FirestoreService } from "@/lib/firestore.service"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/portfolio.store"

const formSchema = z.object({
  year: z.string(),
  months: z.array(z.number()).min(1, "Select at least one month"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be greater than 0",
  }),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  company: z.string().optional(),
})

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

interface AddIncomeDialogProps {
  userId: string;
  onSuccess: () => void;
}

export function AddIncomeDialog({ userId, onSuccess }: AddIncomeDialogProps) {
  const [open, setOpen] = useState(false)
  const { items } = usePortfolioStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      months: [],
      amount: "",
      category: "",
      description: "",
      company: "",
    },
  })

  const category = form.watch("category");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const amount = parseFloat(values.amount);
      const promises = values.months.map(month => 
        FirestoreService.addIncome(userId, {
          year: parseInt(values.year),
          month,
          amount,
          category: values.category,
          description: values.description,
          company: values.category === "Dividend" ? values.company : undefined,
        })
      );

      await Promise.all(promises);
      
      toast.success("Income added successfully");
      setOpen(false);
      form.reset({
        year: new Date().getFullYear().toString(),
        months: [],
        amount: "",
        category: "",
        description: "",
        company: "",
      });
      onSuccess();
    } catch (error) {
      toast.error("Failed to add income");
      console.error(error);
    }
  }

  const toggleMonth = (monthIndex: number) => {
    const currentMonths = form.getValues("months");
    if (currentMonths.includes(monthIndex)) {
      form.setValue("months", currentMonths.filter(m => m !== monthIndex));
    } else {
      form.setValue("months", [...currentMonths, monthIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Income</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Add income entries for one or multiple months.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => 2025 + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
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
              name="months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Months</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {MONTHS.map((month, index) => (
                      <Button
                        key={month}
                        type="button"
                        variant={field.value.includes(index) ? "default" : "outline"}
                        className={cn(
                          "h-8 text-xs",
                          field.value.includes(index) && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => toggleMonth(index)}
                      >
                        {month}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="0.00" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value="Dividend">Dividend</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Coupon">Coupon</SelectItem>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {category === "Dividend" && (
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company / Symbol (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {items.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No companies in portfolio
                          </SelectItem>
                        ) : (
                          items.map((item) => (
                            <SelectItem key={item.symbol} value={item.symbol}>
                              {item.symbol} - {item.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Apartment 1" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Save Income</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

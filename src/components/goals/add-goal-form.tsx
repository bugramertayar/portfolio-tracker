"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoalCategory } from "@/types/portfolio.types"
import { FirestoreService } from "@/lib/firestore.service"

const CATEGORIES = ['BIST100', 'US STOCKS', 'PRECIOUS METALS', 'EUROBOND', 'MUTUAL FUNDS'] as const;

const formSchema = z.object({
  category: z.enum(CATEGORIES),
  targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Target amount must be a positive number",
  }),
})

interface AddGoalFormProps {
  userId: string
  onGoalAdded: () => void
  existingCategories: GoalCategory[]
}

export function AddGoalForm({ userId, onGoalAdded, existingCategories }: AddGoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter available categories
  const availableCategories = CATEGORIES.filter(cat => !existingCategories.includes(cat));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetAmount: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      await FirestoreService.addGoal(userId, {
        category: values.category,
        targetAmount: Number(values.targetAmount),
      })
      toast.success("Goal added successfully")
      form.reset()
      onGoalAdded()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add goal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={availableCategories.length === 0}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={availableCategories.length === 0 ? "All goals added" : "Select Category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="targetAmount"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Target Amount (USD)</FormLabel>
                  <FormControl>
                    <Input placeholder="10000" {...field} type="number" step="0.01" className="w-full" disabled={availableCategories.length === 0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting || availableCategories.length === 0} className="w-full md:w-auto min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Goal"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

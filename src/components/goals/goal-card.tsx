"use client"

import { useState } from "react"
import { Pencil, Trash2, Check, X, Loader2, TrendingUp, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Goal } from "@/types/portfolio.types"
import { FirestoreService } from "@/lib/firestore.service"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface GoalCardProps {
  goal: Goal
  currentAmount: number
  userId: string
  onUpdate: () => void
}

export function GoalCard({ goal, currentAmount, userId, onUpdate }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editAmount, setEditAmount] = useState(goal.targetAmount.toString())
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const progress = Math.min((currentAmount / goal.targetAmount) * 100, 100)
  const isCompleted = progress >= 100
  
  // Chart Data
  const data = [
    { name: 'Completed', value: currentAmount },
    { name: 'Remaining', value: Math.max(0, goal.targetAmount - currentAmount) },
  ]
  const COLORS = [isCompleted ? '#10b981' : 'var(--primary)', 'var(--muted)'];

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const amount = Number(editAmount)
      if (isNaN(amount) || amount <= 0) {
        toast.error("Invalid amount")
        return
      }

      await FirestoreService.updateGoal(userId, goal.id, {
        targetAmount: amount
      })
      toast.success("Goal updated")
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      toast.error("Failed to update goal")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await FirestoreService.deleteGoal(userId, goal.id)
      toast.success("Goal deleted")
      onUpdate()
    } catch (error) {
      toast.error("Failed to delete goal")
      setIsDeleting(false)
    }
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4",
      isCompleted ? "border-l-emerald-500" : "border-l-primary"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {goal.category}
        </CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive/90">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                    <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this goal for {goal.category}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Progress Chart */}
          <div className="relative h-24 w-24 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xs font-bold text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                <div className="text-lg font-bold text-foreground flex items-center gap-1">
                  {formatCurrency(currentAmount, 'USD')}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Goal</p>
                 {isEditing ? (
                  <Input 
                    value={editAmount} 
                    onChange={(e) => setEditAmount(e.target.value)}
                    type="number" 
                    className="h-8 w-24 md:w-full"
                  />
                ) : (
                  <div className="text-lg font-bold text-muted-foreground flex items-center gap-1">
                     {formatCurrency(goal.targetAmount, 'USD')}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
               <div 
                 className={cn("h-full transition-all duration-1000 ease-out", isCompleted ? "bg-emerald-500" : "bg-primary")}
                 style={{ width: `${Math.min(progress, 100)}%` }} 
               />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

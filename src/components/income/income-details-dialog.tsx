"use client"

import { useState } from "react"
import { IncomeEntry } from "@/types/income"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { FirestoreService } from "@/lib/firestore.service"
import { toast } from "sonner"
import { AddIncomeDialog } from "./add-income-dialog"

interface IncomeDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  entries: IncomeEntry[];
  onUpdate: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function IncomeDetailsDialog({ 
  isOpen, 
  onClose, 
  year, 
  month, 
  entries, 
  onUpdate 
}: IncomeDetailsDialogProps) {
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await FirestoreService.deleteIncome(id);
        toast.success("Income deleted");
        onUpdate();
      } catch (error) {
        toast.error("Failed to delete income");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{MONTHS[month]} {year} Details</DialogTitle>
          <DialogDescription>
            Manage income entries for this month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No entries found.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="space-y-1">
                    <div className="font-medium">{entry.category}</div>
                    {entry.description && (
                      <div className="text-xs text-muted-foreground">{entry.description}</div>
                    )}
                    <div className="text-sm font-bold">{formatCurrency(entry.amount)}</div>
                  </div>
                  <div className="flex gap-2">
                    {/* Placeholder for Edit - for now we just support delete or we can implement edit later */}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-lg">
              {formatCurrency(entries.reduce((sum, e) => sum + e.amount, 0))}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

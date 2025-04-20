import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "./categories";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (expense: any) => Promise<void>;
  expense?: any;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ open, onClose, onAdd, expense }) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [name, setName] = useState(expense ? expense.name : "");
  const [category, setCategory] = useState(expense ? expense.category : "");
  const [amount, setAmount] = useState(expense ? expense.amount.toString() : "");
  const [date, setDate] = useState(expense ? expense.date.slice(0, 10) : today);
  const [source, setSource] = useState(expense ? expense.source : "manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!name || !category || !amount || !date) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    try {
      await onAdd({
        name,
        category,
        amount: parseFloat(amount),
        date,
        source,
      });
      setName("");
      setCategory("");
      setAmount("");
      setDate("");
      setSource("manual");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0" step="0.01" />
          <Input type="date" placeholder="Date" value={date} onChange={e => setDate(e.target.value)} required />
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Expense"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;

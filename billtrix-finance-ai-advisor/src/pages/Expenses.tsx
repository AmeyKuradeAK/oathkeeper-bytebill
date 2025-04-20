import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddExpenseModal from '@/components/expenses/AddExpenseModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { categories } from '@/components/expenses/categories';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all-categories");
  const [selectedSource, setSelectedSource] = useState<string>("all-sources");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchExpenses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) {
        console.error('Supabase expenses fetch error:', error.message);
        setExpenses([]);
      } else {
        setExpenses(data || []);
      }
      setLoading(false);
    };
    fetchExpenses();
  }, [user]);

  // XP Calculation: 10 XP per ₹100 saved (expense not savings, so we skip XP for adding an expense)
  const handleAddOrEditExpense = async (expense: any) => {
    if (!user) return;
    if (expense.id) {
      // Edit mode
      const { error } = await supabase.from('expenses').update({
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        date: new Date(expense.date).toISOString(),
        source: expense.source,
      }).eq('id', expense.id);
      if (error) throw new Error(error.message);
    } else {
      // Add mode
      const { error } = await supabase.from('expenses').insert([
        {
          ...expense,
          user_id: user.id,
          date: new Date(expense.date).toISOString(),
        }
      ]);
      if (error) throw new Error(error.message);
      // Deduct XP for spending, or optionally, award XP for saving (not for expenses)
      // If you want to award XP for logging savings, add that logic in Goals or a dedicated Savings page
    }
    // Refetch expenses after add/edit
    setLoading(true);
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  };

  const handleDeleteExpense = async (id: number) => {
    if (!user) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw new Error(error.message);
    // Refetch expenses after delete
    setLoading(true);
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  };

  // Filter expenses based on search term and filters
  const filteredExpenses = expenses.filter(expense => {
    // Defensive: handle missing fields gracefully
    const name = (expense.name || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all-categories" ? true : expense.category === selectedCategory;
    const matchesSource = selectedSource === "all-sources" ? true : expense.source === selectedSource;
    return matchesSearch && matchesCategory && matchesSource;
  });

  if (loading) return <div className="p-8 text-center">Loading expenses...</div>;

  return (
    <div className="space-y-8">
      <AddExpenseModal
        open={showAddModal || editingExpense !== null}
        onClose={() => { setShowAddModal(false); setEditingExpense(null); }}
        onAdd={handleAddOrEditExpense}
        expense={editingExpense}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <Button className="md:self-start" onClick={() => setShowAddModal(true)}>Add Expense</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>Track and manage your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sources">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Source</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted-foreground">No expenses found.</td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id} className="border-b last:border-0">
                      <td className="p-2 whitespace-nowrap">{expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</td>
                      <td className="p-2 whitespace-nowrap">{expense.name}</td>
                      <td className="p-2 whitespace-nowrap">
                        <Badge className={categories.find(c => c.name === expense.category)?.color || 'bg-gray-200'}>
                          {expense.category}
                        </Badge>
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">₹{Number(expense.amount).toLocaleString()}</td>
                      <td className="p-2 whitespace-nowrap capitalize">{expense.source}</td>
                      <td className="p-2 text-center">
                        <Button size="icon" variant="ghost" onClick={() => setEditingExpense(expense)}><Edit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteExpense(expense.id)}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;

import React, { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Target, Wallet, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [expenses, setExpenses] = useState<any[]>([]); // <-- Store all expenses for current month
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const fetchProfileAndExpenses = async () => {
    setLoading(true);
    setError("");
    if (!user || !user.id) {
      setError("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      console.log('Dashboard user.id:', user.id);
      let { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileError) {
        setError('Supabase profile fetch error: ' + profileError.message);
        console.error('Supabase profile fetch error:', profileError.message);
      }
      if (!profileData) {
        const defaultProfile = {
          id: user.id,
          title: user.email,
          level: 1,
          streakDays: 0,
          monthlyBudget: 0,
          savingsGoal: 0,
          currentPoints: 0,
          nextLevel: 200
        };
        await supabase.from('user_profiles').insert([defaultProfile]);
        profileData = defaultProfile;
      }
      setProfile(profileData);
      // Fetch all expenses for this user (TEMP: remove date filter for debugging)
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      if (expensesError) {
        setError('Supabase expenses fetch error: ' + expensesError.message);
        console.error('Supabase expenses fetch error:', expensesError.message);
        setExpenses([]);
      } else {
        setExpenses(expensesData || []);
        console.log('Dashboard fetched ALL user expenses:', expensesData);
      }
    } catch (err: any) {
      setError('Unexpected error: ' + (err.message || err.toString()));
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProfileAndExpenses();
    // --- REAL-TIME SUBSCRIPTION ---
    if (subscription) {
      supabase.removeChannel(subscription);
      setSubscription(null);
    }
    const channel = supabase.channel('realtime-expenses-dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchProfileAndExpenses();
      })
      .subscribe();
    setSubscription(channel);
    // Auto-refetch on tab focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProfileAndExpenses();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  const safeProfile = profile || { title: user?.email, monthlyBudget: 0, savingsGoal: 0 };

  // --- Calculations using up-to-date expenses ---
  const totalSpentCalc = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingBudget = Number(safeProfile.monthlyBudget ?? 0) - Number(totalSpentCalc ?? 0);
  const percentSpent = (Number(totalSpentCalc ?? 0) / (Number(safeProfile.monthlyBudget ?? 1))) * 100;
  const currentSavings = remainingBudget;
  const savingsPercentage = (Number(currentSavings) / (Number(safeProfile.savingsGoal ?? 1))) * 100;
  // Category breakdown
  const grouped = expenses.reduce((acc: any[], curr: any) => {
    const amt = Number(curr.amount) || 0;
    const cat = acc.find((c: any) => c.name === curr.category);
    if (cat) {
      cat.spent += amt;
    } else {
      acc.push({ name: curr.category, spent: amt });
    }
    return acc;
  }, []);
  // --- Weekly Trend Calculation ---
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  const isoStartOfWeek = startOfWeek.toISOString();
  const weeklyExpenses = expenses.filter((e: any) => e.date >= isoStartOfWeek);
  let weeklySpent = 0;
  const dailyTotals = Array(7).fill(0);
  weeklyExpenses.forEach((e: any) => {
    const d = new Date(e.date);
    const day = (d.getDay() + 6) % 7;
    dailyTotals[day] += Number(e.amount) || 0;
    weeklySpent += Number(e.amount) || 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your financial activity
          </p>
        </div>
        <Button onClick={fetchProfileAndExpenses} disabled={loading} className="md:self-start">
          Refresh
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Overview Card */}
        <Card className="min-w-0 break-words">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium truncate">
              Monthly Overview
            </CardTitle>
            <Badge variant={percentSpent > 80 ? 'destructive' : 'default'}>
              {percentSpent.toFixed(0)}% Used
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">₹{Number(totalSpentCalc ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of ₹{Number(safeProfile.monthlyBudget ?? 0).toLocaleString()} budget
            </p>
            <Progress value={percentSpent} className="h-2 mt-4" />
            <div className="mt-3 flex items-center justify-between text-sm">
              <p>Remaining: <span className="font-medium">₹{Number(remainingBudget).toLocaleString()}</span></p>
              <Link to="/expenses" className="text-primary flex items-center">
                Details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
        {/* Weekly Trend Card */}
        <Card className="min-w-0 break-words">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium truncate">
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">₹{weeklySpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              spent this week
            </p>
            <div className="mt-4 h-[60px] grid grid-cols-7 gap-1 items-end">
              {dailyTotals.map((value, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="bg-primary/70 rounded-sm w-full" 
                    style={{ height: `${Math.min(value / Math.max(...dailyTotals, 1) * 100, 100)}%` }}
                  />
                  <span className="text-[10px] mt-1">
                    {['M','T','W','T','F','S','S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Category Breakdown Card */}
        <Card className="min-w-0 break-words">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium truncate">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {grouped.length === 0 ? (
                <li className="text-muted-foreground">No expenses this month.</li>
              ) : (
                grouped.map((cat) => (
                  <li key={cat.name} className="flex items-center justify-between">
                    <span>{cat.name}</span>
                    <span className="font-semibold">₹{cat.spent.toLocaleString()}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
      {/* --- Quick Navigation Block (Bottom, 4 navs in a square box with icons and small labels) --- */}
      <div className="mt-8 flex justify-center">
        <div className="bg-card border rounded-2xl shadow-lg w-full max-w-xs p-4">
          <div className="grid grid-cols-2 gap-4">
            <Link to="/expenses" className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition">
              <Wallet className="h-8 w-8 text-primary" />
              <span className="mt-2 text-xs text-muted-foreground font-medium">Expenses</span>
            </Link>
            <Link to="/receipts" className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition">
              <Mail className="h-8 w-8 text-primary" />
              <span className="mt-2 text-xs text-muted-foreground font-medium">Receipts</span>
            </Link>
            <Link to="/planning" className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="mt-2 text-xs text-muted-foreground font-medium">Planning</span>
            </Link>
            <Link to="/predictions" className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="mt-2 text-xs text-muted-foreground font-medium">Predictions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

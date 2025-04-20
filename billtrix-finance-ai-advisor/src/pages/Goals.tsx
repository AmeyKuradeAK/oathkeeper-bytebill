import React, { useState, useEffect } from 'react';
import { Plus, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Goal } from '@/lib/supabase';
import AddGoalModal from '@/components/goals/AddGoalModal';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchGoals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });
      if (!error) setGoals(data || []);
      setLoading(false);
    };
    fetchGoals();
  }, [user]);

  const handleAddGoal = async (goal: { name: string; target: number; current: number; deadline: string }) => {
    if (!user) return;
    setSaving(true);
    const { name, target, current, deadline } = goal;
    const { data, error } = await supabase
      .from('goals')
      .insert([
        {
          name,
          target: Number(target),
          current: Number(current),
          deadline,
          user_id: user.id,
        },
      ])
      .select();
    setSaving(false);
    if (!error && data) {
      setGoals((prev) => [...prev, ...data]);
      setShowAddGoalForm(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!user) return;
    await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  if (loading) return <div className="p-8 text-center">Loading goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Financial Goals</h2>
        <Button className="md:self-start" onClick={() => setShowAddGoalForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Goal
        </Button>
      </div>

      <AddGoalModal
        open={showAddGoalForm}
        onClose={() => setShowAddGoalForm(false)}
        onAdd={handleAddGoal}
      />

      {showAddGoalForm && false && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Add New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block mb-1 font-medium">Goal Name</label>
                <Input type="text" required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Target Amount (₹)</label>
                <Input type="number" required min="1" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Current Saved (₹)</label>
                <Input type="number" required min="0" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Deadline</label>
                <Input type="date" required />
              </div>
              <div className="col-span-full flex gap-2 mt-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Goal'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddGoalForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="min-w-0 break-words">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium truncate">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{goals.length}</div>
            <p className="text-xs text-muted-foreground">Active savings targets</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 break-words">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium truncate">Total Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {goals.reduce((sum, goal) => sum + goal.target, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </div>
            <p className="text-xs text-muted-foreground">Combined goal amount</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 break-words">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium truncate">Total Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {goals.reduce((sum, goal) => sum + goal.current, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {goals.length > 0 ? Math.round((goals.reduce((sum, goal) => sum + goal.current, 0) / goals.reduce((sum, goal) => sum + goal.target, 0)) * 100) : 0}% of target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.id} className="min-w-0 break-words">
            <CardHeader>
              <CardTitle className="text-base font-semibold truncate">{goal.name}</CardTitle>
              <CardDescription className="truncate">Target: {goal.target.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Current Saved</span>
                  <span className="font-bold truncate">₹{goal.current.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  <div className="w-full md:w-32 bg-muted/40 rounded-full h-3 overflow-hidden mx-2">
                    <div className="bg-primary h-3" style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">0</span>
                  <span className="truncate">{goal.target.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0 md:ml-2">
                  <Button size="icon" variant="ghost" aria-label="Edit Goal" onClick={() => {/* TODO: implement edit */}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3zm0 0v3h3" /></svg>
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete Goal" onClick={() => handleDeleteGoal(goal.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>Goal-Setting Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>🎯 Set <strong>specific</strong> and <strong>measurable</strong> goals</p>
          <p>⏰ Create <strong>deadlines</strong> to stay motivated</p>
          <p>🔍 Break large goals into <strong>smaller milestones</strong></p>
          <p>📊 <strong>Track progress</strong> regularly for better success rates</p>
          <p>💰 Consider setting up <strong>automatic transfers</strong> to your savings</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;

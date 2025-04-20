// Central badge definitions and utility for awarding badges
import { supabase } from './supabase';

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string; // Human-readable description
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'goal-getter',
    name: 'Goal Getter',
    description: 'Complete your first financial goal',
    icon: 'target',
    criteria: 'User marks a goal as completed',
  },
  {
    id: 'savings-streak',
    name: 'Savings Streak',
    description: 'Save money for 3 consecutive months',
    icon: 'trending-up',
    criteria: 'User adds to savings 3 months in a row',
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Log 10 expenses in a month',
    icon: 'bar-chart',
    criteria: 'User logs 10+ expenses in a month',
  },
  {
    id: 'budget-master',
    name: 'Budget Master',
    description: 'Stay under budget for the month',
    icon: 'award',
    criteria: 'Total expenses < budget',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Pay all bills before due date in a month',
    icon: 'clock',
    criteria: 'All bills paid before due date',
  },
  {
    id: 'debt-destroyer',
    name: 'Debt Destroyer',
    description: 'Pay off a loan or credit card',
    icon: 'scissors',
    criteria: 'User marks debt as paid',
  },
];

// Utility: Award badge to user if not already awarded
export async function awardBadgeIfNotExists(userId: string, badgeId: string, extra?: Partial<{ date: string; progress: number }>) {
  const { data: existing, error } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('id', badgeId)
    .maybeSingle();
  if (!existing && !error) {
    await supabase.from('user_badges').insert([
      {
        id: badgeId,
        user_id: userId,
        is_earned: true,
        ...extra,
      },
    ]);
  }
}

import React, { useEffect, useState } from 'react';
import { Award, Lock, Star, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Badge as BadgeType } from '@/lib/supabase';
import { BADGE_DEFINITIONS } from '@/lib/badges';

interface BadgeIconProps {
  icon: string;
  className?: string;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({ icon, className }) => {
  const iconProps = { className };

  switch (icon) {
    case 'award':
      return <Award {...iconProps} />;
    case 'target':
      return <Trophy {...iconProps} />;
    case 'trending-up':
      return <TrendingUp {...iconProps} />;
    case 'bar-chart':
    case 'book-open':
    case 'scissors':
    case 'clock':
    case 'zap':
    default:
      return <Star {...iconProps} />;
  }
};

const Badges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);
      if (!error && data) setBadges(data);
      setLoading(false);
    };
    fetchBadges();
  }, [user]);

  // Map user badges by id for quick lookup
  const userBadgesMap = badges.reduce((map, b) => {
    map[b.id.toString()] = b;
    return map;
  }, {} as Record<string, BadgeType>);

  // Merge BADGE_DEFINITIONS with user badges to show all (earned & not earned)
  const allBadges = BADGE_DEFINITIONS.map(def => {
    const userBadge = userBadgesMap[def.id];
    return {
      ...def,
      ...userBadge,
      is_earned: userBadge?.is_earned || false,
      date: userBadge?.date,
      progress: userBadge?.progress,
    };
  });

  const earnedBadges = allBadges.filter(b => b.is_earned);
  const lockedBadges = allBadges.filter(b => !b.is_earned);

  // Calculate dynamic title and achievements
  let dynamicTitle = 'Newbie';
  if (earnedBadges.some(b => b.id === 'budget-master')) dynamicTitle = 'Budget Master';
  else if (earnedBadges.some(b => b.id === 'goal-getter')) dynamicTitle = 'Goal Getter';
  else if (earnedBadges.some(b => b.id === 'savings-streak')) dynamicTitle = 'Savings Star';
  else if (earnedBadges.some(b => b.id === 'expense-tracker')) dynamicTitle = 'Expense Tracker';
  else if (earnedBadges.some(b => b.id === 'early-bird')) dynamicTitle = 'Early Bird';
  else if (earnedBadges.some(b => b.id === 'debt-destroyer')) dynamicTitle = 'Debt Destroyer';

  const achievedList = earnedBadges.length
    ? earnedBadges.map(b => b.name).join(', ')
    : 'No badges achieved yet';

  const userProfile = {
    title: dynamicTitle,
    level: 1 + earnedBadges.length,
    streakDays: 7,
    totalBadges: earnedBadges.length,
    nextLevel: 1 + BADGE_DEFINITIONS.length,
    currentPoints: earnedBadges.length * 50, // Example: 50 points per badge
    achievedList,
  };

  if (loading) return <div className="p-8 text-center">Loading badges...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Badges & Achievements</h2>
        <p className="text-muted-foreground">
          Track your progress and earn rewards for good financial habits
        </p>
      </div>
      
      {/* User Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border-4 border-primary">
              <BadgeIcon icon="award" className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Your Title</div>
              <h3 className="text-2xl font-bold">{userProfile.title}</h3>
              <div className="text-xs mt-1 text-muted-foreground">Achievements: {userProfile.achievedList}</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Level {userProfile.level}</Badge>
                <Badge variant="outline" className="flex items-center">
                  <Trophy className="h-3 w-3 mr-1 text-amber-500" /> 
                  {userProfile.totalBadges} Badges
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> 
                  {userProfile.streakDays} Day Streak
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Level Progress</span>
              <span>{userProfile.currentPoints}/{userProfile.nextLevel} XP</span>
            </div>
            <Progress value={(userProfile.currentPoints/userProfile.nextLevel) * 100} className="h-2" />
          </div>
        </div>
      </Card>
      
      {/* Badges Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Earned Badges</CardTitle>
          <CardDescription>
            Badges you've unlocked through your financial journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center p-4 border rounded-lg text-center break-words w-full min-w-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <BadgeIcon icon={badge.icon} className="h-6 w-6 text-primary" />
                </div>
                <div className="font-semibold text-base mb-1 truncate w-full" title={badge.name}>{badge.name}</div>
                <div className="text-xs text-muted-foreground break-words w-full">{badge.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Locked Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges to Unlock</CardTitle>
          <CardDescription>
            Complete these financial challenges to earn more badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {lockedBadges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center p-4 border rounded-lg text-center bg-muted/20">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 opacity-70">
                    <BadgeIcon icon={badge.icon} className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="absolute top-0 right-0 h-4 w-4 rounded-full bg-background flex items-center justify-center">
                    <Lock className="h-2 w-2" />
                  </div>
                </div>
                <h4 className="font-medium text-muted-foreground">{badge.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  {badge.description}
                </p>
                <div className="w-full">
                  <Progress value={badge.progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{badge.progress}% completed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-3 w-3 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium">Level Up</span>: Each level unlocks new app features and financial tools
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-3 w-3 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium">Title Changes</span>: Your profile title evolves based on your financial habits
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-3 w-3 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium">Achievement Sharing</span>: Share your financial milestones with friends
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-3 w-3 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium">Personalized Tips</span>: Get tailored financial advice based on your achievements
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Badges;

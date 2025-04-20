import React from 'react';
import { CalendarClock, Download, HelpCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- MOCK ROADMAP DATA ---
const mockRoadmap = [
  { year: 2025, age: 30, income: 60000, expenses: 35000, savings: 15000, focus: 'Emergency Fund' },
  { year: 2026, age: 31, income: 63000, expenses: 36000, savings: 18000, focus: 'Increase SIPs' },
  { year: 2027, age: 32, income: 66150, expenses: 37000, savings: 21000, focus: 'Start Equity Investments' },
  { year: 2028, age: 33, income: 69457, expenses: 38000, savings: 24000, focus: 'Tax Planning' },
  { year: 2029, age: 34, income: 72930, expenses: 39000, savings: 27000, focus: 'Diversify Portfolio' },
  { year: 2030, age: 35, income: 76576, expenses: 40000, savings: 30000, focus: 'Plan for Child Education' },
  { year: 2035, age: 40, income: 97656, expenses: 45000, savings: 40000, focus: 'Mid-term Goals Review' },
  { year: 2045, age: 50, income: 159383, expenses: 60000, savings: 70000, focus: 'Retirement Planning' },
  { year: 2050, age: 55, income: 203000, expenses: 70000, savings: 90000, focus: 'Pre-retirement Allocation' },
  { year: 2055, age: 60, income: 258000, expenses: 80000, savings: 120000, focus: 'Retire & Drawdown' },
];

const Planning = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Future Planning</h2>
          <p className="text-muted-foreground">
            Visualize your long-term financial journey
          </p>
        </div>
        <Button className="sm:self-start">
          <Download className="mr-2 h-4 w-4" /> Export Plan
        </Button>
      </div>
      {/* Input Section (kept for realism, but does nothing) */}
      <Card>
        <CardHeader>
          <CardTitle>Your Financial Inputs</CardTitle>
          <CardDescription>Provide your current financial details to generate a personalized plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="age" className="text-sm font-medium">Current Age</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your current age determines the timeline of your financial plan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input id="age" type="number" placeholder="30" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="income" className="text-sm font-medium">Monthly Income</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your after-tax income that you can allocate to expenses and savings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input id="income" type="number" placeholder="5000" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="increment" className="text-sm font-medium">Expected Annual Increment (%)</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average yearly percentage increase you expect in your income</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input id="increment" type="number" placeholder="5" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="expenses" className="text-sm font-medium">Monthly Expenses</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your current average monthly expenses</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input id="expenses" type="number" placeholder="3500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="retirement-age" className="text-sm font-medium">Target Retirement Age</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>At what age do you plan to retire?</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input id="retirement-age" type="number" placeholder="65" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="risk" className="text-sm font-medium">Risk Appetite</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your comfort level with investment risk</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select>
                <SelectTrigger id="risk">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-6 w-full sm:w-auto" disabled>Generate Financial Plan</Button>
        </CardContent>
      </Card>
      {/* Plan Timeline (static table) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Your Financial Roadmap</CardTitle>
            <CardDescription>Projected financial journey based on your inputs</CardDescription>
          </div>
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {/* Responsive horizontal scroll for table */}
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-muted/40 text-left">
                  <th className="p-3 font-medium">Year</th>
                  <th className="p-3 font-medium">Age</th>
                  <th className="p-3 font-medium text-right">Income</th>
                  <th className="p-3 font-medium text-right">Expenses</th>
                  <th className="p-3 font-medium text-right">Savings</th>
                  <th className="p-3 font-medium hidden md:table-cell">Investment Focus</th>
                </tr>
              </thead>
              <tbody>
                {mockRoadmap.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="p-3 font-medium">{row.year}</td>
                    <td className="p-3">{row.age}</td>
                    <td className="p-3 text-right">₹{row.income.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right">₹{row.expenses.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right">₹{row.savings.toLocaleString('en-IN')}</td>
                    <td className="p-3 hidden md:table-cell">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Planning;

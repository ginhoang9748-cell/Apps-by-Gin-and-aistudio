import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Goal, TaskLog, ThemeColor } from '../types';

interface AnalyticsProps {
  goals: Goal[];
  taskLogs: TaskLog[];
  themeColor: ThemeColor;
}

const COLORS: Record<ThemeColor, string> = {
    indigo: '#4f46e5',
    emerald: '#10b981',
    rose: '#f43f5e',
    amber: '#f59e0b',
    sky: '#0ea5e9',
    violet: '#8b5cf6'
};

const Analytics: React.FC<AnalyticsProps> = ({ goals, taskLogs, themeColor }) => {
  // Calculate completion rate per goal
  const data = goals.map(goal => {
    const totalLogs = taskLogs.filter(log => log.goalId === goal.id).length;
    // In a real app, you'd calculate based on the goal's frequency over time.
    // Simplified: Just raw count of completions for demo visual.
    return {
      name: goal.title.length > 10 ? goal.title.substring(0, 10) + '...' : goal.title,
      completions: totalLogs,
      fullTitle: goal.title
    };
  });

  const hexColor = COLORS[themeColor] || COLORS.indigo;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Habit Consistency</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="completions" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={hexColor} fillOpacity={index % 2 === 0 ? 1 : 0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Top Performer</h4>
                {data.length > 0 ? (
                    <div>
                        <p className={`text-3xl font-bold text-${themeColor}-600`}>
                           {data.reduce((prev, current) => (prev.completions > current.completions) ? prev : current).fullTitle}
                        </p>
                        <p className="text-slate-500">Most consistent habit</p>
                    </div>
                ) : <p className="text-slate-400">No data yet</p>}
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Total Actions</h4>
                <p className={`text-3xl font-bold text-${themeColor}-600`}>{taskLogs.length}</p>
                <p className="text-slate-500">Completed tasks all time</p>
            </div>
        </div>
    </div>
  );
};

export default Analytics;
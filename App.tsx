import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GoalForm from './components/GoalForm';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach';
import Settings from './components/Settings';
import { View, Goal, TaskLog, SoundSettings } from './types';
import { Menu, X } from 'lucide-react';

function App() {
  const [currentView, setView] = useState<View>(View.DASHBOARD);
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('focusflow_goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>(() => {
    const saved = localStorage.getItem('focusflow_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => {
    const saved = localStorage.getItem('focusflow_sound_settings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      type: 'preset',
      url: 'https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3',
      name: 'Soft Chime'
    };
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('focusflow_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('focusflow_logs', JSON.stringify(taskLogs));
  }, [taskLogs]);

  useEffect(() => {
    localStorage.setItem('focusflow_sound_settings', JSON.stringify(soundSettings));
  }, [soundSettings]);

  const handleAddGoals = (newGoals: Goal[]) => {
    setGoals(prev => [...prev, ...newGoals]);
    setView(View.DASHBOARD); // Redirect to dashboard after adding
  };

  const handleDeleteGoal = (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
  }

  const handleToggleTask = (goalId: string, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingLogIndex = taskLogs.findIndex(l => l.goalId === goalId && l.date === today);

    if (existingLogIndex >= 0) {
      // If a note is provided but task is already done, we are editing the note
      if (note !== undefined) {
        const newLogs = [...taskLogs];
        newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], note };
        setTaskLogs(newLogs);
        return;
      }

      // Toggle off (delete log)
      const newLogs = [...taskLogs];
      newLogs.splice(existingLogIndex, 1);
      setTaskLogs(newLogs);
      
      // Update streak (simplified)
      setGoals(prev => prev.map(g => g.id === goalId ? {...g, streak: Math.max(0, g.streak - 1)} : g));
    } else {
      // Toggle on (create log)
      const newLog: TaskLog = {
        id: Date.now().toString(),
        goalId,
        date: today,
        completed: true,
        timestamp: new Date().toISOString(),
        note: note || ''
      };
      setTaskLogs(prev => [...prev, newLog]);

      // Update streak (simplified logic)
      setGoals(prev => prev.map(g => g.id === goalId ? {...g, streak: g.streak + 1} : g));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar for Desktop */}
      <Sidebar currentView={currentView} setView={setView} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
            <div className="p-4 flex justify-between items-center border-b border-slate-100">
                <span className="font-bold text-lg text-indigo-600">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6 text-slate-600"/></button>
            </div>
            <div className="p-4 space-y-4">
                 <button onClick={() => {setView(View.DASHBOARD); setMobileMenuOpen(false)}} className="block w-full text-left p-3 rounded bg-slate-50 text-lg">Dashboard</button>
                 <button onClick={() => {setView(View.GOALS); setMobileMenuOpen(false)}} className="block w-full text-left p-3 rounded bg-slate-50 text-lg">My Goals</button>
                 <button onClick={() => {setView(View.ANALYTICS); setMobileMenuOpen(false)}} className="block w-full text-left p-3 rounded bg-slate-50 text-lg">Analytics</button>
                 <button onClick={() => {setView(View.COACH); setMobileMenuOpen(false)}} className="block w-full text-left p-3 rounded bg-slate-50 text-lg">AI Coach</button>
                 <button onClick={() => {setView(View.SETTINGS); setMobileMenuOpen(false)}} className="block w-full text-left p-3 rounded bg-slate-50 text-lg">Settings</button>
            </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
             <div className="flex items-center space-x-2 text-indigo-600">
                <span className="text-xl font-bold">FocusFlow</span>
            </div>
            <button onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-6 h-6 text-slate-600" />
            </button>
        </div>

        <div className="animate-in fade-in duration-500">
            {currentView === View.DASHBOARD && (
            <Dashboard 
                goals={goals} 
                taskLogs={taskLogs} 
                onToggleTask={handleToggleTask}
                soundSettings={soundSettings}
            />
            )}

            {currentView === View.GOALS && (
            <div className="space-y-8">
                <GoalForm onAddGoals={handleAddGoals} />
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Active Goals</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {goals.map(goal => (
                            <div key={goal.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                <div>
                                    <p className="font-semibold text-slate-900">{goal.title}</p>
                                    <p className="text-sm text-slate-500">{goal.schedule} at {goal.time}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteGoal(goal.id)}
                                    className="text-red-400 hover:text-red-600 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                        {goals.length === 0 && <div className="p-6 text-center text-slate-500">No goals yet. Create one above!</div>}
                    </div>
                </div>
            </div>
            )}

            {currentView === View.ANALYTICS && (
            <Analytics goals={goals} taskLogs={taskLogs} />
            )}

            {currentView === View.COACH && (
            <AICoach />
            )}

            {currentView === View.SETTINGS && (
            <Settings settings={soundSettings} onSave={setSoundSettings} />
            )}
        </div>
      </main>
    </div>
  );
}

export default App;
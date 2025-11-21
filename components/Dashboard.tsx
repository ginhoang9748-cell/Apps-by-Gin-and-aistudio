import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Circle, Clock, Bell, Calendar, FileEdit, X } from 'lucide-react';
import { Goal, TaskLog, SoundSettings, ThemeColor } from '../types';

interface DashboardProps {
  goals: Goal[];
  taskLogs: TaskLog[];
  onToggleTask: (goalId: string, note?: string) => void;
  soundSettings: SoundSettings;
  themeColor: ThemeColor;
}

const Dashboard: React.FC<DashboardProps> = ({ goals, taskLogs, onToggleTask, soundSettings, themeColor }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeReminder, setActiveReminder] = useState<string | null>(null);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoalForNote, setSelectedGoalForNote] = useState<Goal | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Track the last goal ID + time combination we played a sound for to prevent loops
  const lastPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check for reminders
      const currentHM = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const dueGoal = goals.find(g => g.time === currentHM);
      
      if (dueGoal) {
        const today = now.toISOString().split('T')[0];
        const isDone = taskLogs.some(log => log.goalId === dueGoal.id && log.date === today && log.completed);
        
        if (!isDone) {
            setActiveReminder(`Time to ${dueGoal.title}!`);
            
            // Handle Sound Playback
            const uniqueTriggerKey = `${dueGoal.id}-${currentHM}`;
            
            if (soundSettings.enabled && lastPlayedRef.current !== uniqueTriggerKey) {
                // Play Sound
                try {
                    const audio = new Audio(soundSettings.url);
                    audio.play().catch(err => console.warn("Autoplay blocked or audio error:", err));
                    lastPlayedRef.current = uniqueTriggerKey;
                } catch (e) {
                    console.error("Error initializing audio:", e);
                }
            }
        } else {
            setActiveReminder(null);
        }
      } else {
          setActiveReminder(null);
      }

    }, 1000);
    return () => clearInterval(timer);
  }, [goals, taskLogs, soundSettings]);

  const getTodayLog = (goalId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return taskLogs.find(log => log.goalId === goalId && log.date === today);
  };

  const sortedGoals = [...goals].sort((a, b) => a.time.localeCompare(b.time));

  // Interaction Handlers
  const handleTaskClick = (goal: Goal, isCompleted: boolean) => {
    if (isCompleted) {
        // If already done, clicking circle toggles it off (removes log)
        onToggleTask(goal.id);
    } else {
        // If not done, open modal to add optional note
        setSelectedGoalForNote(goal);
        setNoteText('');
        setModalOpen(true);
    }
  };

  const handleEditNote = (goal: Goal, existingNote: string) => {
      setSelectedGoalForNote(goal);
      setNoteText(existingNote);
      setModalOpen(true);
  }

  const confirmCompletion = () => {
      if (selectedGoalForNote) {
          onToggleTask(selectedGoalForNote.id, noteText);
          setModalOpen(false);
          setSelectedGoalForNote(null);
          setNoteText('');
      }
  };

  return (
    <div className="space-y-6 relative">
        {/* Reminder Banner */}
        {activeReminder && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-md flex items-center justify-between animate-bounce">
                <div className="flex items-center">
                    <Bell className="w-6 h-6 text-amber-600 mr-3" />
                    <div>
                        <p className="font-bold text-amber-800">Reminder</p>
                        <p className="text-amber-700">{activeReminder}</p>
                    </div>
                </div>
                <button onClick={() => setActiveReminder(null)} className="text-amber-600 text-sm underline">Dismiss</button>
            </div>
        )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-500">Date</h3>
            <Calendar className={`w-5 h-5 text-${themeColor}-500`} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-500">Time</h3>
            <Clock className={`w-5 h-5 text-${themeColor}-500`} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className={`bg-${themeColor}-600 p-6 rounded-2xl shadow-sm border border-${themeColor}-500 text-white`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-sm font-medium text-${themeColor}-100`}>Tasks Done</h3>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold">
            {taskLogs.filter(l => l.date === new Date().toISOString().split('T')[0] && l.completed).length} / {goals.length}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>

      <div className="grid gap-4">
        {sortedGoals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-400">No goals set yet. Head to the "My Goals" tab to start!</p>
            </div>
        ) : (
            sortedGoals.map((goal) => {
            const log = getTodayLog(goal.id);
            const isCompleted = !!log?.completed;
            const hasNote = log?.note && log.note.length > 0;

            return (
                <div
                key={goal.id}
                className={`group flex flex-col bg-white rounded-xl border transition-all duration-200 ${
                    isCompleted ? 'border-green-200 bg-green-50/30' : `border-slate-200 hover:border-${themeColor}-300 hover:shadow-md`
                }`}
                >
                  <div className="flex items-center p-4">
                    <button
                        onClick={() => handleTaskClick(goal, isCompleted)}
                        className={`mr-4 transition-transform duration-200 active:scale-90 focus:outline-none flex-shrink-0`}
                    >
                        {isCompleted ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        ) : (
                        <Circle className={`w-8 h-8 text-slate-300 group-hover:text-${themeColor}-500`} />
                        )}
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <h3 className={`font-semibold text-lg truncate pr-2 ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {goal.title}
                            </h3>
                            <span className={`flex-shrink-0 text-sm font-mono px-2 py-1 rounded ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {goal.time}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                        {goal.schedule} • {goal.streak} day streak
                        </p>
                    </div>

                    {/* Edit Note Button (Only shows if completed) */}
                    {isCompleted && (
                        <button 
                            onClick={() => handleEditNote(goal, log?.note || '')}
                            className={`ml-3 p-2 text-slate-400 hover:text-${themeColor}-600 hover:bg-${themeColor}-50 rounded-full transition-colors`}
                            title="Edit Note"
                        >
                            <FileEdit className="w-5 h-5" />
                        </button>
                    )}
                  </div>
                  
                  {/* Display Note if exists */}
                  {hasNote && (
                      <div className="px-14 pb-4">
                          <div className="bg-white/50 p-3 rounded-lg border border-green-100 text-sm text-slate-600 italic">
                             "{log.note}"
                          </div>
                      </div>
                  )}
                </div>
            );
            })
        )}
      </div>

      {/* Task Completion Modal */}
      {modalOpen && selectedGoalForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 transform transition-all scale-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Complete Goal</h3>
                    <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="mb-6">
                    <p className="text-slate-600 mb-2">
                        Great job completing <span className={`font-semibold text-${themeColor}-600`}>{selectedGoalForNote.title}</span>!
                    </p>
                    <p className="text-sm text-slate-500 mb-4">Add a note about what you learned or did (optional):</p>
                    <textarea 
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="e.g., Read chapter 4, Ran 5km in 30mins..."
                        className={`w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none resize-none text-slate-800`}
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setModalOpen(false)}
                        className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmCompletion}
                        className={`flex-1 py-3 bg-${themeColor}-600 text-white font-bold rounded-xl hover:bg-${themeColor}-700 transition-colors shadow-lg shadow-${themeColor}-200`}
                    >
                        Save & Complete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
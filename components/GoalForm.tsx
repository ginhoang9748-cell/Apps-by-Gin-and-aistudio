import React, { useState, useRef } from 'react';
import { Sparkles, Plus, Loader2, Upload, Image as ImageIcon, FileText, X, CheckSquare, Square } from 'lucide-react';
import { generateScheduleFromGoal } from '../services/geminiService';
import { Goal, ThemeColor } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface GoalFormProps {
  onAddGoals: (goals: Goal[]) => void;
  themeColor: ThemeColor;
}

const GoalForm: React.FC<GoalFormProps> = ({ onAddGoals, themeColor }) => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, preview: string } | null>(null);
  // Track selected indices from the generated plan
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<Set<number>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1];
      
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        preview: result
      });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedImage) return;
    setIsLoading(true);
    setGeneratedPlan(null);
    setSelectedTaskIndices(new Set());
    
    try {
      const plan = await generateScheduleFromGoal(
        prompt, 
        selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined
      );
      setGeneratedPlan(plan);
      // Auto-select all by default for convenience
      if (plan && plan.tasks) {
        setSelectedTaskIndices(new Set(plan.tasks.map((_: any, i: number) => i)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedTaskIndices);
    if (newSelection.has(index)) {
        newSelection.delete(index);
    } else {
        newSelection.add(index);
    }
    setSelectedTaskIndices(newSelection);
  };

  const toggleSelectAll = () => {
    if (!generatedPlan) return;
    if (selectedTaskIndices.size === generatedPlan.tasks.length) {
        setSelectedTaskIndices(new Set());
    } else {
        setSelectedTaskIndices(new Set(generatedPlan.tasks.map((_: any, i: number) => i)));
    }
  };

  const handleAddSelectedGoals = () => {
    if (!generatedPlan) return;
    
    const newGoals: Goal[] = [];
    selectedTaskIndices.forEach(index => {
        const task = generatedPlan.tasks[index];
        newGoals.push({
            id: uuidv4(),
            title: task.title,
            category: 'other',
            schedule: task.frequency,
            time: task.suggestedTime,
            streak: 0,
            createdAt: new Date().toISOString(),
        });
    });

    if (newGoals.length > 0) {
        onAddGoals(newGoals);
        // Reset form
        setGeneratedPlan(null);
        setPrompt('');
        setSelectedImage(null);
        setSelectedTaskIndices(new Set());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className={`p-6 bg-${themeColor}-50 border-b border-${themeColor}-100`}>
        <h3 className={`text-lg font-semibold text-${themeColor}-900 flex items-center`}>
          <Sparkles className={`w-5 h-5 mr-2 text-${themeColor}-600`} />
          Create Smart Goals
        </h3>
        <p className={`text-${themeColor}-700 text-sm mt-1`}>
          {mode === 'text' 
            ? "Tell AI what you want to achieve, and we'll build your schedule." 
            : "Upload a picture of your timetable or class schedule to auto-create reminders."}
        </p>
      </div>

      <div className="border-b border-slate-100 flex">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            mode === 'text' ? `text-${themeColor}-600 border-b-2 border-${themeColor}-600 bg-white` : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Describe Goal
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            mode === 'image' ? `text-${themeColor}-600 border-b-2 border-${themeColor}-600 bg-white` : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Upload Timetable
        </button>
      </div>

      <div className="p-6 space-y-4">
        {mode === 'text' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., I want to learn Spanish or Run a marathon..."
              className={`flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none`}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {!selectedImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-${themeColor}-400 hover:bg-slate-50 transition-colors`}
              >
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Click to upload timetable image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={selectedImage.preview} alt="Preview" className="max-h-64 w-full object-contain" />
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Add optional context (e.g., 'Only extract math classes')..."
              className={`w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-sm`}
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading || (mode === 'text' && !prompt) || (mode === 'image' && !selectedImage)}
          className={`w-full bg-${themeColor}-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-${themeColor}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {mode === 'image' ? 'Extract Schedule' : 'Generate Plan'}
            </>
          )}
        </button>

        {generatedPlan && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Suggested Schedule for "{generatedPlan.planName}"
                </h4>
                <button 
                    onClick={toggleSelectAll}
                    className={`text-sm text-${themeColor}-600 hover:text-${themeColor}-800 font-medium`}
                >
                    {selectedTaskIndices.size === generatedPlan.tasks.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            
            <div className="grid gap-4 mb-4">
              {generatedPlan.tasks.map((task: any, idx: number) => {
                const isSelected = selectedTaskIndices.has(idx);
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleSelection(idx)}
                    className={`cursor-pointer border rounded-xl p-4 transition-all ${
                        isSelected 
                        ? `border-${themeColor}-500 bg-${themeColor}-50/50 ring-1 ring-${themeColor}-500` 
                        : `border-slate-200 hover:border-${themeColor}-300 bg-slate-50`
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                       <div className={`mt-1 text-${themeColor}-600`}>
                           {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                       </div>
                       <div className="flex-1">
                          <h5 className="font-bold text-slate-900">{task.title}</h5>
                          <p className="text-sm text-slate-600 mt-1">{task.reasoning}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs font-medium text-slate-500">
                            <span className="bg-white px-2 py-1 rounded border border-slate-200">
                              {task.frequency}
                            </span>
                            <span className="bg-white px-2 py-1 rounded border border-slate-200">
                              {task.suggestedTime}
                            </span>
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
                onClick={handleAddSelectedGoals}
                disabled={selectedTaskIndices.size === 0}
                className={`w-full bg-${themeColor}-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-${themeColor}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
                <Plus className="w-4 h-4" />
                Add {selectedTaskIndices.size} Selected Goal{selectedTaskIndices.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalForm;
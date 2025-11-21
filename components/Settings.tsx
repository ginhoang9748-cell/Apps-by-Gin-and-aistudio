import React, { useState, useRef } from 'react';
import { Volume2, Upload, Play, Check, Music, Bell, AlertCircle } from 'lucide-react';
import { SoundSettings } from '../types';

interface SettingsProps {
  settings: SoundSettings;
  onSave: (settings: SoundSettings) => void;
}

const PRESETS = [
  { name: 'Soft Chime', url: 'https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3' },
  { name: 'Digital Beep', url: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3' },
  { name: 'Gentle Alert', url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3' },
  { name: 'Success', url: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3' },
];

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    
    audio.play().catch(e => console.error("Error playing sound:", e));
    
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
        setIsPlaying(false);
        alert("Could not play this audio file.");
    };
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    onSave({
      ...settings,
      type: 'preset',
      url: preset.url,
      name: preset.name
    });
    playSound(preset.url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (limit to 2MB for localStorage sanity)
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please choose a file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onSave({
          ...settings,
          type: 'custom',
          url: result,
          name: file.name
        });
        playSound(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleEnabled = () => {
    onSave({ ...settings, enabled: !settings.enabled });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Volume2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sound Settings</h2>
            <p className="text-sm text-slate-500">Customize your reminder notifications</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
                <Bell className={`w-5 h-5 ${settings.enabled ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="font-medium text-slate-900">Enable Reminder Sounds</span>
            </div>
            <button 
                onClick={toggleEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {settings.enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Preset Sounds</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => handlePresetSelect(preset)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                settings.type === 'preset' && settings.name === preset.name
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Music className="w-4 h-4 opacity-70" />
                                <span className="font-medium">{preset.name}</span>
                            </div>
                            {settings.type === 'preset' && settings.name === preset.name && (
                                <Check className="w-4 h-4 text-indigo-600" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Custom Sound</h3>
                    
                    <div className={`p-4 rounded-xl border border-slate-200 bg-white ${settings.type === 'custom' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                                    <Upload className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-900 truncate">
                                        {settings.type === 'custom' ? settings.name : 'Upload your own sound'}
                                    </p>
                                    <p className="text-xs text-slate-500">MP3, WAV (Max 2MB)</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 flex-shrink-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="audio/*"
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    Select File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Button */}
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={() => playSound(settings.url)}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <Play className={`w-4 h-4 ${isPlaying ? 'fill-white' : ''}`} />
                        {isPlaying ? 'Playing...' : 'Test Current Sound'}
                    </button>
                </div>
            </div>
          )}

          {!settings.enabled && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <p>Reminders will be visual only.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
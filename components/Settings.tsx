import React, { useState, useRef } from 'react';
import { Volume2, Upload, Play, Check, Music, Bell, AlertCircle, Palette, Quote } from 'lucide-react';
import { AppSettings, ThemeColor } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  themeColor: ThemeColor;
}

const PRESETS = [
  { name: 'Soft Chime', url: 'https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3' },
  { name: 'Digital Beep', url: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3' },
  { name: 'Gentle Alert', url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3' },
  { name: 'Success', url: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3' },
];

const COLORS: { label: string, value: ThemeColor, class: string }[] = [
  { label: 'Indigo', value: 'indigo', class: 'bg-indigo-600' },
  { label: 'Emerald', value: 'emerald', class: 'bg-emerald-600' },
  { label: 'Rose', value: 'rose', class: 'bg-rose-600' },
  { label: 'Amber', value: 'amber', class: 'bg-amber-600' },
  { label: 'Sky', value: 'sky', class: 'bg-sky-600' },
  { label: 'Violet', value: 'violet', class: 'bg-violet-600' },
];

const Settings: React.FC<SettingsProps> = ({ settings, onSave, themeColor }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempQuote, setTempQuote] = useState(settings.quote);
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
      sound: {
        ...settings.sound,
        type: 'preset',
        url: preset.url,
        name: preset.name
      }
    });
    playSound(preset.url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          sound: {
            ...settings.sound,
            type: 'custom',
            url: result,
            name: file.name
          }
        });
        playSound(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleEnabled = () => {
    onSave({ 
      ...settings, 
      sound: {
        ...settings.sound,
        enabled: !settings.sound.enabled
      } 
    });
  };

  const handleQuoteSave = () => {
    onSave({ ...settings, quote: tempQuote });
  };

  const handleThemeSelect = (color: ThemeColor) => {
    onSave({ ...settings, themeColor: color });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      {/* Theme Color Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 bg-${themeColor}-100 rounded-lg`}>
            <Palette className={`w-6 h-6 text-${themeColor}-600`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Appearance</h2>
            <p className="text-sm text-slate-500">Customize the look of FocusFlow</p>
          </div>
        </div>

        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Accent Color</label>
            <div className="flex flex-wrap gap-4">
                {COLORS.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => handleThemeSelect(color.value)}
                        className={`w-12 h-12 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 ${settings.themeColor === color.value ? 'ring-4 ring-slate-200 ring-offset-2' : ''}`}
                        title={color.label}
                    >
                        {settings.themeColor === color.value && <Check className="w-6 h-6 text-white" />}
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
             <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 bg-${themeColor}-100 rounded-lg`}>
                    <Quote className={`w-6 h-6 text-${themeColor}-600`} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Motivation</h3>
                </div>
             </div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Daily Quote</label>
             <div className="flex gap-2">
                 <input 
                    type="text"
                    value={tempQuote}
                    onChange={(e) => setTempQuote(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                 />
                 <button 
                    onClick={handleQuoteSave}
                    disabled={tempQuote === settings.quote}
                    className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-lg hover:bg-${themeColor}-700 disabled:opacity-50 transition-colors`}
                 >
                    Save
                 </button>
             </div>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 bg-${themeColor}-100 rounded-lg`}>
            <Volume2 className={`w-6 h-6 text-${themeColor}-600`} />
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
                <Bell className={`w-5 h-5 ${settings.sound.enabled ? `text-${themeColor}-600` : 'text-slate-400'}`} />
                <span className="font-medium text-slate-900">Enable Reminder Sounds</span>
            </div>
            <button 
                onClick={toggleEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.sound.enabled ? `bg-${themeColor}-600` : 'bg-slate-300'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.sound.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {settings.sound.enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Preset Sounds</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => handlePresetSelect(preset)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                settings.sound.type === 'preset' && settings.sound.name === preset.name
                                    ? `border-${themeColor}-600 bg-${themeColor}-50 text-${themeColor}-700`
                                    : `border-slate-200 hover:border-${themeColor}-300 bg-white text-slate-700`
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Music className="w-4 h-4 opacity-70" />
                                <span className="font-medium">{preset.name}</span>
                            </div>
                            {settings.sound.type === 'preset' && settings.sound.name === preset.name && (
                                <Check className={`w-4 h-4 text-${themeColor}-600`} />
                            )}
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Custom Sound</h3>
                    
                    <div className={`p-4 rounded-xl border border-slate-200 bg-white ${settings.sound.type === 'custom' ? `ring-2 ring-${themeColor}-500 ring-offset-2` : ''}`}>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 bg-${themeColor}-50 rounded-lg flex-shrink-0`}>
                                    <Upload className={`w-5 h-5 text-${themeColor}-600`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-900 truncate">
                                        {settings.sound.type === 'custom' ? settings.sound.name : 'Upload your own sound'}
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
                                    className={`px-4 py-2 text-sm font-medium text-${themeColor}-600 bg-${themeColor}-50 rounded-lg hover:bg-${themeColor}-100 transition-colors`}
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
                        onClick={() => playSound(settings.sound.url)}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <Play className={`w-4 h-4 ${isPlaying ? 'fill-white' : ''}`} />
                        {isPlaying ? 'Playing...' : 'Test Current Sound'}
                    </button>
                </div>
            </div>
          )}

          {!settings.sound.enabled && (
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
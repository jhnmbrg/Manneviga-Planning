import React, { useState, useRef } from 'react';
import { Memory, Family } from '../types';
import { FAMILIES, WEEKS } from '../constants';
import { Camera, Send, Trash2, Heart, Quote, MessageSquareQuote, Upload, Loader2 } from 'lucide-react';
import { supabase, TABLES } from '../supabaseClient';

interface FjordMemoriesProps {
  memories: Memory[];
  setMemories: React.Dispatch<React.SetStateAction<Memory[]>>;
}

const FjordMemories: React.FC<FjordMemoriesProps> = ({ memories, setMemories }) => {
  const [newText, setNewText] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(WEEKS[0]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(FAMILIES[0].id);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64);
      setNewImageUrl(compressed);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const addMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const family = FAMILIES.find(f => f.id === selectedFamilyId);
    const id = Date.now().toString();
    const memory: Memory = {
      id,
      week: selectedWeek,
      familyId: selectedFamilyId,
      authorName: family?.name || 'Anonymous',
      text: newText.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      createdAt: Date.now()
    };

    const { error } = await supabase.from(TABLES.memories).insert({
      ...memory,
      imageUrl: memory.imageUrl ?? null,
    });
    if (error) return console.error('Error adding memory:', error.message);
    setNewText('');
    setNewImageUrl('');
  };

  const deleteMemory = async (id: string) => {
    const { error } = await supabase.from(TABLES.memories).delete().eq('id', id);
    if (error) console.error('Error deleting memory:', error.message);
  };

  const groupedMemories = WEEKS.map(week => ({
    week,
    items: memories.filter(m => m.week === week)
  })).filter(group => group.items.length > 0).sort((a, b) => b.week - a.week);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-sky-50">
        <div className="bg-sky-950 p-8 text-white flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold italic serif-font">Fjord Memories</h2>
            <p className="text-teal-400 text-sm mt-1 uppercase tracking-widest font-black text-[10px]">The Digital Guest Book</p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl">
            <MessageSquareQuote className="text-teal-400" size={32} />
          </div>
        </div>

        <form onSubmit={addMemory} className="p-8 space-y-4 bg-sky-50/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2">Assign to Week</label>
              <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-900 outline-none"
              >
                {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2">On behalf of</label>
              <select 
                value={selectedFamilyId} 
                onChange={(e) => setSelectedFamilyId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-900 outline-none"
              >
                {FAMILIES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2">Message from the Coast</label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What happened this week? (e.g. 'Caught 20 mackerel!', 'Astri taught the kids to row')"
              className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-teal-400 outline-none transition-all shadow-sm bg-white text-sm min-h-[120px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2">Capture Memory (Photo)</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-dashed border-sky-200 text-sky-900 hover:border-teal-400 transition-all shadow-sm text-sm font-bold"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                  {newImageUrl ? 'Change Photo' : 'Upload or Take Photo'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {newImageUrl && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-teal-400 shadow-md">
                    <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setNewImageUrl('')}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="sm:w-48 px-8 py-4 bg-sky-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-sky-800 transition-all active:scale-95 shadow-lg self-end"
            >
              <Send size={18} /> Log Memory
            </button>
          </div>
        </form>

        <div className="p-8 space-y-12">
          {groupedMemories.length > 0 ? (
            groupedMemories.map(group => (
              <div key={group.week} className="space-y-6">
                <h3 className="text-2xl font-bold text-sky-900 serif-font italic border-b border-sky-100 pb-2">Week {group.week}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {group.items.map(memory => (
                    <div key={memory.id} className="bg-white border border-sky-50 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
                      {memory.imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img src={memory.imageUrl} alt="Summer memory" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Heart size={16} className="text-red-400 fill-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{memory.authorName}</span>
                          </div>
                          <button onClick={() => deleteMemory(memory.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm italic serif-font leading-relaxed text-sky-900">
                          "{memory.text}"
                        </p>
                        <div className="pt-2 text-[8px] uppercase tracking-widest font-bold text-slate-300">
                          {new Date(memory.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-sky-50 rounded-3xl">
              <Quote className="mx-auto text-sky-100 mb-4" size={48} />
              <p className="text-xs uppercase tracking-[0.4em] font-black text-slate-200 italic">No memories recorded yet. Start the summer legacy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FjordMemories;
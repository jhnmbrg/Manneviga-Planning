import React, { useState, useEffect } from 'react';
import { Anchor, Calendar, Menu, Ship, X, List, ArrowLeft, ClipboardList, Hammer, ShieldCheck, Lock, ChevronRight, History, CalendarCheck, Plus, Trash2, Camera, Quote, MessageSquareQuote } from 'lucide-react';
import { Booking, TodoTask, DailyEvent, Memory } from './types';
import { WEEKS, HOUSES, FAMILIES, DAYS_OF_WEEK } from './constants';
import ScheduleGrid from './components/ScheduleGrid';
import SummerManifest from './components/SummerManifest';
import TodoManager from './components/TodoManager';
import FjordMemories from './components/FjordMemories';
import { supabase, TABLES } from './supabaseClient';

const App: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [dailyEvents, setDailyEvents] = useState<DailyEvent[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [viewMode, setViewMode] = useState<'manifest' | 'weekly' | 'tasks' | 'memories' | 'moderator'>('manifest');
  
  const [isModerator, setIsModerator] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [newEventText, setNewEventText] = useState('');
  const [newEventDay, setNewEventDay] = useState(0);

  // Supabase data load + realtime sync
  useEffect(() => {
    const loadBookings = async () => {
      const { data, error } = await supabase.from(TABLES.bookings).select('*');
      if (error) return console.error('Error loading bookings:', error.message);
      setBookings((data ?? []) as Booking[]);
    };
    const loadTasks = async () => {
      const { data, error } = await supabase.from(TABLES.tasks).select('*').order('createdAt', { ascending: false });
      if (error) return console.error('Error loading tasks:', error.message);
      setTasks((data ?? []) as TodoTask[]);
    };
    const loadEvents = async () => {
      const { data, error } = await supabase.from(TABLES.events).select('*');
      if (error) return console.error('Error loading events:', error.message);
      setDailyEvents((data ?? []) as DailyEvent[]);
    };
    const loadMemories = async () => {
      const { data, error } = await supabase.from(TABLES.memories).select('*').order('createdAt', { ascending: false });
      if (error) return console.error('Error loading memories:', error.message);
      setMemories((data ?? []) as Memory[]);
    };

    loadBookings();
    loadTasks();
    loadEvents();
    loadMemories();

    // Re-fetch the affected table on any insert/update/delete so every device stays in sync.
    const channel = supabase
      .channel('manneviga-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.bookings }, loadBookings)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.events }, loadEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.tasks }, loadTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.memories }, loadMemories)
      .subscribe();

    const savedModStatus = localStorage.getItem('manneviga-mod');
    if (savedModStatus === 'true') setIsModerator(true);

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Moderator persistence
  useEffect(() => { localStorage.setItem('manneviga-mod', isModerator.toString()); }, [isModerator]);

  const handleWeekDrill = (week: number) => {
    setSelectedWeek(week);
    setViewMode('weekly');
  };

  const handleModeratorAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Manneviga2024' || password === 'Sørlandet') {
      setIsModerator(true);
      setShowAuthModal(false);
      setViewMode('moderator');
      setPassword('');
      setAuthError('');
    } else {
      setAuthError('Access Denied.');
    }
  };

  const addEvent = async () => {
    if (!newEventText.trim() || selectedWeek === null) return;
    const id = Math.random().toString(36).substr(2, 9);
    const ev: DailyEvent = {
      id,
      week: selectedWeek,
      dayIndex: newEventDay,
      text: newEventText.trim()
    };
    const { error } = await supabase.from(TABLES.events).insert(ev);
    if (error) return console.error('Error adding event:', error.message);
    setNewEventText('');
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from(TABLES.events).delete().eq('id', id);
    if (error) console.error('Error deleting event:', error.message);
  };

  const totalPeopleForWeek = selectedWeek 
    ? bookings
        .filter(b => b.week === selectedWeek)
        .reduce((sum, b) => {
          return sum + b.familySelections.reduce((acc, f) => acc + f.adults + f.babies, 0);
        }, 0)
    : 0;

  if (showIntro) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-sky-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-sky-950 to-teal-950 opacity-90"></div>
        <div className="relative z-10 text-center max-w-4xl px-6 space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="flex justify-center mb-4">
             <div className="relative">
                <Ship size={120} className="text-white drop-shadow-2xl animate-pulse" />
                <Anchor className="absolute -bottom-4 -right-4 text-teal-300" size={48} />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-bold italic serif-font tracking-tight drop-shadow-2xl">Manneviga</h1>
            <div className="h-1.5 w-32 bg-teal-400 mx-auto rounded-full shadow-lg"></div>
            <p className="text-sm uppercase tracking-[0.5em] font-black text-teal-200 opacity-80">Southern Norway Heritage</p>
          </div>
          <p className="text-xl md:text-3xl font-light tracking-[0.15em] text-sky-50 opacity-90 leading-relaxed max-w-2xl mx-auto italic serif-font">
            Seven Siblings. Three Houses. One Archipelago Legacy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <button 
              onClick={() => setShowIntro(false)}
              className="px-12 py-5 bg-teal-500 text-white font-black rounded-full hover:bg-teal-400 transition-all transform hover:scale-105 shadow-2xl uppercase tracking-[0.25em] text-sm flex items-center gap-3"
            >
              Venture to the Bay <ChevronRight size={18}/>
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 bg-sky-950 text-white shadow-2xl px-8 py-6 flex items-center justify-between border-b border-sky-900 no-print">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowIntro(true)}>
          <div className="p-2.5 bg-sky-900 rounded-2xl border border-sky-800 shadow-inner">
            <Anchor className="text-teal-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter italic serif-font">Manneviga</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-sky-400 font-black">Family Ledger</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {[
            { id: 'manifest', icon: List, label: 'Manifest' },
            { id: 'weekly', icon: Calendar, label: 'Logs' },
            { id: 'memories', icon: MessageSquareQuote, label: 'Memories' },
            { id: 'tasks', icon: ClipboardList, label: 'Maintenance' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id === 'weekly' && !selectedWeek) setSelectedWeek(24);
                setViewMode(tab.id as any);
              }}
              className={`flex items-center gap-2 transition-all relative py-2 ${viewMode === tab.id ? 'text-teal-400 font-black' : 'text-sky-200 hover:text-white'}`}
            >
              <tab.icon size={18} />
              <span className="text-xs uppercase tracking-[0.2em]">{tab.label}</span>
              {viewMode === tab.id && <div className="h-1 w-full bg-teal-400 absolute bottom-0 rounded-full animate-in slide-in-from-left duration-300"></div>}
            </button>
          ))}
          {isModerator && (
            <button onClick={() => setViewMode('moderator')} className={`flex items-center gap-2 transition-all py-2 ${viewMode === 'moderator' ? 'text-orange-400' : 'text-sky-400 hover:text-orange-300'}`}>
              <ShieldCheck size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Command</span>
            </button>
          )}
        </div>
        <button className="md:hidden p-2 text-teal-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-sky-950 text-white p-8 flex flex-col gap-6 md:hidden no-print animate-in fade-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold italic serif-font">Navigation</h2>
             <button onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
          </div>
          {[
            { id: 'manifest', icon: List, label: 'The Manifest' },
            { id: 'weekly', icon: Calendar, label: 'Weekly Logs' },
            { id: 'memories', icon: MessageSquareQuote, label: 'Fjord Memories' },
            { id: 'tasks', icon: ClipboardList, label: 'Maintenance' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id === 'weekly' && !selectedWeek) setSelectedWeek(24);
                setViewMode(tab.id as any);
                setIsMenuOpen(false);
              }}
              className={`flex items-center gap-4 py-4 border-b border-sky-900 text-lg font-bold ${viewMode === tab.id ? 'text-teal-400' : 'text-white'}`}
            >
              <tab.icon size={24} className={viewMode === tab.id ? 'text-teal-400' : 'text-sky-400'} />
              <span className="uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-sky-950/95 backdrop-blur-lg border-t border-sky-900 px-6 py-3 flex items-center justify-between no-print shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        {[
          { id: 'manifest', icon: List, label: 'Manifest' },
          { id: 'weekly', icon: Calendar, label: 'Logs' },
          { id: 'memories', icon: MessageSquareQuote, label: 'Memories' },
          { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'weekly' && !selectedWeek) setSelectedWeek(24);
              setViewMode(tab.id as any);
            }}
            className={`flex flex-col items-center gap-1 transition-all ${viewMode === tab.id ? 'text-teal-400' : 'text-sky-300'}`}
          >
            <tab.icon size={20} className={viewMode === tab.id ? 'animate-bounce-subtle' : ''} />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-12 space-y-8 md:space-y-12 relative min-h-[70vh] pb-24 md:pb-12">
        {viewMode === 'manifest' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="text-center max-w-2xl mx-auto space-y-4 no-print">
              <h2 className="text-4xl font-bold italic serif-font text-sky-900">Seasonal Archive</h2>
              <p className="text-teal-600 uppercase tracking-[0.3em] text-[10px] font-black">Week 24 to 35 • Double-click any week to manage</p>
            </div>
            <SummerManifest bookings={bookings} dailyEvents={dailyEvents} onWeekSelect={handleWeekDrill} />
          </div>
        )}

        {viewMode === 'weekly' && selectedWeek && (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-sky-100 no-print">
              <div className="flex items-center gap-6">
                <button onClick={() => setViewMode('manifest')} className="p-4 rounded-2xl bg-sky-50 text-sky-900 hover:bg-sky-900 hover:text-white transition-all transform hover:-translate-x-1">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-4xl font-bold text-sky-900 serif-font italic">Weekly Log</h2>
                  <p className="text-teal-600 text-xs uppercase tracking-widest font-black mt-1">Assignments for Week {selectedWeek}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {WEEKS.map(week => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`w-11 h-11 rounded-2xl font-black transition-all border-2 text-[10px] ${selectedWeek === week ? 'bg-sky-900 text-white border-sky-900' : 'bg-white text-sky-900 border-sky-50 hover:border-teal-200'}`}
                  >
                    {week}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-center max-w-3xl mx-auto no-print">
              <p className="text-[10px] text-sky-800 font-bold uppercase tracking-wider leading-relaxed">
                <span className="text-teal-600">Note:</span> One "Adult" occupies one bed. Babies do not require their own bed. 
                If a child is old enough to require a bed, please register them as an "Adult".
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-8 order-2 lg:order-1">
                {/* Major Events Manager for the week */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-sky-50">
                  <h3 className="text-xl font-bold text-sky-950 mb-6 flex items-center gap-3 italic serif-font">
                    <CalendarCheck className="text-teal-600" size={24} />
                    Major Events
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 no-print">
                       <input 
                         type="text"
                         value={newEventText}
                         onChange={(e) => setNewEventText(e.target.value)}
                         placeholder="Event (e.g. Picking crabs)"
                         className="px-4 py-3 rounded-xl bg-slate-50 border border-sky-100 text-sm outline-none focus:border-teal-400"
                       />
                       <div className="flex gap-2">
                          <select 
                             value={newEventDay}
                             onChange={(e) => setNewEventDay(parseInt(e.target.value))}
                             className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-sky-100 text-[10px] uppercase font-black text-sky-900 outline-none"
                          >
                             {DAYS_OF_WEEK.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                          </select>
                          <button onClick={addEvent} className="bg-teal-600 text-white p-3 rounded-xl shadow-lg hover:bg-teal-500 transition-all"><Plus size={20}/></button>
                       </div>
                    </div>
                    <div className="space-y-2 mt-4">
                       {dailyEvents.filter(e => e.week === selectedWeek).map(ev => (
                          <div key={ev.id} className="flex items-center justify-between bg-sky-50/50 p-3 rounded-xl border border-sky-50 group">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase bg-white border border-sky-100 px-1.5 py-0.5 rounded text-sky-900">{DAYS_OF_WEEK[ev.dayIndex]}</span>
                                <span className="text-xs text-sky-800 font-medium">{ev.text}</span>
                             </div>
                             <button onClick={() => deleteEvent(ev.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"><Trash2 size={14}/></button>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 border-l-8 border-teal-600">
                  <h3 className="text-xl font-bold text-sky-950 mb-6 flex items-center gap-3 italic serif-font">
                    <Ship className="text-teal-600" size={24} />
                    Occupancy Stats
                  </h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enlisted Souls</span>
                      <span className="text-4xl font-black text-sky-900 tabular-nums">{totalPeopleForWeek}</span>
                    </div>
                    <div className="h-px bg-sky-50"></div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                        <p className="text-[9px] font-black uppercase text-sky-700 tracking-tighter">Beds Total</p>
                        <p className="text-2xl font-bold text-sky-900 mt-1">46</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                        <p className="text-[9px] font-black uppercase text-sky-700 tracking-tighter">Remaining</p>
                        <p className="text-2xl font-bold text-sky-900 mt-1">{46 - totalPeopleForWeek}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 no-print">
                  {HOUSES.map(h => (
                    <div key={h.id} className="relative h-32 rounded-3xl overflow-hidden shadow-xl border-2 border-transparent hover:border-teal-400 transition-all">
                      <img src={h.imageUrl} alt={h.name} className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]" />
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-950/90 via-sky-900/40 to-transparent p-6 flex flex-col justify-center">
                        <h4 className="text-white text-xl font-bold serif-font italic tracking-wide">{h.name}</h4>
                        <p className="text-teal-300 text-[9px] font-black uppercase tracking-[0.3em] mt-1">{h.beds} Sleeping Beds</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 order-1 lg:order-2">
                <ScheduleGrid bookings={bookings} setBookings={setBookings} selectedWeek={selectedWeek} />
              </div>
            </div>
          </>
        )}

        {viewMode === 'tasks' && <TodoManager tasks={tasks} setTasks={setTasks} />}
        
        {viewMode === 'memories' && <FjordMemories memories={memories} setMemories={setMemories} />}

        {viewMode === 'moderator' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 no-print">
             <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
                <div className="bg-orange-800 p-8 text-white flex items-center justify-between">
                   <h2 className="text-3xl font-bold italic serif-font">Moderator Hub</h2>
                   <ShieldCheck size={48} className="opacity-50" />
                </div>
                <div className="p-8 space-y-12">
                   <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-600">Authorized Session Active</p>
                      <button onClick={() => { setIsModerator(false); setViewMode('manifest'); }} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase">Sign Out</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        <footer className="pt-24 pb-12 border-t border-sky-100 text-center relative mt-12 no-print">
          <p className="text-sky-900 text-[11px] font-black uppercase tracking-[0.5em] mb-4">Manneviga Heritage</p>
          <div className="text-[10px] text-slate-400 max-w-lg mx-auto leading-relaxed font-medium italic">
            Coordinating the Seven Siblings. Stewardship by Astri. A collective legacy preservation.
          </div>
        </footer>
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-sky-950/60 animate-in fade-in">
           <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
              <form onSubmit={handleModeratorAuth} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block text-center">Moderator Password</label>
                    <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-400 outline-none text-center text-lg font-black" placeholder="••••••••" />
                 </div>
                 <div className="flex flex-col gap-3">
                    <button type="submit" className="w-full py-4 bg-sky-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Verify</button>
                    <button type="button" onClick={() => { setShowAuthModal(false); setPassword(''); }} className="w-full py-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Back</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
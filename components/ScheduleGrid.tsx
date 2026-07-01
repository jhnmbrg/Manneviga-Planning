
import React, { useState } from 'react';
import { Booking, Family, House, FamilySelection } from '../types';
import { FAMILIES, HOUSES, DAYS_OF_WEEK } from '../constants';
import { Users, Home, AlertCircle, XCircle, Anchor, Baby, Plus, Crown, UserPlus, Info, Trash2 } from 'lucide-react';
import { supabase, TABLES } from '../supabaseClient';

interface ScheduleGridProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  selectedWeek: number;
  selectedYear: number;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ bookings, setBookings, selectedWeek, selectedYear }) => {
  const [registering, setRegistering] = useState<{ houseId: string, familyId: string } | null>(null);
  const [tempCounts, setTempCounts] = useState({ adults: 2, babies: 0, guests: '', label: '' });

  const startRegistration = (houseId: string, familyId: string) => {
    setTempCounts({ adults: 2, babies: 0, guests: '', label: '' });
    setRegistering({ houseId, familyId });
  };

  const removeGroup = async (houseId: string, selectionId: string) => {
    const booking = bookings.find(b => b.week === selectedWeek && b.year === selectedYear && b.houseId === houseId);
    if (!booking) return;

    const updatedSelections = booking.familySelections.filter(fs => fs.id !== selectionId);
    
    if (updatedSelections.length === 0) {
      const { error } = await supabase.from(TABLES.bookings).delete().eq('id', booking.id);
      if (error) console.error('Error deleting booking:', error.message);
    } else {
      const { error } = await supabase
        .from(TABLES.bookings)
        .update({ familySelections: updatedSelections })
        .eq('id', booking.id);
      if (error) console.error('Error updating booking:', error.message);
    }
  };

  const toggleDay = async (houseId: string, selectionId: string, dayIndex: number) => {
    const booking = bookings.find(b => b.week === selectedWeek && b.year === selectedYear && b.houseId === houseId);
    if (!booking) return;

    const updatedSelections = booking.familySelections.map(fs => {
      if (fs.id === selectionId) {
        const newDays = fs.days.includes(dayIndex)
          ? fs.days.filter(d => d !== dayIndex)
          : [...fs.days, dayIndex].sort((a, b) => a - b);
        return { ...fs, days: newDays };
      }
      return fs;
    });

    const { error } = await supabase
      .from(TABLES.bookings)
      .update({ familySelections: updatedSelections })
      .eq('id', booking.id);
    if (error) console.error('Error updating booking days:', error.message);
  };

  const completeRegistration = async () => {
    if (!registering) return;
    const { houseId, familyId } = registering;

    const existingBooking = bookings.find(b => b.week === selectedWeek && b.year === selectedYear && b.houseId === houseId);
    const newSelection: FamilySelection = {
      id: Math.random().toString(36).substr(2, 9),
      familyId,
      label: tempCounts.label.trim(),
      adults: tempCounts.adults,
      babies: tempCounts.babies,
      guests: tempCounts.guests,
      days: [0, 1, 2, 3, 4, 5, 6]
    };

    if (existingBooking) {
      const { error } = await supabase
        .from(TABLES.bookings)
        .update({ familySelections: [...existingBooking.familySelections, newSelection] })
        .eq('id', existingBooking.id);
      if (error) return console.error('Error updating booking:', error.message);
    } else {
      const id = `${selectedYear}-${selectedWeek}-${houseId}-${Date.now()}`;
      const newBooking: Booking = {
        id,
        week: selectedWeek,
        year: selectedYear,
        houseId,
        familySelections: [newSelection]
      };
      const { error } = await supabase.from(TABLES.bookings).insert(newBooking);
      if (error) return console.error('Error creating booking:', error.message);
    }
    setRegistering(null);
  };

  const getBooking = (houseId: string) => bookings.find(b => b.week === selectedWeek && b.year === selectedYear && b.houseId === houseId);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
      {HOUSES.map(house => {
        const booking = getBooking(house.id);
        const currentSouls = booking?.familySelections.reduce((acc, f) => acc + f.adults + f.babies, 0) || 0;
        const isNearCapacity = currentSouls >= house.beds * 0.8;
        const isOverCapacity = currentSouls > house.beds;
        
        return (
          <div key={house.id} className="bg-white rounded-3xl shadow-xl border border-sky-50 overflow-hidden">
            <div className={`p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${isOverCapacity ? 'bg-orange-800' : isNearCapacity ? 'bg-sky-700' : 'bg-sky-900'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl shadow-inner">
                  <Home className="w-8 h-8 text-sky-100" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold italic serif-font tracking-tight">{house.name} <span className="text-sky-300 font-light text-xl">({house.norwegianName})</span></h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-32 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400" style={{ width: `${Math.min(100, (currentSouls / house.beds) * 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-sky-100 uppercase tracking-[0.2em] font-black">{currentSouls} / {house.beds} Beds Used</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-8 bg-gradient-to-b from-sky-50/20 to-white">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                 {FAMILIES.map(family => (
                    <button 
                      key={family.id}
                      onClick={() => startRegistration(house.id, family.id)}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-2xl border border-sky-100 bg-white shadow-sm hover:border-teal-400 transition-all flex items-center justify-center sm:justify-start gap-3 group"
                    >
                      {family.isMatriarch ? <Crown size={16} className="text-amber-500"/> : <Users size={16} className="text-sky-400 group-hover:scale-110 transition-transform"/>}
                      <span className="text-xs sm:text-sm font-bold text-sky-900 whitespace-nowrap">{family.name}</span>
                      <Plus size={14} className="text-teal-500 opacity-50 group-hover:opacity-100 hidden sm:block"/>
                    </button>
                 ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                 {booking?.familySelections.map(selection => {
                    const family = FAMILIES.find(f => f.id === selection.familyId);
                    return (
                       <div key={selection.id} className="bg-white border border-sky-50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative group">
                          <button 
                             onClick={() => removeGroup(house.id, selection.id)}
                             className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors"
                          >
                             <Trash2 size={16}/>
                          </button>
                          
                          <div className="flex items-center gap-4 mb-4">
                             <div className={`p-3 rounded-2xl ${family?.isMatriarch ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
                                {family?.isMatriarch ? <Crown size={24}/> : <Users size={24}/>}
                             </div>
                             <div>
                                <h4 className="font-black text-sky-950 uppercase tracking-tighter flex items-center gap-2">
                                   {family?.name} 
                                   {selection.label && <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-lg text-[10px] lowercase normal-case">{selection.label}</span>}
                                </h4>
                                <p className="text-xs font-bold text-slate-400">{selection.adults} Adults • {selection.babies} Babies</p>
                             </div>
                          </div>

                          <div className="space-y-3">
                             <div className="flex flex-wrap gap-1">
                                {DAYS_OF_WEEK.map((day, idx) => (
                                   <button
                                      key={day}
                                      onClick={() => toggleDay(house.id, selection.id, idx)}
                                      className={`
                                         flex-1 py-1.5 rounded-lg text-[9px] font-black border transition-all
                                         ${selection.days.includes(idx) ? 'bg-teal-600 border-teal-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}
                                      `}
                                   >
                                      {day}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    );
                 })}
                 {(booking?.familySelections.length || 0) === 0 && (
                    <div className="col-span-full border-2 border-dashed border-sky-50 rounded-3xl p-12 text-center">
                       <p className="text-xs uppercase tracking-[0.4em] font-black text-slate-400 italic">This property is currently vacant</p>
                    </div>
                 )}
              </div>
            </div>
          </div>
        );
      })}

      {registering && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md bg-sky-950/40">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="bg-sky-900 p-6 sm:p-8 text-white">
              <h4 className="text-xl sm:text-2xl font-bold italic serif-font">Arrival Details</h4>
              <p className="text-sky-200 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-black">Registering for {FAMILIES.find(f => f.id === registering.familyId)?.name}</p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2">Group Label (Optional)</label>
                    <input 
                      type="text"
                      value={tempCounts.label}
                      onChange={(e) => setTempCounts(p => ({...p, label: e.target.value}))}
                      placeholder="e.g. 'The Kids', 'Torrey & Mary'"
                      className="w-full px-4 py-3 rounded-xl border border-sky-100 text-sm outline-none bg-sky-50/30"
                    />
                 </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Adults</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setTempCounts(p => ({...p, adults: Math.max(1, p.adults - 1)}))} className="w-8 h-8 rounded-full border border-sky-100">-</button>
                    <span className="text-xl font-black tabular-nums">{tempCounts.adults}</span>
                    <button onClick={() => setTempCounts(p => ({...p, adults: p.adults + 1}))} className="w-8 h-8 rounded-full border border-sky-100">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Babies</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setTempCounts(p => ({...p, babies: Math.max(0, p.babies - 1)}))} className="w-8 h-8 rounded-full border border-sky-100">-</button>
                    <span className="text-xl font-black tabular-nums">{tempCounts.babies}</span>
                    <button onClick={() => setTempCounts(p => ({...p, babies: p.babies + 1}))} className="w-8 h-8 rounded-full border border-sky-100">+</button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setRegistering(null)} className="flex-1 py-4 text-xs font-bold text-slate-400">Cancel</button>
                <button onClick={completeRegistration} className="flex-1 py-4 bg-sky-900 text-white rounded-2xl font-bold text-xs uppercase shadow-lg">Confirm Arrival</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;

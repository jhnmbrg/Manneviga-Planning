import React from 'react';
import { Booking, DailyEvent } from '../types';
import { FAMILIES, HOUSES, WEEKS, DAYS_OF_WEEK, getWeekDateRange } from '../constants';
import { Anchor, Users, BedDouble, Crown, Printer, ChevronRight } from 'lucide-react';

interface SummerManifestProps {
  bookings: Booking[];
  dailyEvents: DailyEvent[];
  selectedYear: number;
  onWeekSelect: (week: number) => void;
}

const SummerManifest: React.FC<SummerManifestProps> = ({ bookings, dailyEvents, selectedYear, onWeekSelect }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 manifest-container">
      <div className="bg-sky-950 p-10 text-white flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold italic serif-font tracking-tight">The Summer Manifest</h2>
          <p className="text-teal-400 text-sm mt-1 uppercase tracking-widest font-black text-[10px]">Double-click a week for specific daily arrival details</p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
           <button 
             onClick={handlePrint}
             className="no-print p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 group"
             title="Print Manifest for the Fridge"
           >
              <Printer className="text-teal-400 group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Print for Fridge</span>
           </button>
           <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 hidden sm:block no-print">
              <Anchor className="text-teal-400" size={40} />
           </div>
        </div>
      </div>

      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-sky-50/50 border-b border-sky-100">
              <th className="p-6 w-44 text-sky-900 font-black uppercase tracking-widest text-[10px]">Week</th>
              {HOUSES.map(house => (
                <th key={house.id} className="p-8 text-sky-900 font-black uppercase tracking-widest text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-sm italic serif-font font-bold">{house.name}</span>
                    <span className="text-sky-400 font-bold opacity-60">({house.beds} Beds)</span>
                  </div>
                </th>
              ))}
              <th className="p-8 text-sky-900 font-black uppercase tracking-widest text-[10px]">Major Events</th>
            </tr>
          </thead>
          <tbody>
            {WEEKS.map(week => (
              <tr 
                key={week} 
                onDoubleClick={() => onWeekSelect(week)}
                className="hover:bg-sky-50/50 transition-all cursor-pointer border-b border-sky-50 group"
              >
                <td className="p-6 font-black text-sky-900 bg-sky-50/30 group-hover:bg-sky-100/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xl tabular-nums">Week {week}</span>
                    <span className="text-[12px] text-sky-600 font-bold mt-1 leading-tight normal-case tracking-normal">{getWeekDateRange(week, selectedYear)}</span>
                  </div>
                </td>
                {HOUSES.map(house => {
                  const booking = bookings.find(b => b.week === week && b.year === selectedYear && b.houseId === house.id);
                  const selections = booking?.familySelections || [];
                  const totalSouls = selections.reduce((acc, f) => acc + f.adults + f.babies, 0);

                  return (
                    <td key={house.id} className="p-8 align-top">
                      {selections.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {selections.map(selection => {
                              const family = FAMILIES.find(f => f.id === selection.familyId);
                              const isStayingAllWeek = selection.days.length === 7;
                              return (
                                <div key={selection.id} className={`relative border shadow-sm px-3 py-1.5 rounded-xl flex flex-col gap-1 transition-transform ${family?.isMatriarch ? 'bg-amber-50 border-amber-200' : 'bg-white border-sky-100'}`}>
                                  <div className="flex items-center gap-2">
                                    {family?.isMatriarch ? <Crown size={12} className="text-amber-600"/> : <Users size={12} className="text-sky-400"/>}
                                    <span className={`text-[10px] font-bold truncate max-w-[80px] ${family?.isMatriarch ? 'text-amber-900' : 'text-slate-700'}`}>
                                       {family?.name} {selection.label && `(${selection.label})`}
                                    </span>
                                  </div>
                                  {!isStayingAllWeek && (
                                    <div className="flex gap-0.5 no-print">
                                      {DAYS_OF_WEEK.map((_, i) => (
                                        <div key={i} className={`w-1 h-1 rounded-full ${selection.days.includes(i) ? 'bg-teal-500' : 'bg-slate-100'}`} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className={`text-[9px] font-black uppercase flex items-center gap-1.5 ${totalSouls > house.beds ? 'text-orange-600' : 'text-slate-300'}`}>
                            <BedDouble size={12} /> {totalSouls} Beds Taken
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10px] uppercase font-black">Vacant</span>
                      )}
                    </td>
                  );
                })}
                <td className="p-8 align-top">
                   <div className="space-y-2">
                      {dailyEvents.filter(e => e.week === week && e.year === selectedYear).sort((a,b) => a.dayIndex - b.dayIndex).map(event => (
                         <div key={event.id} className="bg-sky-50/50 p-2 rounded-lg border border-sky-100 flex gap-2 items-start">
                            <span className="text-[9px] font-black text-sky-900 bg-white px-1.5 py-0.5 rounded border border-sky-200 uppercase">{DAYS_OF_WEEK[event.dayIndex]}</span>
                            <span className="text-[10px] text-sky-800 leading-tight font-medium italic serif-font">{event.text}</span>
                         </div>
                      ))}
                      {dailyEvents.filter(e => e.week === week && e.year === selectedYear).length === 0 && (
                         <span className="text-slate-400 italic text-[10px] uppercase font-black">No events logged</span>
                      )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {WEEKS.map(week => (
          <div 
            key={week}
            onClick={() => onWeekSelect(week)}
            className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform"
          >
            <div className="bg-sky-50 px-4 py-3 flex items-center justify-between border-b border-sky-100">
              <div className="flex flex-col">
                <span className="text-lg font-black text-sky-900">Week {week}</span>
                <span className="text-[13px] font-bold text-sky-600">{getWeekDateRange(week, selectedYear)}</span>
              </div>
              <ChevronRight size={16} className="text-sky-300" />
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {HOUSES.map(house => {
                  const booking = bookings.find(b => b.week === week && b.year === selectedYear && b.houseId === house.id);
                  const selections = booking?.familySelections || [];
                  const totalSouls = selections.reduce((acc, f) => acc + f.adults + f.babies, 0);
                  
                  return (
                    <div key={house.id} className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase text-sky-900">{house.name}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${totalSouls > house.beds ? 'bg-orange-100 text-orange-700' : 'bg-sky-50 text-sky-600'}`}>
                            {totalSouls}/{house.beds}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selections.length > 0 ? (
                            selections.map(s => (
                              <span key={s.id} className="text-[9px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                {FAMILIES.find(f => f.id === s.familyId)?.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-300 italic">Vacant</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Mobile Events */}
              {dailyEvents.filter(e => e.week === week && e.year === selectedYear).length > 0 && (
                <div className="pt-3 border-t border-sky-50 flex gap-2 overflow-x-auto no-scrollbar">
                  {dailyEvents.filter(e => e.week === week && e.year === selectedYear).sort((a,b) => a.dayIndex - b.dayIndex).map(event => (
                    <div key={event.id} className="flex-shrink-0 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100 flex items-center gap-1.5">
                      <span className="text-[8px] font-black text-teal-700 uppercase">{DAYS_OF_WEEK[event.dayIndex]}</span>
                      <span className="text-[9px] text-teal-900 font-medium truncate max-w-[80px]">{event.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummerManifest;
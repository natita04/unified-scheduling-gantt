
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info, 
  Check, 
  User,
  X,
  Users,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Repeat
} from 'lucide-react';
import { SchedulingState, Resource, RecurrenceConfig } from '../../types';
import { MOCK_RESOURCES } from '../../constants';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

const DEFAULT_RECURRENCE: RecurrenceConfig = {
  interval: 1,
  unit: 'week',
  days: ['T'],
  endType: 'never',
  endDate: 'May 19, 2026',
  occurrences: 13
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const SchedulingStep: React.FC<Props> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'SLOTS' | 'RESOURCES'>('SLOTS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(2025, 3, 18)); // April 18, 2025
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResources = useMemo(() => {
    let list = MOCK_RESOURCES.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (state.fastTrackUsed && state.resources.length > 0) {
      const selectedId = state.resources[0].id;
      const selectedResource = list.find(r => r.id === selectedId);
      if (selectedResource) {
        list = [selectedResource, ...list.filter(r => r.id !== selectedId)];
      }
    }
    
    return list;
  }, [searchTerm, state.fastTrackUsed, state.resources]);

  const toggleResource = (resource: Resource) => {
    const isSelected = state.resources.some(r => r.id === resource.id);
    if (isSelected) {
      updateState({ resources: state.resources.filter(r => r.id !== resource.id) });
    } else {
      updateState({ resources: [...state.resources, resource], fastTrackUsed: false });
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  const removeResource = (id: string) => {
    updateState({ resources: state.resources.filter(r => r.id !== id), fastTrackUsed: false });
  };

  const handleTimeSelect = (time: string, dateStr: string) => {
    updateState({ 
      date: dateStr,
      timeSlot: `${time} - ${time.includes(':') ? (time.split(':')[1] === '00' ? time.replace(':00', ':30') : (parseInt(time.split(':')[0]) + 1) + ':00') : time}` 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + days);
    setViewDate(newDate);
    updateState({ date: formatDate(newDate) });
  };

  const selectCalendarDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setViewDate(newDate);
    updateState({ date: formatDate(newDate) });
    setIsCalendarOpen(false);
  };

  const Calendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16} /></button>
          <span className="text-sm font-bold text-gray-800">{monthName}</span>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-[10px] font-bold text-gray-400 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = viewDate.getDate() === day;
            return (
              <button
                key={day}
                onClick={() => selectCalendarDate(day)}
                className={`h-7 w-7 rounded-lg text-[11px] font-medium flex items-center justify-center transition-all ${
                  isSelected ? 'bg-[#0176d3] text-white' : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const updateRecurrence = (updates: Partial<RecurrenceConfig>) => {
    const current = state.recurrenceConfig || DEFAULT_RECURRENCE;
    updateState({ recurrenceConfig: { ...current, ...updates } });
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = state.recurrenceConfig?.days || DEFAULT_RECURRENCE.days;
    const dayLetter = DAYS[dayIndex];
    const newDays = [...currentDays];
    const existingIndex = newDays.indexOf(dayLetter);
    if (existingIndex > -1) {
      newDays.splice(existingIndex, 1);
    } else {
      newDays.push(dayLetter);
    }
    updateRecurrence({ days: newDays });
  };

  const RecurrencePanel = () => {
    const config = state.recurrenceConfig || DEFAULT_RECURRENCE;
    
    return (
      <div className="p-5 bg-[#f8f9fa] rounded-2xl space-y-5 animate-in slide-in-from-top-2 duration-300 border border-gray-100 shadow-sm mt-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Repeat every</span>
          <div className="flex items-center bg-gray-100 rounded-md px-1 py-1">
            <input 
              type="number" 
              className="w-8 bg-transparent text-center text-sm font-semibold outline-none"
              value={config.interval}
              onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
            />
            <div className="flex flex-col ml-1">
              <button onClick={() => updateRecurrence({ interval: config.interval + 1 })}><ChevronUp size={10} className="text-gray-500 hover:text-blue-600" /></button>
              <button onClick={() => updateRecurrence({ interval: Math.max(1, config.interval - 1) })}><ChevronDown size={10} className="text-gray-500 hover:text-blue-600" /></button>
            </div>
          </div>
          <div className="relative">
            <select 
              className="bg-gray-100 pl-3 pr-8 py-2 rounded-md text-sm font-medium appearance-none outline-none cursor-pointer hover:bg-gray-200 transition-colors"
              value={config.unit}
              onChange={(e) => updateRecurrence({ unit: e.target.value as any })}
            >
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600">Repeat on</p>
          <div className="flex gap-2">
            {DAYS.map((d, i) => {
              const isSelected = config.days.includes(d);
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#0176d3] text-white shadow-sm' : 'bg-gray-100 text-[#0176d3] hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-600">Ends</p>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.endType === 'never' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                {config.endType === 'never' && <div className="w-2.5 h-2.5 rounded-full bg-[#0176d3]" />}
              </div>
              <input type="radio" className="hidden" name="endType" checked={config.endType === 'never'} onChange={() => updateRecurrence({ endType: 'never' })} />
              <span className={`text-sm font-medium transition-colors ${config.endType === 'never' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>Never</span>
            </label>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer group shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.endType === 'on' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                  {config.endType === 'on' && <div className="w-2.5 h-2.5 rounded-full bg-[#0176d3]" />}
                </div>
                <input type="radio" className="hidden" name="endType" checked={config.endType === 'on'} onChange={() => updateRecurrence({ endType: 'on' })} />
                <span className={`text-sm font-medium transition-colors ${config.endType === 'on' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>On</span>
              </label>
              <div className={`flex-1 bg-gray-100 rounded-md px-4 py-2 text-sm font-medium text-gray-400 ${config.endType !== 'on' && 'opacity-60 cursor-not-allowed'}`}>
                {config.endDate}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer group shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.endType === 'after' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                  {config.endType === 'after' && <div className="w-2.5 h-2.5 rounded-full bg-[#0176d3]" />}
                </div>
                <input type="radio" className="hidden" name="endType" checked={config.endType === 'after'} onChange={() => updateRecurrence({ endType: 'after' })} />
                <span className={`text-sm font-medium transition-colors ${config.endType === 'after' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>After</span>
              </label>
              <div className={`flex flex-1 items-center bg-gray-100 rounded-md px-4 py-2 ${config.endType !== 'after' && 'opacity-60 cursor-not-allowed'}`}>
                <span className="text-sm font-medium text-gray-400">{config.occurrences}</span>
                <span className="text-sm font-medium text-gray-400 ml-3">occurrences</span>
                <div className="flex flex-col ml-auto">
                   <button onClick={() => updateRecurrence({ occurrences: config.occurrences + 1 })}><ChevronUp size={10} className="text-gray-400 hover:text-blue-600" /></button>
                   <button onClick={() => updateRecurrence({ occurrences: Math.max(1, config.occurrences - 1) })}><ChevronDown size={10} className="text-gray-400 hover:text-blue-600" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sharedTimeSlots = ['16:00', '17:00', '18:00', '19:00', '20:00'];
  const bestSlots = ['16:00', '17:00'];
  const otherSlots = ['18:00', '19:00', '20:00'];

  const TimeSlot: React.FC<{ time: string }> = ({ time }) => {
    const isSelected = state.timeSlot.startsWith(time);
    return (
      <button
        key={time}
        onClick={() => handleTimeSelect(time, state.date || formatDate(viewDate))}
        className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border-2 ${
          isSelected 
          ? 'bg-[#0176d3] border-[#0176d3] text-white shadow-sm scale-105' 
          : 'bg-white border-[#0176d3] text-[#0176d3] hover:bg-blue-50 hover:shadow-sm'
        }`}
      >
        {time}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pb-10">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button 
          onClick={() => setActiveTab('SLOTS')}
          className={`flex-1 py-2 text-xs font-bold tracking-wider transition-all relative ${
            activeTab === 'SLOTS' ? 'text-[#0176d3]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          SLOTS
          {activeTab === 'SLOTS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0176d3] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('RESOURCES')}
          className={`flex-1 py-2 text-xs font-bold tracking-wider transition-all relative ${
            activeTab === 'RESOURCES' ? 'text-[#0176d3]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          RESOURCES
          {activeTab === 'RESOURCES' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0176d3] rounded-t-full" />}
        </button>
      </div>

      <div className="space-y-5">
        {activeTab === 'SLOTS' ? (
          <div className="space-y-5 animate-in slide-in-from-left-2">
            {/* Info Box */}
            <div className="bg-[#f0f8ff] p-3 rounded-2xl border border-[#d0e8ff] flex items-start gap-3">
              <Info size={18} className="text-[#0176d3] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#0176d3] font-medium leading-relaxed">
                Service resource will be assigned based on availability for the preferred slot
              </p>
            </div>

            {/* Date Selector */}
            <div className="relative" ref={activeTab === 'SLOTS' ? calendarRef : null}>
              <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between shadow-sm border border-gray-100">
                <button 
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="flex items-center gap-2 text-[14px] font-bold text-gray-800 hover:text-[#0176d3] transition-colors group"
                >
                  {state.date || formatDate(viewDate)}
                  <CalendarIcon size={16} className="text-gray-400 group-hover:text-[#0176d3] transition-colors" />
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => changeDate(-1)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={() => changeDate(1)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              {isCalendarOpen && <Calendar />}
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Best options</p>
                <div className="flex flex-wrap gap-2">
                  {bestSlots.map((time) => <TimeSlot key={time} time={time} />)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">All slots</p>
                <div className="flex flex-wrap gap-2">
                  {otherSlots.map((time) => <TimeSlot key={time} time={time} />)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in slide-in-from-right-2">
            {/* Resource Search */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className={`flex flex-wrap items-center gap-1.5 bg-white border-2 rounded-xl px-3 py-2 transition-all shadow-sm ${
                  isDropdownOpen ? 'border-[#0176d3] ring-1 ring-[#0176d3]/20' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => inputRef.current?.focus()}
              >
                <div className="bg-[#0176d3] text-white p-1 rounded-lg shrink-0">
                  <Users size={18} />
                </div>
                
                {state.resources.map(r => (
                  <div key={r.id} className="bg-blue-50 text-[#0176d3] pl-2 pr-1 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-blue-100 animate-in zoom-in-95">
                    {r.name}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeResource(r.id); }}
                      className="p-0.5 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder={state.resources.length === 0 ? "Search for a resource..." : ""}
                  className="flex-1 min-w-[120px] px-1 py-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-gray-400"
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="text-gray-400 shrink-0" size={18} />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-2 px-1">
                    {filteredResources.length > 0 ? (
                      filteredResources.map((resource) => {
                        const isSelected = state.resources.some(r => r.id === resource.id);
                        return (
                          <button
                            key={resource.id}
                            onClick={() => toggleResource(resource)}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-all hover:bg-gray-50`}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                              <img src={resource.avatar} alt={resource.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[13px] text-gray-800 truncate">{resource.name}</p>
                              <p className="text-[11px] text-gray-500 truncate">{resource.role}</p>
                            </div>
                            {isSelected && <Check size={16} className="text-[#0176d3]" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-400 italic">
                        No resources found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Common Slots Message */}
            {state.resources.length > 1 && (
              <div className="bg-[#f0f8ff] p-3 rounded-2xl border border-[#d0e8ff] flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <MessageSquare size={18} className="text-[#0176d3] shrink-0" />
                <p className="text-[12px] text-[#0176d3] font-medium">
                  Common slots available for all selected resources.
                </p>
              </div>
            )}

            {/* Date Selector */}
            <div className="relative" ref={activeTab === 'RESOURCES' ? calendarRef : null}>
              <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between shadow-sm border border-gray-100">
                <button 
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="flex items-center gap-2 text-[14px] font-bold text-gray-800 hover:text-[#0176d3] transition-colors group"
                >
                  {state.date || formatDate(viewDate)}
                  <CalendarIcon size={16} className="text-gray-400 group-hover:text-[#0176d3] transition-colors" />
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => changeDate(-1)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={() => changeDate(1)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              {isCalendarOpen && <Calendar />}
            </div>

            {/* Time Slots */}
            {state.resources.length === 1 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Best options</p>
                  <div className="flex flex-wrap gap-2">
                    {bestSlots.map((time) => <TimeSlot key={time} time={time} />)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">All slots</p>
                  <div className="flex flex-wrap gap-2">
                    {otherSlots.map((time) => <TimeSlot key={time} time={time} />)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sharedTimeSlots.map((time) => <TimeSlot key={time} time={time} />)}
              </div>
            )}
          </div>
        )}

        {/* Recurring Toggle */}
        {state.timeSlot && (
          <div className="pt-4 border-t border-gray-100 flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-gray-700">Make recurring</span>
              <button 
                onClick={() => updateState({ isRecurring: !state.isRecurring })}
                className={`w-11 h-6 rounded-full transition-all relative ${state.isRecurring ? 'bg-[#0176d3]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.isRecurring ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            {state.isRecurring && (
              <>
                <div className="bg-[#f0f8ff] p-3 rounded-2xl border border-[#d0e8ff] flex items-start gap-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <Info size={18} className="text-[#0176d3] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#0176d3] font-medium leading-relaxed">
                    We'll try to assign the same resource each session, but this can't always be guaranteed.
                  </p>
                </div>
                <RecurrencePanel />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

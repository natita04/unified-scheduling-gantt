
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { SidePanel } from './components/SidePanel';
import { FilterPanel } from './components/FilterPanel';
import {
  Calendar, Plus, Users, Search, Settings, ChevronRight, ChevronLeft, Layout, Briefcase,
  MapPin, Bell, HelpCircle, User, Grid, Star, ChevronDown, Filter,
  RefreshCw, List, Clock, AlertTriangle, CheckCircle2, MoreHorizontal, X, CheckCircle,
  Mountain, PlusCircle, UserCircle, Wand2, Headset, Map, Car, Building2, Phone, CalendarCheck,
  ExternalLink, Square, Coffee, DoorOpen, Truck, ChevronUp, Trash2, Info, Eye, Globe,
  Lock, PersonStanding, Sparkles, Check, Ban
} from 'lucide-react';
import { MOCK_RESOURCES, MOCK_CUSTOMERS } from './constants';
import { SchedulingState, ServiceMode, WorkType, RecurrenceConfig } from './types';

interface ShiftData {
  id: string;
  type: 'INFIELD' | 'ONSITE' | 'VIDEO' | 'PHONE';
  hours: string;
  left: string;
  width: string;
  status?: "Scheduled" | "Tentative";
}

interface CancelTaskData {
  id: string;
  title: string;
  customer?: string;
  times?: { start: string; end: string };
  resourceName?: string;
  type?: string;
  location?: string;
}

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4.5' : 'translate-x-1'}`} />
  </button>
);

const formatDisplayDate = (dateStr?: string) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  try {
    // Expected format: "MM/DD/YYYY HH:MM AM/PM" or "DD/MM/YYYY HH:MM AM/PM"
    // We'll try to parse it flexibly
    const parts = dateStr.split(' ');
    if (parts.length < 2) return dateStr;
    
    const datePart = parts[0];
    const timePart = parts[1];
    const ampm = parts[2] || '';
    
    const dateParts = datePart.split(/[/|-]/);
    if (dateParts.length !== 3) return dateStr;
    
    // Assume MM/DD/YYYY for the mock data
    const month = parseInt(dateParts[0]) - 1;
    const day = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);
    
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return dateStr;

    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    // Ensure time is HH:MM
    const timeParts = timePart.split(':');
    const hours = timeParts[0].padStart(2, '0');
    const minutes = (timeParts[1] || '00').padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    return `${weekday}, ${monthName} ${day} at ${formattedTime}${ampm ? ' ' + ampm : ''}`;
  } catch (e) {
    return dateStr;
  }
};

const CANCEL_REASONS = [
  'No longer needed',
  'Changed provider',
  'Will contact us at a later time',
];

const CancelConfirmationModal: React.FC<{
  task: CancelTaskData;
  onConfirm: () => void;
  onClose: () => void
}> = ({ task, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="px-6 py-6 border-b border-gray-100 text-center">
          <h3 className="text-xl font-bold text-[#002d5b]">Cancel Appointment</h3>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="space-y-3.5">
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Appointment Name</p>
              <p className="text-[13px] font-medium text-blue-600">{task.id.replace(/-SFT-\w+/g, '')} / {task.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Assigned Resource</p>
                <p className="text-[13px] font-medium text-blue-600">{task.resourceName}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Appointment Type</p>
                <p className="text-[13px] text-gray-800 font-medium">{task.type === 'INFIELD' ? 'In-Field' : task.type === 'ONSITE' ? 'On-Site' : task.type === 'VIDEO' ? 'Video' : task.type || 'N/A'}</p>
              </div>

              <div>
                <p className="text-[11px] text-gray-500 mb-1">Account</p>
                <p className="text-[13px] font-medium text-blue-600">{task.customer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Parent Record ID</p>
                <p className="text-[13px] font-medium text-blue-600">00001009</p>
              </div>

              <div>
                <p className="text-[11px] text-gray-500 mb-1">Scheduled Start</p>
                <p className="text-[13px] text-gray-800 font-medium">{formatDisplayDate(task.times?.start)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Scheduled End</p>
                <p className="text-[13px] text-gray-800 font-medium">{formatDisplayDate(task.times?.end)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Reason dropdown */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">Reason <span className="text-red-400">*</span></label>
            <div className="relative">
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0070d2] transition-all pr-9"
              >
                <option value="">Select a reason...</option>
                {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0070d2] transition-all resize-none"
            />
          </div>

          <div className="text-center text-gray-400 text-[12px] leading-relaxed max-w-sm mx-auto">
            <p>Upon cancellation, the appointment will be removed from the Gantt. The customer will be notified via SMS.</p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-[#0070d2] border border-gray-200 rounded-full hover:bg-gray-50 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason}
            className={`px-6 py-2 text-sm font-medium rounded-full shadow-sm transition-all ${
              reason
                ? 'bg-[#0070d2] text-white hover:bg-[#005fb2]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const DEFAULT_RECURRENCE_MODAL: RecurrenceConfig = {
  interval: 1,
  unit: 'week',
  days: ['T'],
  endType: 'after',
  endDate: '',
  occurrences: 6,
};

const getScoreExplanation = (score: number): string => {
  if (score >= 97) return "Aligns best with your objectives — preferred resource is available, travel is minimized, and skill match is excellent.";
  if (score >= 94) return "Near-perfect fit. Preferred resource is free and highly skilled. Travel distance is within the optimal range.";
  if (score >= 91) return "Strong alignment. Preferred resource is available with an excellent skill match. Travel is slightly above minimum.";
  if (score >= 88) return "Very good option. Resource skills meet your requirements and availability is confirmed. Minor travel overhead.";
  if (score >= 75) return "Good fit overall. A well-matched resource is available, though not your preferred one. Travel is reasonable.";
  if (score >= 65) return "Moderate alignment. A capable resource is available but travel distance is higher than preferred slots.";
  if (score >= 60) return "Adequate option. Preferred resource is unavailable at this time and travel overhead is above average.";
  return "Lower alignment due to resource constraints and non-optimal travel distance at this time slot.";
};

// Feature flag — set to true to re-enable "Make recurring" in the reschedule flow
const RESCHEDULE_SHOW_RECURRING = false;

const RescheduleModal: React.FC<{
  appointment: {
    id: string;
    title: string;
    customerName: string;
    resourceName: string;
    startTime: string;
    endTime: string;
    location: string;
    type: string;
  };
  onConfirm: () => void;
  onClose: () => void;
}> = ({ appointment, onConfirm, onClose }) => {
  const [activeTab, setActiveTab] = useState<'SLOTS' | 'RESOURCES'>('SLOTS');
  const [viewDate, setViewDate] = useState(new Date(2025, 3, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(18);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [selectedResources, setSelectedResources] = useState<typeof MOCK_RESOURCES>([]);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<'PERSON' | 'ASSET'>('PERSON');
  const [optionalResourceIds, setOptionalResourceIds] = useState<string[]>([]);
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>(DEFAULT_RECURRENCE_MODAL);
  const [scoreTooltip, setScoreTooltip] = useState<{ text: string; top: number; right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayId = appointment.id.replace(/-SFT-\w+/g, '');
  const typeLabel = appointment.type === 'INFIELD' ? 'In-Field' : appointment.type === 'ONSITE' ? 'On-Site' : appointment.type === 'VIDEO' ? 'Video' : appointment.type === 'PHONE' ? 'Phone' : appointment.type || 'N/A';

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goldenSlots = [
    { time: '08:00', score: 98 },
    { time: '09:00', score: 96 },
    { time: '10:00', score: 94 },
  ];

  const otherSlots = [
    { time: '10:30', score: 62 },
    { time: '11:00', score: 61 },
    { time: '11:30', score: 58 },
    { time: '12:00', score: 55 },
    { time: '13:00', score: 50 },
    { time: '14:00', score: 45 },
    { time: '15:00', score: 40 },
  ];

  const filteredResources = MOCK_RESOURCES.filter(r => {
    const isPerson = r.role !== 'Room' && r.role !== 'Vehicle';
    if (resourceTypeFilter === 'PERSON' && !isPerson) return false;
    if (resourceTypeFilter === 'ASSET' && isPerson) return false;
    return r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleResource = (resource: typeof MOCK_RESOURCES[0]) => {
    const isSelected = selectedResources.some(r => r.id === resource.id);
    if (isSelected) {
      setSelectedResources(prev => prev.filter(r => r.id !== resource.id));
      setOptionalResourceIds(prev => prev.filter(oid => oid !== resource.id));
    } else {
      setSelectedResources(prev => [...prev, resource]);
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  const removeResource = (id: string) => {
    setSelectedResources(prev => prev.filter(r => r.id !== id));
    setOptionalResourceIds(prev => prev.filter(oid => oid !== id));
  };

  const toggleOptional = (id: string) => {
    setOptionalResourceIds(prev =>
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const updateRecurrence = (updates: Partial<RecurrenceConfig>) => {
    setRecurrenceConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleDay = (dayIndex: number) => {
    const dayLetter = DAYS_OF_WEEK[dayIndex];
    setRecurrenceConfig(prev => {
      const newDays = [...prev.days];
      const existingIndex = newDays.indexOf(dayLetter);
      if (existingIndex > -1) {
        newDays.splice(existingIndex, 1);
      } else {
        newDays.push(dayLetter);
      }
      return { ...prev, days: newDays };
    });
  };

  const selectDay = (day: number) => {
    setSelectedDay(day);
    setSelectedSlot(null);
    setIsRecurring(false);
  };

  const canReschedule = selectedSlot && selectedDay && (activeTab === 'SLOTS' || selectedResources.length > 0);

  const RecurrencePanel = () => (
    <div className="p-4 bg-[#f8fafc] rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300 border border-gray-100 shadow-sm mt-3">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium text-gray-600">Repeat every</span>
        <div className="flex items-center bg-gray-100 rounded-md px-1 py-0.5">
          <input
            type="number"
            className="w-6 bg-transparent text-center text-[12px] font-semibold outline-none"
            value={recurrenceConfig.interval}
            onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
          />
          <div className="flex flex-col ml-0.5">
            <button onClick={() => updateRecurrence({ interval: recurrenceConfig.interval + 1 })}><ChevronUp size={8} className="text-gray-500 hover:text-blue-600" /></button>
            <button onClick={() => updateRecurrence({ interval: Math.max(1, recurrenceConfig.interval - 1) })}><ChevronDown size={8} className="text-gray-500 hover:text-blue-600" /></button>
          </div>
        </div>
        <div className="relative">
          <select
            className="bg-gray-100 pl-2 pr-6 py-1 rounded-md text-[12px] font-medium appearance-none outline-none cursor-pointer hover:bg-gray-200 transition-colors"
            value={recurrenceConfig.unit}
            onChange={(e) => updateRecurrence({ unit: e.target.value as RecurrenceConfig['unit'] })}
          >
            <option value="day">day</option>
            <option value="week">week</option>
            <option value="month">month</option>
          </select>
          <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[12px] font-medium text-gray-600">Repeat on</p>
        <div className="flex gap-1.5">
          {DAYS_OF_WEEK.map((d, i) => {
            const isDaySelected = recurrenceConfig.days.includes(d);
            return (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                  isDaySelected ? 'bg-[#0176d3] text-white shadow-sm' : 'bg-gray-100 text-[#0176d3] hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[12px] font-medium text-gray-600">Ends</p>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${recurrenceConfig.endType === 'never' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
              {recurrenceConfig.endType === 'never' && <div className="w-2 h-2 rounded-full bg-[#0176d3]" />}
            </div>
            <input type="radio" className="hidden" name="modalEndType" checked={recurrenceConfig.endType === 'never'} onChange={() => updateRecurrence({ endType: 'never' })} />
            <span className={`text-[12px] font-medium transition-colors ${recurrenceConfig.endType === 'never' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>Never</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer group shrink-0">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${recurrenceConfig.endType === 'on' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                {recurrenceConfig.endType === 'on' && <div className="w-2 h-2 rounded-full bg-[#0176d3]" />}
              </div>
              <input type="radio" className="hidden" name="modalEndType" checked={recurrenceConfig.endType === 'on'} onChange={() => updateRecurrence({ endType: 'on' })} />
              <span className={`text-[12px] font-medium transition-colors ${recurrenceConfig.endType === 'on' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>On</span>
            </label>
            <div className={`flex-1 bg-gray-100 rounded-md px-3 py-1 text-[12px] font-medium text-gray-400 ${recurrenceConfig.endType !== 'on' ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {recurrenceConfig.endDate || 'Select date...'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer group shrink-0">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${recurrenceConfig.endType === 'after' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                {recurrenceConfig.endType === 'after' && <div className="w-2 h-2 rounded-full bg-[#0176d3]" />}
              </div>
              <input type="radio" className="hidden" name="modalEndType" checked={recurrenceConfig.endType === 'after'} onChange={() => updateRecurrence({ endType: 'after' })} />
              <span className={`text-[12px] font-medium transition-colors ${recurrenceConfig.endType === 'after' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>After</span>
            </label>
            <div className={`flex flex-1 items-center bg-gray-100 rounded-md px-3 py-1 ${recurrenceConfig.endType !== 'after' ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <span className="text-[12px] font-medium text-gray-400">{recurrenceConfig.occurrences}</span>
              <span className="text-[11px] font-medium text-gray-400 ml-2">occurrences</span>
              <div className="flex flex-col ml-auto">
                <button onClick={() => updateRecurrence({ occurrences: recurrenceConfig.occurrences + 1 })}><ChevronUp size={8} className="text-gray-400 hover:text-blue-600" /></button>
                <button onClick={() => updateRecurrence({ occurrences: Math.max(1, recurrenceConfig.occurrences - 1) })}><ChevronDown size={8} className="text-gray-400 hover:text-blue-600" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SlotButton: React.FC<{ time: string; score: number; isGolden: boolean }> = ({ time, score, isGolden }) => {
    const isSelected = selectedSlot === time;
    return (
      <div>
        <button
          onClick={() => setSelectedSlot(isSelected ? null : time)}
          className={`w-full px-4 py-3 rounded-xl text-[13px] font-bold transition-all border-2 flex items-center justify-between ${
            isSelected
              ? 'bg-[#0176d3] border-[#0176d3] text-white shadow-md'
              : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />
            <span>{time}</span>
          </div>
          <span
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setScoreTooltip({ text: getScoreExplanation(score), top: rect.top, right: window.innerWidth - rect.right });
            }}
            onMouseLeave={() => setScoreTooltip(null)}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              isSelected ? 'bg-white/20 text-white' : isGolden ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
            }`}
          >
            {score}/100
          </span>
        </button>
        {RESCHEDULE_SHOW_RECURRING && isSelected && (activeTab === 'SLOTS' || selectedResources.length === 1) && (
          <div className="px-1 pt-2 pb-1 animate-in slide-in-from-top-2 duration-200">
            <div
              className="flex items-center gap-2.5 py-1 cursor-pointer"
              onClick={() => setIsRecurring(r => !r)}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shadow-sm ${
                isRecurring ? 'bg-[#0176d3] border-[#0176d3]' : 'bg-white border-gray-300 hover:border-blue-400'
              }`}>
                {isRecurring && <Check size={14} strokeWidth={4} className="text-white" />}
              </div>
              <span className="text-[13px] font-bold text-gray-700 select-none">Make recurring</span>
            </div>
            {isRecurring && <RecurrencePanel />}
          </div>
        )}
      </div>
    );
  };

  const DatePickerGrid = () => (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[13px] font-bold text-gray-800">{monthName}</h4>
        <div className="flex gap-1">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="h-8 w-8" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => selectDay(day)}
              className={`h-8 w-8 rounded-full text-[11px] font-medium flex items-center justify-center transition-all mx-auto ${
                isSelected
                  ? 'bg-[#0176d3] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );

  const InfoBubble = ({ isResources = false }: { isResources?: boolean }) => {
    const effectiveIsRecurring = RESCHEDULE_SHOW_RECURRING && isRecurring;
    if (isResources && selectedResources.length <= 1 && !effectiveIsRecurring) return null;
    return (
      <div className="bg-[#f0f9ff]/95 border border-[#dbeafe] p-3 rounded-xl flex items-start gap-3 mt-3">
        <Info size={14} className="text-[#0070d2] shrink-0 mt-0.5" />
        <div className="space-y-1">
          {(!isResources || !effectiveIsRecurring) && (
            <p className="text-[11px] font-medium text-[#0070d2] leading-tight">
              {isResources
                ? 'Common slots available for all selected resources and assets'
                : 'Service resource will be assigned based on availability for the preferred slot'
              }
            </p>
          )}
          {effectiveIsRecurring && (
            <p className="text-[11px] font-medium text-[#0070d2] leading-tight">
              {isResources
                ? "Your selected resource will be available for 5 out of 6 appointments. An alternative resource will be assigned for the remaining appointments."
                : "We'll try to assign the same resource each session, but this can't always be guaranteed."}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderAvatar = (resource: typeof MOCK_RESOURCES[0], sizeClass = 'w-7 h-7') => {
    if (resource.avatar === 'ROOM' || resource.avatar === 'VEHICLE') {
      return (
        <div className={`${sizeClass} rounded-full border bg-gray-100 flex items-center justify-center shrink-0`}>
          {resource.avatar === 'ROOM' ? <Building2 size={12} className="text-gray-500" /> : <Car size={12} className="text-gray-500" />}
        </div>
      );
    }
    return <img src={resource.avatar} alt={resource.name} className={`${sizeClass} rounded-full border shrink-0`} />;
  };

  const UnifiedSearchBox = () => (
    <div
      className={`relative flex items-stretch bg-white border-2 rounded-xl h-11 transition-all shadow-sm ${isDropdownOpen ? 'border-blue-400' : 'border-gray-200 hover:border-gray-300'}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Type picker dropdown */}
      <div className="relative shrink-0 self-stretch" ref={typeDropdownRef} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setIsTypeOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 h-full border-r border-gray-100 bg-gray-50/30 hover:bg-gray-100/60 transition-colors rounded-l-[10px]"
        >
          <div className="w-5 h-5 bg-[#0176d3] rounded-full flex items-center justify-center text-white shrink-0">
            {resourceTypeFilter === 'PERSON' ? <User size={11} strokeWidth={3} /> : <Briefcase size={11} strokeWidth={3} />}
          </div>
          <span className="text-[13px] font-bold text-gray-700">{resourceTypeFilter === 'PERSON' ? 'People' : 'Assets'}</span>
          <ChevronDown size={14} className={`text-gray-400 ml-0.5 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
        </button>
        {isTypeOpen && (
          <div className="absolute z-[200] top-full left-0 mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
            {[
              { type: 'PERSON' as const, icon: <User size={13} />, label: 'People' },
              { type: 'ASSET' as const, icon: <Briefcase size={13} />, label: 'Assets' },
            ].map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => { setResourceTypeFilter(type); setIsTypeOpen(false); setSearchTerm(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-[12px] font-bold transition-colors ${
                  resourceTypeFilter === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {icon}
                {label}
                {resourceTypeFilter === type && <Check size={12} className="ml-auto text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center min-w-0 px-3">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${resourceTypeFilter === 'PERSON' ? 'people' : 'assets'}...`}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px]"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
          onFocus={() => setIsDropdownOpen(true)}
        />
      </div>

      <Search className="text-gray-400 mr-3 shrink-0 self-center" size={16} />

      {/* Dropdown Results */}
      {isDropdownOpen && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1.5 px-1">
            {filteredResources.length > 0 ? (() => {
              const isSearching = searchTerm.trim().length > 0;
              const isPeople = resourceTypeFilter === 'PERSON';
              const preferred = isPeople && !isSearching ? filteredResources.slice(0, 3) : filteredResources;
              const rest = isPeople && !isSearching ? filteredResources.slice(3) : [];

              const renderRow = (res: typeof MOCK_RESOURCES[0]) => {
                const isSelected = selectedResources.some(r => r.id === res.id);
                return (
                  <button
                    key={res.id}
                    onClick={(e) => { e.stopPropagation(); toggleResource(res); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {renderAvatar(res)}
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-gray-800">{res.name}</p>
                      <p className="text-[10px] text-gray-500">{res.role}</p>
                    </div>
                    {isSelected && <Check size={14} className="text-blue-600" />}
                  </button>
                );
              };

              return (
                <>
                  {isPeople && !isSearching && (
                    <div className="px-2 pt-1 pb-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Preferred Resources</span>
                    </div>
                  )}
                  {preferred.map(renderRow)}
                  {rest.length > 0 && (
                    <>
                      <div className="mx-1 my-1.5 border-t border-gray-100" />
                      <div className="px-2 pb-0.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">All Resources</span>
                      </div>
                      {rest.map(renderRow)}
                    </>
                  )}
                </>
              );
            })() : (
              <div className="px-3 py-3 text-center text-[12px] text-gray-400 italic">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const SelectedResourcesList = () => (
    <div className={`space-y-1 mt-2 ${selectedResources.length > 4 ? 'max-h-[272px] overflow-y-auto custom-scrollbar pr-1' : ''}`}>
      {selectedResources.map((res, index) => {
        const isPrimary = index === 0;
        const isOptional = optionalResourceIds.includes(res.id);
        return (
          <div key={res.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group relative">
            {renderAvatar(res, 'w-10 h-10')}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-gray-800 truncate">{res.name}</p>
                {isPrimary && (
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider">Primary</span>
                )}
                {isOptional && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-[9px] font-bold uppercase tracking-wider">Optional</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 truncate">{res.role}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isPrimary && (
                <button
                  onClick={() => toggleOptional(res.id)}
                  className={`p-1.5 rounded-full transition-all ${
                    isOptional ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={isOptional ? "Make Required" : "Make Optional"}
                >
                  <User size={16} />
                </button>
              )}
              <button
                onClick={() => removeResource(res.id)}
                className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const selectedDateLabel = selectedDay
    ? new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-[1200px] h-[900px] max-w-full max-h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 ease-out">

          {/* Header */}
          <div className="border-b border-gray-200 px-8 py-6 bg-gray-50/80 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-xl text-[#001639]">Reschedule Appointment</h2>
              <p className="text-[10px] font-bold text-[#0176d3] uppercase tracking-wider mt-1">SELECT SLOTS OR RESOURCES</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Info Block — 4 labeled fields in one row */}
          <div className="border-b border-gray-200 px-8 py-4 bg-white shrink-0">
            <div className="grid grid-cols-4 gap-8">
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-1">Appointment Name</p>
                <p className="text-[13px] font-bold text-blue-600 truncate">{displayId} / {appointment.title}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-1">Appointment Type</p>
                <p className="text-[13px] font-medium text-gray-800">{typeLabel}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-1">Scheduled Start</p>
                <p className="text-[13px] font-medium text-gray-800">{appointment.startTime}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-1">Scheduled End</p>
                <p className="text-[13px] font-medium text-gray-800">{appointment.endTime}</p>
              </div>
            </div>
          </div>

          {/* Body: sidebar tabs + main content */}
          <div className="flex flex-1 overflow-hidden">

            {/* Vertical Tab Sidebar */}
            <div className="w-[240px] border-r border-gray-100 px-5 py-8 flex flex-col gap-2 shrink-0">
              <button
                onClick={() => { setActiveTab('SLOTS'); setSelectedResources([]); setOptionalResourceIds([]); setSelectedSlot(null); setIsRecurring(false); }}
                className={`w-full text-left px-4 py-4 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 ${
                  activeTab === 'SLOTS'
                    ? 'bg-blue-50 text-[#0176d3] shadow-sm ring-1 ring-blue-100'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <Calendar size={16} />
                BY AVAILABLE SLOTS
              </button>
              <button
                onClick={() => { setActiveTab('RESOURCES'); setSelectedSlot(null); setIsRecurring(false); }}
                className={`w-full text-left px-4 py-4 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 ${
                  activeTab === 'RESOURCES'
                    ? 'bg-blue-50 text-[#0176d3] shadow-sm ring-1 ring-blue-100'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <Users size={16} />
                BY REQUIRED RESOURCES
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
              {activeTab === 'SLOTS' ? (
                /* SLOTS TAB */
                <div className="grid grid-cols-2 gap-10 h-full items-start animate-in slide-in-from-left-2">
                  {/* Left: Calendar + info */}
                  <div className="sticky top-0">
                    <DatePickerGrid />
                    <InfoBubble />
                  </div>

                  {/* Right: Time Slots */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Sparkles size={12} className="text-amber-500" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GOLDEN SLOTS</p>
                      </div>
                      {selectedDateLabel && <p className="text-[11px] font-bold text-gray-600 px-1">{selectedDateLabel}</p>}
                      <div className="space-y-2">
                        {goldenSlots.map(s => <SlotButton key={s.time} time={s.time} score={s.score} isGolden={true} />)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OTHER OPTIONS</p>
                      </div>
                      {selectedDateLabel && <p className="text-[11px] font-bold text-gray-600 px-1">{selectedDateLabel}</p>}
                      <div className="space-y-2">
                        {otherSlots.map(s => <SlotButton key={s.time} time={s.time} score={s.score} isGolden={false} />)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* RESOURCES TAB */
                <div className="grid grid-cols-2 gap-10 h-full items-stretch animate-in slide-in-from-right-2">
                  {/* Left: Resource selector + calendar */}
                  <div className="space-y-4 sticky top-0">
                    <div ref={dropdownRef}>
                      <UnifiedSearchBox />
                      <SelectedResourcesList />
                    </div>

                    {selectedResources.length > 0 && (
                      <div className="space-y-3 animate-in slide-in-from-top-2">
                        <DatePickerGrid />
                        <InfoBubble isResources={true} />
                      </div>
                    )}
                  </div>

                  {/* Right: Slots or empty state */}
                  <div className="flex flex-col h-full pt-1">
                    {selectedResources.length === 0 ? (
                      <div className="flex-1 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 min-h-[400px]">
                        <div className="bg-gray-50 p-4 rounded-full">
                          <Users size={40} className="text-gray-200" />
                        </div>
                        <p className="text-[14px] font-bold text-gray-400">Assign resources to view shared slots</p>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in slide-in-from-top-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <Sparkles size={12} className="text-amber-500" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GOLDEN SLOTS</p>
                          </div>
                          {selectedDateLabel && <p className="text-[11px] font-bold text-gray-600 px-1">{selectedDateLabel}</p>}
                          <div className="space-y-2">
                            {goldenSlots.map(s => <SlotButton key={s.time} time={s.time} score={s.score} isGolden={true} />)}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OTHER OPTIONS</p>
                          </div>
                          {selectedDateLabel && <p className="text-[11px] font-bold text-gray-600 px-1">{selectedDateLabel}</p>}
                          <div className="space-y-2">
                            {otherSlots.map(s => <SlotButton key={s.time} time={s.time} score={s.score} isGolden={false} />)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-200 bg-white flex items-center gap-4 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              Back
            </button>
            <button
              onClick={onConfirm}
              disabled={!canReschedule}
              className={`flex-[2] px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                canReschedule
                  ? 'bg-[#0176d3] text-white hover:bg-blue-700 shadow-blue-600/20'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Reschedule
            </button>
          </div>
        </div>
      </div>

      {scoreTooltip && createPortal(
        <div
          className="pointer-events-none fixed w-64 px-3 py-2.5 bg-[#032D60] text-white text-[11px] font-medium rounded-xl shadow-xl z-[20000] text-left leading-relaxed"
          style={{ top: scoreTooltip.top, right: scoreTooltip.right, transform: 'translateY(calc(-100% - 8px))' }}
        >
          {scoreTooltip.text}
          <span className="absolute top-full right-3 -mt-[1px] border-[6px] border-transparent border-t-[#032D60] block" />
        </div>,
        document.body
      )}
    </>
  );
};

const GanttTask: React.FC<{
  id: string,
  type: 'INFIELD' | 'ONSITE' | 'VIDEO' | 'PHONE',
  title: string,
  status: string, 
  customer?: string,
  duration: string, 
  color: string, 
  left: string, 
  width: string,
  hasTravelBefore?: boolean,
  hasTravelAfter?: boolean,
  lineColor?: string,
  bgColor?: string,
  resource?: { name: string, avatar: string, role: string },
  territory?: string,
  times?: { start: string, end: string, arrivalStart: string, arrivalEnd: string },
  onReschedule?: (data: { 
    id: string,
    title: string,
    customerName?: string, 
    workType: string, 
    type: 'INFIELD' | 'ONSITE' | 'VIDEO' | 'PHONE',
    resourceName: string,
    startTime: string,
    endTime: string,
    location: string
  }) => void,
  onCancel?: (task: CancelTaskData) => void,
  showShiftsInline?: boolean,
  isFiltered?: boolean,
  specialIcon?: 'lock' | 'warning' | 'walking' | 'group'
}> = ({ 
  id,
  type,
  title, 
  status, 
  customer,
  duration, 
  color, 
  left, 
  width,
  hasTravelBefore,
  hasTravelAfter,
  lineColor = "#0250D9",
  bgColor,
  resource,
  territory = "San Francisco",
  times,
  onReschedule,
  onCancel,
  showShiftsInline = false,
  isFiltered = false,
  specialIcon
}) => {
  const displayId = id.replace(/-SFT-\w+/g, '');
  const [showPopover, setShowPopover] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (showPopover && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left
      });
    }
  }, [showPopover]);

  const handleMouseEnter = () => {
    if (isFiltered) return;
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = window.setTimeout(() => {
      setShowPopover(false);
    }, 150);
  };

  const SimplePopoverContent = (
    <div
      className="fixed bg-white rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.25)] border border-gray-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 origin-top duration-250 w-[440px] pointer-events-auto"
      style={{ top: `${coords.top + 6}px`, left: `${coords.left - 20}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded border-2 mt-0.5 shrink-0" style={{ borderColor: lineColor, backgroundColor: bgColor }} />
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 tracking-tight leading-tight">{displayId} / {title}</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">{status} · {customer} · {duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button className="text-gray-400 hover:text-blue-600 p-1 rounded-full transition-colors"><ExternalLink size={16} /></button>
            <button onClick={() => setShowPopover(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"><X size={16} /></button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3.5">
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Assigned Resource</p>
          <div className="flex items-center gap-2">
            {resource?.avatar === 'ROOM' ? <DoorOpen size={14} className="text-gray-400" /> : resource?.avatar === 'VEHICLE' ? <Car size={14} className="text-gray-400" /> : <img src={resource?.avatar} className="w-5 h-5 rounded-full border border-gray-100" />}
            <span className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{resource?.name}</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Appointment Type</p>
          <p className="text-[13px] text-gray-800 font-medium">{type === 'ONSITE' ? 'On-Site' : type === 'VIDEO' ? 'Video' : type === 'PHONE' ? 'Phone' : 'In-Field'}</p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 mb-1">Account</p>
          <p className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{customer}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Parent Record ID</p>
          <p className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">00001009</p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 mb-1">Scheduled Start</p>
          <p className="text-[13px] text-gray-800 font-medium">{times?.start || '05/06/2025 04:10 PM'}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Scheduled End</p>
          <p className="text-[13px] text-gray-800 font-medium">{times?.end || '05/06/2025 04:50 PM'}</p>
        </div>
      </div>

      {resource?.avatar !== 'ROOM' && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              onReschedule?.({
                id,
                title,
                customerName: customer,
                workType: title,
                type,
                resourceName: resource?.name || '',
                startTime: times?.start || '05/06/2025 04:10 PM',
                endTime: times?.end || '05/06/2025 04:50 PM',
                location: territory
              });
              setShowPopover(false);
            }}
            className="px-5 py-2 border border-gray-300 bg-white rounded-full text-[12px] font-bold text-[#0176d3] hover:bg-gray-50 transition-all"
          >
            Reschedule
          </button>
          <button
            onClick={() => { onCancel?.({ id, title, customer, times: times || { start: '05/06/2025 04:10 PM', end: '05/06/2025 04:50 PM' }, resourceName: resource?.name, type, location: territory }); setShowPopover(false); }}
            className="px-5 py-2 border border-gray-300 bg-white rounded-full text-[12px] font-bold text-[#0176d3] hover:bg-gray-50 transition-all"
          >
            Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );

  const InFieldPopoverContent = (
    <div
      className="fixed bg-white rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.3)] border border-gray-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 origin-top duration-250 w-[440px] pointer-events-auto"
      style={{ top: `${coords.top + 6}px`, left: `${coords.left - 20}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded border-2 mt-0.5 shrink-0" style={{ borderColor: lineColor, backgroundColor: bgColor }} />
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 tracking-tight leading-tight">{displayId} / {title}</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">{status} · {customer} · {duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button className="text-gray-400 hover:text-blue-600 p-1 rounded-full transition-colors"><ExternalLink size={16} /></button>
            <button onClick={() => setShowPopover(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"><X size={16} /></button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3.5">
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Assigned Resource</p>
          <div className="flex items-center gap-2">
            {resource?.avatar === 'ROOM' ? <DoorOpen size={14} className="text-gray-400" /> : resource?.avatar === 'VEHICLE' ? <Car size={14} className="text-gray-400" /> : <img src={resource?.avatar} className="w-5 h-5 rounded-full border border-gray-100" />}
            <span className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{resource?.name}</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Appointment Type</p>
          <p className="text-[13px] text-gray-800 font-medium">In-Field</p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 mb-1">Account</p>
          <p className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{customer}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Parent Record ID</p>
          <p className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">27349147812</p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 mb-1">Arrival Window Start</p>
          <p className="text-[13px] text-gray-800 font-medium">Fri, Mar 20, 2026 8:00 AM</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Arrival Window End</p>
          <p className="text-[13px] text-gray-800 font-medium">Fri, Mar 20, 2026 12:00 PM</p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 mb-1">Scheduled Start</p>
          <p className="text-[13px] text-gray-800 font-medium">{times?.start || 'Fri, Feb 13, 2026 8:00 AM'}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Scheduled End</p>
          <p className="text-[13px] text-gray-800 font-medium">{times?.end || 'Thu, Mar 26, 2026 8:00 AM'}</p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 mb-1">Service Territory</p>
          <p className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{territory}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Travel Time to Appointment</p>
          <p className="text-[13px] text-gray-800 font-medium">15 Minutes</p>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
        <button className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 bg-white rounded-full text-[12px] font-bold text-[#0176d3] hover:bg-gray-50 transition-all">
          Change Status <ChevronDown size={14} />
        </button>
        <button
          onClick={() => {
            onReschedule?.({
              id,
              title,
              customerName: customer,
              workType: title,
              type,
              resourceName: resource?.name || '',
              startTime: times?.start || 'Fri, Feb 13, 2026 8:00 AM',
              endTime: times?.end || 'Thu, Mar 26, 2026 8:00 AM',
              location: territory
            });
            setShowPopover(false);
          }}
          className="px-5 py-2 border border-gray-300 bg-white rounded-full text-[12px] font-bold text-[#0176d3] hover:bg-gray-50 transition-all"
        >
          Reschedule
        </button>
        <button className="p-2 border border-gray-300 bg-white rounded-full text-[#0176d3] hover:bg-gray-50 transition-all">
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div 
      ref={triggerRef}
      className={`absolute z-20 flex items-center transition-all duration-300 ${showShiftsInline ? 'top-[18px] h-[48px]' : 'inset-y-2'} ${isFiltered ? 'opacity-30 pointer-events-none' : 'opacity-100'}`} 
      style={{ left, width: `calc(${width} - 8px)` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hasTravelBefore && (
        <div 
          className="absolute right-full w-8 h-[2px] top-1/2 -translate-y-1/2 z-10" 
          style={{ backgroundColor: lineColor }}
        />
      )}
      
      <div
        className={`h-full w-full rounded-lg border-2 px-2.5 py-1.5 flex flex-col justify-center ${color} cursor-pointer hover:brightness-[0.97] transition-all group relative ${showPopover ? 'ring-2 ring-blue-400' : ''}`}
        style={{ borderColor: lineColor, backgroundColor: bgColor }}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          {specialIcon === 'lock' && <Lock size={13} strokeWidth={2.5} className="text-gray-700 shrink-0" />}
          {specialIcon === 'warning' && <AlertTriangle size={13} strokeWidth={2.5} className="text-amber-600 shrink-0" />}
          {specialIcon === 'walking' && <PersonStanding size={13} strokeWidth={2.5} className="text-gray-700 shrink-0" />}
          {specialIcon === 'group' && <Users size={13} strokeWidth={2.5} className="text-gray-700 shrink-0" />}
          <span className="text-[12px] font-bold text-gray-800 tracking-tight leading-tight truncate">{displayId} / {title}</span>
        </div>
        <div className="text-[10px] text-gray-500 font-medium truncate leading-none">
          {status}{customer ? ` • ${customer}` : ''} • {duration}
        </div>
      </div>

      {hasTravelAfter && (
        <div 
          className="absolute left-full w-8 h-[2px] top-1/2 -translate-y-1/2 z-10" 
          style={{ backgroundColor: lineColor }}
        />
      )}

      {showPopover && createPortal(type === 'INFIELD' ? InFieldPopoverContent : SimplePopoverContent, document.body)}
    </div>
  );
};

const GanttBreak: React.FC<{ left: string, width: string, showShiftsInline?: boolean }> = ({ left, width, showShiftsInline }) => (
  <div 
    className={`absolute z-30 flex items-center justify-center bg-gray-200/80 border-2 border-gray-400 rounded-xl shadow-sm backdrop-blur-[1px] transition-all duration-300 ${showShiftsInline ? 'top-[18px] h-[48px]' : 'inset-y-2'}`}
    style={{ left, width: `calc(${width} - 8px)` }}
  >
    <Coffee size={18} className="text-gray-600" />
  </div>
);

const GanttShift: React.FC<{ 
  shift: ShiftData,
  resourceName: string,
  inline?: boolean,
  isFiltered?: boolean
}> = ({ 
  shift,
  resourceName,
  inline = false,
  isFiltered = false
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const Icon = shift.type === 'INFIELD' ? Car : shift.type === 'ONSITE' ? Building2 : (shift.type === 'PHONE' ? Phone : Phone);
  const isTentative = shift.status === "Tentative";

  const [start, end] = shift.hours.split(' - ');

  useLayoutEffect(() => {
    if (showPopover && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left
      });
    }
  }, [showPopover]);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = window.setTimeout(() => {
      setShowPopover(false);
    }, 150);
  };

  const shiftTypeLabel = shift.type === 'INFIELD' ? 'In-Field' : shift.type === 'ONSITE' ? 'On-Site' : 'Virtual';
  const assignedCount = Math.floor(Math.random() * 8) + 1;
  const workAllowed =
    (resourceName === 'Brooke Weaver' || resourceName === 'Joe Bautista') && shift.type === 'INFIELD'
      ? 'Quick Inspection, Complex Repair, Break Fix'
      : 'All';

  const PopoverContent = (
    <div
      className="fixed bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-gray-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 origin-bottom duration-200 w-[380px] pointer-events-auto"
      style={{ top: `${coords.top + 6}px`, left: `${coords.left}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500 shrink-0">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight leading-tight">{shift.id}</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">{shift.status || 'Scheduled'} · {shiftTypeLabel}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPopover(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
            <MapPin size={10} fill="currentColor" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800 leading-tight">
              Assigned {shiftTypeLabel} Appointments: {assignedCount}
            </p>
            <button className="text-blue-600 text-[12px] font-semibold hover:underline transition-all mt-0.5">View Appointments</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
          <div>
            <p className="text-[11px] text-gray-500 mb-1">Start Time</p>
            <p className="text-[13px] text-gray-800 font-medium">18/4/2025 {start}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">End Time</p>
            <p className="text-[13px] text-gray-800 font-medium">18/4/2025 {end}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">Assigned Resource</p>
            <p className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{resourceName}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">Shift Type</p>
            <p className="text-[13px] text-gray-800 font-medium">{shiftTypeLabel}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] text-gray-500 mb-1">Work Allowed</p>
            <p className="text-[13px] text-gray-800 font-medium">{workAllowed}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => window.open('https://shiftmanager-262-scope-ca916c26db1e.herokuapp.com/', '_blank')}
          className="px-5 py-2 border border-gray-300 bg-white rounded-full text-[12px] font-bold text-[#0176d3] hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          Manage Shift
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );

  if (inline) {
    return (
      <>
        <div 
          ref={triggerRef}
          className={`absolute bottom-1 z-10 flex items-center transition-all duration-300 ${isFiltered ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
          style={{ left: shift.left, width: shift.width }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="h-5 w-full bg-gray-200/80 border border-gray-300 rounded-full flex items-center px-2 shadow-sm cursor-default hover:bg-gray-300/80 transition-colors gap-1">
            {shift.type === 'ONSITE' && <Building2 size={10} className="text-gray-600 shrink-0" />}
            {shift.type === 'VIDEO' && <Globe size={10} className="text-gray-600 shrink-0" />}
            {shift.type === 'INFIELD' && <Car size={10} className="text-gray-600 shrink-0" />}
            <span className="text-[9px] font-bold text-gray-600 truncate">
              {shift.id} • {shift.type === 'INFIELD' ? 'In-Field' : shift.type === 'ONSITE' ? 'On-Site' : 'Virtual'}
            </span>
          </div>
        </div>
        {showPopover && createPortal(PopoverContent, document.body)}
      </>
    );
  }

  return (
    <>
      <div 
        ref={triggerRef}
        className={`absolute inset-y-1.5 transition-all duration-200 z-10`}
        style={{ left: shift.left, width: shift.width }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`h-full w-full rounded-xl flex flex-col justify-center px-3.5 shadow-sm border-2 bg-gray-100 transition-all duration-300 hover:shadow-md cursor-default group ${
            isTentative ? 'border-dashed border-gray-400' : 'border-solid border-gray-400'
          } ${showPopover ? 'ring-2 ring-gray-300' : ''}`}
        >
          <div className="flex flex-col gap-0.5 overflow-hidden w-full">
            <span className="text-[12px] font-bold text-gray-800 leading-tight truncate">
              {shift.hours}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
              <Icon size={12} className="text-gray-500 shrink-0" />
              <span className="truncate">{shift.type === 'INFIELD' ? 'In-Field' : shift.type === 'ONSITE' ? 'Onsite' : 'Virtual'} • {shift.status || 'Scheduled'}</span>
            </div>
          </div>
        </div>
      </div>
      {showPopover && createPortal(PopoverContent, document.body)}
    </>
  );
};

const App: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'reschedule'>('create');
  const [rescheduleData, setRescheduleData] = useState<Partial<SchedulingState> | null>(null);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isOptimizeDropdownOpen, setIsOptimizeDropdownOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type?: 'success' | 'warning', showInGantt?: boolean } | null>(null);
  const [showShiftsInline, setShowShiftsInline] = useState(false);
  const [ganttSearch, setGanttSearch] = useState('');
  
  // Cancellation States
  const [canceledTaskIds, setCanceledTaskIds] = useState<Set<string>>(new Set());
  const [cancelingTask, setCancelingTask] = useState<CancelTaskData | null>(null);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  // New Filter States
  const [appointmentTypeFilters, setAppointmentTypeFilters] = useState<string[]>([]);
  const [resourceTypeFilters, setResourceTypeFilters] = useState<string[]>([]);
  const [skillFilters, setSkillFilters] = useState<string[]>([]);

  // Filter States (Legacy - will be updated by FilterPanel)
  const [apptFilters, setApptFilters] = useState({
    inField: true,
    onSite: true,
    virtual: true
  });
  const [entityFilters, setEntityFilters] = useState({
    people: true,
    assets: true
  });
  
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const optimizeDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node)) {
        setIsCreateDropdownOpen(false);
      }
      if (optimizeDropdownRef.current && !optimizeDropdownRef.current.contains(event.target as Node)) {
        setIsOptimizeDropdownOpen(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScheduleComplete = (state: SchedulingState) => {
    const resourceName = state.resources[0]?.name || 'a resource';
    const startTime = state.timeSlot.split(' - ')[0];
    const action = panelMode === 'reschedule' ? 'rescheduled' : 'scheduled';
    const message = `The appointment was ${action} to ${resourceName} at ${startTime}.`;
    
    setIsPanelOpen(false);
    setToast({ show: true, message, type: 'success' });
    
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleTaskReschedule = (task: { 
    id: string,
    title: string,
    customerName?: string, 
    workType: string, 
    type: 'INFIELD' | 'ONSITE' | 'VIDEO' | 'PHONE',
    resourceName: string,
    startTime: string,
    endTime: string,
    location: string
  }) => {
    let mode: ServiceMode | null = null;
    if (task.type === 'INFIELD') mode = ServiceMode.IN_FIELD;
    else if (task.type === 'ONSITE') mode = ServiceMode.ONSITE;
    else if (task.type === 'PHONE') mode = ServiceMode.PHONE;
    else if (task.type === 'VIDEO') mode = ServiceMode.VIDEO;

    const customer = MOCK_CUSTOMERS.find(c => 
      c.name.toLowerCase().includes(task.customerName?.toLowerCase() || '') ||
      task.customerName?.toLowerCase().includes(c.name.toLowerCase())
    );

    const resource = MOCK_RESOURCES.find(r => r.name === task.resourceName);

    setRescheduleData({
      customers: customer ? [customer] : [],
      workType: task.workType as WorkType,
      serviceMode: mode,
      resources: resource ? [resource] : [],
      currentAppointment: {
        id: task.id,
        title: task.title,
        customerName: task.customerName || 'N/A',
        resourceName: task.resourceName,
        startTime: task.startTime,
        endTime: task.endTime,
        location: task.location,
        type: task.type
      }
    });
    setRescheduleModalOpen(true);
  };

  const handleTaskCancelRequest = (task: CancelTaskData) => {
    setCancelingTask(task);
  };

  const confirmCancellation = () => {
    if (cancelingTask) {
      const newCanceledIds = new Set(canceledTaskIds);
      newCanceledIds.add(cancelingTask.id);
      setCanceledTaskIds(newCanceledIds);
      
      const message = `We canceled ${cancelingTask.id} and the customer was notified via SMS.`;
      setToast({ show: true, message, type: 'warning' });
      setCancelingTask(null);
      
      setTimeout(() => {
        setToast(null);
      }, 5000);
    }
  };

  const confirmReschedule = () => {
    if (rescheduleData?.currentAppointment) {
      const newCanceledIds = new Set(canceledTaskIds);
      newCanceledIds.add(rescheduleData.currentAppointment.id);
      setCanceledTaskIds(newCanceledIds);

      const displayId = rescheduleData.currentAppointment.id.replace(/-SFT-\w+/g, '');
      const message = `${displayId} / ${rescheduleData.currentAppointment.title} was rescheduled successfully.`;
      setToast({ show: true, message, type: 'success', showInGantt: true });
      setRescheduleModalOpen(false);
      setRescheduleData(null);

      setTimeout(() => setToast(null), 5000);
    }
  };

  const isBefore11AM = (timeStr?: string) => {
    if (!timeStr) return false;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return false;
    const hour = parseInt(match[1]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM') return false;
    if (hour === 12) return true; // 12 AM
    return hour < 11;
  };

  const renderGanttContent = (index: number, resourceName: string) => {
    const resource = MOCK_RESOURCES[index];
    let sourceIndex = index;
    if (index === 10) sourceIndex = 0;
    if (index === 11) sourceIndex = 5;

    let shifts = getShiftsForResource(sourceIndex);
    if (index === 10 || index === 11) shifts = shifts.filter(s => s.type === 'INFIELD');

    const tasks: React.ReactNode[] = [];
    const hasLunchAdjustment = sourceIndex < 8; 
    let lunchLeftPercent = 0;
    let lunchWidthPercent = 0;

    if (hasLunchAdjustment) {
      const breakStartTimeMap = [11.5, 12.0, 12.5, 11.0, 11.25, 12.25, 11.75, 12.0];
      const lunchStartHour = breakStartTimeMap[sourceIndex % breakStartTimeMap.length];
      lunchLeftPercent = ((lunchStartHour - 6) / 12) * 100;
      lunchWidthPercent = (0.5 / 12) * 100;
      tasks.push(<GanttBreak key={`lunch-${index}`} left={`${lunchLeftPercent}%`} width={`${lunchWidthPercent}%`} showShiftsInline={showShiftsInline} />);
    }

    const TRAVEL_BUFFER_PERCENT = 2.5;
    const MIN_GAP_PERCENT = 0.5;

    const adjustForLunch = (left: number, width: number, hasBefore: boolean, hasAfter: boolean) => {
      if (!hasLunchAdjustment) return { left, width };
      const bs = lunchLeftPercent;
      const be = lunchLeftPercent + lunchWidthPercent;
      const effLeft = left - (hasBefore ? TRAVEL_BUFFER_PERCENT : 0);
      const effRight = left + width + (hasAfter ? TRAVEL_BUFFER_PERCENT : 0);
      if (effLeft < be && effRight > bs) {
        if (left < bs) {
          const newMaxEffRight = bs - MIN_GAP_PERCENT;
          const newMaxRight = newMaxEffRight - (hasAfter ? TRAVEL_BUFFER_PERCENT : 0);
          const newWidth = Math.max(0.5, newMaxRight - left);
          return { left, width: newWidth };
        } else {
          const newMinEffLeft = be + MIN_GAP_PERCENT;
          const newLeft = newMinEffLeft + (hasBefore ? TRAVEL_BUFFER_PERCENT : 0);
          return { left: newLeft, width };
        }
      }
      return { left, width };
    };

    const isRoomAsset = index === 8 || index === 9;
    const isAsset = resource?.role === 'Room' || resource?.role === 'Vehicle';

    shifts.forEach((shift) => {
      const leftVal = parseFloat(shift.left);
      const widthVal = parseFloat(shift.width);

      if (showShiftsInline && !isAsset) {
        const isFiltered =
          (shift.type === 'INFIELD' && !apptFilters.inField) ||
          (shift.type === 'ONSITE' && !apptFilters.onSite) ||
          ((shift.type === 'VIDEO' || shift.type === 'PHONE') && !apptFilters.virtual);
        tasks.push(<GanttShift key={`inline-${shift.id}`} shift={shift} resourceName={resourceName} inline={true} isFiltered={isFiltered} />);
      }

      if (isRoomAsset) {
        const variedWidths = [0.4, 0.2, 0.4];
        let currentL = leftVal;
        variedWidths.forEach((wPct, i) => {
          const tId = `SA-ASSET-${index}-${i}`;
          if (canceledTaskIds.has(tId)) return;
          const tW = widthVal * wPct;
          const { left: adjL, width: adjW } = adjustForLunch(currentL, tW, false, false);
          tasks.push(<GanttTask key={tId} id={tId} type="ONSITE" title={i === 1 ? "Quick Inspection" : "Full Workshop"} status="Scheduled" customer="Acme Corp" duration="3h" color="text-orange-800" lineColor="#8C4B02" bgColor="#F9E3B6" left={`${adjL}%`} width={`${adjW}%`} resource={resource} onReschedule={handleTaskReschedule} onCancel={handleTaskCancelRequest} showShiftsInline={showShiftsInline} isFiltered={!apptFilters.onSite} />);
          currentL += tW;
        });
        return;
      }

      if (shift.type === 'INFIELD') {
        const t1Id = `SA-0280-${shift.id}`;
        if (!canceledTaskIds.has(t1Id)) {
          const t1Width = widthVal * 0.35;
          const { left: adjL1, width: adjW1 } = adjustForLunch(leftVal, t1Width, true, false);
          tasks.push(<GanttTask key={t1Id} id={t1Id} type="INFIELD" title="Quick Inspection" status="Scheduled" customer="Acme Corp" duration="1.2h" color="text-orange-800" lineColor="#8C4B02" bgColor="#F9E3B6" left={`${adjL1}%`} width={`${adjW1}%`} hasTravelBefore={true} resource={resource} onReschedule={handleTaskReschedule} onCancel={handleTaskCancelRequest} showShiftsInline={showShiftsInline} isFiltered={!apptFilters.inField} specialIcon={sourceIndex === 0 ? 'lock' : undefined} />);
        }
        
        const t2Id = `SA-0285-${shift.id}`;
        if (!canceledTaskIds.has(t2Id)) {
          const { left: adjL2, width: adjW2 } = adjustForLunch(leftVal + (widthVal * 0.35), widthVal * 0.65, false, true);
          tasks.push(<GanttTask key={t2Id} id={t2Id} type="INFIELD" title="Complex Repair" status="Dispatched" customer="Global Tech" duration="2.8h" color="text-blue-800" lineColor="#0250D9" bgColor="#D6E6FF" left={`${adjL2}%`} width={`${adjW2}%`} hasTravelAfter={true} resource={resource} onReschedule={handleTaskReschedule} onCancel={handleTaskCancelRequest} showShiftsInline={showShiftsInline} isFiltered={!apptFilters.inField} specialIcon={sourceIndex === 1 ? 'warning' : undefined} />);
        }
      } else if (shift.type === 'ONSITE') {
        let currentL = leftVal;
        [0.2, 0.3, 0.25, 0.25].forEach((sPct, i) => {
          const tId = `SA-090${i}-${shift.id}`;
          if (canceledTaskIds.has(tId)) return;
          const tW = widthVal * sPct;
          const { left: adjL, width: adjW } = adjustForLunch(currentL, tW, false, false);
          tasks.push(<GanttTask key={tId} id={tId} type="ONSITE" title={["Consultation", "Strategy Session", "Follow-up", "Quick Inspection"][i]} status="Scheduled" customer="Chris Temple" duration="1h" color="text-orange-800" lineColor="#8C4B02" bgColor="#F9E3B6" left={`${adjL}%`} width={`${adjW}%`} resource={resource} onReschedule={handleTaskReschedule} onCancel={handleTaskCancelRequest} showShiftsInline={showShiftsInline} isFiltered={!apptFilters.onSite} specialIcon={sourceIndex === 0 && i === 0 ? 'walking' : sourceIndex === 0 && i === 1 ? 'group' : undefined} />);
          currentL += tW;
        });
      } else if (shift.type === 'VIDEO') {
        let currentL = leftVal;
        [0.15, 0.35, 0.2, 0.3].forEach((sPct, i) => {
          const tId = `SA-070${i}-${shift.id}`;
          if (canceledTaskIds.has(tId)) return;
          const tW = widthVal * sPct;
          const { left: adjL, width: adjW } = adjustForLunch(currentL, tW, false, false);
          tasks.push(<GanttTask key={tId} id={tId} type="VIDEO" title={["Consultation", "Strategy Session", "Repair", "Follow-up"][i]} status="Scheduled" customer="Lori Stanley" duration="1h" color="text-orange-800" lineColor="#8C4B02" bgColor="#F9E3B6" left={`${adjL}%`} width={`${adjW}%`} resource={resource} onReschedule={handleTaskReschedule} onCancel={handleTaskCancelRequest} showShiftsInline={showShiftsInline} isFiltered={!apptFilters.virtual} />);
          currentL += tW;
        });
      }
    });
    return tasks;
  };

  const getShiftsForResource = (index: number): ShiftData[] => {
    if (index >= 8) {
      return [{ id: `SFT-A0${index}`, type: index >= 10 ? "INFIELD" : "ONSITE", hours: "9:00 AM - 5:00 PM", left: "25%", width: "66.66%" }];
    }
    if (index === 0) {
      return [
        { id: "SFT-0010", type: "INFIELD", hours: "8:00 AM - 12:00 PM", left: "16.66%", width: "33.33%" },
        { id: "SFT-0012", type: "ONSITE", hours: "2:00 PM - 6:00 PM", left: "58.33%", width: "33.33%", status: "Tentative" }
      ];
    }
    if (index === 3) {
      return [
        { id: "SFT-0020", type: "ONSITE", hours: "7:00 AM - 11:00 AM", left: "8.33%", width: "33.33%" },
        { id: "SFT-0021", type: "INFIELD", hours: "12:00 PM - 4:00 PM", left: "50%", width: "33.33%" }
      ];
    }
    if (index === 7) return [{ id: "SFT-0099", type: "VIDEO", hours: "9:00 AM - 5:00 PM", left: "25%", width: "66.66%" }];
    if (index % 2 !== 0) return [{ id: `SFT-010${index}`, type: "INFIELD", hours: "7:00 AM - 3:00 PM", left: "8.33%", width: "66.66%" }];
    return [{ id: `SFT-020${index}`, type: "ONSITE", hours: "10:00 AM - 6:00 PM", left: "33.33%", width: "66.66%", status: "Tentative" }];
  };

  const filteredResourcesList = MOCK_RESOURCES.filter(r => {
    const isPeople = r.role !== 'Room' && r.role !== 'Vehicle';
    const isAsset = r.role === 'Room' || r.role === 'Vehicle';
    if (isPeople && !entityFilters.people) return false;
    if (isAsset && !entityFilters.assets) return false;
    if (ganttSearch && !r.name.toLowerCase().includes(ganttSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-screen bg-[#f3f3f3] flex flex-col font-sans text-slate-800 relative overflow-hidden">
      {toast?.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          {toast.type === 'warning' ? (
            <div className="bg-[#dbeafe] border border-blue-200 shadow-lg rounded-lg py-2.5 px-4 flex items-center gap-3 min-w-[400px]">
              <div className="bg-[#005fb2] text-white rounded-full p-0.5 shrink-0"><Ban size={14} /></div>
              <p className="text-[#005fb2] text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => setToast(null)} className="text-[#005fb2]/60 hover:bg-blue-200/50 p-1 rounded transition-colors shrink-0"><X size={14} /></button>
            </div>
          ) : (
            <div className="bg-[#c6f6d5] border border-[#9ae6b4] shadow-lg rounded-lg py-2.5 px-4 flex items-center gap-3 min-w-[400px]">
              <div className="bg-[#276749] text-white rounded-full p-0.5"><CheckCircle size={14} /></div>
              <p className="text-[#22543d] text-sm font-medium flex-1">{toast.message}</p>
              {toast.showInGantt && (
                <button onClick={(e) => e.preventDefault()} className="text-[#276749] text-sm font-semibold underline underline-offset-2 hover:text-[#1a4731] transition-colors shrink-0 whitespace-nowrap">
                  Show in Gantt
                </button>
              )}
              <button onClick={() => setToast(null)} className="text-gray-400 hover:bg-black/5 p-1 rounded transition-colors"><X size={14} /></button>
            </div>
          )}
        </div>
      )}

      {cancelingTask && (
        <CancelConfirmationModal
          task={cancelingTask}
          onConfirm={confirmCancellation}
          onClose={() => setCancelingTask(null)}
        />
      )}

      {rescheduleModalOpen && rescheduleData?.currentAppointment && (
        <RescheduleModal
          appointment={rescheduleData.currentAppointment}
          onConfirm={confirmReschedule}
          onClose={() => setRescheduleModalOpen(false)}
        />
      )}

      <header className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between h-12 z-40">
        <div className="flex items-center gap-4 shrink-0"><img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" className="w-12 h-8" alt="Salesforce Logo" /></div>
        <div className="flex-1 flex justify-center max-w-2xl px-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-full text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-600 shrink-0">
          <div className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><Layout size={18} /></div>
          <div className="flex items-center gap-0.5 border border-gray-300 rounded-md px-1 py-0.5 hover:bg-gray-100 cursor-pointer"><Star size={16} /><ChevronDown size={12} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><Plus size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><Mountain size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><HelpCircle size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><Settings size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><Bell size={18} /></div>
          <div className="w-8 h-8 rounded-full bg-[#001639] flex items-center justify-center cursor-pointer border border-gray-200 text-white"><User size={18} /></div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-4 h-11 flex items-center gap-6 z-30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-500"><Grid size={20} /></div>
          <span className="font-bold text-[15px] text-[#001639]">Field Service</span>
        </div>
        <div className="flex items-center gap-6 h-full text-[13px] font-medium text-gray-600">
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 h-full px-1">Home <ChevronDown size={12} /></div>
          <div className="flex items-center gap-1 cursor-pointer text-[#0176d3] border-b-[3px] border-[#0176d3] h-full px-1 relative top-[1px]">Workforce Scheduling <ChevronDown size={12} className="text-gray-600" /></div>
        </div>
      </nav>

      {/* Content area: main column + filter panel side-by-side — starts from gray header */}
      <div className="flex flex-1 overflow-hidden min-h-0">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

      {/* Main Action Header */}
      <div className="bg-[#f3f3f3] px-6 py-4 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#e01a59] rounded-full flex items-center justify-center text-white shadow-sm border border-white/20"><Headset size={20} /></div>
          <h1 className="text-2xl font-bold text-[#001639] tracking-tight">Workforce Scheduling</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-400 bg-white rounded-full text-sm font-bold text-[#0176d3] hover:bg-gray-50 shadow-sm active:scale-95"><Wand2 size={16} /><span>Optimize</span><ChevronDown size={14} /></button>
          <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-400 bg-white rounded-full text-sm font-bold text-[#0176d3] hover:bg-gray-50 shadow-sm active:scale-95"><span>Customer first</span><ChevronDown size={14} /></button>
          <div className="relative" ref={createDropdownRef}>
            <button onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)} className="flex items-center gap-2 px-4 py-1.5 border border-gray-400 bg-white rounded-full text-sm font-bold text-[#0176d3] hover:bg-gray-50 shadow-sm active:scale-95"><span>Create</span><ChevronDown size={14} /></button>
            {isCreateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"><AlertTriangle size={16} />Resource Absence</button>
              </div>
            )}
          </div>
          <button className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 shadow-sm text-[#0176d3] transition-colors ml-1"><Map size={18} /></button>
          <button className="flex items-center gap-1 p-2 border border-gray-300 bg-white rounded-lg shadow-sm text-[#0176d3] hover:bg-gray-50 transition-colors ml-1"><Settings size={18} /><ChevronDown size={12} /></button>
        </div>
      </div>


      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-4 z-20">
        <div className="flex items-center border rounded overflow-hidden shadow-sm">
          <button className="px-3 py-1 text-xs font-bold border-r bg-gray-50 hover:bg-gray-100 flex items-center gap-1 text-gray-600">1 Day <ChevronDown size={12} /></button>
          <button className="px-3 py-1 text-xs font-bold bg-white hover:bg-gray-100 text-gray-600">Today</button>
        </div>
        <div className="flex items-center border rounded overflow-hidden shadow-sm">
          <button className="p-1.5 border-r bg-gray-50 hover:bg-gray-100 text-gray-600"><ChevronLeft size={14} /></button>
          <button className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600"><ChevronRight size={14} /></button>
        </div>
        <div className="relative">
          <input type="text" value="01/01/2024" readOnly className="border rounded px-3 py-1 text-xs font-semibold w-32 focus:outline-none bg-white cursor-pointer shadow-sm text-gray-700" />
          <Calendar size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex-1"></div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search the Gantt..." value={ganttSearch} onChange={(e) => setGanttSearch(e.target.value)} className="border rounded pl-8 pr-3 py-1 text-xs w-48 focus:outline-none shadow-sm" />
        </div>
        <button
          onClick={() => setFilterPanelOpen(f => !f)}
          className={`relative p-1.5 border rounded-lg shadow-sm transition-all text-gray-600 hover:bg-gray-50 ${filterPanelOpen ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300'}`}
        >
          <Filter size={15} />
          {(appointmentTypeFilters.length > 0 || resourceTypeFilters.length > 0 || skillFilters.length > 0 || showShiftsInline) && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 flex h-10 shrink-0 sticky top-0 z-20">
          <div className="w-64 border-r border-gray-200 shrink-0 flex items-center px-4">
             <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resources</span>
          </div>
          <div className="flex-1 flex">
            {['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'].map(h => (
              <div key={h} className="flex-1 border-r border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">{h}</div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {filteredResourcesList.map((resource, idx) => {
            const originalIndex = MOCK_RESOURCES.findIndex(r => r.id === resource.id);
            return (
              <div key={resource.id} className={`flex border-b border-gray-100 group hover:bg-gray-50/30 transition-all ${showShiftsInline && resource.role !== 'Room' && resource.role !== 'Vehicle' ? 'h-24' : 'h-16'}`}>
                <div className="w-64 border-r border-gray-200 shrink-0 flex items-center px-4 gap-3">
                   <div className="w-9 h-9 rounded-full bg-blue-500 overflow-hidden shrink-0 border border-gray-100 shadow-sm relative">
                     {resource.avatar === 'ROOM' ? (
                       <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><DoorOpen size={18} /></div>
                     ) : resource.avatar === 'VEHICLE' ? (
                       <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><Truck size={18} /></div>
                     ) : (
                       <img src={resource.avatar} alt={resource.name} className="w-full h-full object-cover" />
                     )}
                     {resource.role !== 'Room' && resource.role !== 'Vehicle' && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                   </div>
                   <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0176d3] truncate hover:underline cursor-pointer">{resource.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{Math.floor(Math.random() * 20 + 70)}% booked • {resource.role}</p>
                   </div>
                </div>
                <div className="flex-1 relative bg-slate-50/10">
                   <div className="absolute inset-0 flex pointer-none">
                     {Array.from({ length: 13 }).map((_, i) => (
                       <div key={i} className="flex-1 border-r border-gray-100/50" />
                     ))}
                   </div>
                   <div className="relative z-10 flex items-center h-full">
                    {renderGanttContent(originalIndex, resource.name)}
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t-2 border-gray-200 shrink-0">
          <div className="px-4 py-2 flex items-center justify-between bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 cursor-pointer">
              <ChevronDown size={14} className="text-gray-500" />
              <h2 className="text-sm font-bold text-slate-700">Unscheduled for today</h2>
              <span className="text-xs text-gray-500">13 items • Sorted by Appointment number</span>
            </div>
            <button className="p-1 hover:bg-gray-200 rounded text-gray-500"><List size={16} /></button>
          </div>
          <div className="max-h-40 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
                <tr className="text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3 w-10"><input type="checkbox" className="rounded" /></th>
                  <th className="p-3">Appointment</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Work Type</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Territory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3].map(n => (
                  <tr key={n} className="hover:bg-blue-50/50">
                    <td className="p-3"><input type="checkbox" className="rounded" /></td>
                    <td className="p-3 text-blue-600 font-bold">SA-022{n}</td>
                    <td className="p-3">9/24/2023, 12:26 PM</td>
                    <td className="p-3"><span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">None</span></td>
                    <td className="p-3 text-gray-600">Field Measurements</td>
                    <td className="p-3">20 min</td>
                    <td className="p-3 text-blue-600">San Francisco</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      </div>{/* end main content column */}

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        showShifts={showShiftsInline}
        onShowShiftsChange={setShowShiftsInline}
        appointmentTypes={appointmentTypeFilters}
        onAppointmentTypesChange={setAppointmentTypeFilters}
        resourceTypes={resourceTypeFilters}
        onResourceTypesChange={setResourceTypeFilters}
        skills={skillFilters}
        onSkillsChange={setSkillFilters}
        onSave={() => {
          setApptFilters({
            inField: appointmentTypeFilters.length === 0 || appointmentTypeFilters.includes('In-Field'),
            onSite: appointmentTypeFilters.length === 0 || appointmentTypeFilters.includes('Onsite'),
            virtual: appointmentTypeFilters.length === 0 || appointmentTypeFilters.includes('Virtual')
          });
          setEntityFilters({
            people: resourceTypeFilters.length === 0 || resourceTypeFilters.includes('People'),
            assets: resourceTypeFilters.length === 0 || resourceTypeFilters.includes('Assets')
          });
          setToast({ show: true, message: 'Filters applied successfully', type: 'success' });
          setTimeout(() => setToast(null), 3000);
        }}
      />

      </div>{/* end flex-row content wrapper */}

      <SidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        onFinish={handleScheduleComplete}
        mode={panelMode}
        prefillData={rescheduleData}
      />
      {isPanelOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[45] transition-opacity" onClick={() => setIsPanelOpen(false)} />}
    </div>
  );
};

export default App;

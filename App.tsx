
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
  Lock, PersonStanding
} from 'lucide-react';
import { MOCK_RESOURCES, MOCK_CUSTOMERS } from './constants';
import { SchedulingState, ServiceMode, WorkType } from './types';

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

const CancelConfirmationModal: React.FC<{ 
  task: CancelTaskData; 
  onConfirm: () => void; 
  onClose: () => void 
}> = ({ task, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="px-6 py-6 border-b border-gray-100 text-center">
          <h3 className="text-xl font-bold text-[#002d5b]">Cancel {task.title}</h3>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="text-center text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
            <p>Are you sure you want to cancel the appointment? If you cancel it will be removed from the Gantt.</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5 grid grid-cols-2 gap-y-4 gap-x-6 shadow-sm">
            <div className="col-span-2 pb-2 border-b border-gray-50">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Appointment ID</p>
              <p className="text-sm font-bold text-blue-600">{task.id}</p>
            </div>
            
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Account</p>
              <p className="text-[13px] font-semibold text-gray-700">{task.customer || 'N/A'}</p>
            </div>

            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Resource</p>
              <p className="text-[13px] font-semibold text-gray-700">{task.resourceName}</p>
            </div>

            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Scheduled Start</p>
              <p className="text-[13px] font-semibold text-gray-700">{formatDisplayDate(task.times?.start)}</p>
            </div>

            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Scheduled End</p>
              <p className="text-[13px] font-semibold text-gray-700">{formatDisplayDate(task.times?.end)}</p>
            </div>

            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
              <p className="text-[13px] font-semibold text-gray-700">{task.location || 'N/A'}</p>
            </div>

            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Appointment Type</p>
              <p className="text-[13px] font-semibold text-gray-700">{task.type || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-3 bg-[#f0f7ff] rounded-xl border border-[#e0efff]">
            <Bell size={16} className="text-[#0070d2] shrink-0" />
            <p className="text-[12px] text-[#0070d2] font-medium">
              The customer will be automatically notified via SMS message.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-[#0070d2] border border-gray-200 rounded-full hover:bg-gray-50 transition-all"
          >
            Go Back
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 bg-[#0070d2] text-white text-sm font-bold rounded-full hover:bg-[#005fb2] shadow-sm transition-all"
          >
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
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

  const shiftTypeLabel = shift.type === 'INFIELD' ? 'In-Field' : shift.type === 'ONSITE' ? 'On-Site' : 'Video';
  const assignedCount = Math.floor(Math.random() * 8) + 1;

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
              {shift.id} • {shift.type === 'INFIELD' ? 'In-Field' : shift.type === 'ONSITE' ? 'On-Site' : 'Video'}
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
              <span className="truncate">{shift.type === 'INFIELD' ? 'In-Field' : shift.type === 'ONSITE' ? 'Onsite' : 'Video'} • {shift.status || 'Scheduled'}</span>
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
  const [toast, setToast] = useState<{ show: boolean, message: string, type?: 'success' | 'warning' } | null>(null);
  const [showShiftsInline, setShowShiftsInline] = useState(false);
  const [ganttSearch, setGanttSearch] = useState('');
  
  // Cancellation States
  const [canceledTaskIds, setCanceledTaskIds] = useState<Set<string>>(new Set());
  const [cancelingTask, setCancelingTask] = useState<CancelTaskData | null>(null);

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
    setPanelMode('reschedule');
    setIsPanelOpen(true);
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

    shifts.forEach((shift) => {
      const leftVal = parseFloat(shift.left);
      const widthVal = parseFloat(shift.width);
      
      if (showShiftsInline) {
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
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-slate-800 relative">
      {toast?.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          {toast.type === 'warning' ? (
            <div className="bg-[#dbeafe] shadow-lg rounded-xl py-4 px-6 flex items-center gap-4 min-w-[520px] border border-blue-100/50">
              <div className="bg-[#005fb2] text-white rounded-full p-1 shrink-0 flex items-center justify-center w-6 h-6">
                <Info size={18} fill="currentColor" />
              </div>
              <p className="text-[#005fb2] text-[15px] font-medium flex-1 leading-tight tracking-tight">
                {toast.message}
              </p>
              <button onClick={() => setToast(null)} className="text-[#005fb2] hover:bg-blue-200/50 p-1.5 rounded-full transition-colors shrink-0">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="bg-[#c6f6d5] border border-[#9ae6b4] shadow-lg rounded-lg py-2.5 px-4 flex items-center gap-3 min-w-[400px]">
              <div className="bg-[#276749] text-white rounded-full p-0.5"><CheckCircle size={14} /></div>
              <p className="text-[#22543d] text-sm font-medium flex-1">{toast.message}</p>
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
          <div className="flex items-center gap-1 cursor-pointer text-[#0176d3] border-b-[3px] border-[#0176d3] h-full px-1 relative top-[1px]">Unified Scheduling <ChevronDown size={12} className="text-gray-600" /></div>
        </div>
      </nav>

      {/* Main Action Header */}
      <div className="bg-[#f3f3f3] px-6 py-4 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#e01a59] rounded-full flex items-center justify-center text-white shadow-sm border border-white/20"><Headset size={20} /></div>
          <h1 className="text-2xl font-bold text-[#001639] tracking-tight">Unified Scheduling</h1>
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
          <button
            onClick={() => setFilterPanelOpen(true)}
            className={`p-2 border rounded-lg shadow-sm transition-all flex items-center justify-center ml-1 ${
              (appointmentTypeFilters.length > 0 || resourceTypeFilters.length > 0 || skillFilters.length > 0 || showShiftsInline)
                ? 'bg-[#0176d3] border-[#0176d3] text-white hover:bg-[#005fb2]'
                : filterPanelOpen
                  ? 'bg-blue-50 border-[#0176d3] text-[#0176d3]'
                  : 'bg-white border-gray-300 text-[#0176d3] hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-1 p-2 border border-gray-300 bg-white rounded-lg shadow-sm text-[#0176d3] hover:bg-gray-50 transition-colors ml-1"><Settings size={18} /><ChevronDown size={12} /></button>
        </div>
      </div>

      <div className="bg-white border-y border-gray-200 px-6 py-2 flex items-center gap-4 z-20">
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
              <div key={resource.id} className={`flex border-b border-gray-100 group hover:bg-gray-50/30 transition-all ${showShiftsInline ? 'h-24' : 'h-16'}`}>
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

      <SidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        onFinish={handleScheduleComplete}
        mode={panelMode}
        prefillData={rescheduleData}
      />
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
          // Update legacy filters for backward compatibility with Gantt rendering logic
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
      {isPanelOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[45] transition-opacity" onClick={() => setIsPanelOpen(false)} />}
    </div>
  );
};

export default App;

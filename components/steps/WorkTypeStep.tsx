
import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  MessageSquare, 
  ClipboardCheck, 
  ChevronDown, 
  Check, 
  X,
  MapPin,
  Building2,
  Phone,
  Video
} from 'lucide-react';
import { SchedulingState, WorkType, ServiceMode } from '../../types';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

const ALL_WORK_TYPES = [
  'Installation',
  'Consultation',
  'Repair',
  'Example onsite + multi resource type',
  'Example In-Field Only',
  'Example non-Field Only',
  'Emergency Service',
  'Maintenance Check',
  'System Upgrade',
  'Relocation',
  'Inspection',
  'Training Session',
  'Hardware Delivery',
  'Network Setup',
  'Software Configuration',
  'Warranty Support',
  'Onboarding'
];

const SERVICE_MODES = [
  { 
    mode: ServiceMode.IN_FIELD, 
    icon: MapPin, 
    desc: 'At customer location'
  },
  { 
    mode: ServiceMode.ONSITE, 
    icon: Building2, 
    desc: 'At our branch'
  },
  { 
    mode: ServiceMode.PHONE, 
    icon: Phone, 
    desc: 'Voice call'
  },
  { 
    mode: ServiceMode.VIDEO, 
    icon: Video, 
    desc: 'Video session'
  },
];

export const WorkTypeStep: React.FC<Props> = ({ state, updateState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTypes = ALL_WORK_TYPES.filter(t => 
    t.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectWorkType = (type: string) => {
    let nextMode = state.serviceMode;
    let nextIsMultiResource = state.isMultiResource;

    // Logic for new specialized work type
    if (type === 'Example onsite + multi resource type') {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiResource = true;
    } else if (type === 'Example In-Field Only') {
      // Automatically choose In-Field since it's the only method available
      nextMode = ServiceMode.IN_FIELD;
    } else if (type === 'Example non-Field Only' && nextMode === ServiceMode.IN_FIELD) {
      nextMode = null;
    }

    updateState({ 
      workType: type as WorkType, 
      serviceMode: nextMode, 
      isMultiResource: nextIsMultiResource 
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleClearWorkType = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateState({ workType: null, serviceMode: null });
    setSearchTerm('');
  };

  const isModeDisabled = (mode: ServiceMode) => {
    if (state.workType === 'Example onsite + multi resource type') {
      return mode !== ServiceMode.ONSITE;
    }
    if (state.workType === 'Example In-Field Only') {
      return mode !== ServiceMode.IN_FIELD;
    }
    if (state.workType === 'Example non-Field Only') {
      return mode === ServiceMode.IN_FIELD;
    }
    return false;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold mb-1">Work Type & Method</h3>
      </div>

      {/* Work Type Selection */}
      <div className="relative" ref={dropdownRef}>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Selected Service</label>
        <div 
          className={`relative flex items-center bg-white border-2 rounded-xl transition-all shadow-sm ${
            isDropdownOpen ? 'border-[#001639] ring-1 ring-[#001639]' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="pl-3 text-gray-400 shrink-0">
            <Search size={18} />
          </div>
          
          <input 
            ref={inputRef}
            type="text" 
            placeholder={state.workType ? "" : "Search work types..."}
            className="w-full pl-2 pr-10 py-3 bg-transparent text-sm font-semibold focus:outline-none outline-none"
            value={searchTerm || (isDropdownOpen ? '' : (state.workType || ''))}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="absolute right-2 flex items-center gap-1">
            {state.workType && !searchTerm && (
              <button 
                onClick={handleClearWorkType}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="max-h-60 overflow-y-auto custom-scrollbar py-1 px-1">
              {filteredTypes.length > 0 ? (
                filteredTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSelectWorkType(type)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-[13px] font-bold flex items-center justify-between transition-all ${
                      state.workType === type 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type}</span>
                    {state.workType === type && <Check size={16} className="text-blue-600" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-400 italic">No matching work types found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Service Mode Selection - Appears after work type is chosen */}
      {state.workType && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block px-1">Service Method</label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_MODES.map((opt) => {
              const disabled = isModeDisabled(opt.mode);
              return (
                <button
                  key={opt.mode}
                  disabled={disabled}
                  onClick={() => !disabled && updateState({ serviceMode: opt.mode })}
                  className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all gap-2 relative ${
                    disabled 
                    ? 'border-gray-50 bg-gray-50 opacity-40 cursor-not-allowed'
                    : state.serviceMode === opt.mode
                      ? 'border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600/10'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    disabled 
                    ? 'bg-gray-200 text-gray-400'
                    : state.serviceMode === opt.mode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <opt.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${
                      disabled 
                      ? 'text-gray-400'
                      : state.serviceMode === opt.mode 
                        ? 'text-blue-900' 
                        : 'text-gray-900'
                    }`}>{opt.mode}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{opt.desc}</p>
                  </div>
                  {state.serviceMode === opt.mode && !disabled && (
                    <div className="absolute top-2 right-2">
                      <Check size={14} className="text-blue-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/30 text-[11px] text-blue-700 font-medium">
             <MessageSquare size={14} className="shrink-0 mt-0.5" />
             <p>Selected method determines available locations and resource slots in the following steps.</p>
          </div>
        </div>
      )}
    </div>
  );
};

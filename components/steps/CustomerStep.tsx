
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Check, 
  X, 
  User, 
  Settings2, 
  Link, 
  Mail, 
  Plus, 
  MessageSquare, 
  ChevronDown, 
  MapPin, 
  Building2, 
  Phone, 
  Video 
} from 'lucide-react';
import { SchedulingState, Customer, WorkType, ServiceMode } from '../../types';
import { MOCK_CUSTOMERS } from '../../constants';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
  onFastTrack: () => void;
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
  { mode: ServiceMode.IN_FIELD, icon: MapPin, desc: 'At customer location' },
  { mode: ServiceMode.ONSITE, icon: Building2, desc: 'At our branch' },
  { mode: ServiceMode.PHONE, icon: Phone, desc: 'Voice call' },
  { mode: ServiceMode.VIDEO, icon: Video, desc: 'Video session' },
];

export const CustomerStep: React.FC<Props> = ({ state, updateState, onFastTrack }) => {
  // Customer Selection State
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [activeCustomerIdx, setActiveCustomerIdx] = useState(-1);
  const [emailInput, setEmailInput] = useState('');
  const customerRef = useRef<HTMLDivElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Work Type Selection State
  const [workSearch, setWorkSearch] = useState('');
  const [isWorkOpen, setIsWorkOpen] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);
  const workInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
        setIsCustomerOpen(false);
      }
      if (workRef.current && !workRef.current.contains(event.target as Node)) {
        setIsWorkOpen(false);
        setWorkSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Customer Handlers
  const handleSelectCustomer = (customer: Customer) => {
    updateState({ customers: [customer] });
    setIsCustomerOpen(false);
    setCustomerSearch('');
  };

  const removeCustomer = (id: string) => {
    updateState({ customers: state.customers.filter(c => c.id !== id) });
  };

  const addEmail = () => {
    if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      const currentEmails = state.additionalEmails || [];
      if (!currentEmails.includes(emailInput)) {
        updateState({ additionalEmails: [...currentEmails, emailInput] });
      }
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    updateState({ additionalEmails: (state.additionalEmails || []).filter(e => e !== email) });
  };

  // Work Type Handlers
  const handleSelectWorkType = (type: string) => {
    let nextMode = state.serviceMode;
    let nextIsMultiResource = state.isMultiResource;

    if (type === 'Example onsite + multi resource type') {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiResource = true;
    } else if (type === 'Example In-Field Only') {
      nextMode = ServiceMode.IN_FIELD;
    } else if (type === 'Example non-Field Only' && nextMode === ServiceMode.IN_FIELD) {
      nextMode = null;
    }

    updateState({ 
      workType: type as WorkType, 
      serviceMode: nextMode, 
      isMultiResource: nextIsMultiResource 
    });
    setWorkSearch('');
    setIsWorkOpen(false);
  };

  const isModeDisabled = (mode: ServiceMode) => {
    if (state.workType === 'Example onsite + multi resource type') return mode !== ServiceMode.ONSITE;
    if (state.workType === 'Example In-Field Only') return mode !== ServiceMode.IN_FIELD;
    if (state.workType === 'Example non-Field Only') return mode === ServiceMode.IN_FIELD;
    return false;
  };

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredWorkTypes = ALL_WORK_TYPES.filter(t => 
    t.toLowerCase().includes(workSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 pb-4">
      {/* SECTION 1: CUSTOMER */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-1">Customer Selection</h3>
        </div>

        <div className="relative" ref={customerRef}>
          <div 
            className={`flex flex-wrap items-center gap-1.5 bg-white border-2 rounded-xl px-3 py-2 transition-all shadow-sm ${isCustomerOpen ? 'border-[#001639] ring-1 ring-[#001639]' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => customerInputRef.current?.focus()}
          >
            <div className="bg-gray-700 text-white p-1 rounded-md shrink-0 transition-colors">
              <User size={18} />
            </div>
            
            {state.customers.map(c => (
              <div key={c.id} className="bg-blue-100 text-blue-700 pl-2 pr-1 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 border border-blue-200 animate-in zoom-in-95">
                {c.name}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeCustomer(c.id); }}
                  className="p-0.5 hover:bg-blue-200 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <input 
              ref={customerInputRef}
              type="text" 
              placeholder={state.customers.length === 0 ? "Search for a customer..." : ""}
              className="flex-1 min-w-[120px] px-1 py-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-gray-400"
              value={customerSearch}
              onFocus={() => setIsCustomerOpen(true)}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setIsCustomerOpen(true);
                setActiveCustomerIdx(-1);
              }}
            />
            <Search className="text-gray-400 shrink-0" size={18} />
          </div>

          {isCustomerOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar py-2 px-1">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => {
                    const isSelected = state.customers.some(c => c.id === customer.id);
                    return (
                      <button
                        key={customer.id}
                        onMouseEnter={() => setActiveCustomerIdx(index)}
                        onClick={() => handleSelectCustomer(customer)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] flex items-center gap-3 transition-all ${
                          activeCustomerIdx === index 
                          ? 'bg-[#001639] text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-5 flex justify-center shrink-0">
                          {isSelected && <Check size={16} className={activeCustomerIdx === index ? 'text-white' : 'text-blue-600'} />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{customer.name}</p>
                          <p className={`text-[11px] ${activeCustomerIdx === index ? 'text-gray-300' : 'text-gray-400'}`}>
                            {customer.email}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-400 italic">No contacts found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-1 flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${state.isMultiCustomer ? 'bg-blue-600' : 'bg-gray-300'}`}>
               <input 
                type="checkbox" 
                className="sr-only"
                checked={state.isMultiCustomer}
                onChange={(e) => updateState({ isMultiCustomer: e.target.checked })}
              />
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${state.isMultiCustomer ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
              Group Appointment
            </span>
          </label>
        </div>

        {state.isMultiCustomer && (
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-5 shadow-sm text-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 size={16} className="text-blue-600" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Scheduling Requirements</p>
            </div>
            <div className="space-y-4">
               <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600">Invite Attendees via Email</p>
                  <div className="flex gap-2">
                     <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                          type="email" 
                          placeholder="guest@example.com"
                          className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all text-xs"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                        />
                     </div>
                     <button onClick={addEmail} className="p-2 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 text-blue-600 transition-all shadow-sm active:scale-95"><Plus size={18} /></button>
                  </div>
                  {state.additionalEmails && state.additionalEmails.length > 0 && (
                     <div className="flex flex-wrap gap-1.5 mt-2">
                        {state.additionalEmails.map(email => (
                           <div key={email} className="bg-white border border-gray-200 pl-2 pr-1 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 animate-in scale-95">
                              <span className="truncate max-w-[150px]">{email}</span>
                              <button onClick={() => removeEmail(email)} className="p-0.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"><X size={10} /></button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
               <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Link size={14} className="text-gray-400" />
                  <span className="text-[13px] text-gray-700 font-semibold">Allow self-signup via link</span>
                </div>
                <button onClick={() => updateState({ isOpenForSigning: !state.isOpenForSigning })} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${state.isOpenForSigning ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${state.isOpenForSigning ? 'translate-x-4.5' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" checked={state.minParticipantsEnabled} onChange={(e) => updateState({ minParticipantsEnabled: e.target.checked })} />
                        <span className="text-[11px] font-bold text-gray-500">Min Attendees</span>
                     </label>
                     <input type="number" min="1" disabled={!state.minParticipantsEnabled} className={`w-full p-2 border-2 rounded-xl text-xs font-bold text-center ${state.minParticipantsEnabled ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-100 text-gray-300'}`} value={state.minParticipants || 1} onChange={(e) => updateState({ minParticipants: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-1.5">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" checked={state.maxParticipantsEnabled} onChange={(e) => updateState({ maxParticipantsEnabled: e.target.checked })} />
                        <span className="text-[11px] font-bold text-gray-500">Max Attendees</span>
                     </label>
                     <input type="number" min="1" disabled={!state.maxParticipantsEnabled} className={`w-full p-2 border-2 rounded-xl text-xs font-bold text-center ${state.maxParticipantsEnabled ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-100 text-gray-300'}`} value={state.maxParticipants || 10} onChange={(e) => updateState({ maxParticipants: parseInt(e.target.value) || 10 })} />
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* SECTION 2: WORK TYPE & METHOD */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Work Type & Method</h3>
        </div>

        <div className="relative" ref={workRef}>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Selected Service</label>
          <div 
            className={`relative flex items-center bg-white border-2 rounded-xl transition-all shadow-sm ${isWorkOpen ? 'border-[#001639] ring-1 ring-[#001639]' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => workInputRef.current?.focus()}
          >
            <div className="pl-3 text-gray-400 shrink-0"><Search size={18} /></div>
            <input 
              ref={workInputRef}
              type="text" 
              placeholder={state.workType ? "" : "Search work types..."}
              className="w-full pl-2 pr-10 py-3 bg-transparent text-sm font-semibold focus:outline-none outline-none"
              value={workSearch || (isWorkOpen ? '' : (state.workType || ''))}
              onFocus={() => setIsWorkOpen(true)}
              onChange={(e) => setWorkSearch(e.target.value)}
            />
            <div className="absolute right-2 flex items-center gap-1">
              {state.workType && !workSearch && (
                <button onClick={(e) => { e.stopPropagation(); updateState({ workType: null, serviceMode: null }); }} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"><X size={16} /></button>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); setIsWorkOpen(!isWorkOpen); }} className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown size={18} className={`transition-transform duration-200 ${isWorkOpen ? 'rotate-180' : ''}`} /></button>
            </div>
          </div>
          {isWorkOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="max-h-60 overflow-y-auto custom-scrollbar py-1 px-1">
                {filteredWorkTypes.length > 0 ? (
                  filteredWorkTypes.map((type) => (
                    <button key={type} onClick={() => handleSelectWorkType(type)} className={`w-full text-left px-4 py-3 rounded-lg text-[13px] font-bold flex items-center justify-between transition-all ${state.workType === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <span>{type}</span>
                      {state.workType === type && <Check size={16} className="text-blue-600" />}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center"><p className="text-sm text-gray-400 italic">No matching work types found</p></div>
                )}
              </div>
            </div>
          )}
        </div>

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
                    className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all gap-2 relative ${disabled ? 'border-gray-50 bg-gray-50 opacity-40 cursor-not-allowed' : state.serviceMode === opt.mode ? 'border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600/10' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${disabled ? 'bg-gray-200 text-gray-400' : state.serviceMode === opt.mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}><opt.icon size={20} /></div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${disabled ? 'text-gray-400' : state.serviceMode === opt.mode ? 'text-blue-900' : 'text-gray-900'}`}>{opt.mode}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{opt.desc}</p>
                    </div>
                    {state.serviceMode === opt.mode && !disabled && <div className="absolute top-2 right-2"><Check size={14} className="text-blue-600" /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

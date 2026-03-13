
import React from 'react';
import { MapPin, Building2, Phone, Video, Info } from 'lucide-react';
import { SchedulingState, ServiceMode } from '../../types';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

export const ServiceModeStep: React.FC<Props> = ({ state, updateState }) => {
  const options = [
    { 
      mode: ServiceMode.IN_FIELD, 
      icon: MapPin, 
      desc: 'Technician travels to customer location.'
    },
    { 
      mode: ServiceMode.ONSITE, 
      icon: Building2, 
      desc: 'Customer comes to your physical branch.'
    },
    { 
      mode: ServiceMode.PHONE, 
      icon: Phone, 
      desc: 'Remote meeting via voice call.'
    },
    { 
      mode: ServiceMode.VIDEO, 
      icon: Video, 
      desc: 'Remote meeting via video conferencing.'
    },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold mb-1">Service Mode</h3>
        <p className="text-gray-500 text-sm">How will this appointment take place?</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <div 
            key={opt.mode}
            onClick={() => updateState({ serviceMode: opt.mode })}
            className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
              state.serviceMode === opt.mode 
              ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50 shadow-sm' 
              : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <div className={`p-3 rounded-xl transition-colors ${state.serviceMode === opt.mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <opt.icon size={24} />
            </div>
            <div>
              <p className={`font-bold transition-colors ${state.serviceMode === opt.mode ? 'text-blue-900' : 'text-gray-900'}`}>{opt.mode}</p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
            {state.serviceMode === opt.mode && (
              <div className="ml-auto w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

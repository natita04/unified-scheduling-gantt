
import React from 'react';
import { MapPin, Search, Navigation, ChevronDown } from 'lucide-react';
import { SchedulingState } from '../../types';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

export const LocationStep: React.FC<Props> = ({ state, updateState }) => {
  const branches = [
    { name: 'Downtown HQ', address: '101 Market St, San Francisco, CA' },
    { name: 'Soma Service Center', address: '455 Folsom St, San Francisco, CA' },
    { name: 'Bay View Hub', address: '89 Mission St, San Francisco, CA' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold mb-1">Choose Location</h3>
        <p className="text-gray-500 text-sm">Which office should the customer visit?</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-[2] relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Location</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search location or zip code" 
              title="Search location or zip code"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={state.location}
              onChange={(e) => updateState({ location: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex-1 relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Within</label>
          <div className="relative">
            <select 
              className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm font-medium cursor-pointer"
              value={state.radius || '10 miles'}
              onChange={(e) => updateState({ radius: e.target.value })}
            >
              <option>5 miles</option>
              <option>10 miles</option>
              <option>20 miles</option>
              <option>50 miles</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Branches</p>
        {branches.map((branch) => (
          <div 
            key={branch.name}
            onClick={() => updateState({ location: branch.address })}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
              state.location === branch.address 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${state.location === branch.address ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{branch.name}</p>
              <p className="text-xs text-gray-500">{branch.address}</p>
            </div>
            <button className="ml-auto text-blue-600 hover:text-blue-800 p-1">
              <Navigation size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

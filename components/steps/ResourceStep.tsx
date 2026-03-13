
import React, { useState } from 'react';
import { Search, UserPlus, Users, ShieldCheck } from 'lucide-react';
import { SchedulingState, Resource } from '../../types';
import { MOCK_RESOURCES } from '../../constants';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

export const ResourceStep: React.FC<Props> = ({ state, updateState }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toggleResource = (resource: Resource) => {
    const isSelected = state.resources.some(r => r.id === resource.id);
    if (isSelected) {
      updateState({ resources: state.resources.filter(r => r.id !== resource.id) });
    } else {
      updateState({ resources: [...state.resources, resource] });
    }
  };

  const filtered = MOCK_RESOURCES.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold mb-1">Resource Allocation</h3>
          <p className="text-gray-500 text-sm">Assign staff or assets for this task.</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
          {state.resources.length} Selected
        </div>
      </div>

      {state.isMultiCustomer && (
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-orange-600" size={18} />
            <p className="text-sm font-bold text-orange-900">Capacity Control</p>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number" 
              className="w-16 p-2 border border-orange-200 rounded-lg text-center font-bold"
              value={state.capacity || 10}
              onChange={(e) => updateState({ capacity: parseInt(e.target.value) })}
            />
            <p className="text-xs text-orange-700 leading-tight">Max attendees allowed per resource for this multi-customer slot.</p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search team members..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filtered.map(resource => {
          const isSelected = state.resources.some(r => r.id === resource.id);
          return (
            <div 
              key={resource.id}
              onClick={() => toggleResource(resource)}
              className={`p-3 flex items-center gap-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="relative">
                <img src={resource.avatar} alt={resource.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                {isSelected && (
                   <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                      <ShieldCheck size={12} />
                   </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{resource.name}</p>
                <p className="text-xs text-gray-500">{resource.role}</p>
              </div>
              {isSelected ? (
                <button className="text-blue-600 font-bold text-xs uppercase">Selected</button>
              ) : (
                <button className="text-gray-400 group-hover:text-blue-600 font-bold text-xs uppercase flex items-center gap-1">
                  <UserPlus size={14} /> Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

interface FilterCategoryProps {
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterCategory: React.FC<FilterCategoryProps> = ({ title, description, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border transition-all ${
      isActive 
        ? 'bg-orange-50 border-orange-200' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}
  >
    <p className="text-[13px] font-bold text-gray-800">{title}</p>
    <p className={`text-[11px] ${isActive ? 'text-orange-700 font-medium' : 'text-gray-500'}`}>{description}</p>
  </button>
);

interface PopoverProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onSelect: (options: string[]) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

const FilterPopover: React.FC<PopoverProps> = ({ title, options, selectedOptions, onSelect, onClose, anchorRect }) => {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedOptions);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (tempSelected.includes(option)) {
      setTempSelected(tempSelected.filter(o => o !== option));
    } else {
      setTempSelected([...tempSelected, option]);
    }
  };

  if (!anchorRect) return null;

  return (
    <div 
      className="fixed z-[100] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-gray-200 p-6 w-[320px] animate-in fade-in zoom-in-95 duration-200"
      style={{ 
        top: anchorRect.top, 
        left: anchorRect.left - 340 // Position to the left of the panel
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Operator</label>
          <div className="relative">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
              equal
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Value</label>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700"
            >
              {tempSelected.length === 0 ? '0 options selected' : `${tempSelected.length} option${tempSelected.length > 1 ? 's' : ''} selected`}
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 overflow-hidden">
                {options.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className={tempSelected.includes(option) ? 'text-blue-600 font-medium' : 'text-gray-700'}>{option}</span>
                    {tempSelected.includes(option) && <Check size={14} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={() => setTempSelected([])}
            className="text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={() => {
              onSelect(tempSelected);
              onClose();
            }}
            className="px-6 py-1.5 bg-white border border-gray-300 rounded-full text-[13px] font-bold text-blue-600 hover:bg-gray-50 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showShifts: boolean;
  onShowShiftsChange: (val: boolean) => void;
  appointmentTypes: string[];
  onAppointmentTypesChange: (val: string[]) => void;
  resourceTypes: string[];
  onResourceTypesChange: (val: string[]) => void;
  skills: string[];
  onSkillsChange: (val: string[]) => void;
  onSave: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  isOpen, 
  onClose, 
  showShifts, 
  onShowShiftsChange,
  appointmentTypes,
  onAppointmentTypesChange,
  resourceTypes,
  onResourceTypesChange,
  skills,
  onSkillsChange,
  onSave
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      const rect = categoryRefs.current[category]?.getBoundingClientRect();
      if (rect) {
        setAnchorRect(rect);
        setActiveCategory(category);
      }
    }
  };

  const clearAll = () => {
    onAppointmentTypesChange([]);
    onResourceTypesChange([]);
    onSkillsChange([]);
    setActiveCategory(null);
  };

  const getCategoryDescription = (title: string, selected: string[]) => {
    if (selected.length === 0) return `Showing all ${title.toLowerCase()}s`;
    return `equals ${selected.join(', ')}`;
  };

  return (
    <>
      <div className={`bg-white border-l border-gray-200 shadow-xl flex flex-col transition-all duration-300 ease-out overflow-hidden shrink-0 self-stretch ${isOpen ? 'w-80' : 'w-0'}`}>
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(appointmentTypes.length > 0 || resourceTypes.length > 0 || skills.length > 0) ? (
              <button 
                onClick={onClose}
                className="px-4 py-1.5 border border-gray-300 rounded-full text-[13px] font-bold text-blue-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            ) : (
              <h2 className="font-bold text-lg text-[#001639]">Filters</h2>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(appointmentTypes.length > 0 || resourceTypes.length > 0 || skills.length > 0) ? (
              <button 
                onClick={() => {
                  onSave();
                  onClose();
                }}
                className="px-6 py-1.5 bg-blue-600 text-white rounded-full text-[13px] font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                Save
              </button>
            ) : (
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="showShifts" 
              checked={showShifts} 
              onChange={(e) => onShowShiftsChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showShifts" className="text-sm font-medium text-gray-700">
              {showShifts ? 'Showing Shifts' : 'Show Shifts'}
            </label>
          </div>

          <div className="space-y-3">
            <div ref={el => categoryRefs.current['Appointment Type'] = el}>
              <FilterCategory 
                title="Appointment Type" 
                description={getCategoryDescription('appointment type', appointmentTypes)}
                isActive={appointmentTypes.length > 0}
                onClick={() => handleCategoryClick('Appointment Type')}
              />
            </div>
            <div ref={el => categoryRefs.current['Resource Type'] = el}>
              <FilterCategory 
                title="Resource Type" 
                description={getCategoryDescription('resource type', resourceTypes)}
                isActive={resourceTypes.length > 0}
                onClick={() => handleCategoryClick('Resource Type')}
              />
            </div>
            <div ref={el => categoryRefs.current['Skills'] = el}>
              <FilterCategory 
                title="Skills" 
                description={getCategoryDescription('skill', skills)}
                isActive={skills.length > 0}
                onClick={() => handleCategoryClick('Skills')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={clearAll}
              className="text-[13px] font-bold text-blue-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      {activeCategory === 'Appointment Type' && (
        <FilterPopover 
          title="Appointment Type"
          options={['Onsite', 'Virtual', 'In-Field']}
          selectedOptions={appointmentTypes}
          onSelect={onAppointmentTypesChange}
          onClose={() => setActiveCategory(null)}
          anchorRect={anchorRect}
        />
      )}
      {activeCategory === 'Resource Type' && (
        <FilterPopover 
          title="Resource Type"
          options={['People', 'Assets']}
          selectedOptions={resourceTypes}
          onSelect={onResourceTypesChange}
          onClose={() => setActiveCategory(null)}
          anchorRect={anchorRect}
        />
      )}
      {activeCategory === 'Skills' && (
        <FilterPopover 
          title="Skills"
          options={['Repair', 'Installation', 'Maintenance', 'Consultation']}
          selectedOptions={skills}
          onSelect={onSkillsChange}
          onClose={() => setActiveCategory(null)}
          anchorRect={anchorRect}
        />
      )}

    </>
  );
};

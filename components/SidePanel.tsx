
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Step, SchedulingState, ServiceMode, WorkType } from '../types';
import { STEP_LABELS } from '../constants';
import { CustomerStep } from './steps/CustomerStep';
import { LocationStep } from './steps/LocationStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { ReviewStep } from './steps/ReviewStep';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: (state: SchedulingState) => void;
  mode?: 'create' | 'reschedule';
  prefillData?: Partial<SchedulingState> | null;
}

const INITIAL_STATE: SchedulingState = {
  isMultiCustomer: false,
  customers: [],
  isOpenForSigning: false,
  workType: null,
  serviceMode: null,
  resources: [],
  location: '',
  radius: '10 miles',
  date: '',
  timeSlot: '',
  isRecurring: false,
  fastTrackUsed: false,
  minParticipants: 1,
  maxParticipants: 10,
  minParticipantsEnabled: false,
  maxParticipantsEnabled: false,
  isMultiResource: false,
  additionalEmails: [],
};

const formatDisplayDate = (dateStr?: string) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  try {
    const parts = dateStr.split(' ');
    if (parts.length < 2) return dateStr;
    
    const datePart = parts[0];
    const timePart = parts[1];
    const ampm = parts[2] || '';
    
    const dateParts = datePart.split(/[/|-]/);
    if (dateParts.length !== 3) return dateStr;
    
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

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, onFinish, mode = 'create', prefillData }) => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.CUSTOMER_AND_WORK);
  const [state, setState] = useState<SchedulingState>(INITIAL_STATE);

  // When panel opens, set initial step based on mode and apply pre-fill data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'reschedule') {
        setCurrentStep(Step.SCHEDULING);
        if (prefillData) {
          setState({ ...INITIAL_STATE, ...prefillData });
        }
      } else {
        setCurrentStep(Step.CUSTOMER_AND_WORK);
        setState(INITIAL_STATE);
      }
    }
  }, [isOpen, mode, prefillData]);

  const handleNext = () => {
    let nextStep = currentStep + 1;

    // Dynamic Branching Logic
    if (currentStep === Step.CUSTOMER_AND_WORK) {
      if (state.serviceMode === ServiceMode.ONSITE) {
        nextStep = Step.LOCATION;
      } else {
        nextStep = Step.SCHEDULING;
      }
    }

    if (nextStep <= Step.FINALIZATION) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;

    // Inverse Dynamic Branching Logic
    if (currentStep === Step.SCHEDULING) {
      if (state.serviceMode === ServiceMode.ONSITE) {
        prevStep = Step.LOCATION;
      } else {
        prevStep = Step.CUSTOMER_AND_WORK;
      }
    }

    if (prevStep >= Step.CUSTOMER_AND_WORK) {
      setCurrentStep(prevStep);
    }
  };

  const handleFinish = async () => {
    if (onFinish) {
      onFinish(state);
    }
    // Small delay to ensure state reset happens after transition
    setTimeout(() => {
      setCurrentStep(Step.CUSTOMER_AND_WORK);
      setState(INITIAL_STATE);
    }, 300);
  };

  const updateState = (updates: Partial<SchedulingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.CUSTOMER_AND_WORK:
        return <CustomerStep state={state} updateState={updateState} onFastTrack={() => {
          updateState({ 
            workType: WorkType.REPAIR, 
            serviceMode: ServiceMode.IN_FIELD, 
            fastTrackUsed: true 
          });
          setCurrentStep(Step.SCHEDULING);
        }} />;
      case Step.LOCATION:
        return <LocationStep state={state} updateState={updateState} />;
      case Step.SCHEDULING:
        return <SchedulingStep state={state} updateState={updateState} />;
      case Step.FINALIZATION:
        return <ReviewStep state={state} updateState={updateState} />;
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === Step.CUSTOMER_AND_WORK) return state.customers.length === 0 || !state.workType || !state.serviceMode;
    if (currentStep === Step.LOCATION) return !state.location;
    if (currentStep === Step.SCHEDULING) return state.resources.length === 0 || !state.date || !state.timeSlot;
    return false;
  };

  // Determine if we should show 'Cancel' instead of 'Back'
  const isAtStartOfFlow = mode === 'reschedule' ? currentStep === Step.SCHEDULING : currentStep === Step.CUSTOMER_AND_WORK;

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50/80 sticky top-0 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {mode === 'reschedule' ? 'Reschedule Appointment' : 'Create Appointment'}
              </h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {currentStep === Step.SCHEDULING ? 'Resources & Slots' : STEP_LABELS[currentStep]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {mode === 'reschedule' && state.currentAppointment && (
          <>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">BEFORE</p>
            <div className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Appointment</p>
                <h3 className="text-[14px] font-bold text-blue-600 leading-tight">
                  {state.currentAppointment.title} • {state.currentAppointment.id}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account</p>
                  <p className="text-[13px] font-semibold text-gray-800">{state.currentAppointment.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resource</p>
                  <p className="text-[13px] font-semibold text-gray-800">{state.currentAppointment.resourceName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled Start</p>
                  <p className="text-[13px] font-semibold text-gray-800">{formatDisplayDate(state.currentAppointment.startTime)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled End</p>
                  <p className="text-[13px] font-semibold text-gray-800">{formatDisplayDate(state.currentAppointment.endTime)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-[13px] font-semibold text-gray-800">{state.currentAppointment.location}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Appointment Type</p>
                  <p className="text-[13px] font-semibold text-gray-800 uppercase">{state.currentAppointment.type}</p>
                </div>
              </div>
            </div>
            {currentStep === Step.FINALIZATION && (
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">AFTER</p>
            )}
          </>
        )}
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
        <div className="flex gap-3">
          {isAtStartOfFlow ? (
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button 
              onClick={handleBack}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          
          {currentStep === Step.FINALIZATION ? (
             <button 
              onClick={handleFinish}
              className="flex-[2] px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              {mode === 'reschedule' ? 'Reschedule' : 'Schedule'}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              disabled={isNextDisabled()}
              className={`flex-[2] px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${
                isNextDisabled() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

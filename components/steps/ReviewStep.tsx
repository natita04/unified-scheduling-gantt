
import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Wrench, 
  Zap, 
  UserCheck, 
  Phone, 
  Video, 
  Building2, 
  Activity,
  ExternalLink,
  Link as LinkIcon,
  UserMinus,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { SchedulingState, ServiceMode } from '../../types';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

export const ReviewStep: React.FC<Props> = ({ state, updateState }) => {
  const SummaryItem = ({ icon: Icon, label, value, color, isLink, fullWidth }: { icon: any, label: string, value: string, color: string, isLink?: boolean, fullWidth?: boolean }) => (
    <div className={`flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md ${fullWidth ? 'col-span-full' : ''}`}>
      <div className={`${color} bg-opacity-10 p-2.5 rounded-lg shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        {isLink ? (
          <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline truncate">
            {value}
            <ExternalLink size={12} className="shrink-0" />
          </a>
        ) : (
          <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
        )}
      </div>
    </div>
  );

  const getModeDetails = () => {
    const customerName = state.customers[0]?.name || 'Customer';
    const customerAddress = state.customers[0]?.address || 'Primary Service Address';

    switch (state.serviceMode) {
      case ServiceMode.PHONE:
        return {
          label: 'Communication Details',
          value: `Technician will call ${customerName} at +1 (555) 235-8592`,
          icon: Phone,
          color: 'text-blue-500',
          isLink: false
        };
      case ServiceMode.VIDEO:
        return {
          label: 'Session Link',
          value: 'https://zoom.us/j/84291039452',
          icon: Video,
          color: 'text-indigo-500',
          isLink: true
        };
      case ServiceMode.IN_FIELD:
        return {
          label: 'Service Location',
          value: customerAddress,
          icon: MapPin,
          color: 'text-red-500',
          isLink: false
        };
      case ServiceMode.ONSITE:
        return {
          label: 'Branch Location',
          value: state.location || 'Branch Office',
          icon: Building2,
          color: 'text-orange-500',
          isLink: false
        };
      default:
        return {
          label: 'Location',
          value: state.location || 'Not Specified',
          icon: MapPin,
          color: 'text-gray-500',
          isLink: false
        };
    }
  };

  const modeInfo = getModeDetails();
  const ModeIcon = modeInfo.icon;

  const isReschedule = !!state.currentAppointment;
  
  // Helper to check if a value has changed compared to current appointment
  const hasChanged = (key: 'date' | 'time' | 'resource' | 'location' | 'type') => {
    if (!isReschedule || !state.currentAppointment) return true;
    
    switch (key) {
      case 'date':
        return state.date && !state.currentAppointment.startTime.includes(state.date);
      case 'time':
        return state.timeSlot && !state.currentAppointment.startTime.includes(state.timeSlot.split(' - ')[0]);
      case 'resource':
        const newResourceNames = state.resources.map(r => r.name).join(', ');
        return newResourceNames !== state.currentAppointment.resourceName;
      case 'location':
        return state.location !== state.currentAppointment.location;
      case 'type':
        return state.serviceMode !== state.currentAppointment.type;
      default:
        return true;
    }
  };

  const formatNewAppointmentDate = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return 'N/A';
    try {
      // dateStr is like "Fri, Apr 18, 2025"
      // timeStr is like "19:00"
      // we want "Fri, Apr 18 at 07:00 PM"
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return `${dateStr} ${timeStr}`;

      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      
      // Convert 24h to 12h
      let [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const strTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;
      
      return `${weekday}, ${monthName} ${day} at ${strTime}`;
    } catch (e) {
      return `${dateStr} ${timeStr}`;
    }
  };

  const renderRescheduleSummary = () => {
    const dateChanged = hasChanged('date');
    const timeChanged = hasChanged('time');
    const resourceChanged = hasChanged('resource');

    return (
      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          {(dateChanged || timeChanged) && (
            <>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Scheduled Start</p>
                <p className="text-[13px] font-semibold text-gray-800">
                  {formatNewAppointmentDate(state.date, state.timeSlot.split(' - ')[0])}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Scheduled End</p>
                <p className="text-[13px] font-semibold text-gray-800">
                  {formatNewAppointmentDate(state.date, state.timeSlot.split(' - ')[1])}
                </p>
              </div>
            </>
          )}
          
          {resourceChanged && (
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Resource(s)</p>
              <p className="text-[13px] font-semibold text-gray-800">
                {state.resources.length > 0 ? state.resources.map(r => r.name).join(', ') : 'No resource assigned'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      <div className="space-y-3">
        {state.fastTrackUsed && (
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200 text-xs font-bold shadow-sm">
             <Zap size={14} className="fill-yellow-500 text-yellow-500" />
             Optimized via Fast Track booking
          </div>
        )}
      </div>

      {isReschedule ? (
        renderRescheduleSummary()
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <SummaryItem 
            icon={Activity} 
            label="Appointment Type" 
            value={state.serviceMode || 'N/A'} 
            color="text-emerald-600" 
          />

          <SummaryItem 
            icon={Users} 
            label="Account" 
            value={state.customers.length > 0 ? state.customers.map(c => c.name).join(', ') : 'No account selected'} 
            color="text-blue-600" 
          />

          <SummaryItem 
            icon={Wrench} 
            label="Work Type" 
            value={state.workType || 'N/A'} 
            color="text-purple-600" 
          />

          <SummaryItem 
            icon={UserCheck} 
            label="Assigned Resource(s)" 
            value={state.resources.length > 0 ? state.resources.map(r => r.name).join(', ') : 'No resource assigned'} 
            color="text-sky-600" 
          />

          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryItem 
              icon={Calendar} 
              label="Date" 
              value={state.date || 'N/A'} 
              color="text-orange-600" 
            />
            <SummaryItem 
              icon={Clock} 
              label="Time" 
              value={state.timeSlot || 'N/A'} 
              color="text-green-600" 
            />
          </div>

          {/* Dynamic Location/Communication Details */}
          <SummaryItem 
            icon={ModeIcon} 
            label={modeInfo.label} 
            value={modeInfo.value} 
            color={modeInfo.color}
            isLink={modeInfo.isLink}
          />

          {/* Participant Requirements */}
          {(state.minParticipantsEnabled || state.maxParticipantsEnabled) && (
            <div className="grid grid-cols-2 gap-3">
              {state.minParticipantsEnabled && (
                <SummaryItem 
                  icon={UserMinus} 
                  label="Min Participants" 
                  value={state.minParticipants?.toString() || '1'} 
                  color="text-slate-600" 
                />
              )}
              {state.maxParticipantsEnabled && (
                <SummaryItem 
                  icon={UserPlus} 
                  label="Max Participants" 
                  value={state.maxParticipants?.toString() || '10'} 
                  color="text-slate-600" 
                />
              )}
            </div>
          )}

          {/* Public Signup Link */}
          {state.isOpenForSigning && (
            <div className="animate-in zoom-in-95 duration-200">
              <SummaryItem 
                icon={LinkIcon} 
                label="Public Signup Link" 
                value="https://portal.dispatch.pro/signup/SA-77291" 
                color="text-blue-600"
                isLink={true}
                fullWidth={true}
              />
            </div>
          )}
        </div>
      )}

      <div className="p-5 bg-[#f0f9ff] border border-[#dbeafe] rounded-2xl flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="shrink-0 p-1.5 bg-white rounded-lg shadow-xs border border-blue-50">
          <MessageSquare size={18} className="text-[#2563eb]" />
        </div>
        <p className="text-[#1d4ed8] text-[12px] font-medium leading-relaxed">
          {isReschedule 
            ? "The appointment will be rescheduled and the customer will be notified via SMS."
            : "Upon scheduling, your customer(s) will be notified via SMS."}
        </p>
      </div>
    </div>
  );
};

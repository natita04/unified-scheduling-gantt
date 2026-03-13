
export enum ServiceMode {
  IN_FIELD = 'In-Field',
  ONSITE = 'Onsite',
  PHONE = 'Phone',
  VIDEO = 'Video'
}

export enum WorkType {
  INSTALLATION = 'Installation',
  CONSULTATION = 'Consultation',
  REPAIR = 'Repair',
  INSPECTION = 'Quick Inspection',
  COMPLEX_REPAIR = 'Complex Repair',
  STRATEGY = 'Strategy Session',
  WORKSHOP = 'Full Workshop',
  FOLLOW_UP = 'Follow-up',
  ONSITE_MULTI = 'Example onsite + multi resource type',
  IN_FIELD_ONLY = 'Example In-Field Only',
  NON_FIELD_ONLY = 'Example non-Field Only'
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  address?: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface RecurrenceConfig {
  interval: number;
  unit: 'day' | 'week' | 'month';
  days: string[]; // ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  endType: 'never' | 'on' | 'after';
  endDate: string;
  occurrences: number;
}

export interface SchedulingState {
  isMultiCustomer: boolean;
  customers: Customer[];
  isOpenForSigning: boolean;
  workType: WorkType | null;
  serviceMode: ServiceMode | null;
  resources: Resource[];
  capacity?: number;
  minParticipants?: number;
  maxParticipants?: number;
  minParticipantsEnabled: boolean;
  maxParticipantsEnabled: boolean;
  location: string;
  radius?: string;
  date: string;
  timeSlot: string;
  isRecurring: boolean;
  recurrenceConfig?: RecurrenceConfig;
  fastTrackUsed: boolean;
  isMultiResource: boolean;
  additionalEmails?: string[];
  currentAppointment?: {
    id: string;
    title: string;
    customerName: string;
    resourceName: string;
    startTime: string;
    endTime: string;
    location: string;
    type: string;
  };
}

export enum Step {
  CUSTOMER_AND_WORK = 0,
  LOCATION = 1,
  SCHEDULING = 2,
  FINALIZATION = 3
}


import React from 'react';
import { Customer, Resource, WorkType, ServiceMode } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', address: '30 Market Street, San Francisco, CA' },
  { id: '2', name: 'Global Tech', email: 'hello@globaltech.io', address: '123 Tech Lane, Austin, TX' },
  { id: '3', name: 'Chris Temple', email: 'chris.temple@gmail.com', address: '45 Oak Ave, Seattle, WA' },
  { id: '4', name: 'Lori Stanley', email: 'lori.stanley@outlook.com', address: '88 Maple St, Boston, MA' },
];

export const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Brooke Weaver', role: 'Field Technician', avatar: 'https://picsum.photos/seed/brooke/100/100' },
  { id: 'r2', name: 'Joe Bautista', role: 'Field Technician', avatar: 'https://picsum.photos/seed/joe/100/100' },
  { id: 'r3', name: 'Lawerence Vogt', role: 'Field Technician', avatar: 'https://picsum.photos/seed/lawrence/100/100' },
  { id: 'r4', name: 'Lori Stanley', role: 'Field Technician', avatar: 'https://picsum.photos/seed/lori/100/100' },
  { id: 'r5', name: 'Nathen Mora', role: 'Field Technician', avatar: 'https://picsum.photos/seed/nathen/100/100' },
  { id: 'r6', name: 'Stephanie Harris', role: 'Field Technician', avatar: 'https://picsum.photos/seed/stephanie/100/100' },
  { id: 'r7', name: 'Sam Brown', role: 'Field Technician', avatar: 'https://picsum.photos/seed/sam/100/100' },
  { id: 'r8', name: 'Jim Matthews', role: 'Field Technician', avatar: 'https://picsum.photos/seed/jim/100/100' },
  { id: 'r9', name: 'Conference Room A', role: 'Room', avatar: 'ROOM' },
  { id: 'r10', name: 'Training Room B', role: 'Room', avatar: 'ROOM' },
  { id: 'r11', name: 'Service Van #04', role: 'Vehicle', avatar: 'VEHICLE' },
  { id: 'r12', name: 'Maintenance Truck #02', role: 'Vehicle', avatar: 'VEHICLE' },
];

export const STEP_LABELS = [
  'General Info',
  'Location',
  'Scheduling',
  'Review'
];

export const TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM'
];

export const ROLES = {
  ADMIN: 'Admin',
  RECEPTIONIST: 'Receptionist',
  NURSE: 'Nurse',
  DOCTOR: 'Doctor',
  PHARMACIST: 'Pharmacist',
} as const;

export type Tab = 'dashboard' | 'reception' | 'triage' | 'consultation' | 'billing' | 'pharmacy' | 'admin';

export const TAB_LABELS: Record<Tab, string> = {
  dashboard: 'Monitor Queue',
  reception: 'Reception',
  triage: 'Triage',
  consultation: 'Consultation',
  billing: 'Billing',
  pharmacy: 'Pharmacy',
  admin: 'Admin Panel',
};

export const TAB_ROLES: Record<Tab, string[]> = {
  dashboard: Object.values(ROLES),
  reception: [ROLES.RECEPTIONIST, ROLES.ADMIN],
  triage: [ROLES.NURSE, ROLES.ADMIN],
  consultation: [ROLES.DOCTOR, ROLES.ADMIN],
  billing: [ROLES.RECEPTIONIST, ROLES.ADMIN],
  pharmacy: [ROLES.PHARMACIST, ROLES.ADMIN],
  admin: [ROLES.ADMIN],
};
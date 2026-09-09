export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  staffId: number;
  staffName: string;
  role: string;
  departmentId: number;
  departmentName: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  staff?: Staff[];
}

export interface Role {
  roleId: number;
  roleName: string; // Doctor, Nurse, Receptionist, Pharmacist
}

export interface Staff {
  staffId: number;
  staffName: string;
  departmentId: number;
  roleId: number;
  department?: Department;
  role?: Role;
}

export interface Patient {
  patientId: number;
  fullName: string;
  nationalId: string;
  dateOfBirth: string; // YYYY-MM-DD
  phoneNumber: string;
  gender: string;
  residence: string;
  registeredDate: string;
}

export interface Visit {
  visitId: number;
  patientId: number;
  visitDate: string;
  arrivalTime: string;
  ticketNumber: string;
  receptionistId: number;
  patient?: Patient;
  receptionist?: Staff;
  triages?: Triage[];
  consultations?: Consultation[];
  prescriptions?: Prescription[];
  billing?: Billing;
}

export interface Triage {
  triageId: number;
  nurseId: number;
  departmentId: number;
  reasonForVisit: string;
  bloodPressure: string;
  temperature: number;
  weight: number;
  height: number;
  queueEntryTime: string;
  visitId: number;
  nurse?: Staff;
  department?: Department;
  visit?: Visit;
}

export interface Consultation {
  consultationId: number;
  consultTime: string;
  diagnosis: string;
  notes: string;
  visitId: number;
  doctorId: number;
  visit?: Visit;
  doctor?: Staff;
  prescriptions?: Prescription[];
}

export interface Prescription {
  prescriptionId: number;
  consultationId: number;
  medicationName: string;
  dosage: string;
  quantity: number;
  status: string; // Pending, Fulfilled
  visitId: number;
  consultation?: Consultation;
  visit?: Visit;
  pharmacy?: Pharmacy;
}

export interface Pharmacy {
  dispenseId: number;
  prescriptionId: number;
  pharmacistId: number;
  dispenseDate: string;
  prescription?: Prescription;
  pharmacist?: Staff;
}

export interface Billing {
  billingId: number;
  visitId: number;
  consultationCharge: number;
  labTestCharge: number;
  medicationCharge: number;
  total: number;
  paymentMethod: string; // Cash, M-Pesa, Insurance
  paymentDate: string;
  visit?: Visit;
}
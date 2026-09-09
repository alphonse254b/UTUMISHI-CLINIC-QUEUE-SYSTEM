import type { 
  Patient, Visit, Triage, Consultation, Prescription, 
  Pharmacy, Billing, Staff, Department 
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5250/api'; 

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) return {} as T;
  return response.json();
}

// 💡 FIX: Automatically tracks and attaches the token tied uniquely to the active workstation tab view
function authHeaders(): Record<string, string> {
  try {
    // 1. Check which navigation link button is currently visually active in the layout wrapper
    const activeTabButton = document.querySelector('button[class*="bg-indigo-100"]');
    const visibleTabText = activeTabButton?.textContent || 'dashboard';
    
    // 2. Map standard text identities to storage key indicators
    let targetTabKey = 'dashboard';
    if (visibleTabText.includes('Reception')) targetTabKey = 'reception';
    else if (visibleTabText.includes('Triage')) targetTabKey = 'triage';
    else if (visibleTabText.includes('Consultation')) targetTabKey = 'consultation';
    else if (visibleTabText.includes('Billing')) targetTabKey = 'billing';
    else if (visibleTabText.includes('Pharmacy')) targetTabKey = 'pharmacy';
    else if (
      visibleTabText.includes('Admin') ||
      visibleTabText.includes('Staff') ||
      visibleTabText.includes('Permission')
    ) targetTabKey = 'admin';

    // 3. Extract the target token explicitly from our isolated session matrix map
    const sessionsMapString = localStorage.getItem('utumishi_tab_sessions');
    if (!sessionsMapString) return {};

    const sessions = JSON.parse(sessionsMapString);
    const activeSession = sessions[targetTabKey];

    return activeSession && activeSession.token 
      ? { Authorization: `Bearer ${activeSession.token}` } 
      : {};
  } catch (err) {
    console.error("Dynamic authentication header builder resolution bottleneck:", err);
    return {};
  }
}

export const api = {
  // Patients
  patients: {
    getAll: () => fetch(`${BASE_URL}/Patients`, { headers: authHeaders() }).then(r => handleResponse<Patient[]>(r)),
    getById: (id: number) => fetch(`${BASE_URL}/Patients/${id}`, { headers: authHeaders() }).then(r => handleResponse<Patient>(r)),
    create: (data: Partial<Patient>) => fetch(`${BASE_URL}/Patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Patient>(r)),
  },

  // Visits
  visits: {
    getAll: () => fetch(`${BASE_URL}/Visits`, { headers: authHeaders() }).then(r => handleResponse<Visit[]>(r)),
    getById: (id: number) => fetch(`${BASE_URL}/Visits/${id}`, { headers: authHeaders() }).then(r => handleResponse<Visit>(r)),
    create: (data: Partial<Visit>) => fetch(`${BASE_URL}/Visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Visit>(r)),
  },

  // Triages
  triages: {
    getAll: () => fetch(`${BASE_URL}/Triages`, { headers: authHeaders() }).then(r => handleResponse<Triage[]>(r)),
    create: (data: Partial<Triage>) => fetch(`${BASE_URL}/Triages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Triage>(r)),
  },

  // Consultations
  consultations: {
    getAll: () => fetch(`${BASE_URL}/Consultations`, { headers: authHeaders() }).then(r => handleResponse<Consultation[]>(r)),
    create: (data: Partial<Consultation>) => fetch(`${BASE_URL}/Consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Consultation>(r)),
  },

  // Prescriptions
  prescriptions: {
    getAll: () => fetch(`${BASE_URL}/Prescriptions`, { headers: authHeaders() }).then(r => handleResponse<Prescription[]>(r)),
    create: (data: Partial<Prescription>) => fetch(`${BASE_URL}/Prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Prescription>(r)),
    update: (id: number, data: Prescription) => fetch(`${BASE_URL}/Prescriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<void>(r)),
  },

  // Pharmacy (Dispenses)
  pharmacy: {
    getAllDispenses: () => fetch(`${BASE_URL}/Pharmacy`, { headers: authHeaders() }).then(r => handleResponse<Pharmacy[]>(r)),
    createDispense: (data: Partial<Pharmacy>) => fetch(`${BASE_URL}/Pharmacy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Pharmacy>(r)),
  },

  // Billing
  billing: {
    getAll: () => fetch(`${BASE_URL}/Billing`, { headers: authHeaders() }).then(r => handleResponse<Billing[]>(r)),
    create: (data: Partial<Billing>) => fetch(`${BASE_URL}/Billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Billing>(r)),
  },

  // Staff & Admin Config
  staff: {
    getAll: () => fetch(`${BASE_URL}/Staff`, { headers: authHeaders() }).then(r => handleResponse<Staff[]>(r)),
    create: (data: Partial<Staff>) => fetch(`${BASE_URL}/Staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Staff>(r)),
  },
  // Departments
  departments: {
    getAll: () => fetch(`${BASE_URL}/Departments`, { headers: authHeaders() }).then(r => handleResponse<Department[]>(r)),
    create: (data: Partial<Department>) => fetch(`${BASE_URL}/Departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<Department>(r)),
    update: (id: number, data: Department) => fetch(`${BASE_URL}/Departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<void>(r)),
  },
  // Roles
  roles: {
    getAll: () => fetch(`${BASE_URL}/Roles`, { headers: authHeaders() }).then(r => handleResponse<{ roleId: number; roleName: string }[]>(r)),
    create: (data: { roleName: string }) => fetch(`${BASE_URL}/Roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ roleId: number; roleName: string }>(r)),
    delete: (id: number) => fetch(`${BASE_URL}/Roles/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(r => handleResponse<void>(r)),
  },
};

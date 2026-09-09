import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { Visit, Staff, Department } from './types';
import Reception from './components/Reception';
import TriageForm from './components/Triage';
import ConsultationForm from './components/Consultation';
import BillingForm from './components/Billing';
import PharmacyDispense from './components/Pharmacy';
import StaffAdmin from './components/StaffAdmin';
import LoginPage from './components/LoginPage';
import { TAB_LABELS } from './config/permissions';
import type { Tab } from './config/permissions';


(() => {
  void Reception;
  void TriageForm;
  void ConsultationForm;
  void BillingForm;
  void PharmacyDispense;
  void StaffAdmin;
})();

interface TabSessions {
  reception: any | null;
  triage: any | null;
  consultation: any | null;
  billing: any | null;
  pharmacy: any | null;
  admin: any | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [tabSessions, setTabSessions] = useState<TabSessions>(() => {
    try {
      const persisted = localStorage.getItem('utumishi_tab_sessions');
      return persisted ? JSON.parse(persisted) : {
        reception: null, triage: null, consultation: null, billing: null, pharmacy: null, admin: null
      };
    } catch {
      return { reception: null, triage: null, consultation: null, billing: null, pharmacy: null, admin: null };
    }
  });

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshAllData = async () => {
    try {
      const vData = await api.visits.getAll();
      const sData = await api.staff.getAll();
      const dData = await api.departments.getAll();
      setVisits(vData);
      setStaff(sData);
      setDepartments(dData);
    } catch (err) {
      console.error("Dashboard synchronization error:", err);
    }
  };

  const handleTabLoginSuccess = (tabKey: keyof TabSessions, userSession: any) => {
    const updatedSessions = { ...tabSessions, [tabKey]: userSession };
    setTabSessions(updatedSessions);
    localStorage.setItem('utumishi_tab_sessions', JSON.stringify(updatedSessions));
  };

  const handleTabLogout = (tabKey: keyof TabSessions) => {
    const updatedSessions = { ...tabSessions, [tabKey]: null };
    setTabSessions(updatedSessions);
    localStorage.setItem('utumishi_tab_sessions', JSON.stringify(updatedSessions));
  };

  const visibleTabs = Object.keys(TAB_LABELS) as Tab[];
  const currentTab = activeTab;

  const normalizeStaffRole = (member: Staff | any) => {
    const value = member?.roleId ?? member?.role ?? member?.roleName ?? member?.position ?? '';
    return String(value).trim().toLowerCase();
  };

  const receptionists = staff.filter(s => {
    const role = normalizeStaffRole(s);
    return role === 'receptionist' || role === 'reception';
  });
  const nurses = staff.filter(s => {
    const role = normalizeStaffRole(s);
    return role === 'nurse' || role === 'nursing';
  });
  const doctors = staff.filter(s => {
    const role = normalizeStaffRole(s);
    return role === 'doctor' || role === 'doctors' || role === 'physician';
  });
  const pharmacists = staff.filter(s => {
    const role = normalizeStaffRole(s);
    return role === 'pharmacist' || role === 'pharmacy';
  });

  const visitsAwaitingTriage = visits.filter(v => !v.triages || v.triages.length === 0);
  const visitsAwaitingDoctor = visits.filter(v => v.triages && v.triages.length > 0 && (!v.consultations || v.consultations.length === 0));
  const visitsAwaitingBilling = visits.filter(v => v.consultations && v.consultations.length > 0 && !v.billing);

  // 🛡️ BIND FORCED MULTI-PROPERTY SECURITY PARSING
  const currentTabSession = currentTab !== 'dashboard' ? tabSessions[currentTab as keyof TabSessions] : null;
  const isTabAuthenticated = !!currentTabSession;
  
  const extractedRole = currentTabSession 
    ? (currentTabSession.role || currentTabSession.Role || currentTabSession.userRole || '').toString().trim().toLowerCase()
    : '';

  const isTabUserAdmin = extractedRole === 'admin';
  const isAdminTabAccessBlocked = currentTab === 'admin' && isTabAuthenticated && !isTabUserAdmin;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-indigo-900 text-white shadow-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-wide">UTUMISHI CLINIC QUEUE SYSTEM</h1>
          <div className="flex items-center gap-3">
            {currentTabSession && (
              <>
                <div className="text-right text-xs">
                  <div className="font-bold">{currentTabSession.staffName || currentTabSession.StaffName}</div>
                  <div className="text-indigo-300">{currentTabSession.role || currentTabSession.Role} · Active Workstation</div>
                </div>
                <button
                  onClick={() => handleTabLogout(currentTab as keyof TabSessions)}
                  className="bg-indigo-950 hover:bg-black text-xs font-bold py-1.5 px-3 rounded border border-indigo-700 transition-all"
                >
                  Lock Tab
                </button>
              </>
            )}
            <button
              onClick={refreshAllData}
              className="bg-indigo-700 hover:bg-indigo-600 text-xs font-bold py-1.5 px-3 rounded transition-all"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto flex space-x-1 p-2 text-sm">
          {visibleTabs.map(tab => {
            const isTabActiveSession = tab !== 'dashboard' && !!tabSessions[tab as keyof TabSessions];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold rounded transition-all flex items-center gap-1.5 ${
                  currentTab === tab
                    ? 'bg-indigo-100 text-indigo-950 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {TAB_LABELS[tab]}
                {isTabActiveSession && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {
          (() => {
            // render the appropriate main content to avoid complex nested JSX/ternaries
            if (currentTab !== 'dashboard' && !isTabAuthenticated) {
              return (
                <div className="max-w-md mx-auto mt-12 bg-white p-2 rounded-xl shadow-md border border-gray-100">
                  <div className="p-4 bg-indigo-50 text-indigo-900 text-xs font-medium rounded-t-lg border-b border-indigo-100">
                    Please sign in to open the <strong>{TAB_LABELS[activeTab]}</strong> workstation panel.
                  </div>
                  <LoginPage
                    isEmbedded={true}
                    isAdmin={currentTab === 'admin'}
                    onOverrideLoginSuccess={(userSession: any) => handleTabLoginSuccess(currentTab as keyof TabSessions, userSession)}
                  />
                </div>
              );
            }

            if (isAdminTabAccessBlocked) {
              return (
                <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl shadow-md border border-red-100 text-center">
                  <div className="text-red-600 text-sm font-bold mb-2">⛔ Access Denied</div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    You authenticated on this tab as <strong>{currentTabSession?.staffName || currentTabSession?.StaffName}</strong> ({currentTabSession?.role || currentTabSession?.Role}).
                    Standard employee roles are prohibited here. Only the administrator profile can view this console.
                  </p>
                  <button
                    onClick={() => handleTabLogout('admin')}
                    className="mt-5 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-5 text-xs rounded transition-colors shadow-sm"
                  >
                    Sign In with Admin Account
                  </button>
                </div>
              );
            }

            // Default dashboard / workstation rendering
            return (
              <div>
                {currentTab === 'dashboard' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-black text-gray-800">Clinic Dashboard Queue</h2>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="px-3 py-2 bg-white rounded shadow-sm border">Receptionists: <span className="font-bold">{receptionists.length}</span></div>
                      <div className="px-3 py-2 bg-white rounded shadow-sm border">Nurses: <span className="font-bold">{nurses.length}</span></div>
                      <div className="px-3 py-2 bg-white rounded shadow-sm border">Doctors: <span className="font-bold">{doctors.length}</span></div>
                      <div className="px-3 py-2 bg-white rounded shadow-sm border">Pharmacists: <span className="font-bold">{pharmacists.length}</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-orange-500">
                        <h3 className="font-bold text-gray-700 uppercase text-xs">Waiting for Triage</h3>
                        <p className="text-3xl font-black text-gray-900 my-1">{visitsAwaitingTriage.length}</p>
                        <div className="mt-4 space-y-1">
                          {visitsAwaitingTriage.map(v => (
                            <div key={v.visitId} className="p-2 bg-gray-50 border rounded text-xs flex justify-between">
                              <span>{v.patient?.fullName}</span>
                              <span className="font-bold">{v.ticketNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-emerald-500">
                        <h3 className="font-bold text-gray-700 uppercase text-xs">Waiting for Doctor</h3>
                        <p className="text-3xl font-black text-gray-900 my-1">{visitsAwaitingDoctor.length}</p>
                        <div className="mt-4 space-y-1">
                          {visitsAwaitingDoctor.map(v => (
                            <div key={v.visitId} className="p-2 bg-gray-50 border rounded text-xs flex justify-between">
                              <span>{v.patient?.fullName}</span>
                              <span className="font-bold text-emerald-700">{v.ticketNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-violet-500">
                        <h3 className="font-bold text-gray-700 uppercase text-xs">Awaiting Settlement</h3>
                        <p className="text-3xl font-black text-gray-900 my-1">{visitsAwaitingBilling.length}</p>
                        <div className="mt-4 space-y-1">
                          {visitsAwaitingBilling.map(v => (
                            <div key={v.visitId} className="p-2 bg-gray-50 border rounded text-xs flex justify-between">
                              <span>{v.patient?.fullName}</span>
                              <span className="font-bold">{v.ticketNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'reception' && <Reception session={currentTabSession} onSuccess={() => refreshAllData()} />}
                {currentTab === 'triage' && <TriageForm pendingVisits={visitsAwaitingTriage} departments={departments} session={currentTabSession} onSuccess={() => refreshAllData()} />}
                {currentTab === 'consultation' && <ConsultationForm triagedVisits={visitsAwaitingDoctor} session={currentTabSession} onSuccess={() => refreshAllData()} />}
                {currentTab === 'billing' && <BillingForm unpaidVisits={visitsAwaitingBilling} onSuccess={() => refreshAllData()} />}
                {currentTab === 'pharmacy' && <PharmacyDispense session={currentTabSession} />}
                {currentTab === 'admin' && <StaffAdmin session={currentTabSession} />}
              </div>
            );
          })()
        }
      </main>
      </div>
    );
  }

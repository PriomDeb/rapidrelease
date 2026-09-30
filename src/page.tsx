'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Hospital,
  Lock,
  Pill,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Truck,
  User,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  Patient,
  calculateBlockers,
} from './data/patientsData.ts';
import RapidReleaseLogo from './components/RapidReleaseLogo.tsx';

export type UserRole = 'all' | 'doctor' | 'pharmacy' | 'transport' | 'agedcare' | 'release';

export default function AIDischargeCoordinatorPage() {
  const [patients, setPatients] = useState<Patient[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ai_discharge_patients');
        if (saved) return JSON.parse(saved);
      } catch {
        // storage fallback
      }
    }
    return INITIAL_PATIENTS;
  });

  const [activeTab, setActiveTab] = useState<UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlocker, setFilterBlocker] = useState<number | 'ALL'>('ALL');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [gatePassPatient, setGatePassPatient] = useState<Patient | null>(null);
  const [departedPatientIds, setDepartedPatientIds] = useState<string[]>([]);

  // Sync state to localStorage for simultaneous tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ai_discharge_patients', JSON.stringify(patients));
      } catch {
        // storage fallback
      }
    }
  }, [patients]);

  // Support URL hash routing (#doctor, #pharmacy, #transport, #agedcare, #release)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['all', 'doctor', 'pharmacy', 'transport', 'agedcare', 'release'].includes(hash)) {
        setActiveTab(hash as UserRole);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const changeTab = (tab: UserRole) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'all' ? '' : tab;
    }
  };

  const getCurrentTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Dedicated role sign-offs
  const handleDoctorSignOff = (patientId: string) => {
    const time = getCurrentTime();
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          doctorSignOff: {
            signed: true,
            time,
            physician: p.attendingPhysician,
            notes: 'Clinical discharge authorized. Safe for transition.',
          },
        };
      })
    );
  };

  const handlePharmacySignOff = (patientId: string) => {
    const time = getCurrentTime();
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          pharmacySignOff: {
            ...p.pharmacySignOff,
            signed: true,
            time,
            pharmacist: 'Pharm. Kevin Patel, RPh',
          },
        };
      })
    );
  };

  const handleTransportSignOff = (patientId: string) => {
    const time = getCurrentTime();
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          transportSignOff: {
            ...p.transportSignOff,
            signed: true,
            time,
          },
        };
      })
    );
  };

  const handleAgedCareSignOff = (patientId: string) => {
    const time = getCurrentTime();
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          agedCareSignOff: {
            ...p.agedCareSignOff,
            signed: true,
            time,
          },
        };
      })
    );
  };

  const resetAllData = () => {
    setPatients(INITIAL_PATIENTS);
    setDepartedPatientIds([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai_discharge_patients');
    }
  };

  const markAsDeparted = (patientId: string) => {
    setDepartedPatientIds((prev) => [...prev, patientId]);
  };

  // Selected patient for modal
  const activeModalPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Overall metrics
  const counts = useMemo(() => {
    let red = 0;
    let orange = 0;
    let yellow = 0;
    let green = 0;
    let docPending = 0;
    let pharmPending = 0;
    let transPending = 0;
    let agedPending = 0;

    patients.forEach((p) => {
      const { count, doctorBlocked, pharmacyBlocked, transportBlocked, agedCareBlocked } = calculateBlockers(p);
      if (count >= 3) red++;
      else if (count === 2) orange++;
      else if (count === 1) yellow++;
      else green++;

      if (doctorBlocked) docPending++;
      if (pharmacyBlocked) pharmPending++;
      if (transportBlocked) transPending++;
      if (agedCareBlocked) agedPending++;
    });

    return { red, orange, yellow, green, docPending, pharmPending, transPending, agedPending };
  }, [patients]);

  // Filtered and Sorted Patients
  // Requirement:
  // 1. When a patient is ready, move them to home/release portal.
  // 2. Keep ONLY remaining blocked patients in the master board.
  // 3. Sort from Red to Yellow (Red top to yellow bottom: 3+ -> 2 -> 1).
  const displayedPatients = useMemo(() => {
    // Release portal view: ONLY ready patients (count === 0)
    if (activeTab === 'release') {
      return patients.filter((p) => {
        const { count } = calculateBlockers(p);
        if (count !== 0) return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.room.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.diagnosis.toLowerCase().includes(q)
        );
      });
    }

    // Master Dashboard and Department Portals:
    // ONLY remaining blocked patients (count > 0)
    const blockedList = patients.filter((p) => {
      const { count, doctorBlocked, pharmacyBlocked, transportBlocked, agedCareBlocked } = calculateBlockers(p);

      // Must be blocked (0 blockers are moved to release portal)
      if (count === 0) return false;

      // Filter by specific department queue if selected
      if (activeTab === 'doctor' && !doctorBlocked) return false;
      if (activeTab === 'pharmacy' && !pharmacyBlocked) return false;
      if (activeTab === 'transport' && !transportBlocked) return false;
      if (activeTab === 'agedcare' && !agedCareBlocked) return false;

      // Search match
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.room.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.diagnosis.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Blocker filter buttons
      if (filterBlocker === 3 && count < 3) return false;
      if (filterBlocker === 2 && count !== 2) return false;
      if (filterBlocker === 1 && count !== 1) return false;

      return true;
    });

    // Strictly sort Red to Yellow: count descending (3+ -> 2 -> 1)
    return blockedList.sort((a, b) => {
      const aCount = calculateBlockers(a).count;
      const bCount = calculateBlockers(b).count;
      return bCount - aCount;
    });
  }, [patients, activeTab, searchQuery, filterBlocker]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => changeTab('all')}
              className="text-left cursor-pointer transition-opacity hover:opacity-90 focus:outline-none"
              title="RapidRelease - Master Dashboard"
            >
              <RapidReleaseLogo className="h-10" showSubtitle={true} />
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={resetAllData}
                title="Reset simulation to initial state"
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Reset Data
              </button>
            </div>
          </div>

          {/* Department Role Tabs + Release Portal */}
          <nav className="flex space-x-1 border-t border-slate-100 py-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => changeTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Master Dashboard
            </button>

            <button
              onClick={() => changeTab('doctor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center transition-colors ${
                activeTab === 'doctor'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
              Doctor Portal
              {counts.docPending > 0 && (
                <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'doctor' ? 'bg-white text-blue-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {counts.docPending}
                </span>
              )}
            </button>

            <button
              onClick={() => changeTab('pharmacy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center transition-colors ${
                activeTab === 'pharmacy'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-3.5 h-3.5 mr-1.5" />
              Pharmacy Portal
              {counts.pharmPending > 0 && (
                <span className="ml-2 inline-flex items-center text-amber-500">
                  <Bell className="w-3 h-3 animate-bounce" />
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'pharmacy' ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {counts.pharmPending}
                  </span>
                </span>
              )}
            </button>

            <button
              onClick={() => changeTab('transport')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center transition-colors ${
                activeTab === 'transport'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              Transport Portal
              {counts.transPending > 0 && (
                <span className="ml-2 inline-flex items-center text-amber-500">
                  <Bell className="w-3 h-3 animate-bounce" />
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'transport' ? 'bg-white text-amber-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {counts.transPending}
                  </span>
                </span>
              )}
            </button>

            <button
              onClick={() => changeTab('agedcare')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center transition-colors ${
                activeTab === 'agedcare'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 mr-1.5" />
              Aged Care Portal
              {counts.agedPending > 0 && (
                <span className="ml-2 inline-flex items-center text-amber-500">
                  <Bell className="w-3 h-3 animate-bounce" />
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'agedcare' ? 'bg-white text-teal-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {counts.agedPending}
                  </span>
                </span>
              )}
            </button>

            {/* Dedicated Release Portal (home/release) */}
            <button
              onClick={() => changeTab('release')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center transition-colors ${
                activeTab === 'release'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Release Portal
              <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'release' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {counts.green} Ready
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Blocker Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              if (activeTab === 'release') changeTab('all');
              setFilterBlocker(filterBlocker === 3 ? 'ALL' : 3);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              filterBlocker === 3 && activeTab !== 'release'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-white border-slate-200 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={filterBlocker === 3 && activeTab !== 'release' ? 'text-red-100' : 'text-red-700'}>
                &ge; 3 Blockers (Red)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <div className="text-xl font-bold mt-1">{counts.red}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Top of Board</div>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'release') changeTab('all');
              setFilterBlocker(filterBlocker === 2 ? 'ALL' : 2);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              filterBlocker === 2 && activeTab !== 'release'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={filterBlocker === 2 && activeTab !== 'release' ? 'text-amber-100' : 'text-amber-700'}>
                2 Blockers (Orange)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-xl font-bold mt-1">{counts.orange}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Middle of Board</div>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'release') changeTab('all');
              setFilterBlocker(filterBlocker === 1 ? 'ALL' : 1);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              filterBlocker === 1 && activeTab !== 'release'
                ? 'bg-yellow-400 text-yellow-950 border-yellow-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={filterBlocker === 1 && activeTab !== 'release' ? 'text-yellow-950' : 'text-yellow-700'}>
                1 Blocker (Yellow)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            </div>
            <div className="text-xl font-bold mt-1">{counts.yellow}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bottom of Board</div>
          </button>

          {/* Green Card: Navigates straight to Release Portal */}
          <button
            onClick={() => {
              setFilterBlocker('ALL');
              changeTab('release');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeTab === 'release'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={activeTab === 'release' ? 'text-emerald-100' : 'text-emerald-700'}>
                0 Blockers (Ready)
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold mt-1">{counts.green}</div>
            <div className={`text-[10px] mt-0.5 font-medium ${
              activeTab === 'release' ? 'text-emerald-200' : 'text-emerald-600'
            }`}>
              In Release Portal &rarr;
            </div>
          </button>
        </div>

        {/* View Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs">
            <span className="text-slate-500">Active View: </span>
            <span className="font-bold text-slate-800 uppercase">
              {activeTab === 'all' && 'Master Board (Remaining Blocked Patients • Sorted Red &rarr; Yellow)'}
              {activeTab === 'doctor' && 'Doctor Portal (Clinical Trigger Authorized)'}
              {activeTab === 'pharmacy' && 'Pharmacy Portal (Dispense Authorized)'}
              {activeTab === 'transport' && 'Transport Portal (Logistics Authorized)'}
              {activeTab === 'agedcare' && 'Aged Care Portal (Transition Authorized)'}
              {activeTab === 'release' && 'Release Portal (Ready to Go • 0 Blockers)'}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activeTab === 'release'
                ? 'Patients who have completed all 4 departmental sign-offs and are cleared for discharge.'
                : 'Showing only remaining blocked patients sorted by urgency (Red at top, Yellow at bottom). Ready patients are moved to the Release Portal.'}
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, room, MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* =========================================================================
            IF IN RELEASE PORTAL: DEDICATED RELEASE BOARD
            ========================================================================= */}
        {activeTab === 'release' ? (
          <div className="space-y-4">
            {displayedPatients.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700 text-sm">No Patients in Release Portal Yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Once all 4 department blockers (Doctor, Pharmacy, Transport, Aged Care) are signed off, patients will automatically move here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedPatients.map((patient) => {
                  const isDeparted = departedPatientIds.includes(patient.id);

                  return (
                    <div
                      key={patient.id}
                      className="bg-white rounded-xl border border-emerald-300 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

                      <div>
                        {/* Top patient header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-base text-slate-900">{patient.name}</h3>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {patient.room}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {patient.mrn} • {patient.age} yo {patient.gender} • {patient.diagnosis}
                            </p>
                          </div>

                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Ready for Release
                          </span>
                        </div>

                        {/* 4 Cleared Dependencies Grid */}
                        <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Doctor Sign-Off</span>
                            <span className="font-semibold text-slate-800">Dr. Sarah Lin</span>
                            <div className="text-[10px] text-slate-500">Signed at {patient.doctorSignOff.time || '07:15 AM'}</div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Pharmacy Dispense</span>
                            <span className="font-semibold text-slate-800">Med Pack Verified</span>
                            <div className="text-[10px] text-slate-500">Dispensed at {patient.pharmacySignOff.time || '07:45 AM'}</div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Transport</span>
                            <span className="font-semibold text-slate-800 truncate block">{patient.transportSignOff.vehicleType}</span>
                            <div className="text-[10px] text-slate-500">Booked at {patient.transportSignOff.time || '08:00 AM'}</div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Aged Care / Community</span>
                            <span className="font-semibold text-slate-800 truncate block">{patient.agedCareSignOff.program}</span>
                            <div className="text-[10px] text-slate-500">Reconciled at {patient.agedCareSignOff.time || '08:15 AM'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Target departure: <strong className="text-slate-700">{patient.aiTargetDeparture}</strong>
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setGatePassPatient(patient)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1.5" />
                            Print Gate Pass
                          </button>

                          {isDeparted ? (
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                              Departed
                            </span>
                          ) : (
                            <button
                              onClick={() => markAsDeparted(patient.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                            >
                              Confirm Departure
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
              MASTER DASHBOARD & DEPARTMENT PORTALS
              Keeps ONLY remaining blocked patients, sorted Red to Yellow!
              ========================================================================= */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-3">Blockers (Red &rarr; Yellow)</th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Pharmacy</th>
                    <th className="py-3 px-3">Transport</th>
                    <th className="py-3 px-3">Aged Care</th>
                    <th className="py-3 px-3">AI Next Action</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {displayedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        {counts.green > 0 ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-700 text-sm">All Active Blockers Cleared!</p>
                            <p className="text-xs text-slate-400">
                              All ready patients have moved to the{' '}
                              <button
                                onClick={() => changeTab('release')}
                                className="text-emerald-700 underline font-semibold"
                              >
                                Release Portal ({counts.green} Ready)
                              </button>
                              .
                            </p>
                          </div>
                        ) : (
                          'No blocked patients match this filter.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    displayedPatients.map((patient) => {
                      const {
                        count,
                        doctorBlocked,
                        pharmacyBlocked,
                        transportBlocked,
                        agedCareBlocked,
                        colorClass,
                      } = calculateBlockers(patient);

                      return (
                        <tr
                          key={patient.id}
                          className={`transition-colors ${colorClass.rowBg} ${colorClass.borderAccent}`}
                        >
                          {/* Patient info */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{patient.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {patient.room} • {patient.mrn} • {patient.diagnosis}
                            </div>
                          </td>

                          {/* Blocker Badge strictly red/orange/yellow */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${colorClass.badgeBg}`}
                            >
                              {count} {count === 1 ? 'Blocker' : 'Blockers'}
                            </span>
                          </td>

                          {/* Doctor Status */}
                          <td className="py-3 px-3">
                            {doctorBlocked ? (
                              activeTab === 'doctor' ? (
                                <button
                                  onClick={() => handleDoctorSignOff(patient.id)}
                                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px]"
                                >
                                  Sign Off
                                </button>
                              ) : (
                                <span className="text-amber-700 text-[11px] font-medium flex items-center">
                                  <Clock className="w-3 h-3 mr-1" /> Pending
                                </span>
                              )
                            ) : (
                              <span className="text-emerald-700 text-[11px] font-medium flex items-center">
                                <Check className="w-3.5 h-3.5 mr-1" /> Signed
                              </span>
                            )}
                          </td>

                          {/* Pharmacy Status */}
                          <td className="py-3 px-3">
                            {pharmacyBlocked ? (
                              activeTab === 'pharmacy' ? (
                                <button
                                  onClick={() => handlePharmacySignOff(patient.id)}
                                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center"
                                >
                                  <Bell className="w-3 h-3 mr-1 animate-bounce" />
                                  Release Pack
                                </button>
                              ) : (
                                <span className="text-amber-700 text-[11px] font-medium flex items-center">
                                  <Bell className="w-3 h-3 mr-1 text-amber-500 animate-bounce" />
                                  Pending
                                </span>
                              )
                            ) : (
                              <span className="text-emerald-700 text-[11px] font-medium flex items-center">
                                <Check className="w-3.5 h-3.5 mr-1" /> Dispensed
                              </span>
                            )}
                          </td>

                          {/* Transport Status */}
                          <td className="py-3 px-3">
                            {transportBlocked ? (
                              activeTab === 'transport' ? (
                                <button
                                  onClick={() => handleTransportSignOff(patient.id)}
                                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] flex items-center"
                                >
                                  <Bell className="w-3 h-3 mr-1 animate-bounce" />
                                  Book Vehicle
                                </button>
                              ) : (
                                <span className="text-amber-700 text-[11px] font-medium flex items-center">
                                  <Bell className="w-3 h-3 mr-1 text-amber-500 animate-bounce" />
                                  Pending
                                </span>
                              )
                            ) : (
                              <span className="text-emerald-700 text-[11px] font-medium flex items-center">
                                <Check className="w-3.5 h-3.5 mr-1" /> Booked
                              </span>
                            )}
                          </td>

                          {/* Aged Care Status */}
                          <td className="py-3 px-3">
                            {agedCareBlocked ? (
                              activeTab === 'agedcare' ? (
                                <button
                                  onClick={() => handleAgedCareSignOff(patient.id)}
                                  className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] flex items-center"
                                >
                                  <Bell className="w-3 h-3 mr-1 animate-bounce" />
                                  Finalize TCP
                                </button>
                              ) : (
                                <span className="text-amber-700 text-[11px] font-medium flex items-center">
                                  <Bell className="w-3 h-3 mr-1 text-amber-500 animate-bounce" />
                                  Pending
                                </span>
                              )
                            ) : (
                              <span className="text-emerald-700 text-[11px] font-medium flex items-center">
                                <Check className="w-3.5 h-3.5 mr-1" /> Reconciled
                              </span>
                            )}
                          </td>

                          {/* AI Prioritization */}
                          <td className="py-3 px-3 max-w-[200px]">
                            <div className="text-[11px] text-slate-700 truncate" title={patient.aiRecommendation}>
                              {patient.aiRecommendation}
                            </div>
                            <div className="text-[10px] text-slate-500">{patient.aiTargetDeparture}</div>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedPatientId(patient.id)}
                              className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px]"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          PATIENT PROFILE MODAL (Strict Actor Permission Enforcement)
          ========================================================================= */}
      {activeModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-bold text-base text-slate-900">{activeModalPatient.name}</h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                      {activeModalPatient.room}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeModalPatient.mrn} • {activeModalPatient.age} yo {activeModalPatient.gender} • {activeModalPatient.diagnosis}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientId(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Vitals Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Heart Rate</span>
                  <div className="font-bold text-slate-800 mt-0.5">{activeModalPatient.vitals.hr}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Blood Pressure</span>
                  <div className="font-bold text-slate-800 mt-0.5">{activeModalPatient.vitals.bp}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Oxygen</span>
                  <div className="font-bold text-slate-800 mt-0.5">{activeModalPatient.vitals.o2}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Labs</span>
                  <div className="font-bold text-emerald-700 mt-0.5">Clear</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Mobility</span>
                  <div className="font-bold text-slate-800 mt-0.5">{activeModalPatient.vitals.mobility}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Target</span>
                  <div className="font-bold text-slate-800 mt-0.5">{activeModalPatient.aiTargetDeparture}</div>
                </div>
              </div>

              {/* Actor 1: Doctor Clinical Trigger */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeModalPatient.doctorSignOff.signed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : activeTab === 'doctor'
                    ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">Doctor Clinical Sign-Off</span>
                  </div>
                  {activeModalPatient.doctorSignOff.signed ? (
                    <span className="text-emerald-700 font-bold flex items-center text-[11px]">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Signed ({activeModalPatient.doctorSignOff.time})
                    </span>
                  ) : activeTab === 'doctor' ? (
                    <button
                      onClick={() => handleDoctorSignOff(activeModalPatient.id)}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Sign Off Clinical Trigger
                    </button>
                  ) : (
                    <span className="text-slate-400 flex items-center text-[11px]">
                      <Lock className="w-3 h-3 mr-1" />
                      Requires Doctor Portal
                    </span>
                  )}
                </div>
                <p className="text-slate-600 mt-1.5 text-[11px]">
                  {activeModalPatient.doctorSignOff.notes || 'Awaiting physician authorization.'}
                </p>
              </div>

              {/* Actor 2: Pharmacy Dispense */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeModalPatient.pharmacySignOff.signed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : activeTab === 'pharmacy'
                    ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900">Pharmacy Medication Release</span>
                  </div>
                  {activeModalPatient.pharmacySignOff.signed ? (
                    <span className="text-emerald-700 font-bold flex items-center text-[11px]">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Dispensed ({activeModalPatient.pharmacySignOff.time})
                    </span>
                  ) : activeTab === 'pharmacy' ? (
                    <button
                      onClick={() => handlePharmacySignOff(activeModalPatient.id)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      Release Medication Pack
                    </button>
                  ) : (
                    <span className="text-slate-400 flex items-center text-[11px]">
                      <Lock className="w-3 h-3 mr-1" />
                      Requires Pharmacy Portal
                    </span>
                  )}
                </div>
                <div className="mt-1.5 p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-800">
                  <span className="font-semibold text-indigo-700">NLP Alert: </span>
                  {activeModalPatient.pharmacySignOff.llmAlert}
                </div>
              </div>

              {/* Actor 3: Transport Logistics */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeModalPatient.transportSignOff.signed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : activeTab === 'transport'
                    ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900">Transport Logistics</span>
                  </div>
                  {activeModalPatient.transportSignOff.signed ? (
                    <span className="text-emerald-700 font-bold flex items-center text-[11px]">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Booked ({activeModalPatient.transportSignOff.time})
                    </span>
                  ) : activeTab === 'transport' ? (
                    <button
                      onClick={() => handleTransportSignOff(activeModalPatient.id)}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                    >
                      Confirm Transit Vehicle
                    </button>
                  ) : (
                    <span className="text-slate-400 flex items-center text-[11px]">
                      <Lock className="w-3 h-3 mr-1" />
                      Requires Transport Portal
                    </span>
                  )}
                </div>
                <div className="mt-1.5 p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-800">
                  <span className="font-semibold text-amber-700">NLP Alert: </span>
                  {activeModalPatient.transportSignOff.llmAlert}
                </div>
              </div>

              {/* Actor 4: Aged Care / Community */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeModalPatient.agedCareSignOff.signed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : activeTab === 'agedcare'
                    ? 'bg-teal-50/60 border-teal-300 ring-2 ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HeartHandshake className="w-4 h-4 text-teal-700" />
                    <span className="font-bold text-slate-900">Aged Care &amp; Community Referral</span>
                  </div>
                  {activeModalPatient.agedCareSignOff.signed ? (
                    <span className="text-emerald-700 font-bold flex items-center text-[11px]">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Reconciled ({activeModalPatient.agedCareSignOff.time})
                    </span>
                  ) : activeTab === 'agedcare' ? (
                    <button
                      onClick={() => handleAgedCareSignOff(activeModalPatient.id)}
                      className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
                    >
                      Finalize Community Referral
                    </button>
                  ) : (
                    <span className="text-slate-400 flex items-center text-[11px]">
                      <Lock className="w-3 h-3 mr-1" />
                      Requires Aged Care Portal
                    </span>
                  )}
                </div>
                <div className="mt-1.5 p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-800">
                  <span className="font-semibold text-teal-700">NLP Alert: </span>
                  {activeModalPatient.agedCareSignOff.llmAlert}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                To sign off another department, switch to that portal tab.
              </span>
              <button
                onClick={() => setSelectedPatientId(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DISCHARGE GATE PASS MODAL (0 Blockers)
          ========================================================================= */}
      {gatePassPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-emerald-600 p-5 text-white text-center">
              <ShieldCheck className="w-8 h-8 mx-auto mb-1.5" />
              <h3 className="font-bold text-lg">Official Discharge Gate Pass</h3>
              <p className="text-xs text-emerald-100">All 4 Department Dependencies Cleared</p>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Patient</div>
                  <div className="font-bold text-slate-900">{gatePassPatient.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Room</div>
                  <div className="font-bold text-slate-900">{gatePassPatient.room}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Release Code</div>
                  <div className="font-mono font-bold text-emerald-700">REL-9421-OK</div>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-b border-slate-100 py-2.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor Sign-Off:</span>
                  <span className="font-semibold text-emerald-700">
                    Dr. Sarah Lin ({gatePassPatient.doctorSignOff.time || 'Signed'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pharmacy Dispense:</span>
                  <span className="font-semibold text-emerald-700">
                    Verified Pack ({gatePassPatient.pharmacySignOff.time || 'Signed'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transport:</span>
                  <span className="font-semibold text-emerald-700">
                    {gatePassPatient.transportSignOff.vehicleType} ({gatePassPatient.transportSignOff.time || 'Signed'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aged Care:</span>
                  <span className="font-semibold text-emerald-700">
                    {gatePassPatient.agedCareSignOff.program} ({gatePassPatient.agedCareSignOff.time || 'Signed'})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                The patient has fulfilled all clinical, pharmaceutical, mobility, and community transition requirements. Security and ward reception may release the patient.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setGatePassPatient(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Pass
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <span className="font-semibold text-slate-700">RapidRelease &bull; AI Discharge Coordinator</span>
          <span className="text-slate-400">Clinical Workflow &amp; Patient Release Automation</span>
        </div>
      </footer>
    </div>
  );
}

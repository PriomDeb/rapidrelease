export interface PatientVitals {
  hr: string;
  bp: string;
  o2: string;
  temp: string;
  labsStatus: string;
  mobility: string;
}

export interface DoctorSignOff {
  signed: boolean;
  time?: string;
  physician?: string;
  notes?: string;
}

export interface PharmacySignOff {
  signed: boolean;
  time?: string;
  pharmacist?: string;
  llmAlert: string;
  meds: string[];
}

export interface TransportSignOff {
  signed: boolean;
  time?: string;
  vehicleType: string;
  pickupTime: string;
  llmAlert: string;
}

export interface AgedCareSignOff {
  signed: boolean;
  time?: string;
  program: string;
  contact: string;
  llmAlert: string;
}

export interface Patient {
  id: string;
  name: string;
  room: string;
  mrn: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  admitDate: string;
  attendingPhysician: string;
  vitals: PatientVitals;
  doctorSignOff: DoctorSignOff;
  pharmacySignOff: PharmacySignOff;
  transportSignOff: TransportSignOff;
  agedCareSignOff: AgedCareSignOff;
  aiPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'READY';
  aiRecommendation: string;
  aiTargetDeparture: string;
}

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pt-101',
    name: 'John Doe',
    room: 'Room 4B',
    mrn: 'MRN-849204',
    age: 72,
    gender: 'Male',
    diagnosis: 'Acute CHF Exacerbation (Resolved)',
    admitDate: '3 days ago',
    attendingPhysician: 'Dr. Sarah Lin, MD (Cardiology)',
    vitals: {
      hr: '68 bpm (Normal)',
      bp: '122/78 mmHg',
      o2: '98% Room Air',
      temp: '36.8 °C',
      labsStatus: 'Bloods Clear (Troponin & Creatinine WNL)',
      mobility: 'Independent with walking frame',
    },
    doctorSignOff: {
      signed: false,
      notes: 'Diuretic therapy successful. Vitals and kidney markers stable. Awaiting discharge order sign-off.',
    },
    pharmacySignOff: {
      signed: false,
      llmAlert: 'AI Alert: Bloods are clear. Please prepare the take-home medication pack for John Doe.',
      meds: ['Enalapril 10mg (1x daily)', 'Furosemide 20mg (1x morning)', 'Atorvastatin 40mg (1x night)'],
    },
    transportSignOff: {
      signed: false,
      vehicleType: 'Level 2 Wheelchair Accessible Van (Hydraulic Lift)',
      pickupTime: '10:00 AM Departure Slot',
      llmAlert: 'AI Alert: Patient cleared for mobility. Book a 10:00 AM wheelchair-accessible transport vehicle.',
    },
    agedCareSignOff: {
      signed: false,
      program: 'Transition Care Program (TCP) Post-Acute Package',
      contact: 'Eleanor Doe (Daughter) - SMS Auto-Dispatched',
      llmAlert: 'AI Alert: Elderly patient milestone triggered. Confirm Transition Care Program (TCP) Referral and notify family.',
    },
    aiPriority: 'CRITICAL',
    aiRecommendation: 'PRIORITY 1: Doctor must sign clinical discharge trigger before parallel alerts can dispatch.',
    aiTargetDeparture: 'Tomorrow 10:00 AM',
  },
  {
    id: 'pt-102',
    name: 'Eleanor Vance',
    room: 'Room 12A',
    mrn: 'MRN-773192',
    age: 68,
    gender: 'Female',
    diagnosis: 'Post-Op Knee Arthroplasty (Day 4)',
    admitDate: '4 days ago',
    attendingPhysician: 'Dr. Marcus Vance, MD (Orthopedics)',
    vitals: {
      hr: '72 bpm',
      bp: '118/76 mmHg',
      o2: '99% Room Air',
      temp: '36.6 °C',
      labsStatus: 'WBC normal, CRP declining',
      mobility: 'Weight bearing as tolerated with crutches',
    },
    doctorSignOff: {
      signed: true,
      time: '08:45 AM',
      physician: 'Dr. Marcus Vance, MD',
      notes: 'Surgical site clean. Pain managed. Cleared for step-down rehabilitation.',
    },
    pharmacySignOff: {
      signed: false,
      llmAlert: 'AI Alert: Post-op anticoagulation protocol triggered. Dispense 14-day Enoxaparin supply with patient injection teach-back.',
      meds: ['Enoxaparin 40mg SubQ daily', 'Paracetamol 1000mg QDS PRN', 'Celecoxib 200mg daily'],
    },
    transportSignOff: {
      signed: false,
      vehicleType: 'Standard Stretcher / Transfer Ambulance',
      pickupTime: '11:30 AM Departure Slot',
      llmAlert: 'AI Alert: Knee flexion restriction (<90 deg). Schedule non-emergency transit vehicle with leg elevation support.',
    },
    agedCareSignOff: {
      signed: false,
      program: 'Community Physiotherapy & Home Nursing Outreach',
      contact: 'Robert Vance (Spouse, (555) 349-2011)',
      llmAlert: 'AI Alert: Home hazards checklist pending. Ensure occupational therapist visit scheduled for Day 2 post-discharge.',
    },
    aiPriority: 'HIGH',
    aiRecommendation: 'PRIORITY 2: Doctor signed off. Pharmacy dispense and Transport vehicle booking are active bottlenecks.',
    aiTargetDeparture: 'Tomorrow 11:30 AM',
  },
  {
    id: 'pt-103',
    name: 'Marcus Chen',
    room: 'Room 7C',
    mrn: 'MRN-910482',
    age: 54,
    gender: 'Male',
    diagnosis: 'Community-Acquired Pneumonia (Resolved)',
    admitDate: '5 days ago',
    attendingPhysician: 'Dr. Sarah Lin, MD (Internal Medicine)',
    vitals: {
      hr: '64 bpm',
      bp: '124/80 mmHg',
      o2: '97% Room Air',
      temp: '36.5 °C',
      labsStatus: 'Sputum culture negative, LFTs normal',
      mobility: 'Fully ambulatory without assistance',
    },
    doctorSignOff: {
      signed: true,
      time: '09:10 AM',
      physician: 'Dr. Sarah Lin, MD',
      notes: 'Afebril for 48 hours. Lungs clear to auscultation. Fit for step-down discharge.',
    },
    pharmacySignOff: {
      signed: true,
      time: '09:35 AM',
      pharmacist: 'Pharm. Kevin Patel, RPh',
      llmAlert: 'AI Alert: Oral stepdown completed. 5-day Amoxicillin/Clavulanate pack dispensed and verified.',
      meds: ['Augmentin 875/125mg BD x 5d', 'Salbutamol Inhaler PRN'],
    },
    transportSignOff: {
      signed: false,
      vehicleType: 'Standard Private Ride / Family Pickup',
      pickupTime: '01:00 PM Slot',
      llmAlert: 'AI Alert: Patient is ambulatory. Confirm family escort or verify voucher for hospital taxi transit.',
    },
    agedCareSignOff: {
      signed: false,
      program: 'Primary Care GP Handover Follow-Up',
      contact: 'Linda Chen (Wife, (555) 782-9014)',
      llmAlert: 'AI Alert: Discharge summary auto-faxed to Community GP Dr. Wong. Awaiting patient confirmation callback.',
    },
    aiPriority: 'MEDIUM',
    aiRecommendation: 'PRIORITY 3: 2 blockers remaining (Transport + Community Handover). Estimated 45 min to clearance.',
    aiTargetDeparture: 'Today 01:00 PM',
  },
  {
    id: 'pt-104',
    name: 'Beatrice Taylor',
    room: 'Room 3A',
    mrn: 'MRN-602931',
    age: 81,
    gender: 'Female',
    diagnosis: 'Hypokalemia & Dehydration (Corrected)',
    admitDate: '2 days ago',
    attendingPhysician: 'Dr. David Foster, MD (Geriatrics)',
    vitals: {
      hr: '70 bpm',
      bp: '120/74 mmHg',
      o2: '98% Room Air',
      temp: '36.7 °C',
      labsStatus: 'Potassium 4.2 mmol/L (Normal), eGFR stable',
      mobility: 'Assisted with rollator walker',
    },
    doctorSignOff: {
      signed: true,
      time: '07:50 AM',
      physician: 'Dr. David Foster, MD',
      notes: 'Electrolyte imbalance fully restored. Patient alert and oriented x 4.',
    },
    pharmacySignOff: {
      signed: false,
      llmAlert: 'AI Alert: Electrolyte regimen reviewed. Final pharmacist sign-off needed for oral potassium chloride pack.',
      meds: ['Slow-K 600mg daily x 7 days', 'Multivitamin daily'],
    },
    transportSignOff: {
      signed: true,
      time: '08:20 AM',
      vehicleType: 'Silver Chain Community Shuttle (Van #14)',
      pickupTime: '12:00 PM Slot',
      llmAlert: 'AI Alert: Vehicle dispatch confirmed with lift capability.',
    },
    agedCareSignOff: {
      signed: true,
      time: '08:40 AM',
      program: 'Meadowbrook Residential Care Coordination',
      contact: 'Facility Director Nurse Karen Smith',
      llmAlert: 'AI Alert: Care home bed retention confirmed. Handover packet received.',
    },
    aiPriority: 'HIGH',
    aiRecommendation: 'PRIORITY 4: ONLY 1 BLOCKER! Pharmacy pack verification will immediately release patient.',
    aiTargetDeparture: 'Today 12:00 PM',
  },
  {
    id: 'pt-105',
    name: 'Arthur Pendelton',
    room: 'Room 9B',
    mrn: 'MRN-551829',
    age: 79,
    gender: 'Male',
    diagnosis: 'Elective Cataract Extraction & Observation',
    admitDate: 'Yesterday',
    attendingPhysician: 'Dr. Nathan Cruz, MD (Ophthalmology)',
    vitals: {
      hr: '62 bpm',
      bp: '116/72 mmHg',
      o2: '99% Room Air',
      temp: '36.6 °C',
      labsStatus: 'Not indicated / Cleared pre-op',
      mobility: 'Independent, eye-shield in place',
    },
    doctorSignOff: {
      signed: true,
      time: '07:15 AM',
      physician: 'Dr. Nathan Cruz, MD',
      notes: 'Anterior chamber clear. Intraocular pressure normal. Discharge authorized.',
    },
    pharmacySignOff: {
      signed: true,
      time: '07:45 AM',
      pharmacist: 'Pharm. Angela Wu, PharmD',
      llmAlert: 'AI Alert: Post-op eyedrops (Prednisolone + Moxifloxacin) dispensed with visual schedule.',
      meds: ['Prednisolone 1% eye drops QID', 'Moxifloxacin 0.5% drops TID'],
    },
    transportSignOff: {
      signed: true,
      time: '08:00 AM',
      vehicleType: 'Family Private Vehicle (Curbside Pick-up)',
      pickupTime: '09:30 AM Slot',
      llmAlert: 'AI Alert: Son Greg Pendelton parked at Main Concourse loading bay.',
    },
    agedCareSignOff: {
      signed: true,
      time: '08:15 AM',
      program: 'Community Eye Care 48-Hour Telehealth Follow-up',
      contact: 'Greg Pendelton (Son, (555) 441-9920)',
      llmAlert: 'AI Alert: Day-2 telehealth video follow-up link sent to son.',
    },
    aiPriority: 'READY',
    aiRecommendation: 'READY TO GO: 0 blockers! All 4 clinical authorities have signed off. Gate Pass active.',
    aiTargetDeparture: 'Immediately (Gate Pass Ready)',
  },
  {
    id: 'pt-106',
    name: 'Sofia Rodriguez',
    room: 'Room 5D',
    mrn: 'MRN-439281',
    age: 63,
    gender: 'Female',
    diagnosis: 'Type 2 Diabetes Mellitus with Hyperglycemia (Stabilized)',
    admitDate: '3 days ago',
    attendingPhysician: 'Dr. Sarah Lin, MD (Endocrinology)',
    vitals: {
      hr: '74 bpm',
      bp: '128/82 mmHg',
      o2: '98% Room Air',
      temp: '36.9 °C',
      labsStatus: 'Fasting Blood Glucose 118 mg/dL, HbA1c 7.4%',
      mobility: 'Independent ambulatory',
    },
    doctorSignOff: {
      signed: false,
      notes: 'Insulin sliding scale transitioned to basal insulin glargine. Pending morning endocrinology consult sign-off.',
    },
    pharmacySignOff: {
      signed: false,
      llmAlert: 'AI Alert: New insulin glargine pen + glucometer test strips pending diabetic educator review.',
      meds: ['Lantus Solostar 18 units SubQ at bedtime', 'Metformin 850mg BD', 'Glucometer Sensor Kit'],
    },
    transportSignOff: {
      signed: false,
      vehicleType: 'Patient Self-Drive / Public Transit Accompanied',
      pickupTime: '02:00 PM Slot',
      llmAlert: 'AI Alert: Verify patient is accompanied given recent hypoglycemic stabilization.',
    },
    agedCareSignOff: {
      signed: false,
      program: 'Community Diabetes Educator Outreach',
      contact: 'Carlos Rodriguez (Husband, (555) 671-0023)',
      llmAlert: 'AI Alert: Enroll in outpatient nutrition & continuous glucose monitoring educational program.',
    },
    aiPriority: 'CRITICAL',
    aiRecommendation: 'PRIORITY 5: Doctor trigger pending. Pharmacy needs insulin education sign-off before departure.',
    aiTargetDeparture: 'Today 02:00 PM',
  },
  {
    id: 'pt-107',
    name: 'David Kim',
    room: 'Room 2F',
    mrn: 'MRN-881923',
    age: 45,
    gender: 'Male',
    diagnosis: 'Cellulitis Right Lower Extremity (Resolving on IV Antibiotics)',
    admitDate: '3 days ago',
    attendingPhysician: 'Dr. Michael Chen, MD (Infectious Disease)',
    vitals: {
      hr: '66 bpm',
      bp: '120/78 mmHg',
      o2: '99% Room Air',
      temp: '36.6 °C',
      labsStatus: 'WBC 6.8 (Normalized), Erythema demarcated & receding',
      mobility: 'Full weight-bearing, mild edema',
    },
    doctorSignOff: {
      signed: true,
      time: '08:10 AM',
      physician: 'Dr. Michael Chen, MD',
      notes: 'Switched from IV Cefazolin to oral Cephalexin. Redness significantly decreased.',
    },
    pharmacySignOff: {
      signed: false,
      llmAlert: 'AI Alert: Oral stepdown regimen. Dispense Cephalexin 500mg QDS x 7 days with adherence instruction.',
      meds: ['Cephalexin 500mg QID x 7 days', 'Ibuprofen 400mg TID PRN'],
    },
    transportSignOff: {
      signed: true,
      time: '08:50 AM',
      vehicleType: 'Personal Vehicle / Uber Health Voucher',
      pickupTime: '11:00 AM Slot',
      llmAlert: 'AI Alert: Patient cleared to drive or use ride-hail voucher.',
    },
    agedCareSignOff: {
      signed: false,
      program: 'Hospital in the Home (HITH) Wound Check Day 3',
      contact: 'David Kim (Self, (555) 902-3341)',
      llmAlert: 'AI Alert: Schedule HITH nurse home visit in 72 hours to measure wound circumference.',
    },
    aiPriority: 'MEDIUM',
    aiRecommendation: 'PRIORITY 6: 2 blockers remaining (Pharmacy dispense + HITH wound outreach registration).',
    aiTargetDeparture: 'Today 11:00 AM',
  },
];

// Helper to calculate blockers count
export function calculateBlockers(patient: Patient): {
  count: number;
  doctorBlocked: boolean;
  pharmacyBlocked: boolean;
  transportBlocked: boolean;
  agedCareBlocked: boolean;
  colorClass: {
    badgeBg: string;
    badgeText: string;
    rowBg: string;
    borderAccent: string;
    label: string;
  };
} {
  const doctorBlocked = !patient.doctorSignOff.signed;
  const pharmacyBlocked = !patient.pharmacySignOff.signed;
  const transportBlocked = !patient.transportSignOff.signed;
  const agedCareBlocked = !patient.agedCareSignOff.signed;

  const count =
    (doctorBlocked ? 1 : 0) +
    (pharmacyBlocked ? 1 : 0) +
    (transportBlocked ? 1 : 0) +
    (agedCareBlocked ? 1 : 0);

  // Exact user specifications:
  // "more than 3 blocks red, 2 blocks orange, 1 blocks yellow and 0 blocks green who is ready to go"
  // (>= 3 blocks: Red, 2 blocks: Orange, 1 block: Yellow, 0 blocks: Green)
  let colorClass = {
    badgeBg: 'bg-red-100 text-red-800 border-red-200',
    badgeText: 'text-red-700',
    rowBg: 'bg-red-50/60 hover:bg-red-50/90',
    borderAccent: 'border-l-4 border-l-red-500',
    label: `${count} Blockers (Critical)`,
  };

  if (count >= 3) {
    colorClass = {
      badgeBg: 'bg-red-100 text-red-800 border-red-200',
      badgeText: 'text-red-700',
      rowBg: 'bg-red-50/60 hover:bg-red-50/90',
      borderAccent: 'border-l-4 border-l-red-500',
      label: `${count} Blockers (Critical Delay)`,
    };
  } else if (count === 2) {
    colorClass = {
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'text-amber-800',
      rowBg: 'bg-amber-50/60 hover:bg-amber-50/90',
      borderAccent: 'border-l-4 border-l-amber-500',
      label: '2 Blockers (Pending Dependencies)',
    };
  } else if (count === 1) {
    colorClass = {
      badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      badgeText: 'text-yellow-800',
      rowBg: 'bg-yellow-50/50 hover:bg-yellow-50/80',
      borderAccent: 'border-l-4 border-l-yellow-400',
      label: '1 Blocker (Final Dependency)',
    };
  } else if (count === 0) {
    colorClass = {
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeText: 'text-emerald-700',
      rowBg: 'bg-emerald-50/60 hover:bg-emerald-50/90',
      borderAccent: 'border-l-4 border-l-emerald-500',
      label: '0 Blockers (Ready for Release!)',
    };
  }

  return {
    count,
    doctorBlocked,
    pharmacyBlocked,
    transportBlocked,
    agedCareBlocked,
    colorClass,
  };
}

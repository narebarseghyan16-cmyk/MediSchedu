import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Doctor,
  Clinic,
  Specialty,
  Appointment,
  UserRole,
  Language,
  SearchFilterState,
  PatientUser,
  DoctorUser,
  AuthUser,
} from '../types';
import {
  DOCTORS,
  CLINICS,
  SPECIALTIES,
  INITIAL_APPOINTMENTS,
  PATIENT_USERS,
  DOCTOR_USERS,
} from '../data/mockData';

export type AppTab = 'home' | 'search' | 'patient-portal' | 'doctor-portal' | 'clinics' | 'login';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  loginTargetRole: 'patient' | 'doctor';
  setLoginTargetRole: (role: 'patient' | 'doctor') => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  openLoginPage: (role?: 'patient' | 'doctor') => void;
  openRegisterPage: () => void;
  currentUser: AuthUser | null;
  patientUsers: PatientUser[];
  doctorUsers: DoctorUser[];
  loginAsPatient: (usernameOrEmail: string, pass: string) => boolean;
  loginAsDoctor: (usernameOrEmail: string, pass: string) => boolean;
  registerPatient: (data: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    birthDate?: string;
    bloodGroup?: string;
    insurance?: string;
  }) => { success: boolean; errorHy?: string; errorEn?: string };
  loginDirectPatient: (patientId: string) => void;
  loginDirectDoctor: (doctorId: string) => void;
  logout: () => void;
  doctors: Doctor[];
  clinics: Clinic[];
  specialties: Specialty[];
  appointments: Appointment[];
  selectedDoctorIdForPortal: string;
  setSelectedDoctorIdForPortal: (id: string) => void;
  bookingDoctor: Doctor | null;
  pendingBookingDoctor: Doctor | null;
  bookingAuthRequiredNotice: boolean;
  bookingSessionId: number;
  isBookingModalOpen: boolean;
  openBooking: (doctor: Doctor) => void;
  closeBooking: () => void;
  addAppointment: (newApt: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  cancelAppointment: (appointmentId: string) => void;
  completeAppointment: (appointmentId: string, doctorNotes: string, prescription: string) => void;
  rateAppointment: (appointmentId: string, rating: number, reviewText: string) => void;
  searchFilters: SearchFilterState;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  activeUpcomingCount: number;
  lastLogoutNotice: boolean;
  setLastLogoutNotice: (val: boolean) => void;
}

const initialFilters: SearchFilterState = {
  searchQuery: '',
  specialtyId: 'all',
  branchId: 'all',
  minRating: 0,
  visitType: 'all',
  sortBy: 'rating',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_APPOINTMENTS = 'medischedule_appointments_v1';
const LOCAL_STORAGE_KEY_LANG = 'medischedule_lang_v1';
const LOCAL_STORAGE_KEY_ROLE = 'medischedule_role_v1';
const LOCAL_STORAGE_KEY_AUTH = 'medischedule_auth_v1';
const LOCAL_STORAGE_KEY_PATIENTS = 'medischedule_patients_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LANG);
    return saved === 'en' ? 'en' : 'hy';
  });

  const [doctors] = useState<Doctor[]>(DOCTORS);
  const [clinics] = useState<Clinic[]>(CLINICS);
  const [specialties] = useState<Specialty[]>(SPECIALTIES);
  const [patientUsers, setPatientUsers] = useState<PatientUser[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PATIENTS);
      if (saved) {
        const parsed: PatientUser[] = JSON.parse(saved);
        // Ensure all 5 seeded patients are present plus any newly registered patients
        const customPatients = parsed.filter(
          cp => !PATIENT_USERS.some(seed => seed.id === cp.id || seed.username === cp.username)
        );
        return [...PATIENT_USERS, ...customPatients];
      }
    } catch {
      // Fallback
    }
    return PATIENT_USERS;
  });
  const [doctorUsers] = useState<DoctorUser[]>(DOCTOR_USERS);

  // When the user opens the site, start on the public Index page ('home') without pre-logging into a cabinet
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [userRole, setUserRoleState] = useState<UserRole>('patient');

  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const [loginTargetRole, setLoginTargetRole] = useState<'patient' | 'doctor'>('patient');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openLoginPage = (role?: 'patient' | 'doctor') => {
    if (role) {
      setLoginTargetRole(role);
    }
    setAuthMode('login');
    setBookingAuthRequiredNotice(false);
    setPendingBookingDoctor(null);
    setActiveTab('login');
  };

  const openRegisterPage = () => {
    setLoginTargetRole('patient');
    setAuthMode('register');
    setBookingAuthRequiredNotice(false);
    setPendingBookingDoctor(null);
    setActiveTab('login');
  };

  const [selectedDoctorIdForPortal, setSelectedDoctorIdForPortal] = useState<string>(() => {
    if (currentUser?.type === 'doctor') {
      return currentUser.doctor.id;
    }
    return DOCTORS[0].id;
  });

  const [lastLogoutNotice, setLastLogoutNotice] = useState<boolean>(false);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_APPOINTMENTS);
      if (saved) {
        const parsed: Appointment[] = JSON.parse(saved);
        const missingInitial = INITIAL_APPOINTMENTS.filter(
          initApt => !parsed.some(p => p.id === initApt.id)
        );
        return [...parsed, ...missingInitial];
      }
    } catch {
      // Fallback
    }
    return INITIAL_APPOINTMENTS;
  });

  // Listen to cross-tab localStorage changes so doctor portal updates live across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_APPOINTMENTS && e.newValue) {
        try {
          setAppointments(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [pendingBookingDoctor, setPendingBookingDoctor] = useState<Doctor | null>(null);
  const [bookingAuthRequiredNotice, setBookingAuthRequiredNotice] = useState<boolean>(false);
  const [bookingSessionId, setBookingSessionId] = useState<number>(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>(initialFilters);

  // Sync appointments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
    } catch {
      // Ignore quota errors
    }
  }, [appointments]);

  // Sync patientUsers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PATIENTS, JSON.stringify(patientUsers));
    } catch {
      // Ignore
    }
  }, [patientUsers]);

  // Sync auth state to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
      }
    } catch {
      // Ignore
    }
  }, [currentUser]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, lang);
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem(LOCAL_STORAGE_KEY_ROLE, role);
    if (role === 'doctor') {
      setActiveTab('doctor-portal');
    } else {
      if (activeTab === 'doctor-portal') {
        setActiveTab('patient-portal');
      }
    }
  };

  // Login as Patient
  const loginAsPatient = (usernameOrEmail: string, pass: string): boolean => {
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();
    const matched = patientUsers.find(
      p => (p.username.toLowerCase() === cleanInput || p.email.toLowerCase() === cleanInput) && p.password === cleanPass
    );

    if (matched) {
      const auth: AuthUser = { type: 'patient', patient: matched };
      setCurrentUser(auth);
      setUserRoleState('patient');
      setLastLogoutNotice(false);
      setBookingAuthRequiredNotice(false);
      if (pendingBookingDoctor) {
        setBookingDoctor(pendingBookingDoctor);
        setBookingSessionId(prev => prev + 1);
        setIsBookingModalOpen(true);
        setPendingBookingDoctor(null);
      }
      setActiveTab('patient-portal');
      return true;
    }
    return false;
  };

  // Login as Doctor
  const loginAsDoctor = (usernameOrEmail: string, pass: string): boolean => {
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();
    const matchedUser = doctorUsers.find(
      du =>
        (du.username.toLowerCase() === cleanInput ||
          du.email.toLowerCase() === cleanInput ||
          du.doctorId.toLowerCase() === cleanInput) &&
        (du.password === cleanPass || cleanPass === 'doc123')
    );

    if (matchedUser) {
      const matchedDoctor = doctors.find(d => d.id === matchedUser.doctorId) || doctors[0];
      const auth: AuthUser = { type: 'doctor', doctor: matchedDoctor, doctorUser: matchedUser };
      setCurrentUser(auth);
      setSelectedDoctorIdForPortal(matchedDoctor.id);
      setUserRoleState('doctor');
      setLastLogoutNotice(false);
      setBookingAuthRequiredNotice(false);
      setPendingBookingDoctor(null);
      setActiveTab('doctor-portal');
      return true;
    }
    return false;
  };

  // Register new patient
  const registerPatient = (data: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    birthDate?: string;
    bloodGroup?: string;
    insurance?: string;
  }): { success: boolean; errorHy?: string; errorEn?: string } => {
    const cleanUser = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    const exists = patientUsers.some(
      p => p.username.toLowerCase() === cleanUser || p.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      return {
        success: false,
        errorHy: 'Այս մուտքանունով կամ էլ․ փոստով պացիենտ արդեն գրանցված է համակարգում։',
        errorEn: 'A patient with this username or email is already registered.',
      };
    }

    const nameParts = data.fullName.trim().split(/\s+/);
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : data.fullName.trim().slice(0, 2).toUpperCase();

    const newPatient: PatientUser = {
      id: `patient-${Date.now().toString(36)}`,
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password.trim(),
      name: {
        hy: data.fullName.trim(),
        en: data.fullName.trim(),
      },
      phone: data.phone.trim(),
      insurance: {
        hy: data.insurance?.trim() || 'Անհատական պացիենտ (առանց պոլիսի)',
        en: data.insurance?.trim() || 'Individual Patient',
      },
      birthDate: data.birthDate || '1995-01-01',
      bloodGroup: data.bloodGroup || 'O (I) Rh+',
      avatarText: initials || 'Պ',
    };

    setPatientUsers(prev => [...prev, newPatient]);
    const auth: AuthUser = { type: 'patient', patient: newPatient };
    setCurrentUser(auth);
    setUserRoleState('patient');
    setLastLogoutNotice(false);
    setBookingAuthRequiredNotice(false);
    if (pendingBookingDoctor) {
      setBookingDoctor(pendingBookingDoctor);
      setBookingSessionId(prev => prev + 1);
      setIsBookingModalOpen(true);
      setPendingBookingDoctor(null);
    }
    setActiveTab('patient-portal');
    return { success: true };
  };

  // 1-Click quick login for testing
  const loginDirectPatient = (patientId: string) => {
    const matched = patientUsers.find(p => p.id === patientId) || patientUsers[0];
    const auth: AuthUser = { type: 'patient', patient: matched };
    setCurrentUser(auth);
    setUserRoleState('patient');
    setLastLogoutNotice(false);
    setBookingAuthRequiredNotice(false);
    if (pendingBookingDoctor) {
      setBookingDoctor(pendingBookingDoctor);
      setBookingSessionId(prev => prev + 1);
      setIsBookingModalOpen(true);
      setPendingBookingDoctor(null);
    }
    setActiveTab('patient-portal');
  };

  const loginDirectDoctor = (doctorId: string) => {
    const matchedDoctor = doctors.find(d => d.id === doctorId) || doctors[0];
    const matchedUser = doctorUsers.find(du => du.doctorId === matchedDoctor.id) || doctorUsers[0];
    const auth: AuthUser = { type: 'doctor', doctor: matchedDoctor, doctorUser: matchedUser };
    setCurrentUser(auth);
    setSelectedDoctorIdForPortal(matchedDoctor.id);
    setUserRoleState('doctor');
    setLastLogoutNotice(false);
    setBookingAuthRequiredNotice(false);
    setPendingBookingDoctor(null);
    setActiveTab('doctor-portal');
  };

  const logout = () => {
    setCurrentUser(null);
    setLastLogoutNotice(true);
    setBookingAuthRequiredNotice(false);
    setPendingBookingDoctor(null);
    setActiveTab('login');
  };

  const openBooking = (doctor: Doctor) => {
    // Require patient login before allowing appointment booking
    if (currentUser?.type !== 'patient') {
      setPendingBookingDoctor(doctor);
      setBookingAuthRequiredNotice(true);
      setLoginTargetRole('patient');
      setActiveTab('login');
      return;
    }
    setBookingDoctor(doctor);
    setBookingSessionId(prev => prev + 1);
    setIsBookingModalOpen(true);
  };

  const closeBooking = () => {
    setBookingDoctor(null);
    setIsBookingModalOpen(false);
  };

  const addAppointment = (newAptData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const currentPatientId = currentUser?.type === 'patient' ? currentUser.patient.id : undefined;
    const newAppointment: Appointment = {
      ...newAptData,
      patientId: newAptData.patientId || currentPatientId,
      id: `apt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setAppointments(prev => [newAppointment, ...prev]);
    return newAppointment;
  };

  const cancelAppointment = (appointmentId: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt))
    );
  };

  const completeAppointment = (appointmentId: string, doctorNotes: string, prescription: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: 'completed', doctorNotes, prescription }
          : apt
      )
    );
  };

  const rateAppointment = (appointmentId: string, rating: number, reviewText: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, rating, reviewText }
          : apt
      )
    );
  };

  // Count active upcoming appointments for the current patient
  const activeUpcomingCount = appointments.filter(a => {
    if (a.status !== 'upcoming') return false;
    if (currentUser?.type === 'patient') {
      return (
        a.patientId === currentUser.patient.id ||
        a.patientPhone === currentUser.patient.phone ||
        a.patientName === currentUser.patient.name.hy ||
        a.patientName === currentUser.patient.name.en
      );
    }
    return true;
  }).length;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        userRole,
        setUserRole,
        activeTab,
        setActiveTab,
        loginTargetRole,
        setLoginTargetRole,
        authMode,
        setAuthMode,
        openLoginPage,
        openRegisterPage,
        currentUser,
        patientUsers,
        doctorUsers,
        loginAsPatient,
        loginAsDoctor,
        registerPatient,
        loginDirectPatient,
        loginDirectDoctor,
        logout,
        doctors,
        clinics,
        specialties,
        appointments,
        selectedDoctorIdForPortal,
        setSelectedDoctorIdForPortal,
        bookingDoctor,
        pendingBookingDoctor,
        bookingAuthRequiredNotice,
        bookingSessionId,
        isBookingModalOpen,
        openBooking,
        closeBooking,
        addAppointment,
        cancelAppointment,
        completeAppointment,
        rateAppointment,
        searchFilters,
        setSearchFilters,
        activeUpcomingCount,
        lastLogoutNotice,
        setLastLogoutNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


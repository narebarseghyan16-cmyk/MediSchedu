import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DoctorSearch } from './components/DoctorSearch';
import { PatientPortal } from './components/PatientPortal';
import { DoctorPortal } from './components/DoctorPortal';
import { ClinicsDirectory } from './components/ClinicsDirectory';
import { BookingModal } from './components/BookingModal';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { HeartPulse, PhoneCall, ShieldCheck, Clock } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, language, isBookingModalOpen, bookingDoctor, bookingSessionId } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Emergency Hotline Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-800 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-semibold">
              {language === 'hy'
                ? 'Շտապ օգնություն՝ 1-03'
                : 'Emergency Ambulance: 1-03'}
            </span>
            <span className="text-teal-200 hidden sm:inline">•</span>
            <span className="text-teal-100 hidden sm:inline">
              {language === 'hy'
                ? 'Առողջապահության նախարարության թեժ գիծ՝ 8003'
                : 'Ministry of Health Hotline: 8003'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-teal-200 text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {language === 'hy'
                ? 'Առցանց ամրագրում 24/7'
                : '24/7 Online Booking System'}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && <LandingPage />}
        {activeTab === 'search' && <DoctorSearch />}
        {activeTab === 'patient-portal' && <PatientPortal />}
        {activeTab === 'doctor-portal' && <DoctorPortal />}
        {activeTab === 'clinics' && <ClinicsDirectory />}
        {activeTab === 'login' && <LoginPage />}
      </main>

      {/* Global Booking Modal - Keyed by doctor and session ID to guarantee clean state on each booking */}
      {isBookingModalOpen && bookingDoctor && (
        <BookingModal key={`booking-modal-${bookingDoctor.id}-${bookingSessionId}`} />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              M
            </div>
            <span className="font-bold text-slate-800 text-sm">MediSchedule</span>
            <span>—</span>
            <span>
              {language === 'hy'
                ? 'Բժշկի ընդունելության և կլինիկաների ամրագրման համակարգ'
                : 'Doctor Appointment and Clinic Booking System'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              {language === 'hy' ? 'Պաշտպանված բժշկական տվյալներ' : 'HIPAA/GDPR Compliant Data'}
            </span>
            <span>•</span>
            <span>Երևան, Հայաստան</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

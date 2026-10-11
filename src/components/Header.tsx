import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import {
  CalendarDays,
  User,
  Stethoscope,
  Building2,
  CalendarCheck,
  Languages,
  Search,
  LogIn,
  LogOut,
  UserPlus,
  Home,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    openLoginPage,
    openRegisterPage,
    activeUpcomingCount,
    currentUser,
    logout,
    specialties,
  } = useApp();

  const strings = t[language];
  const isDoctor = currentUser?.type === 'doctor';
  const isPatient = currentUser?.type === 'patient';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Medi<span className="text-teal-600">Schedule</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {isDoctor
                    ? language === 'hy'
                      ? 'Բժշկի պորտալ'
                      : 'Doctor Portal'
                    : language === 'hy'
                    ? 'Բուժհամակարգ'
                    : 'Healthcare'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {strings.tagline}
              </p>
            </div>
          </div>

          {/* Center Navigation - STRICT ROLE SEPARATION + SHARED INDEX PAGE */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-home-btn"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4 text-teal-600" />
              <span>{strings.navHome}</span>
            </button>

            {/* If DOCTOR: ONLY DOCTOR-RELATED NAVIGATION */}
            {isDoctor && (
              <>
                <button
                  id="nav-doctor-portal-btn"
                  onClick={() => setActiveTab('doctor-portal')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'doctor-portal'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>{strings.navDoctorPortal}</span>
                </button>

                <button
                  id="nav-search-btn"
                  onClick={() => setActiveTab('search')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'search'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>
                    {language === 'hy' ? 'Բժիշկների ցուցակ' : 'Doctors Directory'}
                  </span>
                </button>

                <button
                  id="nav-clinics-btn"
                  onClick={() => setActiveTab('clinics')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'clinics'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>{strings.navClinics}</span>
                </button>
              </>
            )}

            {/* If PATIENT: ONLY PATIENT-RELATED NAVIGATION (NO DOCTOR PORTAL!) */}
            {isPatient && (
              <>
                <button
                  id="nav-search-btn"
                  onClick={() => setActiveTab('search')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'search'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>{strings.navSearch}</span>
                </button>

                <button
                  id="nav-clinics-btn"
                  onClick={() => setActiveTab('clinics')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'clinics'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>{strings.navClinics}</span>
                </button>
              </>
            )}

            {/* If GUEST / NOT LOGGED IN: Public Navigation */}
            {!currentUser && (
              <>
                <button
                  id="nav-search-btn"
                  onClick={() => setActiveTab('search')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'search'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>{strings.navSearch}</span>
                </button>

                <button
                  id="nav-clinics-btn"
                  onClick={() => setActiveTab('clinics')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'clinics'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>{strings.navClinics}</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: User Profile + Login / Logout + Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If LOGGED IN: Show User Profile badge & Logout button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* User Info Capsule */}
                <div
                  onClick={() => setActiveTab(isDoctor ? 'doctor-portal' : 'patient-portal')}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors"
                  title={strings.switchAccount}
                >
                  {isDoctor ? (
                    <img
                      src={currentUser.doctor.avatarUrl}
                      alt={currentUser.doctor.name[language]}
                      className="w-7 h-7 rounded-lg object-cover border border-teal-500/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      {currentUser.patient.avatarText}
                    </div>
                  )}

                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-bold text-slate-800 leading-tight">
                      {isDoctor
                        ? currentUser.doctor.name[language]
                        : currentUser.patient.name[language]}
                    </span>
                    <span className="block text-[10px] text-teal-700 font-medium">
                      {isDoctor
                        ? specialties.find(s => s.id === currentUser.doctor.specialtyId)?.name[language]
                        : strings.rolePatient}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  id="logout-header-btn"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                  title={strings.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{strings.logout}</span>
                </button>
              </div>
            ) : (
              /* If GUEST: Show Login and Register buttons */
              <div className="flex items-center gap-2">
                <button
                  id="login-header-btn"
                  onClick={() => openLoginPage('patient')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{strings.login}</span>
                </button>

                <button
                  id="register-header-btn"
                  onClick={openRegisterPage}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                  <span>{language === 'hy' ? 'Գրանցում' : 'Register'}</span>
                </button>
              </div>
            )}

            {/* Language toggle */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLanguage(language === 'hy' ? 'en' : 'hy')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Լեզվի ընտրություն / Select Language"
            >
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'hy' ? 'ՀԱՅ' : 'ENG'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200/60 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
              activeTab === 'home' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{strings.navHome}</span>
          </button>

          {/* If Doctor Mobile */}
          {isDoctor && (
            <>
              <button
                onClick={() => setActiveTab('doctor-portal')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'doctor-portal'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{strings.navDoctorPortal}</span>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'search' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{strings.foundDoctors}</span>
              </button>
              <button
                onClick={() => setActiveTab('clinics')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'clinics' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{strings.navClinics}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 rounded-full"
              >
                <LogOut className="w-3 h-3" />
                <span>{strings.logout}</span>
              </button>
            </>
          )}

          {/* If Patient Mobile */}
          {isPatient && (
            <>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'search' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{strings.navSearch}</span>
              </button>
              <button
                onClick={() => setActiveTab('patient-portal')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'patient-portal'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{strings.navPatientPortal}</span>
                {activeUpcomingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {activeUpcomingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('clinics')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'clinics' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{strings.navClinics}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 rounded-full"
              >
                <LogOut className="w-3 h-3" />
                <span>{strings.logout}</span>
              </button>
            </>
          )}

          {/* If Guest Mobile */}
          {!currentUser && (
            <>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'search' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{strings.navSearch}</span>
              </button>
              <button
                onClick={() => setActiveTab('clinics')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'clinics' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{strings.navClinics}</span>
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${
                  activeTab === 'login' ? 'bg-teal-600 text-white' : 'text-teal-700 bg-teal-50'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{strings.login}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

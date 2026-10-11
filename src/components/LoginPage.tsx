import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import {
  User,
  Stethoscope,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  UserPlus,
  Calendar,
  HeartPulse,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    language,
    loginAsPatient,
    loginAsDoctor,
    registerPatient,
    currentUser,
    logout,
    setActiveTab,
    lastLogoutNotice,
    loginTargetRole,
    setLoginTargetRole,
    authMode,
    setAuthMode,
    bookingAuthRequiredNotice,
    pendingBookingDoctor,
  } = useApp();

  const strings = t[language];

  const [activeRoleTab, setActiveRoleTab] = useState<'patient' | 'doctor'>(loginTargetRole);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration form states
  const [regFullName, setRegFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('+374 ');
  const [regBirthDate, setRegBirthDate] = useState<string>('1995-05-15');
  const [regBloodGroup, setRegBloodGroup] = useState<string>('O (I) Rh+');
  const [regInsurance, setRegInsurance] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  useEffect(() => {
    setActiveRoleTab(loginTargetRole);
  }, [loginTargetRole]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage(
        language === 'hy'
          ? 'Խնդրում ենք լրացնել մուտքանունը և գաղտնաբառը'
          : 'Please enter both username and password'
      );
      return;
    }

    if (activeRoleTab === 'patient') {
      const ok = loginAsPatient(usernameInput, passwordInput);
      if (!ok) {
        setErrorMessage(strings.invalidCredentials);
      }
    } else {
      const ok = loginAsDoctor(usernameInput, passwordInput);
      if (!ok) {
        setErrorMessage(strings.invalidCredentials);
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !regFullName.trim() ||
      !regUsername.trim() ||
      !regEmail.trim() ||
      !regPhone.trim() ||
      !regPassword.trim()
    ) {
      setErrorMessage(
        language === 'hy'
          ? 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը'
          : 'Please fill in all required fields'
      );
      return;
    }

    if (regPassword.trim().length < 4) {
      setErrorMessage(
        language === 'hy'
          ? 'Գաղտնաբառը պետք է պարունակի առնվազն 4 նիշ'
          : 'Password must be at least 4 characters long'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(
        language === 'hy'
          ? 'Գաղտնաբառերը չեն համընկնում'
          : 'Passwords do not match'
      );
      return;
    }

    const result = registerPatient({
      fullName: regFullName,
      username: regUsername,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      birthDate: regBirthDate,
      bloodGroup: regBloodGroup,
      insurance: regInsurance,
    });

    if (!result.success) {
      setErrorMessage(language === 'hy' ? result.errorHy || '' : result.errorEn || '');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-6 animate-fade-in">
      {/* Booking Login Required Banner */}
      {bookingAuthRequiredNotice && (
        <div
          id="booking-auth-required-banner"
          className="bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold text-amber-950">
                {language === 'hy'
                  ? 'Ամրագրում կատարելու համար անհրաժեշտ է մուտք գործել պացիենտի էջ'
                  : 'Patient Sign-In Required to Book an Appointment'}
              </h3>
              <p className="text-xs sm:text-sm text-amber-800">
                {pendingBookingDoctor
                  ? language === 'hy'
                    ? `Դուք ընտրել եք «${pendingBookingDoctor.name.hy}»։ Մուտք գործեք ձեր պացիենտի հաշիվ կամ գրանցվեք, և ամրագրման պատուհանն անմիջապես կբացվի։`
                    : `You selected ${pendingBookingDoctor.name.en}. Please sign in or register as a patient to continue booking.`
                  : language === 'hy'
                  ? 'Խնդրում ենք մուտք գործել պացիենտի ձեր անձնական էջ՝ ժամ ամրագրելու համար։'
                  : 'Please sign in to your personal patient account to book a time slot.'}
              </p>
            </div>
          </div>
          {pendingBookingDoctor && (
            <div className="flex items-center gap-2.5 bg-white/80 px-3.5 py-2 rounded-xl border border-amber-200 shrink-0">
              <img
                src={pendingBookingDoctor.avatarUrl}
                alt={pendingBookingDoctor.name[language]}
                className="w-9 h-9 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">{pendingBookingDoctor.name[language]}</p>
                <p className="text-slate-500">
                  {pendingBookingDoctor.consultationFee.toLocaleString()} ֏
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logout Notice Banner */}
      {lastLogoutNotice && !currentUser && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{strings.loggedOutSuccess}</p>
        </div>
      )}

      {/* Active User Card (if already logged in) */}
      {currentUser && (
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center">
              {currentUser.type === 'patient' ? (
                currentUser.patient.avatarText
              ) : (
                <img
                  src={currentUser.doctor.avatarUrl}
                  alt={currentUser.doctor.name[language]}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-teal-800">
                {currentUser.type === 'patient' ? strings.rolePatient : strings.roleDoctor}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {currentUser.type === 'patient'
                  ? currentUser.patient.name[language]
                  : currentUser.doctor.name[language]}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() =>
                setActiveTab(currentUser.type === 'patient' ? 'patient-portal' : 'doctor-portal')
              }
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors"
            >
              <span>{language === 'hy' ? 'Անցնել անձնական էջ' : 'Go to Personal Page'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{strings.logout}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Auth Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header with Title and Role / Register Switcher */}
        <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-slate-50/50">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20 mb-1">
              {authMode === 'register' ? (
                <UserPlus className="w-6 h-6" />
              ) : (
                <KeyRound className="w-6 h-6" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {authMode === 'register'
                ? language === 'hy'
                  ? 'Նոր պացիենտի գրանցում'
                  : 'New Patient Registration'
                : strings.loginTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {authMode === 'register'
                ? language === 'hy'
                  ? 'Լրացրեք ձեր անձնական տվյալները՝ սեփական պացիենտի էջ ստեղծելու համար'
                  : 'Create your personal patient account to book and manage appointments'
                : strings.loginSubtitle}
            </p>
          </div>

          {/* 3-Way Segmented Control: Patient Sign In | Patient Register | Doctor Sign In */}
          <div className="grid grid-cols-3 p-1 bg-slate-200/70 rounded-2xl mt-6 gap-1">
            <button
              type="button"
              id="login-tab-patient"
              onClick={() => {
                setAuthMode('login');
                setActiveRoleTab('patient');
                setLoginTargetRole('patient');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'login' && activeRoleTab === 'patient'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{strings.loginPatientTab}</span>
            </button>

            <button
              type="button"
              id="register-tab-patient"
              onClick={() => {
                setAuthMode('register');
                setActiveRoleTab('patient');
                setLoginTargetRole('patient');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">
                {language === 'hy' ? 'Գրանցում' : 'Register'}
              </span>
            </button>

            <button
              type="button"
              id="login-tab-doctor"
              onClick={() => {
                setAuthMode('login');
                setActiveRoleTab('doctor');
                setLoginTargetRole('doctor');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'login' && activeRoleTab === 'doctor'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{strings.loginDoctorTab}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'login' ? (
            /* SIGN IN FORM (Patient or Doctor) */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {strings.usernameOrEmail}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="login-username-input"
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    placeholder={
                      activeRoleTab === 'patient'
                        ? language === 'hy'
                          ? 'Մուտքագրեք ձեր մուտքանունը կամ էլ․ փոստը'
                          : 'Enter your patient username or email'
                        : language === 'hy'
                        ? 'Մուտքագրեք բժշկի մուտքանունը կամ էլ․ փոստը'
                        : 'Enter your doctor username or email'
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {strings.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{strings.signInBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {activeRoleTab === 'patient' && (
                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-600">
                    {language === 'hy' ? 'Դեռ գրանցված չե՞ք համակարգում։ ' : "Don't have an account yet? "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMessage(null);
                      }}
                      className="font-bold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                    >
                      {language === 'hy' ? 'Գրանցվել որպես նոր պացիենտ' : 'Register as a new patient'}
                    </button>
                  </p>
                </div>
              )}
            </form>
          ) : (
            /* NEW PATIENT REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hy' ? 'Անուն Ազգանուն *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="register-fullname-input"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder={language === 'hy' ? 'Օր․՝ Արմեն Հակոբյան' : 'e.g. Armen Hakobyan'}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'hy' ? 'Մուտքանուն (Login) *' : 'Username *'}
                  </label>
                  <input
                    type="text"
                    id="register-username-input"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="armen.hakobyan"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'hy' ? 'Հեռախոսահամար *' : 'Phone Number *'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="register-phone-input"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+374 91 00 00 00"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hy' ? 'Էլ․ փոստ *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="register-email-input"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="name@mail.am"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'hy' ? 'Ծննդյան ամսաթիվ' : 'Date of Birth'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={regBirthDate}
                      onChange={e => setRegBirthDate(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'hy' ? 'Արյան խումբ' : 'Blood Group'}
                  </label>
                  <div className="relative">
                    <select
                      value={regBloodGroup}
                      onChange={e => setRegBloodGroup(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="O (I) Rh+">O (I) Rh+</option>
                      <option value="O (I) Rh-">O (I) Rh-</option>
                      <option value="A (II) Rh+">A (II) Rh+</option>
                      <option value="A (II) Rh-">A (II) Rh-</option>
                      <option value="B (III) Rh+">B (III) Rh+</option>
                      <option value="B (III) Rh-">B (III) Rh-</option>
                      <option value="AB (IV) Rh+">AB (IV) Rh+</option>
                      <option value="AB (IV) Rh-">AB (IV) Rh-</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hy'
                    ? 'Բժշկական ապահովագրություն (ըստ ցանկության)'
                    : 'Health Insurance (Optional)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regInsurance}
                    onChange={e => setRegInsurance(e.target.value)}
                    placeholder={
                      language === 'hy'
                        ? 'Օր․՝ «Ինգո Արմենիա» կամ թողեք դատարկ'
                        : 'e.g. Ingo Armenia or leave blank'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'hy' ? 'Գաղտնաբառ *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="register-password-input"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'hy' ? 'Կրկնել գաղտնաբառը *' : 'Confirm Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="register-confirm-password-input"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                id="register-submit-btn"
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {language === 'hy' ? 'Գրանցվել և մուտք գործել' : 'Create Account & Sign In'}
                </span>
              </button>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  {language === 'hy' ? 'Արդեն ունե՞ք հաշիվ։ ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                  >
                    {language === 'hy' ? 'Մուտք գործել' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

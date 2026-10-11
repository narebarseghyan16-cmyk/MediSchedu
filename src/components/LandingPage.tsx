import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import {
  CalendarDays,
  Stethoscope,
  User,
  LogIn,
  UserPlus,
  Search,
  Building2,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  FileText,
  CalendarCheck,
  HeartPulse,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    language,
    setActiveTab,
    openLoginPage,
    openRegisterPage,
    currentUser,
    doctors,
    clinics,
    specialties,
    setSearchFilters,
    openBooking,
  } = useApp();

  const strings = t[language];

  const handleSelectSpecialty = (specialtyId: string) => {
    setSearchFilters(prev => ({
      ...prev,
      specialtyId,
    }));
    setActiveTab('search');
  };

  const featuredDoctors = doctors.slice(0, 8);

  return (
    <div className="space-y-14 pb-16">
      {/* Active Session Quick Return Banner (if user is logged in and visits Index page) */}
      {currentUser && (
        <div className="bg-teal-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-teal-200 font-medium">
              {language === 'hy' ? 'Դուք մուտք եք գործել համակարգ' : 'You are currently signed in'}
            </p>
            <h2 className="text-lg font-bold tracking-wide">
              {currentUser.type === 'patient'
                ? currentUser.patient.name[language]
                : currentUser.doctor.name[language]}
              {' · '}
              <span className="font-normal text-teal-200 text-sm">
                {currentUser.type === 'patient' ? strings.rolePatient : strings.roleDoctor}
              </span>
            </h2>
          </div>
          <button
            onClick={() =>
              setActiveTab(currentUser.type === 'doctor' ? 'doctor-portal' : 'patient-portal')
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-950 hover:bg-teal-50 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <span>
              {currentUser.type === 'doctor'
                ? language === 'hy'
                  ? 'Անցնել Բժշկի անձնական էջ'
                  : 'Go to Doctor Portal'
                : language === 'hy'
                ? 'Անցնել Պացիենտի անձնական էջ'
                : 'Go to Patient Portal'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section — Unified Index Page for Both Doctors and Patients */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-teal-300 font-medium tracking-wide">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <span>
              {language === 'hy'
                ? 'Միասնական բժշկական հարթակ · Պացիենտների և Բժիշկների համար'
                : 'Unified Healthcare Platform · For Patients & Doctors'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-2xl">
            {language === 'hy'
              ? 'Բժշկի ընդունելության ամրագրման և կլինիկական կառավարման համակարգ'
              : 'Medical Appointment Booking & Clinical Schedule Management'}
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
            {language === 'hy'
              ? 'Բարի գալուստ MediSchedule գլխավոր էջ։ Այստեղից կարող եք ծանոթանալ կլինիկաներին և մասնագետներին, այնուհետև մուտք գործել ձեր անձնական էջ՝ որպես պացիենտ կամ բժիշկ։'
              : 'Welcome to the MediSchedule index portal. Explore partner clinics and specialists, then sign in to access your dedicated personal patient or doctor workspace.'}
          </p>

          {/* Primary Gateway Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <button
              id="hero-login-main-btn"
              onClick={() => openLoginPage('patient')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {language === 'hy'
                  ? 'Մուտք գործել անձնական էջ'
                  : 'Sign In to Personal Portal'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-register-btn"
              onClick={openRegisterPage}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white text-slate-950 hover:bg-teal-50 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-teal-700" />
              <span>
                {language === 'hy' ? 'Նոր պացիենտի գրանցում' : 'Register as New Patient'}
              </span>
            </button>

            <button
              id="hero-search-doctors-btn"
              onClick={() => setActiveTab('search')}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/15 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-teal-300" />
              <span>
                {language === 'hy' ? 'Դիտել բոլոր բժիշկներին' : 'Browse Doctors'}
              </span>
            </button>
          </div>

          {/* Key Platform Facts — Clean unboxed metadata with typographic separators */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-300 tabular-nums">
            <span>
              <strong className="text-white font-semibold">{doctors.length}</strong>{' '}
              {language === 'hy' ? 'ավագ մասնագետներ' : 'senior specialists'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-white font-semibold">{clinics.length}</strong>{' '}
              {language === 'hy' ? 'գործընկեր բժշկական կենտրոններ' : 'partner medical centers'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-white font-semibold">24/7</strong>{' '}
              {language === 'hy' ? 'առցանց ամրագրում և գրանցում' : 'online booking & registration'}
            </span>
          </div>
        </div>
      </section>

      {/* Dual Role Entry Section — Separate Gateways for Patients and Doctors */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {language === 'hy'
              ? 'Անձնական կաբինետների մուտքի հարթակ'
              : 'Personal Portal Access for Patients & Doctors'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {language === 'hy'
              ? 'Ընտրեք ձեր կարգավիճակը՝ մուտքի էջ անցնելու և ձեր անհատական էջ մուտք գործելու համար'
              : 'Select your role to proceed to the login screen and enter your personal workspace'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Portal Gateway Card */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {language === 'hy' ? 'Պացիենտների համար' : 'For Patients'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {language === 'hy' ? 'Պացիենտի անձնական էջ' : 'Patient Personal Portal'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {language === 'hy'
                    ? 'Մուտք գործեք ձեր պացիենտի հաշիվ՝ բժշկի մոտ ազատ ժամեր ամրագրելու, ձեր առաջիկա և անցյալ այցելությունները կառավարելու, ինչպես նաև բժշկական եզրակացություններն ու դեղատոմսերը տեսնելու համար։'
                    : 'Sign in with your patient credentials to book available slots, manage upcoming and past visits, and view clinical diagnoses and prescriptions.'}
                </p>
              </div>

              <ul className="space-y-2.5 pt-2 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {language === 'hy'
                      ? 'Անսահմանափակ ամրագրումներ տարբեր մասնագետների մոտ'
                      : 'Unlimited bookings across all medical specialists'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {language === 'hy'
                      ? 'Ակտիվ և ավարտված այցելությունների ամբողջական պատմություն'
                      : 'Complete history of active and completed appointments'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {language === 'hy'
                      ? 'Անվանական և պաշտպանված անձնական բժշկական էջ'
                      : 'Private and secure personal medical profile'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                id="landing-patient-register-btn"
                onClick={openRegisterPage}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-teal-700" />
                <span>
                  {language === 'hy' ? 'Գրանցվել' : 'Register'}
                </span>
              </button>
              <button
                id="landing-patient-login-btn"
                onClick={() => {
                  if (currentUser?.type === 'patient') {
                    setActiveTab('patient-portal');
                  } else {
                    openLoginPage('patient');
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {currentUser?.type === 'patient'
                    ? language === 'hy'
                      ? 'Բացել իմ էջը'
                      : 'Open My Portal'
                    : language === 'hy'
                    ? 'Մուտք որպես Պացիենտ'
                    : 'Patient Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Doctor Portal Gateway Card */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-teal-700" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {language === 'hy' ? 'Բժիշկների համար' : 'For Doctors'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {language === 'hy' ? 'Բժշկի աշխատանքային կաբինետ' : 'Doctor Workstation Portal'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {language === 'hy'
                    ? 'Մուտք գործեք ձեր անհատական բժշկական հաշիվ՝ օրվա ժամանակացույցը տեսնելու, գրանցված պացիենտներին ընդունելու, ախտորոշումներ և էլեկտրոնային դեղատոմսեր լրացնելու համար։'
                    : 'Sign in to your personal doctor account to review daily schedules, manage registered patients, and record clinical notes and prescriptions.'}
                </p>
              </div>

              <ul className="space-y-2.5 pt-2 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {language === 'hy'
                      ? 'Օրվա ժամանակացույց և ազատ/զբաղված սլոթների վերահսկում'
                      : 'Daily schedule timeline and slot occupancy tracking'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {language === 'hy'
                      ? 'Պացիենտի ընդունելության ավարտում և դեղատոմսի նշանակում'
                      : 'Consultation completion with diagnosis & prescription'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {language === 'hy'
                      ? `Անհատական հաշիվներ բոլոր ${doctors.length} մասնագետների համար`
                      : `Dedicated accounts for all ${doctors.length} clinic specialists`}
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                id="landing-doctor-login-btn"
                onClick={() => {
                  if (currentUser?.type === 'doctor') {
                    setActiveTab('doctor-portal');
                  } else {
                    openLoginPage('doctor');
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>
                  {currentUser?.type === 'doctor'
                    ? language === 'hy'
                      ? 'Բացել Բժշկի կաբինետը'
                      : 'Open Doctor Portal'
                    : language === 'hy'
                    ? 'Մուտք որպես Բժիշկ'
                    : 'Doctor Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — 3 Clear Editorial Steps */}
      <section className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200/80 space-y-6">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {language === 'hy'
              ? 'Ինչպես օգտվել համակարգից'
              : 'How the MediSchedule Platform Works'}
          </h2>
          <p className="text-sm text-slate-500">
            {language === 'hy'
              ? 'Պարզ և հստակ քայլեր պացիենտների և բժիշկների համար'
              : 'Simple workflow from the public index page to your personal cabinet'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
              01. {language === 'hy' ? 'ԸՆՏՐՈՒԹՅՈՒՆ' : 'EXPLORE'}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'hy'
                ? 'Ծանոթացեք մասնագետներին և կլինիկաներին'
                : 'Explore Specialists & Clinics'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {language === 'hy'
                ? 'Գլխավոր էջում դիտեք բժշկական մասնագիտությունները, մասնաճյուղերը, բժիշկների փորձը և ընդունելության արժեքները։'
                : 'Browse medical specialties, hospital branches, doctor qualifications, and consultation fees directly from the index page.'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
              02. {language === 'hy' ? 'ԱՎՏՈՐԻԶԱՑԻԱ' : 'SIGN IN'}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'hy'
                ? 'Մուտք գործեք ձեր լոգինով և գաղտնաբառով'
                : 'Sign In with Your Credentials'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {language === 'hy'
                ? 'Անցեք «Մուտք» բաժին, ընտրեք Պացիենտի կամ Բժշկի մուտքը և մուտքագրեք ձեր տվյալները (կամ օգտվեք արագ մուտքի քարտերից)։'
                : 'Navigate to the Sign In page, select Patient or Doctor login, and enter your credentials or use one-click demo access.'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
              03. {language === 'hy' ? 'ԱՆՁՆԱԿԱՆ ԷՋ' : 'PERSONAL PORTAL'}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'hy'
                ? 'Կառավարեք այցերը անձնական կաբինետում'
                : 'Manage Visits in Your Personal Page'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {language === 'hy'
                ? 'Պացիենտները տեսնում են իրենց ամրագրումներն ու դեղատոմսերը, իսկ բժիշկները՝ իրենց օրվա գրաֆիկը և գրանցված հիվանդներին։'
                : 'Patients manage their bookings and prescriptions, while doctors manage their daily schedule and registered patient roster.'}
            </p>
          </div>
        </div>
      </section>

      {/* Medical Specialties Explorer */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {language === 'hy' ? 'Բժշկական մասնագիտություններ' : 'Medical Specialties'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {language === 'hy'
                ? 'Սեղմեք մասնագիտության վրա՝ համապատասխան բժիշկներին տեսնելու համար'
                : 'Select a specialty to filter specialists in the directory'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            <span>{language === 'hy' ? 'Բոլոր բժիշկները' : 'View all doctors'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {specialties.map(spec => (
            <button
              key={spec.id}
              onClick={() => handleSelectSpecialty(spec.id)}
              className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-teal-500 text-left transition-all group cursor-pointer"
            >
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                {spec.name[language]}
              </h3>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                {spec.doctorCount} {language === 'hy' ? 'մասնագետ' : 'specialists'}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Specialists Preview */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {language === 'hy' ? 'Առաջատար բժիշկ-մասնագետներ' : 'Featured Specialists'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {language === 'hy'
                ? 'Բարձր վարկանիշ ունեցող մասնագետներ Երևանի առաջատար կլինիկաներից'
                : 'Top-rated specialists across partner clinics in Yerevan'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            <span>
              {language === 'hy'
                ? `Դիտել բոլորը (${doctors.length})`
                : `See all (${doctors.length})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredDoctors.map(doc => {
            const spec = specialties.find(s => s.id === doc.specialtyId);
            const cln = clinics.find(c => c.id === doc.clinicId);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name[language]}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-teal-700 truncate">
                        {spec?.name[language]}
                      </p>
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {doc.name[language]}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {cln?.name[language]}
                      </p>
                    </div>
                  </div>

                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums pt-1">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {doc.rating}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {doc.experienceYears} {strings.yearsExp}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.consultationFee.toLocaleString()} ֏</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => openBooking(doc)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    {strings.bookAppointment}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

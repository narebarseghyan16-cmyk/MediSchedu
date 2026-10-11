import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import { Doctor, SearchFilterState } from '../types';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  Video,
  Building,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  Award,
  Sparkles,
  HeartPulse,
  Stethoscope,
  Baby,
  Brain,
  ShieldAlert,
  Eye,
  Activity,
  Phone,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const DoctorSearch: React.FC = () => {
  const {
    doctors,
    clinics,
    specialties,
    language,
    searchFilters,
    setSearchFilters,
    openBooking,
  } = useApp();

  const strings = t[language];
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);

  // Icon mapping for specialties
  const getSpecialtyIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-amber-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-cyan-600" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-orange-500" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-indigo-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-emerald-600" />;
      default:
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
    }
  };

  // Clinic branches list for filtering
  const branchOptions = useMemo(() => {
    const branches = new Set<string>();
    clinics.forEach(c => branches.add(c.branch[language]));
    return Array.from(branches);
  }, [clinics, language]);

  // Filtering & sorting logic
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      // 1. Specialty filter
      if (searchFilters.specialtyId !== 'all' && doctor.specialtyId !== searchFilters.specialtyId) {
        return false;
      }

      // 2. Branch filter
      if (searchFilters.branchId !== 'all') {
        const clinic = clinics.find(c => c.id === doctor.clinicId);
        if (!clinic || clinic.branch[language] !== searchFilters.branchId) {
          return false;
        }
      }

      // 3. Minimum rating filter
      if (searchFilters.minRating > 0 && doctor.rating < searchFilters.minRating) {
        return false;
      }

      // 4. Visit type filter
      if (searchFilters.visitType === 'online' && !doctor.allowsOnline) {
        return false;
      }

      // 5. Query search (name, specialty name, clinic name, bio, symptoms)
      if (searchFilters.searchQuery.trim()) {
        const q = searchFilters.searchQuery.toLowerCase().trim();
        const specialty = specialties.find(s => s.id === doctor.specialtyId);
        const clinic = clinics.find(c => c.id === doctor.clinicId);

        const nameMatch =
          doctor.name.hy.toLowerCase().includes(q) ||
          doctor.name.en.toLowerCase().includes(q);

        const titleMatch =
          doctor.title.hy.toLowerCase().includes(q) ||
          doctor.title.en.toLowerCase().includes(q);

        const specialtyMatch =
          specialty &&
          (specialty.name.hy.toLowerCase().includes(q) ||
            specialty.name.en.toLowerCase().includes(q));

        const clinicMatch =
          clinic &&
          (clinic.name.hy.toLowerCase().includes(q) ||
            clinic.name.en.toLowerCase().includes(q) ||
            clinic.branch.hy.toLowerCase().includes(q) ||
            clinic.branch.en.toLowerCase().includes(q));

        const bioMatch =
          doctor.bio.hy.toLowerCase().includes(q) ||
          doctor.bio.en.toLowerCase().includes(q);

        if (!nameMatch && !titleMatch && !specialtyMatch && !clinicMatch && !bioMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (searchFilters.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (searchFilters.sortBy === 'experience') {
        return b.experienceYears - a.experienceYears;
      }
      if (searchFilters.sortBy === 'price-asc') {
        return a.consultationFee - b.consultationFee;
      }
      if (searchFilters.sortBy === 'price-desc') {
        return b.consultationFee - a.consultationFee;
      }
      return 0;
    });
  }, [doctors, clinics, specialties, searchFilters, language]);

  const resetFilters = () => {
    setSearchFilters({
      searchQuery: '',
      specialtyId: 'all',
      branchId: 'all',
      minRating: 0,
      visitType: 'all',
      sortBy: 'rating',
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-teal-950/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-medium border border-teal-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'hy' ? 'Առողջապահական ժամանակակից պորտալ' : 'Modern Healthcare Portal'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            {language === 'hy'
              ? 'Գտեք ձեր բժշկին և ամրագրեք այցելություն վայրկյանների ընթացքում'
              : 'Find your doctor and book an appointment in seconds'}
          </h1>
          <p className="text-teal-100 text-sm sm:text-base mb-6 leading-relaxed">
            {language === 'hy'
              ? 'Երևանի առաջատար կլինիկաների լավագույն մասնագետները, բաց ժամանակացույց և առցանց հերթագրում առանց զանգերի ու հերթերի։'
              : 'Top certified doctors from Yerevan medical centers, real-time slot availability, and zero waiting in line.'}
          </p>

          {/* Quick Search Bar */}
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden bg-white text-slate-800 border-2 border-teal-400/30">
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5 text-teal-600" />
            </div>
            <input
              id="search-input"
              type="text"
              value={searchFilters.searchQuery}
              onChange={e => setSearchFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder={strings.searchPlaceholder}
              className="w-full py-3.5 pl-3 pr-4 text-sm sm:text-base outline-none text-slate-900 placeholder:text-slate-400"
            />
            {searchFilters.searchQuery && (
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="pr-4 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Specialty Quick Selector Chips */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {language === 'hy' ? 'Մասնագիտացումներ' : 'Medical Specialties'}
          </h2>
          {searchFilters.specialtyId !== 'all' && (
            <button
              onClick={() => setSearchFilters(prev => ({ ...prev, specialtyId: 'all' }))}
              className="text-xs font-medium text-teal-700 hover:text-teal-800"
            >
              {language === 'hy' ? 'Դիտել բոլորը' : 'Show All'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {specialties.map(spec => {
            const isSelected = searchFilters.specialtyId === spec.id;
            return (
              <button
                key={spec.id}
                id={`specialty-pill-${spec.id}`}
                onClick={() =>
                  setSearchFilters(prev => ({
                    ...prev,
                    specialtyId: isSelected ? 'all' : spec.id,
                  }))
                }
                className={`p-3 rounded-2xl flex flex-col items-center text-center transition-all border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
                }`}
              >
                <div className={`p-2 rounded-xl mb-1.5 ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {getSpecialtyIcon(spec.icon)}
                </div>
                <span className="text-xs font-semibold line-clamp-1">
                  {spec.name[language]}
                </span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                  {spec.doctorCount} {language === 'hy' ? 'բժիշկ' : 'docs'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Filter Bar */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            <span>{language === 'hy' ? 'Ֆիլտրել և տեսակավորել' : 'Filter & Sort'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              {filteredDoctors.length} {strings.foundDoctors}
            </span>
            {(searchFilters.specialtyId !== 'all' ||
              searchFilters.branchId !== 'all' ||
              searchFilters.minRating > 0 ||
              searchFilters.visitType !== 'all' ||
              searchFilters.searchQuery) && (
              <button
                id="reset-filters-btn"
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium underline"
              >
                {strings.resetFilters}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Specialty Dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {language === 'hy' ? 'Մասնագիտացում' : 'Specialty'}
            </label>
            <select
              id="filter-specialty-select"
              value={searchFilters.specialtyId}
              onChange={e => setSearchFilters(prev => ({ ...prev, specialtyId: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            >
              <option value="all">{strings.allSpecialties}</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name[language]}
                </option>
              ))}
            </select>
          </div>

          {/* Branch / Clinic Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {language === 'hy' ? 'Մասնաճյուղ / Համայնք' : 'Branch / Area'}
            </label>
            <select
              id="filter-branch-select"
              value={searchFilters.branchId}
              onChange={e => setSearchFilters(prev => ({ ...prev, branchId: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            >
              <option value="all">{strings.allBranches}</option>
              {branchOptions.map(branch => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {language === 'hy' ? 'Վարկանիշ' : 'Minimum Rating'}
            </label>
            <select
              id="filter-rating-select"
              value={searchFilters.minRating}
              onChange={e => setSearchFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            >
              <option value={0}>{strings.allRatings}</option>
              <option value={4.5}>★ 4.5 {strings.ratingAbove}</option>
              <option value={4.8}>★ 4.8 {strings.ratingAbove}</option>
              <option value={4.9}>★ 4.9 {strings.ratingAbove}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {strings.sortBy}
            </label>
            <select
              id="filter-sort-select"
              value={searchFilters.sortBy}
              onChange={e =>
                setSearchFilters(prev => ({
                  ...prev,
                  sortBy: e.target.value as SearchFilterState['sortBy'],
                }))
              }
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            >
              <option value="rating">{strings.sortRating}</option>
              <option value="experience">{strings.sortExp}</option>
              <option value="price-asc">{strings.sortPriceAsc}</option>
              <option value="price-desc">{strings.sortPriceDesc}</option>
            </select>
          </div>
        </div>

        {/* Visit Type Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium mr-1">
            {language === 'hy' ? 'Այցի ձևաչափ՝' : 'Consultation format:'}
          </span>
          <button
            onClick={() => setSearchFilters(prev => ({ ...prev, visitType: 'all' }))}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
              searchFilters.visitType === 'all'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {strings.visitTypeAll}
          </button>
          <button
            onClick={() => setSearchFilters(prev => ({ ...prev, visitType: 'in-person' }))}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              searchFilters.visitType === 'in-person'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-teal-600" />
            <span>{strings.visitTypeInPerson}</span>
          </button>
          <button
            onClick={() => setSearchFilters(prev => ({ ...prev, visitType: 'online' }))}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              searchFilters.visitType === 'online'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-cyan-600" />
            <span>{strings.visitTypeOnline}</span>
          </button>
        </div>
      </section>

      {/* Doctor Cards List */}
      <section className="space-y-4">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              {strings.noDoctorsFound}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {language === 'hy'
                ? 'Խորհուրդ ենք տալիս փոխել որոնման բառը կամ ընտրել «Բոլոր մասնագիտությունները»'
                : 'Try adjusting your search filters or clearing the search bar'}
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              {strings.resetFilters}
            </button>
          </div>
        ) : (
          filteredDoctors.map(doctor => {
            const clinic = clinics.find(c => c.id === doctor.clinicId);
            const specialty = specialties.find(s => s.id === doctor.specialtyId);
            const isExpanded = expandedDoctorId === doctor.id;

            return (
              <div
                key={doctor.id}
                id={`doctor-card-${doctor.id}`}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Avatar + Details */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Doctor Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.name[language]}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs"
                        title="Ստուգված մասնագետ"
                      >
                        <CheckCircle2 className="w-4 h-4 text-teal-600 fill-teal-50" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {doctor.name[language]}
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700 border border-teal-200">
                          {specialty?.name[language]}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        {doctor.title[language]}
                      </p>

                      {/* Clinic and Branch info */}
                      {clinic && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {clinic.name[language]}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {clinic.branch[language]} ({clinic.address[language]})
                          </span>
                        </div>
                      )}

                      {/* Ratings & Experience */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-semibold border border-amber-200/70">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{doctor.rating}</span>
                          <span className="text-amber-700 font-normal">
                            ({doctor.reviewCount} {strings.reviews})
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          <Award className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {doctor.experienceYears} {strings.yearsExp}
                          </span>
                        </div>

                        {doctor.allowsOnline && (
                          <div className="flex items-center gap-1 text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md font-medium border border-cyan-100">
                            <Video className="w-3.5 h-3.5" />
                            <span>{language === 'hy' ? 'Առցանց հասանելի' : 'Online available'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & Quick Booking Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="space-y-1 sm:text-right">
                      <div className="text-xs text-slate-500">
                        {strings.feeInPerson}:{' '}
                        <span className="text-sm font-bold text-slate-900">
                          {doctor.consultationFee.toLocaleString()} ֏
                        </span>
                      </div>
                      {doctor.allowsOnline && (
                        <div className="text-xs text-slate-500">
                          {strings.feeOnline}:{' '}
                          <span className="text-sm font-semibold text-teal-700">
                            {doctor.onlineFee.toLocaleString()} ֏
                          </span>
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>
                          {language === 'hy' ? 'Ազատ ժամեր կան' : 'Available slots'}:{' '}
                          {doctor.nextAvailableDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() =>
                          setExpandedDoctorId(isExpanded ? null : doctor.id)
                        }
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                        title={strings.quickView}
                      >
                        <span>{strings.quickView}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        id={`book-doctor-btn-${doctor.id}`}
                        onClick={() => openBooking(doctor)}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>{strings.bookAppointment}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Bio, Education & Languages */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 space-y-3 bg-slate-50/70 p-4 rounded-2xl">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">
                        {language === 'hy' ? 'Մասնագիտական կենսագրություն' : 'Professional Biography'}
                      </h4>
                      <p className="leading-relaxed">{doctor.bio[language]}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">
                        {language === 'hy' ? 'Կրթություն և որակավորում' : 'Education & Credentials'}
                      </h4>
                      <p className="text-slate-700">{doctor.education[language]}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <div>
                        <span className="text-slate-500 font-medium">
                          {language === 'hy' ? 'Լեզուներ՝ ' : 'Languages: '}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {doctor.languages.join(', ')}
                        </span>
                      </div>
                      {clinic && (
                        <div>
                          <span className="text-slate-500 font-medium">
                            {language === 'hy' ? 'Կլինիկայի հեռախոս՝ ' : 'Clinic Phone: '}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {clinic.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Star,
  Search,
  User,
  CalendarCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const ClinicsDirectory: React.FC = () => {
  const { clinics, doctors, specialties, language, openBooking, setSearchFilters, setActiveTab } = useApp();
  const strings = t[language];

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const branches = ['all', ...Array.from(new Set(clinics.map(c => c.branch[language])))];

  const filteredClinics = clinics.filter(clinic => {
    if (selectedBranch !== 'all' && clinic.branch[language] !== selectedBranch) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName =
        clinic.name.hy.toLowerCase().includes(q) ||
        clinic.name.en.toLowerCase().includes(q);
      const matchAddr =
        clinic.address.hy.toLowerCase().includes(q) ||
        clinic.address.en.toLowerCase().includes(q);
      const matchBranch =
        clinic.branch.hy.toLowerCase().includes(q) ||
        clinic.branch.en.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchBranch) {
        return false;
      }
    }
    return true;
  });

  const handleFilterDoctorsByClinic = (branchName: string) => {
    setSearchFilters(prev => ({ ...prev, branchId: branchName, specialtyId: 'all' }));
    setActiveTab('search');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-3 border border-teal-200">
            <Building2 className="w-3.5 h-3.5" />
            <span>{strings.branchesTitle}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2">
            {language === 'hy'
              ? 'Գործընկեր բժշկական կենտրոններ և մասնաճյուղեր'
              : 'Affiliated Medical Centers & Clinics'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {strings.branchesDesc}
          </p>
        </div>

        {/* Search & Branch Filter */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'hy' ? 'Փնտրել ըստ կլինիկայի անվան կամ հասցեի...' : 'Search by clinic name or address...'}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {branches.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedBranch === b
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'all' ? strings.allBranches : b}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClinics.map(clinic => {
          const clinicDoctors = doctors.filter(d => d.clinicId === clinic.id);

          return (
            <div
              key={clinic.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      {clinic.branch[language]}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">
                      {clinic.name[language]}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200/60">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{clinic.rating}</span>
                    <span className="text-amber-700 font-normal">
                      ({clinic.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{clinic.address[language]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{clinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {strings.workingHours}: {clinic.workingHours}
                    </span>
                  </div>
                </div>

                {/* Specialists at this clinic */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    {language === 'hy' ? 'Կլինիկայի բժիշկները՝' : 'Specialists at this branch:'}
                  </span>
                  <div className="space-y-2">
                    {clinicDoctors.map(doc => {
                      const spec = specialties.find(s => s.id === doc.specialtyId);
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={doc.avatarUrl}
                              alt={doc.name[language]}
                              className="w-8 h-8 rounded-lg object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {doc.name[language]}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {spec?.name[language]}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => openBooking(doc)}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            {strings.quickBook}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleFilterDoctorsByClinic(clinic.branch[language])}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <span>
                    {language === 'hy'
                      ? `Դիտել այս մասնաճյուղի բոլոր բժիշկներին`
                      : `View all doctors in this branch`}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

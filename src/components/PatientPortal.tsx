import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Video,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Pill,
  Star,
  User,
  Phone,
  Mail,
  Search,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  LogOut,
  Users,
  HeartPulse,
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const {
    appointments,
    doctors,
    clinics,
    specialties,
    language,
    cancelAppointment,
    rateAppointment,
    openBooking,
    setActiveTab,
    currentUser,
    patientUsers,
    loginDirectPatient,
    logout,
  } = useApp();

  const strings = t[language];
  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'past'>('upcoming');

  // Cancel dialog state
  const [cancellingAptId, setCancellingAptId] = useState<string | null>(null);

  // Rating input state for past appointments
  const [reviewingAptId, setReviewingAptId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Active patient object
  const activePatient = currentUser?.type === 'patient' ? currentUser.patient : patientUsers[0];

  // Strictly filter appointments for the active patient
  const patientAppointments = appointments.filter(a => {
    return (
      a.patientId === activePatient.id ||
      a.patientPhone === activePatient.phone ||
      a.patientName === activePatient.name.hy ||
      a.patientName === activePatient.name.en
    );
  });

  const upcomingAppointments = patientAppointments
    .filter(a => a.status === 'upcoming')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const pastAppointments = patientAppointments
    .filter(a => a.status === 'completed' || a.status === 'cancelled')
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const handleConfirmCancel = (id: string) => {
    cancelAppointment(id);
    setCancellingAptId(null);
  };

  const handleSubmitReview = (aptId: string) => {
    if (!reviewComment.trim()) return;
    rateAppointment(aptId, ratingScore, reviewComment.trim());
    setReviewingAptId(null);
    setReviewComment('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Patient Profile Header Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-teal-500/20 shrink-0">
              {activePatient.avatarText}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activePatient.name[language]}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {strings.rolePatient}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  ID: {activePatient.username}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {activePatient.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {activePatient.email}
                </span>
                <span className="flex items-center gap-1 text-teal-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {activePatient.insurance[language]}
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <HeartPulse className="w-3.5 h-3.5" />
                  {language === 'hy' ? `Արյան խումբ՝ ${activePatient.bloodGroup}` : `Blood: ${activePatient.bloodGroup}`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block font-medium">
                {language === 'hy' ? 'Առաջիկա' : 'Upcoming'}
              </span>
              <span className="text-base font-bold text-teal-700">
                {upcomingAppointments.length}
              </span>
            </div>

            <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block font-medium">
                {language === 'hy' ? 'Ավարտված' : 'Completed'}
              </span>
              <span className="text-base font-bold text-slate-800">
                {pastAppointments.filter(a => a.status === 'completed').length}
              </span>
            </div>

            <button
              onClick={() => setActiveTab('search')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{strings.bookAppointment}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Selector: Upcoming vs Past */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="tab-upcoming-appointments"
          onClick={() => setActiveSubTab('upcoming')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-2xl transition-all ${
            activeSubTab === 'upcoming'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{strings.upcomingTab}</span>
          {upcomingAppointments.length > 0 && (
            <span
              className={`px-2 py-0.2 rounded-full text-xs ${
                activeSubTab === 'upcoming' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {upcomingAppointments.length}
            </span>
          )}
        </button>

        <button
          id="tab-past-appointments"
          onClick={() => setActiveSubTab('past')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-2xl transition-all ${
            activeSubTab === 'past'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{strings.pastTab}</span>
          <span
            className={`px-2 py-0.2 rounded-full text-xs ${
              activeSubTab === 'past' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {pastAppointments.length}
          </span>
        </button>
      </div>

      {/* UPCOMING APPOINTMENTS LIST */}
      {activeSubTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {strings.noUpcomingAppointments}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {language === 'hy'
                  ? 'Ընտրեք համապատասխան բժշկին և ամրագրեք ձեզ հարմար ժամը։'
                  : 'Choose a doctor and schedule a convenient slot.'}
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{strings.bookAppointment}</span>
              </button>
            </div>
          ) : (
            upcomingAppointments.map(apt => {
              const doc = doctors.find(d => d.id === apt.doctorId);
              const clinic = clinics.find(c => c.id === apt.clinicId);
              const specialty = doc ? specialties.find(s => s.id === doc.specialtyId) : null;

              return (
                <div
                  key={apt.id}
                  id={`appointment-card-${apt.id}`}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Doctor and appointment details */}
                    <div className="flex items-start gap-4">
                      {doc ? (
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name[language]}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                          <User className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {doc ? doc.name[language] : language === 'hy' ? 'Բժիշկ' : 'Doctor'}
                          </h3>
                          {specialty && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700 border border-teal-200">
                              {specialty.name[language]}
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {strings.statusUpcoming}
                          </span>
                        </div>

                        {/* Clinic info */}
                        {clinic && (
                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              {clinic.name[language]} ({clinic.branch[language]})
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {clinic.address[language]}
                            </span>
                          </div>
                        )}

                        {/* Reason / Symptoms note */}
                        <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                          <span className="font-semibold text-slate-900 block mb-0.5">
                            {language === 'hy' ? 'Այցի նպատակ՝' : 'Reason:'}{' '}
                            <span className="font-normal text-slate-700">{apt.reason}</span>
                          </span>
                          {apt.patientNotes && (
                            <span className="text-slate-500 italic block mt-0.5">
                              «{apt.patientNotes}»
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date badge & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Slot badge */}
                      <div className="bg-teal-50 border border-teal-200/80 p-3 rounded-2xl space-y-1 text-left sm:text-right w-full sm:w-auto">
                        <div className="flex items-center lg:justify-end gap-1.5 text-teal-900 font-bold text-sm">
                          <Calendar className="w-4 h-4 text-teal-600" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center lg:justify-end gap-1.5 text-teal-800 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>{apt.time}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-teal-700">
                            {apt.type === 'in-person' ? strings.visitTypeInPerson : strings.visitTypeOnline}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 lg:text-right">
                          {language === 'hy' ? 'Վճարումը կլինիկայում՝' : 'Fee at clinic:'}{' '}
                          <span className="font-bold text-slate-800">{apt.fee.toLocaleString()} ֏</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {doc && (
                          <button
                            id={`reschedule-btn-${apt.id}`}
                            onClick={() => openBooking(doc)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                            <span>{strings.reschedule}</span>
                          </button>
                        )}

                        <button
                          id={`cancel-btn-${apt.id}`}
                          onClick={() => setCancellingAptId(apt.id)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{strings.cancelAppointment}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Confirmation Prompt */}
                  {cancellingAptId === apt.id && (
                    <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-medium">{strings.cancelConfirm}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCancellingAptId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium"
                        >
                          {language === 'hy' ? 'Ոչ, թողնել' : 'No, keep it'}
                        </button>
                        <button
                          id="confirm-cancel-action-btn"
                          onClick={() => handleConfirmCancel(apt.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                        >
                          {language === 'hy' ? 'Այո, չեղարկել' : 'Yes, cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PAST APPOINTMENTS & MEDICAL RECORDS */}
      {activeSubTab === 'past' && (
        <div className="space-y-4">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {strings.noPastAppointments}
              </h3>
            </div>
          ) : (
            pastAppointments.map(apt => {
              const doc = doctors.find(d => d.id === apt.doctorId);
              const clinic = clinics.find(c => c.id === apt.clinicId);
              const specialty = doc ? specialties.find(s => s.id === doc.specialtyId) : null;
              const isCancelled = apt.status === 'cancelled';

              return (
                <div
                  key={apt.id}
                  id={`past-appointment-${apt.id}`}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                    isCancelled ? 'border-slate-200 opacity-70 bg-slate-50/50' : 'border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {doc && (
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name[language]}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {doc ? doc.name[language] : 'Doctor'}
                          </h4>
                          {specialty && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {specialty.name[language]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {clinic?.name[language]} • {apt.date} ({apt.time})
                        </p>
                      </div>
                    </div>

                    <div>
                      {isCancelled ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {strings.statusCancelled}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {strings.statusCompleted}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Doctor notes & prescription content */}
                  {!isCancelled && (
                    <div className="mt-4 space-y-3 text-xs sm:text-sm">
                      {apt.doctorNotes && (
                        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100">
                          <div className="flex items-center gap-1.5 font-bold text-teal-900 mb-1">
                            <FileText className="w-4 h-4 text-teal-700" />
                            <span>{strings.doctorNotes}</span>
                          </div>
                          <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                            {apt.doctorNotes}
                          </p>
                        </div>
                      )}

                      {apt.prescription && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                            <Pill className="w-4 h-4 text-emerald-700" />
                            <span>{strings.prescriptions}</span>
                          </div>
                          <p className="text-slate-800 whitespace-pre-line leading-relaxed font-mono text-xs">
                            {apt.prescription}
                          </p>
                        </div>
                      )}

                      {/* Review & Rating Block */}
                      <div className="pt-2 border-t border-slate-100">
                        {apt.rating ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-700">
                              {language === 'hy' ? 'Ձեր գնահատականը՝' : 'Your Rating:'}
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < (apt.rating || 0) ? 'fill-amber-400' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {apt.reviewText && (
                              <span className="text-slate-600 italic">«{apt.reviewText}»</span>
                            )}
                          </div>
                        ) : reviewingAptId === apt.id ? (
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-slate-800">
                                {strings.rateVisit}
                              </span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(score => (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() => setRatingScore(score)}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        score <= ratingScore
                                          ? 'fill-amber-400 text-amber-500'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <input
                              type="text"
                              value={reviewComment}
                              onChange={e => setReviewComment(e.target.value)}
                              placeholder={strings.writeReview}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setReviewingAptId(null)}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                              >
                                {strings.close}
                              </button>
                              <button
                                onClick={() => handleSubmitReview(apt.id)}
                                className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-xs"
                              >
                                {strings.submitReview}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            id={`rate-visit-btn-${apt.id}`}
                            onClick={() => setReviewingAptId(apt.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>{strings.rateVisit}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

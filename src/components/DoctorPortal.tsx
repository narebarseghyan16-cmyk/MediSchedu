import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import { generateTimeSlots } from '../data/mockData';
import { Appointment } from '../types';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  Building,
  CheckCircle2,
  FileEdit,
  TrendingUp,
  Users,
} from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const {
    doctors,
    clinics,
    specialties,
    appointments,
    language,
    selectedDoctorIdForPortal,
    completeAppointment,
    cancelAppointment,
    currentUser,
    doctorUsers,
  } = useApp();

  const strings = t[language];

  // Active doctor from session or selection
  const currentDoctor =
    currentUser?.type === 'doctor'
      ? currentUser.doctor
      : doctors.find(d => d.id === selectedDoctorIdForPortal) || doctors[0];

  const currentDoctorUser = doctorUsers.find(du => du.doctorId === currentDoctor.id);

  // All appointments belonging to this doctor across all dates
  const allDoctorAppointments = useMemo(() => {
    return appointments
      .filter(a => a.doctorId === currentDoctor.id)
      .sort((a, b) => {
        // Put upcoming appointments first, then sort by date and time
        if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
        if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
        return (a.date + a.time).localeCompare(b.date + b.time);
      });
  }, [appointments, currentDoctor.id]);

  // Default filter is 'all' so the doctor immediately sees every booking made by any patient across any date
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // For the right-side daily slot grid, track which specific date's slots are shown
  const [slotGridDate, setSlotGridDate] = useState<string>(() => {
    const firstUpcoming = allDoctorAppointments.find(a => a.status === 'upcoming');
    return firstUpcoming?.date || currentDoctor.nextAvailableDate || '2026-09-12';
  });

  useEffect(() => {
    if (selectedDate !== 'all') {
      setSlotGridDate(selectedDate);
    } else {
      const firstUpcoming = allDoctorAppointments.find(a => a.status === 'upcoming');
      if (firstUpcoming) {
        setSlotGridDate(firstUpcoming.date);
      }
    }
  }, [selectedDate, currentDoctor.id, allDoctorAppointments.length]);

  // Consultation completion modal state
  const [activeConsultationApt, setActiveConsultationApt] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [prescriptionText, setPrescriptionText] = useState<string>('');

  const clinic = clinics.find(c => c.id === currentDoctor.clinicId);
  const specialty = specialties.find(s => s.id === currentDoctor.specialtyId);

  // Build dynamic schedule dates: include base dates + any date where this doctor has an appointment
  const scheduleDates = useMemo(() => {
    const baseDates = ['2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14', '2026-09-15'];
    const aptDates = allDoctorAppointments.map(a => a.date);
    const uniqueDates = Array.from(new Set([...baseDates, ...aptDates])).sort();

    const formatLabel = (iso: string) => {
      if (iso === '2026-09-11') {
        return { hy: '11 Սեպ (Այսօր)', en: 'Sep 11 (Today)' };
      }
      if (iso === '2026-09-12') {
        return { hy: '12 Սեպ (Վաղը)', en: 'Sep 12 (Tomorrow)' };
      }
      const d = new Date(`${iso}T00:00:00`);
      if (isNaN(d.getTime())) {
        return { hy: iso, en: iso };
      }
      const monthsHy = ['Հուն', 'Փետ', 'Մար', 'Ապր', 'Մայ', 'Հուն', 'Հուլ', 'Օգս', 'Սեպ', 'Հոկ', 'Նոյ', 'Դեկ'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        hy: `${d.getDate()} ${monthsHy[d.getMonth()]}`,
        en: `${monthsEn[d.getMonth()]} ${d.getDate()}`,
      };
    };

    return uniqueDates.map(iso => {
      const labels = formatLabel(iso);
      const count = allDoctorAppointments.filter(
        a => a.date === iso && a.status !== 'cancelled'
      ).length;
      return {
        iso,
        labelHy: labels.hy,
        labelEn: labels.en,
        count,
      };
    });
  }, [allDoctorAppointments]);

  // Filtered appointments for display
  const displayedAppointments = useMemo(() => {
    if (selectedDate === 'all') {
      return allDoctorAppointments;
    }
    return allDoctorAppointments
      .filter(a => a.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [allDoctorAppointments, selectedDate]);

  // Metrics based on displayed appointments
  const totalPatientsCount = displayedAppointments.filter(a => a.status !== 'cancelled').length;
  const completedCount = displayedAppointments.filter(a => a.status === 'completed').length;
  const pendingCount = displayedAppointments.filter(a => a.status === 'upcoming').length;
  const estimatedEarnings = displayedAppointments
    .filter(a => a.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.fee, 0);

  // Time slots for this doctor on slotGridDate
  const timeSlots = useMemo(() => {
    return generateTimeSlots(currentDoctor.id, slotGridDate, appointments);
  }, [currentDoctor.id, slotGridDate, appointments]);

  const handleOpenConsultationModal = (apt: Appointment) => {
    setActiveConsultationApt(apt);
    setClinicalNotes(apt.doctorNotes || '');
    setPrescriptionText(apt.prescription || '');
  };

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultationApt) return;

    completeAppointment(
      activeConsultationApt.id,
      clinicalNotes.trim() ||
        (language === 'hy'
          ? 'Ընդունելությունն ավարտված է։ Հիվանդի վիճակը բավարար է։'
          : 'Consultation completed. Patient status satisfactory.'),
      prescriptionText.trim() ||
        (language === 'hy' ? 'Դեղատոմս չի նշանակվել։' : 'No prescription needed.')
    );

    setActiveConsultationApt(null);
    setClinicalNotes('');
    setPrescriptionText('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Doctor Workspace Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <img
              src={currentDoctor.avatarUrl}
              alt={currentDoctor.name[language]}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentDoctor.name[language]}
                </h1>
                <span className="text-xs font-semibold text-teal-700">
                  · {specialty?.name[language]}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  ID: {currentDoctorUser?.username || currentDoctor.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {currentDoctor.title[language]}
              </p>
              <p className="text-xs text-slate-500">
                {clinic?.name[language]} ({clinic?.branch[language]}) · {clinic?.address[language]}
              </p>
              <p className="text-xs text-teal-700 font-mono">{currentDoctorUser?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Date selector for schedule — Defaults to 'all' so all patient bookings are visible immediately */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span className="font-bold text-slate-900 text-sm sm:text-base">
            {strings.scheduleForDate}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            id="doctor-schedule-date-all"
            onClick={() => setSelectedDate('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedDate === 'all'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{language === 'hy' ? 'Բոլոր օրերը' : 'All Dates'}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold tabular-nums ${
                selectedDate === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-teal-50 text-teal-700'
              }`}
            >
              {allDoctorAppointments.filter(a => a.status !== 'cancelled').length}
            </span>
          </button>

          {scheduleDates.map(item => (
            <button
              key={item.iso}
              id={`doctor-schedule-date-${item.iso}`}
              onClick={() => setSelectedDate(item.iso)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedDate === item.iso
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{language === 'hy' ? item.labelHy : item.labelEn}</span>
              {item.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold tabular-nums ${
                    selectedDate === item.iso
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Dashboard */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">
              {strings.totalPatients}
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalPatientsCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">
              {strings.completedCount}
            </span>
            <span className="text-xl font-bold text-emerald-600 tabular-nums">
              {completedCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">
              {strings.pendingCount}
            </span>
            <span className="text-xl font-bold text-amber-600 tabular-nums">
              {pendingCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">
              {strings.earningsEst}
            </span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {estimatedEarnings.toLocaleString()} ֏
            </span>
          </div>
        </div>
      </section>

      {/* Main Content: Registered Patients List + Slots Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Registered Patients List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>{strings.patientList}</span>
              <span className="text-xs text-slate-500 font-normal">
                (
                {selectedDate === 'all'
                  ? language === 'hy'
                    ? 'Բոլոր օրերը'
                    : 'All Dates'
                  : selectedDate}
                )
              </span>
            </h2>
          </div>

          {displayedAppointments.length === 0 ? (
            <div className="text-center py-14 px-4 bg-white rounded-3xl border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {strings.noPatientsToday}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hy'
                  ? 'Այս բժշկի մոտ ընտրված օրվա համար գրանցումներ չկան։'
                  : 'No scheduled appointments found for this selection.'}
              </p>
            </div>
          ) : (
            displayedAppointments.map(apt => {
              const isCompleted = apt.status === 'completed';
              const isCancelled = apt.status === 'cancelled';

              return (
                <div
                  key={apt.id}
                  id={`doctor-patient-card-${apt.id}`}
                  className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all ${
                    isCompleted
                      ? 'border-emerald-200/80 bg-emerald-50/15'
                      : isCancelled
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="px-3 py-2 rounded-2xl bg-teal-100 text-teal-900 flex flex-col items-center justify-center font-bold text-xs tabular-nums shrink-0">
                        <span className="text-[11px] font-medium text-teal-700">{apt.date}</span>
                        <span className="text-sm font-bold">{apt.time}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">
                            {apt.patientName}
                          </h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            ·{' '}
                            {apt.type === 'in-person' ? (
                              <Building className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <Video className="w-3.5 h-3.5 text-cyan-600" />
                            )}
                            {apt.type === 'in-person'
                              ? strings.visitTypeInPerson
                              : strings.visitTypeOnline}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {apt.patientPhone}
                          </span>
                          {apt.patientEmail && <span>· {apt.patientEmail}</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {strings.statusCompleted}
                        </span>
                      ) : isCancelled ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                          {strings.statusCancelled}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          {strings.statusUpcoming}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stated symptoms/reason */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        {strings.reasonLabel}:{' '}
                        <span className="font-normal">{apt.reason}</span>
                      </span>
                      {apt.patientNotes && (
                        <span className="text-slate-500 italic block mt-0.5">
                          «{apt.patientNotes}»
                        </span>
                      )}
                    </div>

                    {/* If consultation is already completed, display the medical notes */}
                    {isCompleted && (apt.doctorNotes || apt.prescription) && (
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                        {apt.doctorNotes && (
                          <div>
                            <span className="font-bold text-emerald-900 block">
                              {strings.doctorNotes}:
                            </span>
                            <p className="text-slate-700 whitespace-pre-line">{apt.doctorNotes}</p>
                          </div>
                        )}
                        {apt.prescription && (
                          <div className="pt-1 border-t border-emerald-100">
                            <span className="font-bold text-emerald-900 block">
                              {strings.prescriptions}:
                            </span>
                            <p className="text-slate-700 whitespace-pre-line font-mono">
                              {apt.prescription}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Consultation Actions */}
                  {!isCancelled && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                      {!isCompleted ? (
                        <>
                          <button
                            id={`start-consultation-btn-${apt.id}`}
                            onClick={() => handleOpenConsultationModal(apt)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{strings.startConsultation}</span>
                          </button>

                          <button
                            onClick={() => cancelAppointment(apt.id)}
                            className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {strings.cancelAppointment}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenConsultationModal(apt)}
                          className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {language === 'hy' ? 'Խմբագրել եզրակացությունը' : 'Edit notes'}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Daily Slot Overview for Doctor */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{language === 'hy' ? 'Օրվա ժամային ցանց' : 'Day Slot Grid'}</span>
                </h3>
                <span className="text-xs text-slate-500 tabular-nums">
                  {timeSlots.filter(s => s.isBooked).length}/{timeSlots.length} {strings.slotBooked}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {language === 'hy' ? 'Ամսաթիվ՝' : 'Date:'}
                </span>
                <select
                  value={slotGridDate}
                  onChange={e => setSlotGridDate(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:border-teal-500"
                >
                  {scheduleDates.map(d => (
                    <option key={d.iso} value={d.iso}>
                      {language === 'hy' ? d.labelHy : d.labelEn} ({d.iso})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {timeSlots.map(slot => {
                const bookedApt = appointments.find(
                  a =>
                    a.doctorId === currentDoctor.id &&
                    a.date === slotGridDate &&
                    a.time === slot.time &&
                    a.status !== 'cancelled'
                );

                return (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      slot.isBooked
                        ? 'bg-teal-50/80 border-teal-200 text-teal-950 font-semibold'
                        : 'bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">{slot.time}</span>
                      {slot.isBooked ? (
                        <span className="text-[11px] text-teal-800 line-clamp-1">
                          • {bookedApt?.patientName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({strings.slotFree})
                        </span>
                      )}
                    </div>

                    <div>
                      {slot.isBooked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-600 text-white font-medium">
                          {bookedApt?.status === 'completed'
                            ? strings.statusCompleted
                            : strings.statusUpcoming}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                          {strings.slotFree}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Diagnosis & Prescription Modal */}
      {activeConsultationApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {strings.addNotesPrescription}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeConsultationApt.patientName} · {activeConsultationApt.date} ·{' '}
                  {activeConsultationApt.time} ({activeConsultationApt.reason})
                </p>
              </div>
              <button
                onClick={() => setActiveConsultationApt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.doctorNotes} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="doctor-notes-input"
                  rows={3}
                  required
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  placeholder={strings.notesPlaceholder}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.prescriptions}
                </label>
                <textarea
                  id="doctor-prescription-input"
                  rows={3}
                  value={prescriptionText}
                  onChange={e => setPrescriptionText(e.target.value)}
                  placeholder={strings.prescriptionPlaceholder}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveConsultationApt(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {strings.close}
                </button>
                <button
                  id="save-consultation-btn"
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{strings.saveMedicalRecord}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

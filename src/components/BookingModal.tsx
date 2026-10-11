import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../data/translations';
import { generateTimeSlots } from '../data/mockData';
import { AppointmentType } from '../types';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building,
  Video,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Search,
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    bookingDoctor,
    isBookingModalOpen,
    closeBooking,
    language,
    appointments,
    addAppointment,
    clinics,
    specialties,
    setActiveTab,
    setUserRole,
    currentUser,
  } = useApp();

  const strings = t[language];

  // Selected date defaults to doctor's next available date or 2026-09-12
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return bookingDoctor?.nextAvailableDate || '2026-09-12';
  });

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<AppointmentType>('in-person');

  // Patient form states
  const [patientName, setPatientName] = useState<string>(() => {
    if (currentUser?.type === 'patient') {
      return currentUser.patient.name[language] || currentUser.patient.name.hy;
    }
    return 'Արամ Գրիգորյան';
  });
  const [patientPhone, setPatientPhone] = useState<string>(() => {
    if (currentUser?.type === 'patient') {
      return currentUser.patient.phone;
    }
    return '+374 91 22 33 44';
  });
  const [patientEmail, setPatientEmail] = useState<string>(() => {
    if (currentUser?.type === 'patient') {
      return currentUser.patient.email;
    }
    return 'aram.grig@mail.am';
  });
  const [reason, setReason] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [step, setStep] = useState<'slots' | 'details' | 'success'>('slots');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Automatically reset step and slot selection when a new doctor is opened
  useEffect(() => {
    if (bookingDoctor) {
      setStep('slots');
      setSelectedDate(bookingDoctor.nextAvailableDate || '2026-09-12');
      setSelectedTime(null);
      setVisitType('in-person');
      setConfirmedBookingId(null);
      setReason('');
      setPatientNotes('');
      if (currentUser?.type === 'patient') {
        setPatientName(currentUser.patient.name[language] || currentUser.patient.name.hy);
        setPatientPhone(currentUser.patient.phone);
        setPatientEmail(currentUser.patient.email);
      }
    }
  }, [bookingDoctor?.id, currentUser]);

  const handleBookAnother = () => {
    setStep('slots');
    setSelectedTime(null);
    setConfirmedBookingId(null);
    setReason('');
    setPatientNotes('');
  };

  const handleBookOtherDoctor = () => {
    closeBooking();
    setActiveTab('search');
  };

  // Quick symptom suggestions
  const symptomSuggestions = useMemo(() => {
    if (language === 'hy') {
      return [
        'Պլանային ստուգում',
        'Ախտանիշների ստուգում',
        'Բուժման կուրսի քննարկում',
        'Հետազոտության արդյունքներ',
        'Կրկնակի այցելություն',
      ];
    }
    return [
      'Routine Checkup',
      'Symptom Evaluation',
      'Treatment Review',
      'Test Results Discussion',
      'Follow-up Visit',
    ];
  }, [language]);

  // Generate calendar dates for the next 14 days from 2026-09-11
  const calendarDays = useMemo(() => {
    const days = [];
    const baseDate = new Date('2026-09-11T00:00:00');

    for (let i = 0; i < 14; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const iso = d.toISOString().split('T')[0];

      // Day of week localized
      const dayNamesHy = ['Կիր', 'Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շաբ'];
      const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = language === 'hy' ? dayNamesHy[d.getDay()] : dayNamesEn[d.getDay()];

      const monthNamesHy = ['Հուն', 'Փետ', 'Մար', 'Ապր', 'Մայ', 'Հուն', 'Հուլ', 'Օգս', 'Սեպ', 'Հոկ', 'Նոյ', 'Դեկ'];
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = language === 'hy' ? monthNamesHy[d.getMonth()] : monthNamesEn[d.getMonth()];

      days.push({
        iso,
        dayNum: d.getDate(),
        dayName,
        monthName,
        isSunday: d.getDay() === 0,
      });
    }
    return days;
  }, [language]);

  // Compute time slots for the selected date and doctor
  const timeSlots = useMemo(() => {
    if (!bookingDoctor) return [];
    return generateTimeSlots(bookingDoctor.id, selectedDate, appointments);
  }, [bookingDoctor, selectedDate, appointments]);

  if (!isBookingModalOpen || !bookingDoctor) {
    return null;
  }

  const clinic = clinics.find(c => c.id === bookingDoctor.clinicId);
  const specialty = specialties.find(s => s.id === bookingDoctor.specialtyId);

  const morningSlots = timeSlots.filter(s => s.period === 'morning');
  const afternoonSlots = timeSlots.filter(s => s.period === 'afternoon');
  const eveningSlots = timeSlots.filter(s => s.period === 'evening');

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !patientName.trim() || !patientPhone.trim()) {
      return;
    }

    const fee = visitType === 'online' ? bookingDoctor.onlineFee : bookingDoctor.consultationFee;

    const newAppointment = addAppointment({
      doctorId: bookingDoctor.id,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || undefined,
      reason: reason.trim() || (language === 'hy' ? 'Ընդհանուր խորհրդատվություն' : 'General Consultation'),
      patientNotes: patientNotes.trim() || undefined,
      date: selectedDate,
      time: selectedTime,
      type: visitType,
      status: 'upcoming',
      fee,
      clinicId: bookingDoctor.clinicId,
    });

    setConfirmedBookingId(newAppointment.id);
    setStep('success');
  };

  const handleGoToPatientPortal = () => {
    closeBooking();
    setUserRole('patient');
    setActiveTab('patient-portal');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={bookingDoctor.avatarUrl}
              alt={bookingDoctor.name[language]}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {bookingDoctor.name[language]}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {specialty?.name[language]}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {clinic?.name[language]} • {clinic?.branch[language]}
              </p>
            </div>
          </div>

          <button
            id="close-booking-modal"
            onClick={closeBooking}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* STEP 1 & 2: Slot and details view */}
          {step === 'slots' && (
            <div className="space-y-6">
              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  {strings.visitTypeLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisitType('in-person')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                      visitType === 'in-person'
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-slate-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${visitType === 'in-person' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{strings.visitTypeInPerson}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {bookingDoctor.consultationFee.toLocaleString()} ֏
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!bookingDoctor.allowsOnline}
                    onClick={() => setVisitType('online')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                      !bookingDoctor.allowsOnline
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                        : visitType === 'online'
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-slate-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${visitType === 'online' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{strings.visitTypeOnline}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {bookingDoctor.allowsOnline
                          ? `${bookingDoctor.onlineFee.toLocaleString()} ֏`
                          : language === 'hy'
                          ? 'Անհասանելի է'
                          : 'Not available'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Carousel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {language === 'hy' ? 'Ընտրեք օրացուցային օրը' : 'Select Calendar Day'}
                  </label>
                  <span className="text-xs text-slate-500">
                    {selectedDate}
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {calendarDays.map(day => {
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.iso}
                        id={`date-cell-${day.iso}`}
                        onClick={() => handleSelectDate(day.iso)}
                        className={`shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center justify-center text-center border transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/25 scale-[1.03]'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className={`text-[11px] font-medium ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                          {day.dayName}
                        </span>
                        <span className="text-lg font-bold my-0.5">
                          {day.dayNum}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                          {day.monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {language === 'hy' ? 'Հասանելի ժամեր (Slots)' : 'Available Time Slots'}
                  </label>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                      {strings.slotFree}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                      {strings.slotBooked}
                    </span>
                  </div>
                </div>

                {/* Morning */}
                <div className="space-y-2 mb-3">
                  <span className="text-xs font-medium text-slate-500">
                    {strings.morning}
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {morningSlots.map(slot => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.id}
                          disabled={slot.isBooked}
                          id={`slot-btn-${slot.time.replace(':', '')}`}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                            slot.isBooked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-white border-teal-200 text-teal-800 hover:bg-teal-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Afternoon */}
                <div className="space-y-2 mb-3">
                  <span className="text-xs font-medium text-slate-500">
                    {strings.afternoon}
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {afternoonSlots.map(slot => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.id}
                          disabled={slot.isBooked}
                          id={`slot-btn-${slot.time.replace(':', '')}`}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                            slot.isBooked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-white border-teal-200 text-teal-800 hover:bg-teal-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Evening */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">
                    {strings.evening}
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {eveningSlots.map(slot => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.id}
                          disabled={slot.isBooked}
                          id={`slot-btn-${slot.time.replace(':', '')}`}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                            slot.isBooked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-white border-teal-200 text-teal-800 hover:bg-teal-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="proceed-to-details-btn"
                  disabled={!selectedTime}
                  onClick={() => setStep('details')}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedTime
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/25'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {selectedTime
                      ? `${language === 'hy' ? 'Շարունակել գրանցումը' : 'Continue'} (${selectedDate} - ${selectedTime})`
                      : language === 'hy'
                      ? 'Ընտրեք հարմար ժամ'
                      : 'Select a time slot'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Patient Form */}
          {step === 'details' && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Selected Slot Summary Bar */}
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-teal-900 font-semibold">
                  <CalendarIcon className="w-4 h-4 text-teal-600" />
                  <span>
                    {selectedDate} • {selectedTime}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-200/60 text-teal-900 font-medium">
                    {visitType === 'in-person' ? strings.visitTypeInPerson : strings.visitTypeOnline}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('slots')}
                  className="text-teal-700 hover:text-teal-900 font-medium underline text-xs"
                >
                  {language === 'hy' ? 'Փոխել ժամը' : 'Change time'}
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.fullNameLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="patient-name-input"
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder={strings.fullNamePlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                  />
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.phoneLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="patient-phone-input"
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      placeholder={strings.phonePlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="patient-email-input"
                      type="email"
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      placeholder="user@example.am"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                    />
                  </div>
                </div>
              </div>

              {/* Reason for visit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.reasonLabel}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="patient-reason-input"
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder={strings.reasonPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                  />
                </div>

                {/* Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {symptomSuggestions.map((sym, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReason(sym)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors"
                    >
                      + {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.notesLabel}
                </label>
                <textarea
                  id="patient-notes-textarea"
                  rows={2}
                  value={patientNotes}
                  onChange={e => setPatientNotes(e.target.value)}
                  placeholder={language === 'hy' ? 'Օր․՝ ունեմ նախորդ հետազոտությունների պատասխանները...' : 'e.g. I have previous blood test results...'}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep('slots')}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  {language === 'hy' ? 'Ետ' : 'Back'}
                </button>
                <button
                  id="submit-booking-btn"
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{strings.confirmBookingBtn}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation Ticket */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {strings.bookingSuccessTitle}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {strings.bookingSuccessDesc}
                </p>
              </div>

              {/* Informative banner about multi-booking capability */}
              <div className="p-3 bg-teal-50/90 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-center gap-2 max-w-md mx-auto text-left shadow-2xs">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{strings.bookingSuccessBanner}</span>
              </div>

              {/* Booking Ticket Pass */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 max-w-md mx-auto shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {strings.appointmentId}
                    </span>
                    <div className="text-sm font-mono font-bold text-teal-700">
                      #{confirmedBookingId}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                    {strings.statusUpcoming}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">{language === 'hy' ? 'Բժիշկ' : 'Doctor'}:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {bookingDoctor.name[language]} ({specialty?.name[language]})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{strings.dateTime}:</span>
                    <span className="font-bold text-slate-800">
                      {selectedDate} — {selectedTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{strings.clinic}:</span>
                    <span className="font-semibold text-slate-800">
                      {clinic?.name[language]} ({clinic?.branch[language]})
                    </span>
                    <p className="text-slate-500">{clinic?.address[language]}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{strings.fullNameLabel}:</span>
                    <span className="font-semibold text-slate-800">
                      {patientName} • {patientPhone}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {language === 'hy'
                      ? 'Խնդրում ենք ներկայանալ 10 րոպե շուտ և ներկայացնել անձը հաստատող փաստաթուղթ։'
                      : 'Please arrive 10 minutes early and carry an identification document.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Multiple Bookings & Portal */}
              <div className="space-y-3 pt-2 max-w-md mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    id="book-another-slot-btn"
                    onClick={handleBookAnother}
                    className="w-full px-4 py-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <PlusCircle className="w-4 h-4 text-teal-600" />
                    <span>{strings.bookAnotherForDoctor}</span>
                  </button>

                  <button
                    id="book-other-doctor-btn"
                    onClick={handleBookOtherDoctor}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4 text-slate-500" />
                    <span>{strings.bookOtherDoctor}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                  <button
                    id="go-to-portal-btn"
                    onClick={handleGoToPatientPortal}
                    className="w-full sm:flex-1 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>{strings.viewAllBookings}</span>
                  </button>

                  <button
                    onClick={closeBooking}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    {strings.close}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

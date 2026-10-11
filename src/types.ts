export type Language = 'hy' | 'en';

export type UserRole = 'patient' | 'doctor';

export type AppointmentType = 'in-person' | 'online';

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface LocalizedText {
  hy: string;
  en: string;
}

export interface Specialty {
  id: string;
  name: LocalizedText;
  icon: string;
  doctorCount: number;
}

export interface Clinic {
  id: string;
  name: LocalizedText;
  branch: LocalizedText;
  address: LocalizedText;
  phone: string;
  workingHours: string;
  rating: number;
  reviewCount: number;
}

export interface Doctor {
  id: string;
  name: LocalizedText;
  title: LocalizedText;
  specialtyId: string;
  clinicId: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  avatarUrl: string;
  consultationFee: number; // AMD
  onlineFee: number; // AMD
  languages: string[];
  education: LocalizedText;
  bio: LocalizedText;
  allowsOnline: boolean;
  nextAvailableDate: string; // e.g., '2026-09-12'
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  isBooked: boolean;
  appointmentId?: string;
  period: 'morning' | 'afternoon' | 'evening';
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientNotes?: string;
  reason: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: AppointmentType;
  status: AppointmentStatus;
  fee: number;
  clinicId: string;
  createdAt: string;
  doctorNotes?: string;
  prescription?: string;
  rating?: number;
  reviewText?: string;
}

export interface PatientUser {
  id: string;
  username: string;
  email: string;
  password: string;
  name: LocalizedText;
  phone: string;
  insurance: LocalizedText;
  birthDate: string;
  bloodGroup: string;
  avatarText: string;
}

export interface DoctorUser {
  id: string;
  doctorId: string;
  username: string;
  email: string;
  password: string;
}

export type AuthUser =
  | { type: 'patient'; patient: PatientUser }
  | { type: 'doctor'; doctor: Doctor; doctorUser: DoctorUser };

export interface SearchFilterState {
  searchQuery: string;
  specialtyId: string;
  branchId: string;
  minRating: number;
  visitType: 'all' | 'in-person' | 'online';
  sortBy: 'rating' | 'experience' | 'price-asc' | 'price-desc' | 'availability';
}

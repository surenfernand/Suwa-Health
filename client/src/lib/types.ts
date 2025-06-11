export interface SearchFilters {
  specialty: string;
  location: string;
}

export interface BookingState {
  selectedDoctor: number | null;
  selectedDate: string;
  selectedTime: string;
  patientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    reasonForVisit: string;
  };
}

export interface AppointmentFilters {
  status: 'upcoming' | 'past' | 'cancelled';
}

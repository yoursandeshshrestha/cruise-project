export type SettingsTab = 'general' | 'business' | 'features';

export interface SettingsFormData {
  // General - Capacity
  defaultDailyCapacity: string;
  bufferSpaces: string;
  // General - Operating Hours
  operatingHoursOpen: string;
  operatingHoursClose: string;
  bookingCutoffHours: string;
  // Business
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  // Features
  bookingEnabled: boolean;
  maintenanceMode: boolean;
  promoCodesEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  showCancellationPolicy: boolean;
  cancellationPolicyText: string;
}

export const defaultFormData: SettingsFormData = {
  defaultDailyCapacity: '',
  bufferSpaces: '',
  operatingHoursOpen: '',
  operatingHoursClose: '',
  bookingCutoffHours: '',
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  bookingEnabled: true,
  maintenanceMode: false,
  promoCodesEnabled: true,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  showCancellationPolicy: true,
  cancellationPolicyText: '',
};

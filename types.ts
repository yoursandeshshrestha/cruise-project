export enum ParkingType {
  PARK_AND_RIDE = 'Park and Ride',
  MEET_AND_GREET = 'Meet and Greet' // Future proofing, though strictly P&R for now
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // Icon name
}

export interface CruiseLine {
  id: string;
  name: string;
  ships: string[];
}

export type VehicleType = 'car' | 'van';

export interface BookingState {
  dropOffDate: string;
  dropOffTime: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  cruiseLine: string;
  shipName: string;
  terminal?: string;
  selectedAddOns: string[];
  vehicleType: VehicleType;
  vehicleReg: string;
  vehicleMake: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  promoCode: string;
  totalPrice: number;
}

export interface Quote {
  basePrice: number;
  days: number;
}

export type BookingStep = 1 | 2 | 3 | 4 | 5;

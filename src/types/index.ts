export type Role = 'admin' | 'buyer' | 'broker';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: Role;
  createdAt: string;
}

export type PropertyStatus = 'available' | 'sold' | 'unpublished';
export type ApprovalType = 'DTCP' | 'RERA' | 'Corporation' | 'Panchayat' | 'Other';
export type PropertyType = 'Residential Plot' | 'Commercial Plot' | 'Land' | 'Agricultural Land' | 'Villa' | 'House';

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  location: string;
  address: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  plotSize: number; // in sq.ft
  price: number;
  pricePerSqft: number;
  approval: ApprovalType;
  reraNumber?: string;
  roadWidth?: string; // e.g. "30 ft"
  facing?: string; // e.g. "North"
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  amenities?: string[];
  nearbyLandmarks?: string[];
  images: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  sortOrder: number;
}

export type EnquiryStatus = 'New' | 'Contacted' | 'Site Visit' | 'Negotiation' | 'Booked' | 'Closed';

export interface Enquiry {
  id: string;
  userId: string;
  propertyId: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
  
  // Joined fields for display
  property?: Property;
  user?: User;
}

import { Property, Enquiry } from '../types';

const MOCK_PROPERTIES_KEY = 'mj_properties_list';
const MOCK_ENQUIRIES_KEY = 'mj_properties_enquiries';

// Helper to initialize some dummy properties if empty
const initDummyProperties = () => {
  const existing = localStorage.getItem(MOCK_PROPERTIES_KEY);
  if (!existing) {
    const dummy: Property[] = [
      {
        id: 'prop-1',
        title: 'DTCP Approved Residential Plot',
        description: 'Excellent residential plot in a prime location. Ready for construction.',
        propertyType: 'Residential Plot',
        location: 'Othakadai',
        address: 'Othakadai, Madurai',
        plotSize: 1200,
        price: 1800000,
        pricePerSqft: 1500,
        approval: 'DTCP',
        roadWidth: '30 ft',
        facing: 'East',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        amenities: ['Water Connection', 'EB Line', 'Gated Community'],
        images: [{ id: 'img-1', propertyId: 'prop-1', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', sortOrder: 0 }],
      },
      {
        id: 'prop-2',
        title: 'Premium Commercial Land',
        description: 'Main road facing commercial land suitable for shops or office building.',
        propertyType: 'Commercial Plot',
        location: 'Mattuthavani',
        address: 'Near Bus Stand, Mattuthavani, Madurai',
        plotSize: 2400,
        price: 7200000,
        pricePerSqft: 3000,
        approval: 'Corporation',
        roadWidth: '60 ft',
        facing: 'North',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: [{ id: 'img-2', propertyId: 'prop-2', imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', sortOrder: 0 }],
      }
    ];
    localStorage.setItem(MOCK_PROPERTIES_KEY, JSON.stringify(dummy));
  }
};

initDummyProperties();

export const api = {
  // Properties
  getProperties: async (filters?: any): Promise<Property[]> => {
    const data = localStorage.getItem(MOCK_PROPERTIES_KEY);
    let properties: Property[] = data ? JSON.parse(data) : [];
    
    if (filters) {
      if (filters.location) {
        properties = properties.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
      if (filters.propertyType) {
        properties = properties.filter(p => p.propertyType === filters.propertyType);
      }
      if (filters.status) {
        properties = properties.filter(p => p.status === filters.status);
      }
      // Add budget filters if needed
    }
    
    return properties;
  },

  getPropertyById: async (id: string): Promise<Property | null> => {
    const properties = await api.getProperties();
    return properties.find(p => p.id === id) || null;
  },

  saveProperty: async (property: Partial<Property>): Promise<Property> => {
    const properties = await api.getProperties();
    if (property.id) {
      const index = properties.findIndex(p => p.id === property.id);
      if (index >= 0) {
        properties[index] = { ...properties[index], ...property, updatedAt: new Date().toISOString() } as Property;
        localStorage.setItem(MOCK_PROPERTIES_KEY, JSON.stringify(properties));
        return properties[index];
      }
    }
    
    const newProperty = {
      ...property,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Property;
    
    properties.push(newProperty);
    localStorage.setItem(MOCK_PROPERTIES_KEY, JSON.stringify(properties));
    return newProperty;
  },

  deleteProperty: async (id: string): Promise<boolean> => {
    let properties = await api.getProperties();
    properties = properties.filter(p => p.id !== id);
    localStorage.setItem(MOCK_PROPERTIES_KEY, JSON.stringify(properties));
    return true;
  },

  // Enquiries
  getEnquiries: async (): Promise<Enquiry[]> => {
    const data = localStorage.getItem(MOCK_ENQUIRIES_KEY);
    const enquiries: Enquiry[] = data ? JSON.parse(data) : [];
    
    // Join property data for display
    const properties = await api.getProperties();
    
    // Also join user data (mock users)
    const usersJson = localStorage.getItem('mj_properties_users');
    const users = usersJson ? JSON.parse(usersJson) : [];

    return enquiries.map(e => ({
      ...e,
      property: properties.find(p => p.id === e.propertyId),
      user: users.find((u: any) => u.id === e.userId)
    }));
  },

  getEnquiriesByUser: async (userId: string): Promise<Enquiry[]> => {
    const enquiries = await api.getEnquiries();
    return enquiries.filter(e => e.userId === userId);
  },

  createEnquiry: async (userId: string, propertyId: string): Promise<Enquiry> => {
    const data = localStorage.getItem(MOCK_ENQUIRIES_KEY);
    const enquiries: Enquiry[] = data ? JSON.parse(data) : [];
    
    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}`,
      userId,
      propertyId,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    enquiries.push(newEnquiry);
    localStorage.setItem(MOCK_ENQUIRIES_KEY, JSON.stringify(enquiries));
    return newEnquiry;
  },

  updateEnquiryStatus: async (id: string, status: string): Promise<void> => {
    const data = localStorage.getItem(MOCK_ENQUIRIES_KEY);
    const enquiries: Enquiry[] = data ? JSON.parse(data) : [];
    const index = enquiries.findIndex(e => e.id === id);
    if (index >= 0) {
      enquiries[index].status = status as any;
      enquiries[index].updatedAt = new Date().toISOString();
      localStorage.setItem(MOCK_ENQUIRIES_KEY, JSON.stringify(enquiries));
    }
  }
};

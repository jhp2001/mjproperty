-- MJ Properties Database Schema for Supabase
-- This script sets up the PostgreSQL tables, row level security (RLS), and basic triggers.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'buyer', 'broker')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  map_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  plot_size NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  price_per_sqft NUMERIC NOT NULL,
  approval TEXT NOT NULL,
  rera_number TEXT,
  road_width TEXT,
  facing TEXT,
  status TEXT NOT NULL CHECK (status IN ('available', 'sold', 'unpublished')) DEFAULT 'available',
  amenities TEXT[],
  nearby_landmarks TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Property Images Table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 4. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('New', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Closed')) DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update 'updated_at' automatically
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Users: Can read their own data. Admin can read all.
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Properties: Anyone can read available properties. Admin can read/write all.
CREATE POLICY "Anyone can view available properties" ON public.properties FOR SELECT USING (status = 'available');
CREATE POLICY "Admin can view all properties" ON public.properties FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can insert properties" ON public.properties FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can update properties" ON public.properties FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Images: Anyone can view. Admin can write.
CREATE POLICY "Anyone can view property images" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Admin can manage property images" ON public.property_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Enquiries: Users can read/write their own. Admin can read/write all.
CREATE POLICY "Users can insert their own enquiries" ON public.enquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own enquiries" ON public.enquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all enquiries" ON public.enquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

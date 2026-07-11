-- ====================================================================
-- LANDVERSE SUPABASE DATABASE SCHEMA
-- Generated: 2026-05-30
-- Description: Complete production schema for profiles, KYC, lands,
--              applications, marketplace, and transaction indexing.
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ENUMS AND CUSTOM TYPES
-- --------------------------------------------------------------------
DROP TYPE IF EXISTS public.transaction_status CASCADE;
DROP TYPE IF EXISTS public.transaction_event CASCADE;
DROP TYPE IF EXISTS public.listing_status CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;
DROP TYPE IF EXISTS public.kyc_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.application_type CASCADE;

CREATE TYPE public.user_role AS ENUM ('buyer', 'seller', 'authority');
CREATE TYPE public.kyc_status AS ENUM ('not_started', 'pending', 'approved', 'rejected', 'changes_requested');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected', 'changes_requested');
CREATE TYPE public.application_type AS ENUM ('registration', 'transfer');
CREATE TYPE public.listing_status AS ENUM ('active', 'sold', 'cancelled');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE public.transaction_event AS ENUM ('minted', 'listed', 'purchase', 'transfer');

-- --------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- --------------------------------------------------------------------

-- User Profiles & KYC (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role public.user_role DEFAULT 'buyer'::public.user_role NOT NULL,
  wallet_address varchar(42) UNIQUE CONSTRAINT wallet_address_format CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{35,45}$'),
  kyc_status public.kyc_status DEFAULT 'not_started'::public.kyc_status NOT NULL,
  kyc_submitted_at timestamp with time zone,
  kyc_document_url text,
  kyc_verified_at timestamp with time zone,
  kyc_verified_by uuid REFERENCES public.profiles(id),
  kyc_rejection_reason text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Properties & GPS Coordinates
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_code text UNIQUE NOT NULL,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  survey_number text NOT NULL,
  plot_number text NOT NULL,
  area numeric(12,2) NOT NULL CONSTRAINT positive_area CHECK (area > 0),
  area_unit text DEFAULT 'SQ. FT' NOT NULL CONSTRAINT valid_unit CHECK (area_unit IN ('SQ. FT', 'ACRES', 'HECTARES', 'SQ. METERS')),
  physical_address text NOT NULL,
  latitude numeric(9,6) NOT NULL CONSTRAINT valid_latitude CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric(9,6) NOT NULL CONSTRAINT valid_longitude CHECK (longitude BETWEEN -180 AND 180),
  gps_polygon jsonb, -- Stores array of boundary coordinate maps e.g. [{"lat": 42.1, "lng": -71.2}, ...]
  title_deed_url text NOT NULL,
  ownership_proof_url text NOT NULL,
  token_id numeric UNIQUE, -- Indexed blockchain NFT Token ID
  status public.verification_status DEFAULT 'pending'::public.verification_status NOT NULL,
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Registry Workflow & Land Applications
CREATE TABLE IF NOT EXISTS public.land_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.application_type NOT NULL,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES public.profiles(id),
  seller_id uuid REFERENCES public.profiles(id),
  buyer_id uuid REFERENCES public.profiles(id),
  status public.verification_status DEFAULT 'pending'::public.verification_status NOT NULL,
  authority_feedback text,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Marketplace Listings
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid UNIQUE NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  price_eth numeric(18,8) NOT NULL CONSTRAINT positive_price_eth CHECK (price_eth > 0),
  price_usd numeric(12,2) NOT NULL CONSTRAINT positive_price_usd CHECK (price_usd > 0),
  status public.listing_status DEFAULT 'active'::public.listing_status NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Blockchain Transaction Indexer Logs
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  buyer_id uuid REFERENCES public.profiles(id),
  event_type public.transaction_event NOT NULL,
  tx_hash varchar(66) UNIQUE CONSTRAINT valid_tx_hash CHECK (tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
  block_number integer CONSTRAINT positive_block_number CHECK (block_number IS NULL OR block_number >= 0),
  price_eth numeric(18,8),
  gas_used numeric(20,0),
  status public.transaction_status DEFAULT 'pending'::public.transaction_status NOT NULL,
  indexed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_coords ON public.properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_land_apps_property ON public.land_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_land_apps_applicant ON public.land_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_land_apps_status ON public.land_applications(status);
CREATE INDEX IF NOT EXISTS idx_listings_property ON public.marketplace_listings(property_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_tx_property ON public.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_tx_hash ON public.transactions(tx_hash);

-- --------------------------------------------------------------------
-- 4. AUTOMATIC TIMESTAMPS TRIGGERS
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_current_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_current_updated_at();

CREATE OR REPLACE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_current_updated_at();

CREATE OR REPLACE TRIGGER trg_land_apps_updated_at
  BEFORE UPDATE ON public.land_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_current_updated_at();

CREATE OR REPLACE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_current_updated_at();

-- --------------------------------------------------------------------
-- 5. FIELD-LEVEL ROLE PROTECTION (SECURITY HARDENED TRIGGERS)
-- --------------------------------------------------------------------

-- Profile Field Protection Trigger
CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS trigger AS $$
DECLARE
  caller_role public.user_role;
BEGIN
  -- If user is updating their own profile, ensure they are not modifying roles or KYC status
  -- Get the caller's role from public.profiles
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  
  -- If caller is not 'authority', block modification of admin-only fields
  IF caller_role IS DISTINCT FROM 'authority' THEN
    IF new.role IS DISTINCT FROM old.role THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can change user roles.';
    END IF;
    IF new.kyc_status IS DISTINCT FROM old.kyc_status THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can change KYC status.';
    END IF;
    IF new.kyc_verified_by IS DISTINCT FROM old.kyc_verified_by THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can assign the KYC verifier.';
    END IF;
    IF new.kyc_verified_at IS DISTINCT FROM old.kyc_verified_at THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can set the KYC verification timestamp.';
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_profiles_protect
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_updates();

-- Property Field Protection Trigger
CREATE OR REPLACE FUNCTION public.check_property_updates()
RETURNS trigger AS $$
DECLARE
  caller_role public.user_role;
BEGIN
  -- Get the caller's role
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

  -- If caller is not 'authority', block modification of verification columns and token mapping
  IF caller_role IS DISTINCT FROM 'authority' THEN
    IF new.status IS DISTINCT FROM old.status THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can change property verification status.';
    END IF;
    IF new.token_id IS DISTINCT FROM old.token_id THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can assign or edit the blockchain NFT Token ID.';
    END IF;
    IF new.verified_at IS DISTINCT FROM old.verified_at THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can set property verification timestamp.';
    END IF;
    IF new.verified_by IS DISTINCT FROM old.verified_by THEN
      RAISE EXCEPTION 'Unauthorized: Only Registrar Authority can set property verifier.';
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_properties_protect
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.check_property_updates();

-- --------------------------------------------------------------------
-- 6. AUTO-CREATE PROFILE ON AUTH USER SIGNUP (SECURITY HARDENED)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_val public.user_role;
  raw_role text;
  wallet_addr text;
BEGIN
  raw_role := new.raw_user_meta_data->>'role';
  wallet_addr := NULLIF(new.raw_user_meta_data->>'wallet_address', '');
  
  -- Translate 'owner' registration role to 'seller' database enum value
  IF raw_role = 'owner' THEN
    user_role_val := 'seller'::public.user_role;
  ELSIF raw_role = 'buyer' THEN
    user_role_val := 'buyer'::public.user_role;
  ELSIF raw_role = 'authority' THEN
    user_role_val := 'authority'::public.user_role;
  ELSE
    user_role_val := 'buyer'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, role, wallet_address, kyc_status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    user_role_val,
    wallet_addr,
    'not_started'::public.kyc_status
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Hardening trigger execute permissions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_profile_updates() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_property_updates() FROM public, anon, authenticated;

-- --------------------------------------------------------------------
-- 7. ROW-LEVEL SECURITY (RLS) ACTIVATION
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 8. ROW-LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- profiles policies
CREATE POLICY select_profiles ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY update_profiles_self ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY authority_profiles_manage ON public.profiles
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority');

-- properties policies
CREATE POLICY select_properties ON public.properties
  FOR SELECT
  USING (
    status = 'approved'::public.verification_status
    OR owner_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority'
  );

CREATE POLICY insert_properties_seller ON public.properties
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'seller'
    AND status = 'pending'::public.verification_status
  );

CREATE POLICY update_properties_owner ON public.properties
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY authority_properties_manage ON public.properties
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority');

-- land_applications policies
CREATE POLICY select_land_applications ON public.land_applications
  FOR SELECT
  USING (
    applicant_id = auth.uid()
    OR seller_id = auth.uid()
    OR buyer_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority'
  );

CREATE POLICY insert_land_applications ON public.land_applications
  FOR INSERT
  WITH CHECK (
    applicant_id = auth.uid()
    AND status = 'pending'::public.verification_status
  );

CREATE POLICY authority_land_applications_manage ON public.land_applications
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority');

-- marketplace_listings policies
CREATE POLICY select_listings ON public.marketplace_listings
  FOR SELECT
  USING (
    status = 'active'::public.listing_status 
    OR seller_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority'
  );

CREATE POLICY insert_listings_seller ON public.marketplace_listings
  FOR INSERT
  WITH CHECK (
    seller_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'seller'
    AND (SELECT owner_id FROM public.properties WHERE id = property_id) = auth.uid()
  );

CREATE POLICY update_listings_seller ON public.marketplace_listings
  FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY authority_listings_manage ON public.marketplace_listings
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority');

-- transactions policies
CREATE POLICY select_transactions ON public.transactions
  FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority'
    OR status = 'confirmed'::public.transaction_status
  );

CREATE POLICY insert_transactions ON public.transactions
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
  );

CREATE POLICY authority_transactions_manage ON public.transactions
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'authority');

-- --------------------------------------------------------------------
-- 9. DATA API GRANTS
-- --------------------------------------------------------------------
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

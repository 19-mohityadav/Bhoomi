// src/services/supabaseService.js
// Centralized Supabase fetching functions for the Bhoomi client
// Provides async helpers to retrieve data for various UI components.

import { supabase } from "../supabaseClient";

/**
 * Fetch feature cards for the landing page.
 * Expects a table `features` with columns matching the static structure:
 *   id, icon, title, description, color_class
 */
export async function fetchFeatures() {
  const { data, error } = await supabase.from("features").select("*");
  if (error) {
    console.error("Failed to fetch features:", error);
    return [];
  }
  return data;
}

/**
 * Fetch active market listings.
 * Joins listings with properties to include needed fields for UI.
 */
export async function fetchMarketListings() {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(`*, property:properties(*)`)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to fetch market listings:", error);
    return [];
  }
  // Transform to match the shape previously used by mock data
  return data.map((item) => {
    const prop = item.property;
    return {
      id: prop.property_code || prop.id,
      name: prop.name,
      price: Number(item.price_eth),
      usdPrice: Number(item.price_usd),
      owner: prop.owner_address?.slice(0, 6) + "..." + prop.owner_address?.slice(-4),
      fullOwner: prop.owner_address,
      area: Number(prop.area),
      image: prop.image || "",
      verified: true,
      region: prop.region || "",
      coordinates: `${prop.latitude?.toFixed(4)}° N, ${prop.longitude?.toFixed(4)}° W`,
      page: 1,
    };
  });
}

/**
 * Generic helper to fetch a table with optional filter.
 */
export async function fetchTable(table, filter = {}) {
  const { data, error } = await supabase.from(table).select("*").match(filter);
  if (error) {
    console.error(`Failed to fetch ${table}:`, error);
    return [];
  }
  return data;
}

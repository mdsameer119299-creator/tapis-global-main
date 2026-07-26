/**
 * Shared window event name used to open the CraftTrack modal from anywhere in
 * the app (e.g. TARA's "Track My Order" quick action) without prop-drilling
 * or a shared context — mirrors the existing lib/consent.ts CONSENT_EVENT
 * pattern for cross-component signaling.
 */
export const CRAFTTRACK_OPEN_EVENT = 'tgi-open-crafttrack'

import type { ImportBaseline } from './gsc-import'

/** Approved baseline for the one-time 90-day Search Console import (2026-08-11 .. 2026-11-08, sc-domain:tapisglobalinternational.com).
 *  FAIL-CLOSED: while `windows` has no row-level hash for every window the importer refuses to start (BASELINE_NOT_CONFIGURED).
 *  `daily` is the row-level hash captured in the accepted E1 extraction. The 13 window hashes are filled in ONLY after the hashes-only
 *  dry-run extension (see gsc-fingerprint.ts) has been deployed to Preview, run, and its output reviewed and approved. */
export const IMPORT_BASELINE: ImportBaseline = {
  daily: '23d11372971d56026c05416d178dff2d35b442609801a1a2fe60759c875880e7',
  windows: {}, // TO BE FILLED from the approved row-level dry-run: { 1: '<sha256>', ..., 13: '<sha256>' }
}

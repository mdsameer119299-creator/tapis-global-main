# GSC_TOKEN_ENCRYPTION_KEY: rotation and recovery

The Search Console refresh token is stored AES-256-GCM encrypted in `seo_oauth_connections`. The key lives only in
Vercel (Preview-only variables). Never in Git, the database, logs, chat or browser code.

## Variables
| Variable | Meaning |
|---|---|
| `GSC_TOKEN_ENCRYPTION_KEY` | Current key: 32 random bytes, base64 or hex. New tokens are sealed with it. |
| `GSC_TOKEN_KEY_VERSION` | Integer version of the current key (default `1`). Stored in `keyVersion` next to each token. |
| `GSC_TOKEN_ENCRYPTION_KEY_PREVIOUS` | Old key, present ONLY during a rotation. |
| `GSC_TOKEN_KEY_PREVIOUS_VERSION` | Version of the old key. |

A stored token is opened with the key whose version it carries. A key is never guessed or silently substituted.

## Why you must not just overwrite the key
If `GSC_TOKEN_ENCRYPTION_KEY` is replaced while encrypted tokens exist, nothing can open them. The app does **not**
treat that as "token revoked": the connection flips to `KEY_UNAVAILABLE` (status only), the ciphertext is left intact,
syncs stop, and the dashboard says so. Restoring the old key (as current, or as PREVIOUS with its version) recovers it
with no data loss.

## Planned rotation (no downtime, no reconnect)
1. Generate a new key (`openssl rand -base64 32`) in your own terminal. Do not paste it in chat.
2. In Vercel (Preview): set `GSC_TOKEN_ENCRYPTION_KEY_PREVIOUS` = old key, `GSC_TOKEN_KEY_PREVIOUS_VERSION` = old version,
   `GSC_TOKEN_ENCRYPTION_KEY` = new key, `GSC_TOKEN_KEY_VERSION` = old version + 1. Redeploy.
3. Run the re-seal action (admin, authenticated): each connection is opened with its own version's key and re-sealed
   under the current key. It fails closed: a row that cannot be opened is left untouched and reported.
4. Confirm every row's `keyVersion` equals the new version, then remove the two PREVIOUS variables and redeploy.

## Recovery if a key is lost
The token cannot be decrypted by anyone, including us. This is the designed failure mode: click **Reconnect** and grant
consent again. Everything already synced (Search Analytics, sitemaps, index status) is stored unencrypted in the SEO
database and is not affected.

## Never
Never delete or null a ciphertext because decryption failed. Never reuse a version number for a different key.

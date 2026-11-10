import { GscConnectButton, GscDisconnectButton } from './actions'
import { Panel } from './ui'
import { testingExpiry, type GscConnectionView } from '@/lib/seo-command/gsc-connection'

const fmt = (epoch: number | null) => (epoch === null ? 'never' : new Date(epoch * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' UTC')

/** Server component. Status only: no token, key or secret value ever reaches this component. */
export function GscPanel({ view, configured, nowMs }: { view: GscConnectionView; configured: boolean; nowMs: number }) {
  const exp = view.state === 'CONNECTED' ? testingExpiry(view.grantedAtEpoch, nowMs) : null
  const tone = view.state === 'CONNECTED' && exp?.level !== 'expired' && exp?.level !== 'soon' ? 'border-emerald-200 bg-emerald-50' : view.state === 'DISCONNECTED' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
  const effective = view.state === 'CONNECTED' && exp?.level === 'expired' ? 'RECONNECT_REQUIRED' : view.state
  return (
    <div className={`rounded-lg border p-4 ${tone}`} data-testid="gsc-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-ink">Google Search Console</div>
          <div className="text-xs text-ink-s" data-testid="gsc-state">
            {effective === 'CONNECTED' && 'Connected (read-only). No data has been requested yet.'}
            {effective === 'DISCONNECTED' && (configured ? 'Not connected. No data is shown until Google access is authorised; nothing is estimated.' : 'Not configured for this environment (Vercel Preview variables missing).')}
            {effective === 'RECONNECT_REQUIRED' && 'Reconnect required: Google no longer accepts the saved authorisation (expired, revoked, or the 7-day Testing-mode limit).'}
            {effective === 'KEY_UNAVAILABLE' && 'The saved token cannot be opened with the configured encryption key. It was left untouched. Restore the previous key, or Reconnect to replace it.'}
            {effective === 'ERROR' && `Connection error${view.lastErrorCode ? ` (${view.lastErrorCode})` : ''}. Check the OAuth client settings, then Reconnect.`}
          </div>
          {view.propertyUrl && effective !== 'DISCONNECTED' && <div className="text-xs text-ink-s">Property: {view.propertyUrl}</div>}
          {view.grantedAtEpoch !== null && effective !== 'DISCONNECTED' && <div className="text-xs text-ink-s">Authorised {fmt(view.grantedAtEpoch)} · last token refresh {fmt(view.lastRefreshEpoch)}</div>}
          {exp && exp.level !== 'expired' && (
            <div className={`text-xs ${exp.level === 'soon' ? 'font-medium text-red-700' : 'text-ink-s'}`} data-testid="gsc-expiry">
              While the Google app is in Testing mode, this authorisation expires on {fmt(Math.floor(exp.expiresAtMs / 1000))}{exp.level === 'soon' ? ' — reconnect soon.' : '.'}
            </div>
          )}
          {view.lastErrorCode && effective !== 'CONNECTED' && view.lastErrorCode !== 'invalid_grant' && <div className="text-xs text-ink-s">Last error code: {view.lastErrorCode}</div>}
        </div>
        {configured && (
          <div className="flex items-start gap-2">
            {effective === 'DISCONNECTED' ? <GscConnectButton label="Connect Search Console" /> : <GscConnectButton label="Reconnect" />}
            {view.state !== 'DISCONNECTED' && <GscDisconnectButton />}
          </div>
        )}
      </div>
    </div>
  )
}

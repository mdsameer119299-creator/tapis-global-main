// app/og/route.tsx
// Dynamic OG image generator using Next.js Edge Runtime + Satori.
// Generates a branded 1200×630 image at /og?title=...&desc=...
//
// Install dependency: npm install @vercel/og
// Then uncomment the code below.

/*
import { ImageResponse } from '@vercel/og'
import { NextRequest }   from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Tapis Global International'
  const desc  = searchParams.get('desc')  ?? 'Premium Handmade Carpets from Bhadohi, India'

  return new ImageResponse(
    (
      <div
        style={{
          width:      '100%',
          height:     '100%',
          display:    'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding:    '60px 72px',
          background: '#4A1414',
          fontFamily: 'serif',
          position:   'relative',
        }}
      >
        // Background texture div
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #4A1414 0%, #1A1310 60%, #0D0A08 100%)',
        }} />

        // Gold accent line
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 4, background: '#C09B4A',
        }} />

        // Content
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: 14, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#D4B574', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            TAPIS GLOBAL INTERNATIONAL · BHADOHI, INDIA
          </p>
          <h1 style={{
            fontSize: 56, fontWeight: 500, color: '#FFFFFF',
            lineHeight: 1.1, marginBottom: 20, maxWidth: 900,
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: 22, color: 'rgba(255,255,255,0.6)',
            fontWeight: 300, maxWidth: 800, lineHeight: 1.5,
          }}>
            {desc}
          </p>
          <div style={{
            marginTop: 40, display: 'flex', gap: 32, alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: '#EDD99A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Est. 1998
            </span>
            <span style={{ width: 1, height: 20, background: 'rgba(192,155,74,0.4)' }} />
            <span style={{ fontSize: 13, color: '#EDD99A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              45+ Export Countries
            </span>
            <span style={{ width: 1, height: 20, background: 'rgba(192,155,74,0.4)' }} />
            <span style={{ fontSize: 13, color: '#EDD99A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              ISO 9001:2015 Certified
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  )
}
*/

// Placeholder export until @vercel/og is installed
export async function GET() {
  return new Response('OG image route — install @vercel/og to enable dynamic generation', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}

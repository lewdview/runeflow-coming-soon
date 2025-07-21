import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '🔮 RuneFlow Template Collection Dashboard',
  description: 'Ancient Power. Modern Automation. Glass Window Transparency.',
  keywords: 'runeflow, automation, templates, n8n, dashboard, norse, runes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-runic-gradient font-norse antialiased">
        <div className="relative min-h-screen">
          {/* Background particles/effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-runeflow-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-runic-gold-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-runeflow-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

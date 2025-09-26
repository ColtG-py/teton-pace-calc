import type { Metadata } from "next"
import { JetBrains_Mono, Orbitron } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-jetbrains',
})

const orbitron = Orbitron({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: "NERV TETON MISSION CONTROL - Middle Teton Southwest Couloir",
  description: "Evangelion-inspired tactical climbing interface for Middle Teton route planning, real-time progress tracking, and advanced fatigue modeling.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body className={jetbrainsMono.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen eva-grid" style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(255, 102, 0, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 255, 65, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(102, 0, 255, 0.05) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 25%, #0a0a0a 50%, #1a1a0a 75%, #0a0a0a 100%)
            `
          }}>
            {/* Terminal Header */}
            <header className="eva-terminal container mx-auto px-4 py-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="eva-title text-4xl mb-2">
                    NERV_MISSION_CONTROL
                  </h1>
                  <div className="eva-text-green text-sm mb-2">
                    MIDDLE_TETON_SOUTHWEST_COULOIR_TACTICAL_INTERFACE
                  </div>
                  <div className="eva-status-bar inline-block">
                    STATUS: OPERATIONAL | CLASS: RESTRICTED
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="eva-border p-3 mb-3">
                    <div className="eva-text-green text-xs mb-1">SYSTEM_TIME:</div>
                    <div className="eva-text font-mono">{new Date().toLocaleTimeString()}</div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
              
              {/* Decorative terminal elements */}
              <div className="mt-6 flex justify-between items-center eva-border-green border-t-0 border-l-0 border-r-0 pt-4">
                <div className="flex gap-8 text-xs eva-text-green">
                  <div>ROUTE: SW_COULOIR</div>
                  <div>DIFFICULTY: CLASS_3-4</div>
                  <div>ELEVATION: 6,732_-_12,804_FT</div>
                  <div>DISTANCE: 6.5_MILES</div>
                </div>
                <div className="eva-text text-xs">
                  AUTHORIZATION: REQUIRED
                </div>
              </div>
            </header>
            
            <main className="container mx-auto px-4 pb-8">
              {children}
            </main>
            
            {/* Footer Terminal */}
            <footer className="eva-terminal container mx-auto px-4 py-4 mt-8">
              <div className="flex justify-between items-center text-xs eva-text-green">
                <div>
                  © 2025 NERV_TACTICAL_SYSTEMS | CLASSIFIED_MOUNTAIN_OPERATIONS
                </div>
                <div>
                  VERSION: 4.0.1 | BUILD: NGE_TERMINAL_INTERFACE
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const interTight = Inter_Tight({ 
  subsets: ["latin"],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Middle Teton Southwest Couloir Pacing Calculator",
  description: "Plan your Middle Teton climb with precise timing calculations, real-time progress tracking, and fatigue modeling.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={interTight.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
            <header className="container mx-auto px-4 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">🏔️ Middle Teton Calculator</h1>
                <p className="text-slate-300 text-sm">Southwest Couloir Route Planning</p>
              </div>
              <ThemeToggle />
            </header>
            <main className="container mx-auto px-4 pb-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
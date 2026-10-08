import "./globals.css"
import Sidebar from "./components/Sidebar"
import TopBar from "./components/TopBar"
import AuthGuard from "./components/AuthGuard"
import ThemeProvider from "./context/ThemeProvider"
import { AppProvider } from "./context/AppContext"
import { AuthProvider } from "./context/AuthContext"
import ServiceWorker from "./components/ServiceWorker"

export const metadata = {
  title: "NutriFit — Tu plan nutricional",
  description: "Trackea tu alimentación, planifica comidas y alcanza tus objetivos de fitness",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriFit",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#10b981",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <ServiceWorker />
        <ThemeProvider>
          <AuthProvider>
            <AuthGuard>
              <AppProvider>
                <Sidebar />
                <TopBar />
                <main className="md:ml-64 min-h-screen">
                  <div
                    className="max-w-6xl mx-auto px-4 md:px-8 pb-6 md:pb-8"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)' }}
                  >
                    {children}
                  </div>
                </main>
              </AppProvider>
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

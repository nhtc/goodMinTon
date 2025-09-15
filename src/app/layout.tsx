import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css" // This imports your global styles
import Navbar from "../components/Navbar"
import { AuthProvider } from "@/context/AuthContext"
import { ToastProvider } from "@/context/ToastContext"
import { AlertProvider } from "@/context/AlertContext"
import { QueryProvider } from "@/context/QueryContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Badminton Manager",
  description: "Manage your badminton games, members, and history efficiently",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <AlertProvider>
                <Navbar />
                <main className='main-content'>{children}</main>
              </AlertProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

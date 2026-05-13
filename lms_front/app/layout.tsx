import Link from "next/link";
import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";
import { UserProvider } from "./userContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edusys",
  description: "LMS EduSys",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
              flex: 1,
              transition: 'margin-left 0.3s ease',
              padding: '2rem'
            }}>
              {children}
            </main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
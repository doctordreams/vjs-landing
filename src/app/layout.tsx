import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vaidya Jyothi Scholarship - MBBS Admission Consultancy | Doctor Dreams",
  description: "Apply for Vaidya Jyothi Scholarship and achieve your MBBS dreams. India's leading MBBS consultancy since 2009, guiding 6000+ students to medical education excellence across 25+ destinations worldwide.",
  keywords: [
    "Vaidya Jyothi Scholarship",
    "MBBS admission",
    "MBBS consultancy",
    "Doctor Dreams",
    "medical education",
    "MBBS abroad",
    "MBBS scholarship",
    "medical college admission",
    "MBBS guidance",
    "study MBBS abroad"
  ],
  authors: [{ name: "Doctor Dreams" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Vaidya Jyothi Scholarship - MBBS Admission Consultancy",
    description: "Apply for Vaidya Jyothi Scholarship. India's leading MBBS consultancy since 2009 with 6000+ success stories. Get expert guidance for MBBS admissions in India and abroad.",
    url: "https://vjsdoctordreams-zeta.vercel.app",
    siteName: "Vaidya Jyothi Scholarship - Doctor Dreams",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vaidya Jyothi Scholarship - Doctor Dreams MBBS Consultancy"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaidya Jyothi Scholarship - MBBS Admission Consultancy",
    description: "Apply for Vaidya Jyothi Scholarship. 6000+ success stories. Expert MBBS admission guidance since 2009.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

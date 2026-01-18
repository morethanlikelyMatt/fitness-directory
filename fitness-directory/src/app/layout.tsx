import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fitness Directory - Find Gyms & Fitness Centers Near You",
    template: "%s | Fitness Directory",
  },
  description:
    "Discover fitness centers worldwide. Search by equipment, amenities, location, and specialties. Find your perfect gym today.",
  keywords: [
    "gym finder",
    "fitness center",
    "gym near me",
    "workout",
    "fitness",
    "health club",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

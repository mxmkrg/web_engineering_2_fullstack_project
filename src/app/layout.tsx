import type { Metadata } from "next";
import "./globals.css";
import { RootLayoutClient } from "./layout-client";

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Track your fitness journey",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}

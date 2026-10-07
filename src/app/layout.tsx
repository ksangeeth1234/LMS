import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuition Class Student Management & LMS Portal",
  description: "Enterprise Systems Technologies and Architectures (IT 403061) - Model-View-Controller Tuition LMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}

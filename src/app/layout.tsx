import type { Metadata } from "next";
import ServiceWorkerRegistration from "./ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuition Class Student Management & LMS Portal",
  description: "PicoZen Enterprise Systems Technologies - Model-View-Controller Tuition LMS",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tuition LMS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('tuition_theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

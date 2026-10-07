export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-bold">You are offline</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Connect to the internet and try again to access the Tuition LMS.
        </p>
      </section>
    </main>
  );
}

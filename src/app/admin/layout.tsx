import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_NAME, verifySessionToken } from "@/lib/auth";
import { Navbar } from "@/views/components/Navbar";
import { Sidebar } from "@/views/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(TOKEN_NAME)?.value;
  if (!token) {
    redirect("/login");
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar user={session} />
      <div className="flex flex-1">
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

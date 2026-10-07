import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_NAME, verifySessionToken } from "@/lib/auth";
import { AppLayout } from "@/views/components/AppLayout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(TOKEN_NAME)?.value;
  if (!token) {
    redirect("/login");
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <AppLayout user={session} role="STUDENT">
      {children}
    </AppLayout>
  );
}

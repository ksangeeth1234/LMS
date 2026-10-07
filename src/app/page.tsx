import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_NAME, verifySessionToken } from "@/lib/auth";

export default function HomePage() {
  const token = cookies().get(TOKEN_NAME)?.value;

  if (token) {
    const session = verifySessionToken(token);
    if (session?.role === "ADMIN") {
      redirect("/admin");
    } else if (session?.role === "STUDENT") {
      redirect("/student");
    }
  }

  // Not authenticated, redirect to login
  redirect("/login");
}

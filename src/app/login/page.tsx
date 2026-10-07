import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_NAME, verifySessionToken } from "@/lib/auth";
import { LoginView } from "@/views/auth/LoginView";

export default function LoginPage() {
  const token = cookies().get(TOKEN_NAME)?.value;

  if (token) {
    const session = verifySessionToken(token);
    if (session?.role === "ADMIN") {
      redirect("/admin");
    } else if (session?.role === "STUDENT") {
      redirect("/student");
    }
  }

  return <LoginView />;
}

import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/user.model";
import { verifyPassword, signSessionToken, TOKEN_NAME, verifySessionToken } from "@/lib/auth";
import { SessionUser } from "@/models/types";
import { AuditModel } from "@/models/audit.model";

export class AuthController {
  /**
   * Handle user login request (Admin / Student)
   */
  static async handleLogin(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { username, password } = body;

      if (!username || !password) {
        return NextResponse.json(
          { success: false, message: "Username and password are required" },
          { status: 400 }
        );
      }

      // 1. Fetch user by username via Model
      const user = await UserModel.findByUsername(username);

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid username or password" },
          { status: 401 }
        );
      }

      // 2. Check if account is active
      if (!user.is_active) {
        return NextResponse.json(
          {
            success: false,
            message: "This account has been deactivated. Please contact your tuition master.",
          },
          { status: 403 }
        );
      }

      // 3. Verify password hash
      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid username or password" },
          { status: 401 }
        );
      }

      // 4. Construct Session Object
      const sessionUser: SessionUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.role === "ADMIN" 
          ? user.admin?.full_name || "Tuition Administrator" 
          : user.student?.full_name || user.username,
        studentId: user.student?.id,
        studentCode: user.student?.student_id,
        courseClass: user.student?.course_class,
      };

      // 5. Sign JWT token & set HTTP-only cookie
      const token = signSessionToken(sessionUser);

      await AuditModel.log({
        user_id: user.id,
        action: "USER_LOGIN",
        entity_type: "AUTH",
        entity_id: user.id,
        details: { role: user.role, username: user.username },
      });

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        user: sessionUser,
        redirectTo: user.role === "ADMIN" ? "/admin" : "/student",
      });

      // Secure cookie
      response.cookies.set({
        name: TOKEN_NAME,
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });

      return response;
    } catch (error: any) {
      console.error("Login controller error:", error);
      return NextResponse.json(
        { success: false, message: "An unexpected server error occurred during login" },
        { status: 500 }
      );
    }
  }

  /**
   * Handle user logout
   */
  static async handleLogout(req: NextRequest): Promise<NextResponse> {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set({
      name: TOKEN_NAME,
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  }

  /**
   * Get current authenticated user session
   */
  static async getCurrentUser(req: NextRequest): Promise<NextResponse> {
    const token = req.cookies.get(TOKEN_NAME)?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: session });
  }

  /**
   * Helper to verify authentication for API routes
   */
  static verifyAuth(req: NextRequest, requiredRole?: "ADMIN" | "STUDENT"): SessionUser | null {
    const token = req.cookies.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session) return null;

    if (requiredRole && session.role !== requiredRole) {
      return null;
    }

    return session;
  }
}

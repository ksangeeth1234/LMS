import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GeneratedCredentials, SessionUser } from "@/models/types";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-tuition-lms-jwt-token-key-2027";
const TOKEN_NAME = "tuition_lms_session";

/**
 * Generates automated student login credentials according to assignment specifications:
 * - Username: Student's First Name (trimmed)
 * - Password: Last name's final 3 characters + "@" + NIC number's first 3 digits
 *
 * Example:
 * First Name: Kavindu
 * Last Name: Silpage
 * NIC: 200012345678
 *
 * Result:
 * Username: Kavindu
 * Password: age@200
 */
export function generateStudentCredentials(
  firstName: string,
  lastName: string,
  nic: string,
  studentId: string,
  fullName: string
): GeneratedCredentials {
  // 1. Username = First Name
  const cleanFirstName = firstName.trim().replace(/[^a-zA-Z0-9]/g, "");
  const username = cleanFirstName || `Student_${studentId.replace(/[^0-9]/g, "")}`;

  // 2. Last 3 chars of Last Name (case-preserved or lowercased based on requirement, assignment shows "age" for "Silpage")
  const cleanLastName = lastName.trim().toLowerCase();
  const last3 = cleanLastName.length >= 3 
    ? cleanLastName.slice(-3) 
    : cleanLastName.padEnd(3, "x");

  // 3. First 3 digits of NIC
  const cleanNic = nic.trim().replace(/[^0-9]/g, "");
  const first3Nic = cleanNic.length >= 3 
    ? cleanNic.slice(0, 3) 
    : "100";

  const passwordPlain = `${last3}@${first3Nic}`;

  return {
    username,
    passwordPlain,
    studentId,
    fullName,
  };
}

/**
 * Hashes plain text password securely using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compares plain text password with bcrypt hash
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  // If demo unhashed or direct match fallback for quick testing
  if (plainText === hash) return true;
  return bcrypt.compare(plainText, hash);
}

/**
 * Signs a JWT session token
 */
export function signSessionToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies and decodes a JWT session token
 */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export { TOKEN_NAME };

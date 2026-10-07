// ==============================================================================
// Tuition LMS - Domain Entity Models & Interfaces
// ==============================================================================

export type UserRole = "ADMIN" | "STUDENT";

export type PaymentStatus = "NOT PAID" | "SLIP UPLOADED" | "VERIFIED" | "REJECTED";

export type MaterialType = "LINK" | "NOTE" | "FILE";

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  designation?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  nic: string;
  student_phone: string;
  whatsapp_phone: string;
  parent_phone: string;
  address: string;
  email?: string;
  course_class: string;
  registration_date: string;
  additional_details?: string;
  initial_password_plain?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  username?: string; // Joined from User
}

export interface PaymentSlip {
  id: string;
  payment_id: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  payment_month: string; // Format: 'YYYY-MM'
  amount: number;
  payment_date?: string | null;
  payment_status: PaymentStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  student?: Student;
  slip?: PaymentSlip | null;
  admin_verifier?: Admin | null;
}

export interface LearningLink {
  id: string;
  material_id: string;
  url: string;
  platform?: string;
  created_at: string;
}

export interface Note {
  id: string;
  material_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialAttachment {
  id: string;
  material_id: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export interface LearningMaterial {
  id: string;
  payment_month: string; // Required month e.g. '2027-01'
  course_class: string;
  title: string;
  description?: string;
  material_type: MaterialType;
  is_published: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Joined content
  note?: Note | null;
  link?: LearningLink | null;
  attachment?: MaterialAttachment | null;
  
  // Access control property computed for student
  is_unlocked?: boolean;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  username?: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface SessionUser {
  id: string; // User ID
  username: string;
  role: UserRole;
  studentId?: string; // If student
  studentCode?: string; // e.g. STU-2027-001
  fullName: string;
  courseClass?: string;
}

export interface StudentRegistrationInput {
  studentId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nic: string;
  studentPhone: string;
  whatsappPhone: string;
  parentPhone: string;
  address: string;
  email?: string;
  courseClass: string;
  registrationDate: string;
  additionalDetails?: string;
}

export interface GeneratedCredentials {
  username: string;
  passwordPlain: string;
  studentId: string;
  fullName: string;
}

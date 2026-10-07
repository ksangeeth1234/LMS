import { Admin, AuditLog, LearningMaterial, Payment, PaymentSlip, Student, User } from "@/models/types";
import bcrypt from "bcryptjs";

// Global in-memory data store for testing and fallback when Supabase is not connected
interface StoreState {
  users: User[];
  admins: Admin[];
  students: Student[];
  payments: Payment[];
  slips: PaymentSlip[];
  materials: LearningMaterial[];
  auditLogs: AuditLog[];
}

declare global {
  // eslint-disable-next-line no-var
  var __LMS_STORE__: StoreState | undefined;
}

function initializeStore(): StoreState {
  // Pre-hashed passwords:
  // Admin: 'AdminPassword@123'
  // Kavindu: 'age@200'
  // Nimal: 'era@200'
  // Dilani: 'ena@200'
  // Kasun: 'ndo@200'
  // Tharindu: 'ghe@200'
  const adminHash = bcrypt.hashSync("AdminPassword@123", 10);
  const kavinduHash = bcrypt.hashSync("age@200", 10);
  const nimalHash = bcrypt.hashSync("era@200", 10);
  const dilaniHash = bcrypt.hashSync("ena@200", 10);
  const kasunHash = bcrypt.hashSync("ndo@200", 10);
  const tharinduHash = bcrypt.hashSync("ghe@200", 10);

  const users: User[] = [
    {
      id: "u-admin-01",
      username: "admin",
      password_hash: adminHash,
      role: "ADMIN",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "u-stu-01",
      username: "Kavindu",
      password_hash: kavinduHash,
      role: "STUDENT",
      is_active: true,
      created_at: "2026-01-05T00:00:00Z",
      updated_at: "2026-01-05T00:00:00Z",
    },
    {
      id: "u-stu-02",
      username: "Nimal",
      password_hash: nimalHash,
      role: "STUDENT",
      is_active: true,
      created_at: "2026-01-08T00:00:00Z",
      updated_at: "2026-01-08T00:00:00Z",
    },
    {
      id: "u-stu-03",
      username: "Dilani",
      password_hash: dilaniHash,
      role: "STUDENT",
      is_active: true,
      created_at: "2026-01-10T00:00:00Z",
      updated_at: "2026-01-10T00:00:00Z",
    },
    {
      id: "u-stu-04",
      username: "Kasun",
      password_hash: kasunHash,
      role: "STUDENT",
      is_active: true,
      created_at: "2026-01-12T00:00:00Z",
      updated_at: "2026-01-12T00:00:00Z",
    },
    {
      id: "u-stu-05",
      username: "Tharindu",
      password_hash: tharinduHash,
      role: "STUDENT",
      is_active: true,
      created_at: "2026-01-15T00:00:00Z",
      updated_at: "2026-01-15T00:00:00Z",
    },
  ];

  const admins: Admin[] = [
    {
      id: "a-01",
      user_id: "u-admin-01",
      full_name: "Eng. Anura Bandara",
      email: "anura.tuition@maths.lk",
      phone: "0771234567",
      designation: "Tuition Master / Chief Instructor",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ];

  const students: Student[] = [
    {
      id: "s-01",
      user_id: "u-stu-01",
      student_id: "STU-2027-001",
      full_name: "Kavindu Sangeeth Silpage",
      first_name: "Kavindu",
      last_name: "Silpage",
      nic: "200012345678",
      student_phone: "0712345678",
      whatsapp_phone: "0712345678",
      parent_phone: "0779876543",
      address: "No. 45, Temple Road, Nugegoda, Colombo",
      email: "kavindu.student@gmail.com",
      course_class: "Combined Maths 2027 A/L",
      registration_date: "2026-01-05",
      initial_password_plain: "age@200",
      is_active: true,
      created_at: "2026-01-05T00:00:00Z",
      updated_at: "2026-01-05T00:00:00Z",
      username: "Kavindu",
    },
    {
      id: "s-02",
      user_id: "u-stu-02",
      student_id: "STU-2027-002",
      full_name: "Nimal Shantha Perera",
      first_name: "Nimal",
      last_name: "Perera",
      nic: "200156789123",
      student_phone: "0723456789",
      whatsapp_phone: "0723456789",
      parent_phone: "0765432198",
      address: "No. 12/B, Galle Road, Kalutara",
      email: "nimal.p@gmail.com",
      course_class: "Combined Maths 2027 A/L",
      registration_date: "2026-01-08",
      initial_password_plain: "era@200",
      is_active: true,
      created_at: "2026-01-08T00:00:00Z",
      updated_at: "2026-01-08T00:00:00Z",
      username: "Nimal",
    },
    {
      id: "s-03",
      user_id: "u-stu-03",
      student_id: "STU-2027-003",
      full_name: "Dilani Chamodi Jayawardena",
      first_name: "Dilani",
      last_name: "Jayawardena",
      nic: "200234567890",
      student_phone: "0754567890",
      whatsapp_phone: "0754567890",
      parent_phone: "0711122334",
      address: "No. 88, Kandy Road, Gampaha",
      email: "dilani.j@gmail.com",
      course_class: "Combined Maths 2027 A/L",
      registration_date: "2026-01-10",
      initial_password_plain: "ena@200",
      is_active: true,
      created_at: "2026-01-10T00:00:00Z",
      updated_at: "2026-01-10T00:00:00Z",
      username: "Dilani",
    },
    {
      id: "s-04",
      user_id: "u-stu-04",
      student_id: "STU-2027-004",
      full_name: "Kasun Thisara Fernando",
      first_name: "Kasun",
      last_name: "Fernando",
      nic: "200198765432",
      student_phone: "0787654321",
      whatsapp_phone: "0787654321",
      parent_phone: "0722233445",
      address: "No. 19, Beach Road, Negombo",
      email: "kasun.f@gmail.com",
      course_class: "Combined Maths 2027 A/L",
      registration_date: "2026-01-12",
      initial_password_plain: "ndo@200",
      is_active: true,
      created_at: "2026-01-12T00:00:00Z",
      updated_at: "2026-01-12T00:00:00Z",
      username: "Kasun",
    },
    {
      id: "s-05",
      user_id: "u-stu-05",
      student_id: "STU-2027-005",
      full_name: "Tharindu Sandaruwan Wickramasinghe",
      first_name: "Tharindu",
      last_name: "Wickramasinghe",
      nic: "200087654321",
      student_phone: "0761239876",
      whatsapp_phone: "0761239876",
      parent_phone: "0773344556",
      address: "No. 104, Highlevel Road, Maharagama",
      email: "tharindu.w@gmail.com",
      course_class: "Combined Maths 2027 A/L",
      registration_date: "2026-01-15",
      initial_password_plain: "ghe@200",
      is_active: true,
      created_at: "2026-01-15T00:00:00Z",
      updated_at: "2026-01-15T00:00:00Z",
      username: "Tharindu",
    },
  ];

  const slips: PaymentSlip[] = [
    {
      id: "slip-01",
      payment_id: "p-01",
      file_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60",
      file_name: "BOC_Deposit_Slip_Jan2027.jpg",
      file_size: 245600,
      mime_type: "image/jpeg",
      uploaded_at: "2027-01-03T10:30:00Z",
    },
    {
      id: "slip-02",
      payment_id: "p-02",
      file_url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=60",
      file_name: "CommercialBank_Slip_Feb2027.png",
      file_size: 312400,
      mime_type: "image/png",
      uploaded_at: "2027-02-02T11:15:00Z",
    },
    {
      id: "slip-03",
      payment_id: "p-04",
      file_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60",
      file_name: "HNB_Slip_Jan2027_Blur.jpg",
      file_size: 198000,
      mime_type: "image/jpeg",
      uploaded_at: "2027-01-04T16:45:00Z",
    },
  ];

  const payments: Payment[] = [
    {
      id: "p-01",
      student_id: "s-01",
      payment_month: "2027-01",
      amount: 4500.0,
      payment_date: "2027-01-03T10:30:00Z",
      payment_status: "VERIFIED",
      verified_at: "2027-01-03T14:20:00Z",
      verified_by: "a-01",
      remarks: "Bank deposit verified. Access granted.",
      created_at: "2027-01-01T00:00:00Z",
      updated_at: "2027-01-03T14:20:00Z",
      slip: slips[0],
    },
    {
      id: "p-02",
      student_id: "s-01",
      payment_month: "2027-02",
      amount: 4500.0,
      payment_date: "2027-02-02T11:15:00Z",
      payment_status: "SLIP UPLOADED",
      verified_at: null,
      verified_by: null,
      remarks: "Slip submitted via online portal. Pending teacher verification.",
      created_at: "2027-02-01T00:00:00Z",
      updated_at: "2027-02-02T11:15:00Z",
      slip: slips[1],
    },
    {
      id: "p-03",
      student_id: "s-01",
      payment_month: "2027-03",
      amount: 4500.0,
      payment_date: null,
      payment_status: "NOT PAID",
      verified_at: null,
      verified_by: null,
      remarks: "Tuition fee outstanding for March 2027.",
      created_at: "2027-03-01T00:00:00Z",
      updated_at: "2027-03-01T00:00:00Z",
      slip: null,
    },
    {
      id: "p-04",
      student_id: "s-02",
      payment_month: "2027-01",
      amount: 4500.0,
      payment_date: "2027-01-04T16:45:00Z",
      payment_status: "REJECTED",
      verified_at: "2027-01-05T09:00:00Z",
      verified_by: "a-01",
      rejection_reason: "Slip image is unclear and transaction reference number is cropped out. Please upload a clear original receipt.",
      remarks: "Re-upload required.",
      created_at: "2027-01-01T00:00:00Z",
      updated_at: "2027-01-05T09:00:00Z",
      slip: slips[2],
    },
    {
      id: "p-05",
      student_id: "s-02",
      payment_month: "2027-02",
      amount: 4500.0,
      payment_date: "2027-02-01T09:30:00Z",
      payment_status: "VERIFIED",
      verified_at: "2027-02-01T15:10:00Z",
      verified_by: "a-01",
      remarks: "Payment verified successfully.",
      created_at: "2027-02-01T00:00:00Z",
      updated_at: "2027-02-01T15:10:00Z",
      slip: null,
    },
    {
      id: "p-06",
      student_id: "s-03",
      payment_month: "2027-01",
      amount: 4500.0,
      payment_date: "2027-01-02T14:00:00Z",
      payment_status: "VERIFIED",
      verified_at: "2027-01-02T18:00:00Z",
      verified_by: "a-01",
      remarks: "Verified via online bank transfer.",
      created_at: "2027-01-01T00:00:00Z",
      updated_at: "2027-01-02T18:00:00Z",
      slip: null,
    },
    {
      id: "p-07",
      student_id: "s-04",
      payment_month: "2027-01",
      amount: 4500.0,
      payment_date: null,
      payment_status: "NOT PAID",
      verified_at: null,
      verified_by: null,
      remarks: "Pending payment.",
      created_at: "2027-01-01T00:00:00Z",
      updated_at: "2027-01-01T00:00:00Z",
      slip: null,
    },
    {
      id: "p-08",
      student_id: "s-05",
      payment_month: "2027-01",
      amount: 4500.0,
      payment_date: "2027-01-06T12:00:00Z",
      payment_status: "SLIP UPLOADED",
      verified_at: null,
      verified_by: null,
      remarks: "Uploaded slip via portal.",
      created_at: "2027-01-01T00:00:00Z",
      updated_at: "2027-01-06T12:00:00Z",
      slip: null,
    },
  ];

  const materials: LearningMaterial[] = [
    {
      id: "mat-01",
      payment_month: "2027-01",
      course_class: "Combined Maths 2027 A/L",
      title: "Week 01 – Fundamentals of Differential Calculus",
      description: "Comprehensive lecture note covering Limits, Continuity, and First Principles of Differentiation with step-by-step worked examples.",
      material_type: "NOTE",
      is_published: true,
      created_by: "u-admin-01",
      created_at: "2027-01-01T08:00:00Z",
      updated_at: "2027-01-01T08:00:00Z",
      note: {
        id: "note-01",
        material_id: "mat-01",
        content: `# Chapter 1: Differential Calculus Fundamentals

## 1. Introduction to Limits
A limit describes the value that a function approaches as the input approaches some value.

$$\\lim_{x \\to a} f(x) = L$$

### Key Standard Limit Rules:
1. $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$ (where x is in radians)
2. $\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$
3. $\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e$

## 2. Differentiation from First Principles
The derivative of $f(x)$ is defined as:
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

### Important Worked Problem:
Differentiate $f(x) = x^2 + 3x$ using first principles.

**Solution:**
1. $f(x+h) = (x+h)^2 + 3(x+h) = x^2 + 2xh + h^2 + 3x + 3h$
2. $f(x+h) - f(x) = 2xh + h^2 + 3h = h(2x + h + 3)$
3. $\\frac{f(x+h) - f(x)}{h} = 2x + h + 3$
4. Taking limit as $h \\to 0$: $f'(x) = 2x + 3$. (Q.E.D.)

*Homework Assignment:* Complete Exercises 1.1 to 1.8 from Model Paper 01 before the next interactive discussion session.`,
        created_at: "2027-01-01T08:00:00Z",
        updated_at: "2027-01-01T08:00:00Z",
      },
    },
    {
      id: "mat-02",
      payment_month: "2027-01",
      course_class: "Combined Maths 2027 A/L",
      title: "Week 02 – Full Masterclass Recording (Integration Methods)",
      description: "High definition stream of the 3-hour weekend interactive theory session discussing Integration by Parts & Partial Fractions.",
      material_type: "LINK",
      is_published: true,
      created_by: "u-admin-01",
      created_at: "2027-01-08T09:00:00Z",
      updated_at: "2027-01-08T09:00:00Z",
      link: {
        id: "link-01",
        material_id: "mat-02",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        platform: "YouTube",
        created_at: "2027-01-08T09:00:00Z",
      },
    },
    {
      id: "mat-03",
      payment_month: "2027-01",
      course_class: "Combined Maths 2027 A/L",
      title: "Week 03 – Pure Maths Assignment 01 & Past Paper Solutions",
      description: "Downloadable PDF tutorial sheet containing 25 structured essay questions and past Colombo school term test problems.",
      material_type: "FILE",
      is_published: true,
      created_by: "u-admin-01",
      created_at: "2027-01-15T10:00:00Z",
      updated_at: "2027-01-15T10:00:00Z",
      attachment: {
        id: "att-01",
        material_id: "mat-03",
        file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        file_name: "Pure_Maths_Worksheet_01_Calculus_2027.pdf",
        file_size: 1450200,
        mime_type: "application/pdf",
        created_at: "2027-01-15T10:00:00Z",
      },
    },
    {
      id: "mat-04",
      payment_month: "2027-02",
      course_class: "Combined Maths 2027 A/L",
      title: "Week 05 – Advanced Trigonometry & Compound Angle Formulae",
      description: "Complete reference sheet and proofs for Compound Angles, Double Angles, and Factor Formulae.",
      material_type: "NOTE",
      is_published: true,
      created_by: "u-admin-01",
      created_at: "2027-02-01T08:00:00Z",
      updated_at: "2027-02-01T08:00:00Z",
      note: {
        id: "note-02",
        material_id: "mat-04",
        content: `# Chapter 2: Advanced Trigonometry

## Compound Angle Expansion Formulae:
1. $\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B$
2. $\\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B$
3. $\\tan(A \\pm B) = \\frac{\\tan A \\pm \\tan B}{1 \\mp \\tan A \\tan B}$

## Double Angle Relations:
- $\\sin 2A = 2\\sin A \\cos A$
- $\\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$
- $\\tan 2A = \\frac{2\\tan A}{1 - \\tan^2 A}$`,
        created_at: "2027-02-01T08:00:00Z",
        updated_at: "2027-02-01T08:00:00Z",
      },
    },
    {
      id: "mat-05",
      payment_month: "2027-02",
      course_class: "Combined Maths 2027 A/L",
      title: "Week 06 – Trigonometric Equations & Inverses Video Lecture",
      description: "Detailed video breakdown of solving general trigonometric equations with quadratic reductions.",
      material_type: "LINK",
      is_published: true,
      created_by: "u-admin-01",
      created_at: "2027-02-08T09:00:00Z",
      updated_at: "2027-02-08T09:00:00Z",
      link: {
        id: "link-02",
        material_id: "mat-05",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        platform: "YouTube",
        created_at: "2027-02-08T09:00:00Z",
      },
    },
    {
      id: "mat-06",
      payment_month: "2027-03",
      course_class: "Combined Maths 2027 A/L",
      title: "Week 09 – Vectors in 2D & 3D Space Master Summary",
      description: "Vector algebra, scalar dot product, vector cross product, and geometric applications.",
      material_type: "NOTE",
      is_published: true,
      created_by: "u-admin-01",
      created_at: "2027-03-01T08:00:00Z",
      updated_at: "2027-03-01T08:00:00Z",
      note: {
        id: "note-03",
        material_id: "mat-06",
        content: `# Chapter 3: Vectors in Space\n\n- Position Vectors: $\\vec{r} = x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}$\n- Dot Product: $\\mathbf{a} \\cdot \\mathbf{b} = |a||b|\\cos\\theta = a_x b_x + a_y b_y + a_z b_z$\n- Cross Product: $\\mathbf{a} \\times \\mathbf{b} = |a||b|\\sin\\theta \\,\\mathbf{\\hat{n}}$`,
        created_at: "2027-03-01T08:00:00Z",
        updated_at: "2027-03-01T08:00:00Z",
      },
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "log-01",
      user_id: "u-admin-01",
      username: "admin",
      action: "STUDENT_REGISTERED",
      entity_type: "STUDENT",
      entity_id: "STU-2027-001",
      details: {
        student_name: "Kavindu Sangeeth Silpage",
        username: "Kavindu",
        course: "Combined Maths 2027 A/L",
      },
      ip_address: "127.0.0.1",
      created_at: "2026-01-05T10:00:00Z",
    },
    {
      id: "log-02",
      user_id: "u-admin-01",
      username: "admin",
      action: "PAYMENT_VERIFIED",
      entity_type: "PAYMENT",
      entity_id: "p-01",
      details: {
        month: "2027-01",
        student: "Kavindu Silpage",
        amount: 4500,
      },
      ip_address: "127.0.0.1",
      created_at: "2027-01-03T14:20:00Z",
    },
  ];

  return {
    users,
    admins,
    students,
    payments,
    slips,
    materials,
    auditLogs,
  };
}

export function getMockStore(): StoreState {
  if (!global.__LMS_STORE__) {
    global.__LMS_STORE__ = initializeStore();
  }
  return global.__LMS_STORE__;
}

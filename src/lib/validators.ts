// ==============================================================================
// Tuition LMS - Regular Expression Validation Rules
// ==============================================================================

// Sri Lankan National Identity Card (Old format: 9 digits + V/X, New format: 12 digits)
export const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

// Phone number regex: Supports 10-digit Sri Lankan numbers starting with 0 (e.g. 0771234567) or +94 format
export const PHONE_REGEX = /^(?:0|94|\+94)?(7[0-9]|1[1-9]|2[1-8]|3[1-8]|4[1-7]|5[1-7]|6[3-7]|8[1-9]|9[1-2])[0-9]{7}$/;

// Student ID regex: e.g. STU-2027-001 or general student code
export const STUDENT_ID_REGEX = /^STU-[0-9]{4}-[0-9]{3,5}$/i;

// Standard Email Regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Name Regex: Letters, spaces, apostrophes, and hyphens (at least 2 chars)
export const NAME_REGEX = /^[a-zA-Z\s'.\-]{2,100}$/;

// Month Code Regex (YYYY-MM)
export const MONTH_CODE_REGEX = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStudentRegistration(data: {
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
  courseClass?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Student ID
  if (!data.studentId || !data.studentId.trim()) {
    errors.studentId = "Student ID is required";
  } else if (!STUDENT_ID_REGEX.test(data.studentId.trim())) {
    errors.studentId = "Student ID must follow format 'STU-YYYY-XXX' (e.g., STU-2027-001)";
  }

  // Full Name
  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (!NAME_REGEX.test(data.fullName.trim())) {
    errors.fullName = "Full name contains invalid characters";
  }

  // First Name
  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (!NAME_REGEX.test(data.firstName.trim())) {
    errors.firstName = "First name must contain only letters";
  }

  // Last Name
  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (!NAME_REGEX.test(data.lastName.trim())) {
    errors.lastName = "Last name must contain only letters";
  }

  // NIC
  if (!data.nic || !data.nic.trim()) {
    errors.nic = "NIC number is required";
  } else if (!NIC_REGEX.test(data.nic.trim())) {
    errors.nic = "Invalid NIC format (Use 9 digits+V/X or 12 digits, e.g. 200012345678)";
  }

  // Student Phone
  if (!data.studentPhone || !data.studentPhone.trim()) {
    errors.studentPhone = "Student phone number is required";
  } else if (!PHONE_REGEX.test(data.studentPhone.trim())) {
    errors.studentPhone = "Invalid phone format (e.g. 0712345678)";
  }

  // WhatsApp Phone
  if (!data.whatsappPhone || !data.whatsappPhone.trim()) {
    errors.whatsappPhone = "WhatsApp number is required";
  } else if (!PHONE_REGEX.test(data.whatsappPhone.trim())) {
    errors.whatsappPhone = "Invalid WhatsApp number format (e.g. 0712345678)";
  }

  // Parent Phone
  if (!data.parentPhone || !data.parentPhone.trim()) {
    errors.parentPhone = "Parent phone number is required";
  } else if (!PHONE_REGEX.test(data.parentPhone.trim())) {
    errors.parentPhone = "Invalid parent phone format (e.g. 0779876543)";
  }

  // Address
  if (!data.address || data.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters long";
  }

  // Email (optional)
  if (data.email && data.email.trim() && !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Invalid email address format";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

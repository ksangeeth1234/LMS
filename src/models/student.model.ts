import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getMockStore } from "@/lib/mock-store";
import { GeneratedCredentials, Student, StudentRegistrationInput } from "./types";
import { AuditModel } from "./audit.model";

export class StudentModel {
  /**
   * Retrieve all students with optional search and filtering
   */
  static async getAll(search?: string, status?: string): Promise<Student[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("students")
          .select("*, users(username, is_active)")
          .order("created_at", { ascending: false });

        if (status === "active") query = query.eq("is_active", true);
        if (status === "inactive") query = query.eq("is_active", false);

        if (search) {
          query = query.or(
            `full_name.ilike.%${search}%,student_id.ilike.%${search}%,nic.ilike.%${search}%,student_phone.ilike.%${search}%`
          );
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            username: item.users?.username || item.first_name,
            is_active: item.is_active ?? item.users?.is_active ?? true,
          }));
        }
      } catch (err) {
        console.error("Supabase getAll students error:", err);
      }
    }

    // Fallback store
    const store = getMockStore();
    let list = [...store.students];

    if (status === "active") {
      list = list.filter((s) => s.is_active);
    } else if (status === "inactive") {
      list = list.filter((s) => !s.is_active);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.student_id.toLowerCase().includes(q) ||
          s.nic.toLowerCase().includes(q) ||
          s.student_phone.includes(q) ||
          s.whatsapp_phone.includes(q) ||
          (s.username && s.username.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Find student by their unique student UUID or Student ID string
   */
  static async findById(id: string): Promise<Student | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("students")
          .select("*, users(username, is_active)")
          .or(`id.eq.${id},student_id.eq.${id}`)
          .single();

        if (!error && data) {
          return {
            ...data,
            username: data.users?.username || data.first_name,
            is_active: data.is_active ?? data.users?.is_active ?? true,
          };
        }
      } catch (err) {
        console.error("Supabase findById student error:", err);
      }
    }

    const store = getMockStore();
    return (
      store.students.find((s) => s.id === id || s.student_id.toLowerCase() === id.toLowerCase()) || null
    );
  }

  /**
   * Find student by linked user_id
   */
  static async findByUserId(userId: string): Promise<Student | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("students")
          .select("*, users(username, is_active)")
          .eq("user_id", userId)
          .single();

        if (!error && data) {
          return {
            ...data,
            username: data.users?.username || data.first_name,
            is_active: data.is_active ?? data.users?.is_active ?? true,
          };
        }
      } catch (err) {
        console.error("Supabase findByUserId student error:", err);
      }
    }

    const store = getMockStore();
    return store.students.find((s) => s.user_id === userId) || null;
  }

  /**
   * Check for duplicate student (NIC or Student ID or Username)
   */
  static async checkDuplicate(studentId: string, nic: string, username: string): Promise<string | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: existingStudent } = await supabaseAdmin
          .from("students")
          .select("student_id, nic")
          .or(`student_id.eq.${studentId},nic.eq.${nic}`)
          .maybeSingle();

        if (existingStudent) {
          if (existingStudent.student_id === studentId) return `Student ID '${studentId}' is already registered.`;
          if (existingStudent.nic === nic) return `NIC '${nic}' is already registered with another student.`;
        }

        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("username")
          .ilike("username", username)
          .maybeSingle();

        if (existingUser) return `Username '${username}' is already taken.`;
      } catch (err) {
        console.error("Supabase checkDuplicate error:", err);
      }
    }

    const store = getMockStore();
    if (store.students.some((s) => s.student_id.toLowerCase() === studentId.toLowerCase())) {
      return `Student ID '${studentId}' is already registered.`;
    }
    if (store.students.some((s) => s.nic.toLowerCase() === nic.toLowerCase())) {
      return `NIC '${nic}' is already registered with another student.`;
    }
    if (store.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return `Username '${username}' is already taken.`;
    }

    return null;
  }

  /**
   * Create a new student and associated user account with automatic credentials
   */
  static async create(
    input: StudentRegistrationInput,
    credentials: GeneratedCredentials,
    passwordHash: string,
    adminUserId?: string
  ): Promise<{ student: Student; credentials: GeneratedCredentials }> {
    const timestamp = new Date().toISOString();
    const newUserId = `u-stu-${Date.now()}`;
    const newStudentId = `s-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        // 1. Insert into users table
        const { data: userData, error: userError } = await supabaseAdmin
          .from("users")
          .insert({
            username: credentials.username,
            password_hash: passwordHash,
            role: "STUDENT",
            is_active: true,
          })
          .select()
          .single();

        if (userError) throw userError;

        // 2. Insert into students table
        const { data: studentData, error: studentError } = await supabaseAdmin
          .from("students")
          .insert({
            user_id: userData.id,
            student_id: input.studentId,
            full_name: input.fullName,
            first_name: input.firstName,
            last_name: input.lastName,
            nic: input.nic,
            student_phone: input.studentPhone,
            whatsapp_phone: input.whatsappPhone,
            parent_phone: input.parentPhone,
            address: input.address,
            email: input.email || null,
            course_class: input.courseClass || "Combined Maths 2027 A/L",
            registration_date: input.registrationDate || new Date().toISOString().split("T")[0],
            additional_details: input.additionalDetails || null,
            initial_password_plain: credentials.passwordPlain,
            is_active: true,
          })
          .select()
          .single();

        if (studentError) throw studentError;

        // 3. Initialize default monthly payment record for the current/upcoming month
        await supabaseAdmin.from("payments").insert({
          student_id: studentData.id,
          payment_month: "2027-01",
          amount: 4500.0,
          payment_status: "NOT PAID",
        });

        // 4. Audit Log
        await AuditModel.log({
          user_id: adminUserId,
          action: "STUDENT_REGISTERED",
          entity_type: "STUDENT",
          entity_id: studentData.student_id,
          details: {
            student_name: studentData.full_name,
            username: credentials.username,
            course: studentData.course_class,
          },
        });

        return {
          student: {
            ...studentData,
            username: credentials.username,
          },
          credentials,
        };
      } catch (err) {
        console.error("Supabase student create error:", err);
      }
    }

    // Mock store insert
    const store = getMockStore();
    const newUser = {
      id: newUserId,
      username: credentials.username,
      password_hash: passwordHash,
      role: "STUDENT" as const,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    };
    store.users.unshift(newUser);

    const newStudent: Student = {
      id: newStudentId,
      user_id: newUserId,
      student_id: input.studentId,
      full_name: input.fullName,
      first_name: input.firstName,
      last_name: input.lastName,
      nic: input.nic,
      student_phone: input.studentPhone,
      whatsapp_phone: input.whatsappPhone,
      parent_phone: input.parentPhone,
      address: input.address,
      email: input.email,
      course_class: input.courseClass || "Combined Maths 2027 A/L",
      registration_date: input.registrationDate || new Date().toISOString().split("T")[0],
      additional_details: input.additionalDetails,
      initial_password_plain: credentials.passwordPlain,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
      username: credentials.username,
    };
    store.students.unshift(newStudent);

    // Seed default unpaid payments for this new student
    const defaultMonths = ["2027-01", "2027-02", "2027-03"];
    defaultMonths.forEach((m, idx) => {
      store.payments.push({
        id: `p-new-${Date.now()}-${idx}`,
        student_id: newStudentId,
        payment_month: m,
        amount: 4500.0,
        payment_date: null,
        payment_status: "NOT PAID",
        remarks: `Tuition fee for ${m}`,
        created_at: timestamp,
        updated_at: timestamp,
        student: newStudent,
      });
    });

    // Audit Log
    await AuditModel.log({
      user_id: adminUserId,
      action: "STUDENT_REGISTERED",
      entity_type: "STUDENT",
      entity_id: newStudent.student_id,
      details: {
        student_name: newStudent.full_name,
        username: credentials.username,
        course: newStudent.course_class,
      },
    });

    return {
      student: newStudent,
      credentials,
    };
  }

  /**
   * Update student information
   */
  static async update(
    id: string,
    data: Partial<StudentRegistrationInput>,
    adminUserId?: string
  ): Promise<Student | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: updated, error } = await supabaseAdmin
          .from("students")
          .update({
            full_name: data.fullName,
            first_name: data.firstName,
            last_name: data.lastName,
            student_phone: data.studentPhone,
            whatsapp_phone: data.whatsappPhone,
            parent_phone: data.parentPhone,
            address: data.address,
            email: data.email,
            course_class: data.courseClass,
            additional_details: data.additionalDetails,
          })
          .eq("id", id)
          .select("*, users(username, is_active)")
          .single();

        if (!error && updated) {
          await AuditModel.log({
            user_id: adminUserId,
            action: "STUDENT_UPDATED",
            entity_type: "STUDENT",
            entity_id: updated.student_id,
            details: { updated_fields: Object.keys(data) },
          });

          return {
            ...updated,
            username: updated.users?.username || updated.first_name,
            is_active: updated.is_active ?? updated.users?.is_active ?? true,
          };
        }
      } catch (err) {
        console.error("Supabase update student error:", err);
      }
    }

    const store = getMockStore();
    const student = store.students.find((s) => s.id === id);
    if (!student) return null;

    if (data.fullName) student.full_name = data.fullName;
    if (data.firstName) student.first_name = data.firstName;
    if (data.lastName) student.last_name = data.lastName;
    if (data.studentPhone) student.student_phone = data.studentPhone;
    if (data.whatsappPhone) student.whatsapp_phone = data.whatsappPhone;
    if (data.parentPhone) student.parent_phone = data.parentPhone;
    if (data.address) student.address = data.address;
    if (data.email !== undefined) student.email = data.email;
    if (data.courseClass) student.course_class = data.courseClass;
    if (data.additionalDetails !== undefined) student.additional_details = data.additionalDetails;
    student.updated_at = new Date().toISOString();

    await AuditModel.log({
      user_id: adminUserId,
      action: "STUDENT_UPDATED",
      entity_type: "STUDENT",
      entity_id: student.student_id,
      details: { updated_fields: Object.keys(data) },
    });

    return student;
  }

  /**
   * Toggle student active status
   */
  static async toggleStatus(id: string, isActive: boolean, adminUserId?: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { data: student } = await supabaseAdmin
          .from("students")
          .update({ is_active: isActive })
          .eq("id", id)
          .select("user_id, student_id")
          .single();

        if (student) {
          await supabaseAdmin
            .from("users")
            .update({ is_active: isActive })
            .eq("id", student.user_id);

          await AuditModel.log({
            user_id: adminUserId,
            action: isActive ? "STUDENT_ACTIVATED" : "STUDENT_DEACTIVATED",
            entity_type: "STUDENT",
            entity_id: student.student_id,
            details: { is_active: isActive },
          });
          return true;
        }
      } catch (err) {
        console.error("Supabase toggleStatus error:", err);
      }
    }

    const store = getMockStore();
    const student = store.students.find((s) => s.id === id);
    if (!student) return false;

    student.is_active = isActive;
    const user = store.users.find((u) => u.id === student.user_id);
    if (user) user.is_active = isActive;

    await AuditModel.log({
      user_id: adminUserId,
      action: isActive ? "STUDENT_ACTIVATED" : "STUDENT_DEACTIVATED",
      entity_type: "STUDENT",
      entity_id: student.student_id,
      details: { is_active: isActive },
    });

    return true;
  }

  /**
   * Admin Reset Student Password
   */
  static async resetPassword(id: string, newPasswordHash: string, plainTextPassword?: string, adminUserId?: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { data: student } = await supabaseAdmin
          .from("students")
          .select("user_id, student_id")
          .eq("id", id)
          .single();

        if (student) {
          await supabaseAdmin
            .from("users")
            .update({ password_hash: newPasswordHash })
            .eq("id", student.user_id);

          if (plainTextPassword) {
            await supabaseAdmin
              .from("students")
              .update({ initial_password_plain: plainTextPassword })
              .eq("id", id);
          }

          await AuditModel.log({
            user_id: adminUserId,
            action: "PASSWORD_RESET",
            entity_type: "STUDENT",
            entity_id: student.student_id,
            details: { reset_by_admin: true },
          });
          return true;
        }
      } catch (err) {
        console.error("Supabase resetPassword error:", err);
      }
    }

    const store = getMockStore();
    const student = store.students.find((s) => s.id === id);
    if (!student) return false;

    const user = store.users.find((u) => u.id === student.user_id);
    if (user) user.password_hash = newPasswordHash;
    if (plainTextPassword) student.initial_password_plain = plainTextPassword;

    await AuditModel.log({
      user_id: adminUserId,
      action: "PASSWORD_RESET",
      entity_type: "STUDENT",
      entity_id: student.student_id,
      details: { reset_by_admin: true },
    });

    return true;
  }
}

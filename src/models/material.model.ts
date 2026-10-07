import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getMockStore } from "@/lib/mock-store";
import { LearningMaterial, MaterialType } from "./types";
import { PaymentModel } from "./payment.model";
import { AuditModel } from "./audit.model";

export class MaterialModel {
  /**
   * Retrieve all materials for Admin view
   */
  static async getAllForAdmin(month?: string, courseClass?: string): Promise<LearningMaterial[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("learning_materials")
          .select("*, notes(*), learning_links(*), material_attachments(*)")
          .order("created_at", { ascending: false });

        if (month && month !== "ALL") query = query.eq("payment_month", month);
        if (courseClass && courseClass !== "ALL") query = query.eq("course_class", courseClass);

        const { data, error } = await query;
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            note: item.notes?.[0] || null,
            link: item.learning_links?.[0] || null,
            attachment: item.material_attachments?.[0] || null,
          }));
        }
      } catch (err) {
        console.error("Supabase getAllForAdmin error:", err);
      }
    }

    const store = getMockStore();
    let list = [...store.materials];

    if (month && month !== "ALL") {
      list = list.filter((m) => m.payment_month === month);
    }
    if (courseClass && courseClass !== "ALL") {
      list = list.filter((m) => m.course_class === courseClass);
    }

    return list;
  }

  /**
   * Retrieve materials for student with STRICT BACKEND ACCESS CONTROL
   * If the student hasn't paid & verified for the month, contents are stripped/masked.
   */
  static async getMaterialsForStudent(
    studentId: string,
    month?: string
  ): Promise<{ materials: LearningMaterial[]; isMonthVerified: boolean }> {
    const store = getMockStore();
    const targetMonth = month || "2027-01";
    
    // 1. Verify payment status in DB/model layer
    const isVerified = await PaymentModel.isMonthVerified(studentId, targetMonth);

    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("learning_materials")
          .select("*, notes(*), learning_links(*), material_attachments(*)")
          .eq("payment_month", targetMonth)
          .eq("is_published", true)
          .order("created_at", { ascending: true });

        const { data, error } = await query;
        if (!error && data) {
          const processedMaterials: LearningMaterial[] = data.map((item: any) => {
            if (!isVerified) {
              // LOCKED: Strip actual lesson text, links, and download URLs at the backend level
              return {
                id: item.id,
                payment_month: item.payment_month,
                course_class: item.course_class,
                title: item.title,
                description: item.description,
                material_type: item.material_type,
                is_published: item.is_published,
                created_at: item.created_at,
                updated_at: item.updated_at,
                is_unlocked: false,
                note: null,
                link: null,
                attachment: null,
              };
            }

            // UNLOCKED: Return full content
            return {
              ...item,
              is_unlocked: true,
              note: item.notes?.[0] || null,
              link: item.learning_links?.[0] || null,
              attachment: item.material_attachments?.[0] || null,
            };
          });

          return {
            materials: processedMaterials,
            isMonthVerified: isVerified,
          };
        }
      } catch (err) {
        console.error("Supabase getMaterialsForStudent error:", err);
      }
    }

    // Mock store processing
    const filtered = store.materials.filter(
      (m) => m.payment_month === targetMonth && m.is_published
    );

    const processed = filtered.map((m) => {
      if (!isVerified) {
        return {
          id: m.id,
          payment_month: m.payment_month,
          course_class: m.course_class,
          title: m.title,
          description: m.description,
          material_type: m.material_type,
          is_published: m.is_published,
          created_at: m.created_at,
          updated_at: m.updated_at,
          is_unlocked: false,
          note: null,
          link: null,
          attachment: null,
        };
      }

      return {
        ...m,
        is_unlocked: true,
      };
    });

    return {
      materials: processed,
      isMonthVerified: isVerified,
    };
  }

  /**
   * Create a new Learning Material (Link, Note, or File)
   */
  static async create(
    data: {
      paymentMonth: string;
      courseClass?: string;
      title: string;
      description?: string;
      materialType: MaterialType;
      isPublished?: boolean;
      url?: string;
      platform?: string;
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    },
    adminUserId?: string
  ): Promise<LearningMaterial> {
    const timestamp = new Date().toISOString();
    const newId = `mat-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const { data: mat, error: matError } = await supabaseAdmin
          .from("learning_materials")
          .insert({
            payment_month: data.paymentMonth,
            course_class: data.courseClass || "Combined Maths 2027 A/L",
            title: data.title,
            description: data.description || null,
            material_type: data.materialType,
            is_published: data.isPublished !== undefined ? data.isPublished : true,
            created_by: adminUserId || null,
          })
          .select()
          .single();

        if (matError) throw matError;

        let note = null;
        let link = null;
        let attachment = null;

        if (data.materialType === "NOTE" && data.content) {
          const { data: n } = await supabaseAdmin
            .from("notes")
            .insert({ material_id: mat.id, content: data.content })
            .select()
            .single();
          note = n;
        } else if (data.materialType === "LINK" && data.url) {
          const { data: l } = await supabaseAdmin
            .from("learning_links")
            .insert({
              material_id: mat.id,
              url: data.url,
              platform: data.platform || "YouTube",
            })
            .select()
            .single();
          link = l;
        } else if (data.materialType === "FILE" && data.fileUrl) {
          const { data: a } = await supabaseAdmin
            .from("material_attachments")
            .insert({
              material_id: mat.id,
              file_url: data.fileUrl,
              file_name: data.fileName || "Material.pdf",
              file_size: data.fileSize || 0,
              mime_type: data.mimeType || "application/pdf",
            })
            .select()
            .single();
          attachment = a;
        }

        await AuditModel.log({
          user_id: adminUserId,
          action: "MATERIAL_CREATED",
          entity_type: "MATERIAL",
          entity_id: mat.id,
          details: {
            title: mat.title,
            type: mat.material_type,
            month: mat.payment_month,
          },
        });

        return {
          ...mat,
          note,
          link,
          attachment,
        };
      } catch (err) {
        console.error("Supabase create material error:", err);
      }
    }

    // Mock store
    const store = getMockStore();
    const newMaterial: LearningMaterial = {
      id: newId,
      payment_month: data.paymentMonth,
      course_class: data.courseClass || "Combined Maths 2027 A/L",
      title: data.title,
      description: data.description,
      material_type: data.materialType,
      is_published: data.isPublished !== undefined ? data.isPublished : true,
      created_by: adminUserId,
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (data.materialType === "NOTE" && data.content) {
      newMaterial.note = {
        id: `note-${Date.now()}`,
        material_id: newId,
        content: data.content,
        created_at: timestamp,
        updated_at: timestamp,
      };
    } else if (data.materialType === "LINK" && data.url) {
      newMaterial.link = {
        id: `link-${Date.now()}`,
        material_id: newId,
        url: data.url,
        platform: data.platform || "YouTube",
        created_at: timestamp,
      };
    } else if (data.materialType === "FILE" && data.fileUrl) {
      newMaterial.attachment = {
        id: `att-${Date.now()}`,
        material_id: newId,
        file_url: data.fileUrl,
        file_name: data.fileName || "Resource.pdf",
        file_size: data.fileSize || 1024000,
        mime_type: data.mimeType || "application/pdf",
        created_at: timestamp,
      };
    }

    store.materials.unshift(newMaterial);

    await AuditModel.log({
      user_id: adminUserId,
      action: "MATERIAL_CREATED",
      entity_type: "MATERIAL",
      entity_id: newMaterial.id,
      details: {
        title: newMaterial.title,
        type: newMaterial.material_type,
        month: newMaterial.payment_month,
      },
    });

    return newMaterial;
  }

  /**
   * Delete material
   */
  static async delete(id: string, adminUserId?: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabaseAdmin.from("learning_materials").delete().eq("id", id);
        if (!error) {
          await AuditModel.log({
            user_id: adminUserId,
            action: "MATERIAL_DELETED",
            entity_type: "MATERIAL",
            entity_id: id,
          });
          return true;
        }
      } catch (err) {
        console.error("Supabase delete material error:", err);
      }
    }

    const store = getMockStore();
    const idx = store.materials.findIndex((m) => m.id === id);
    if (idx >= 0) {
      store.materials.splice(idx, 1);
      await AuditModel.log({
        user_id: adminUserId,
        action: "MATERIAL_DELETED",
        entity_type: "MATERIAL",
        entity_id: id,
      });
      return true;
    }
    return false;
  }
}

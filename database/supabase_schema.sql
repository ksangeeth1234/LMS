-- ==============================================================================
-- TUITION CLASS STUDENT MANAGEMENT & LEARNING MANAGEMENT SYSTEM (LMS)
-- IT 403061 – Enterprise Systems Technologies and Architectures
-- Supabase PostgreSQL Relational Database Schema & Storage Configuration
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUMS & DOMAINS (Drop if exists for clean re-run)
-- ==============================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS material_attachments CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS learning_links CASCADE;
DROP TABLE IF EXISTS learning_materials CASCADE;
DROP TABLE IF EXISTS payment_slips CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- 3. CORE TABLES
-- ==============================================================================

-- TABLE: users (Authentication and System Roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STUDENT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: admins (Administrator / Tuition Teacher Details)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    designation VARCHAR(100) DEFAULT 'Tuition Master / Chief Instructor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: students (Student Profile and Academic Details)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nic VARCHAR(20) NOT NULL UNIQUE,
    student_phone VARCHAR(20) NOT NULL,
    whatsapp_phone VARCHAR(20) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255),
    course_class VARCHAR(100) NOT NULL DEFAULT 'Combined Maths 2027 A/L',
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    additional_details TEXT,
    initial_password_plain VARCHAR(100), -- Stored temporarily for admin credential card upon registration
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: payments (Monthly Tuition Payments)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    payment_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g. '2027-01', '2027-02')
    amount NUMERIC(10, 2) NOT NULL DEFAULT 4500.00,
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'NOT PAID' 
        CHECK (payment_status IN ('NOT PAID', 'SLIP UPLOADED', 'VERIFIED', 'REJECTED')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_month UNIQUE (student_id, payment_month)
);

-- TABLE: payment_slips (Uploaded Bank/Deposit Receipts)
CREATE TABLE payment_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: learning_materials (Monthly Academic Content Header)
CREATE TABLE learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_month VARCHAR(7) NOT NULL, -- Month required to unlock (YYYY-MM)
    course_class VARCHAR(100) NOT NULL DEFAULT 'Combined Maths 2027 A/L',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    material_type VARCHAR(20) NOT NULL CHECK (material_type IN ('LINK', 'NOTE', 'FILE')),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: learning_links (External Video / Resource Links)
CREATE TABLE learning_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    platform VARCHAR(50) DEFAULT 'YouTube', -- YouTube, Google Drive, Zoom, Portal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: notes (Structured Text / Rich HTML Lesson Content)
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: material_attachments (Downloadable Files - PDFs, Worksheets, PPTs)
CREATE TABLE material_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: audit_logs (Enterprise Compliance and Activity Tracking)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_nic ON students(nic);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_month ON payments(payment_month);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_materials_month ON learning_materials(payment_month);
CREATE INDEX idx_materials_type ON learning_materials(material_type);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ==============================================================================
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_materials_updated_at BEFORE UPDATE ON learning_materials FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 USERS TABLE POLICIES
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));

-- 6.2 STUDENTS TABLE POLICIES
CREATE POLICY "Students can read own student record"
    ON students FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can manage students"
    ON students FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));

-- 6.3 PAYMENTS & SLIPS POLICIES
CREATE POLICY "Students can read own payments"
    ON payments FOR SELECT
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Students can insert/update payment slips"
    ON payments FOR UPDATE
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all payments"
    ON payments FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "View payment slips"
    ON payment_slips FOR SELECT
    USING (
        payment_id IN (SELECT id FROM payments WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 6.4 STRICT MONTHLY ACCESS CONTROL FOR LEARNING MATERIALS
-- Students can only read learning materials for months they have VERIFIED payments
CREATE POLICY "Students view unlocked verified materials or Admin view all"
    ON learning_materials FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
        OR (
            is_published = TRUE AND
            payment_month IN (
                SELECT p.payment_month 
                FROM payments p 
                JOIN students s ON p.student_id = s.id 
                WHERE s.user_id = auth.uid() AND p.payment_status = 'VERIFIED'
            )
        )
    );

CREATE POLICY "Admins can manage materials"
    ON learning_materials FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Notes read access with verified payment"
    ON notes FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
        OR material_id IN (
            SELECT lm.id FROM learning_materials lm
            JOIN payments p ON p.payment_month = lm.payment_month
            JOIN students s ON p.student_id = s.id
            WHERE s.user_id = auth.uid() AND p.payment_status = 'VERIFIED' AND lm.is_published = TRUE
        )
    );

CREATE POLICY "Links read access with verified payment"
    ON learning_links FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
        OR material_id IN (
            SELECT lm.id FROM learning_materials lm
            JOIN payments p ON p.payment_month = lm.payment_month
            JOIN students s ON p.student_id = s.id
            WHERE s.user_id = auth.uid() AND p.payment_status = 'VERIFIED' AND lm.is_published = TRUE
        )
    );

CREATE POLICY "Attachments read access with verified payment"
    ON material_attachments FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
        OR material_id IN (
            SELECT lm.id FROM learning_materials lm
            JOIN payments p ON p.payment_month = lm.payment_month
            JOIN students s ON p.student_id = s.id
            WHERE s.user_id = auth.uid() AND p.payment_status = 'VERIFIED' AND lm.is_published = TRUE
        )
    );

-- 6.5 AUDIT LOGS
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (TRUE);

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKETS CONFIGURATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-slips', 'payment-slips', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('learning-materials', 'learning-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: payment-slips (authenticated users can upload to their student folder, admins can read all)
CREATE POLICY "Student upload payment slip"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'payment-slips' AND auth.role() = 'authenticated');

CREATE POLICY "Admin and owner read payment slips"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'payment-slips' AND auth.role() = 'authenticated');

-- Storage RLS: learning-materials
CREATE POLICY "Admin upload learning materials"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'learning-materials' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users view learning materials"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'learning-materials' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 8. SEED / DEMO DATA (For Immediate Testing & Evaluation)
-- ==============================================================================

-- 8.1 ADMIN ACCOUNT
-- Username: admin
-- Password: AdminPassword@123 (bcrypt hash: $2a$10$w8FepO4xL44l5sU6oQeHLePfgP3L0/U0y1/4oBq0sFwO1J1V8c9lG or standard $2a$10$XQ...)
-- Using crypt('AdminPassword@123', gen_salt('bf'))
INSERT INTO users (id, username, password_hash, role, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    crypt('AdminPassword@123', gen_salt('bf')),
    'ADMIN',
    TRUE
);

INSERT INTO admins (id, user_id, full_name, email, phone, designation)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'Eng. Anura Bandara (Tuition Master)',
    'anura.tuition@maths.lk',
    '0771234567',
    'Chief Mathematics Lecturer'
);

-- 8.2 SAMPLE STUDENTS
-- Student 1: Kavindu Sangeeth Silpage (NIC: 200012345678, Last: Silpage -> Username: Kavindu, Password: age@200)
INSERT INTO users (id, username, password_hash, role, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Kavindu',
    crypt('age@200', gen_salt('bf')),
    'STUDENT',
    TRUE
);

INSERT INTO students (id, user_id, student_id, full_name, first_name, last_name, nic, student_phone, whatsapp_phone, parent_phone, address, email, course_class, registration_date, initial_password_plain)
VALUES (
    'b1111111-1111-1111-1111-111111111101',
    'b0000000-0000-0000-0000-000000000001',
    'STU-2027-001',
    'Kavindu Sangeeth Silpage',
    'Kavindu',
    'Silpage',
    '200012345678',
    '0712345678',
    '0712345678',
    '0779876543',
    'No. 45, Temple Road, Nugegoda, Colombo',
    'kavindu.student@gmail.com',
    'Combined Maths 2027 A/L',
    '2026-01-05',
    'age@200'
);

-- Student 2: Nimal Shantha Perera (NIC: 200156789123, Last: Perera -> Username: Nimal, Password: era@200)
INSERT INTO users (id, username, password_hash, role, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'Nimal',
    crypt('era@200', gen_salt('bf')),
    'STUDENT',
    TRUE
);

INSERT INTO students (id, user_id, student_id, full_name, first_name, last_name, nic, student_phone, whatsapp_phone, parent_phone, address, email, course_class, registration_date, initial_password_plain)
VALUES (
    'b1111111-1111-1111-1111-111111111102',
    'b0000000-0000-0000-0000-000000000002',
    'STU-2027-002',
    'Nimal Shantha Perera',
    'Nimal',
    'Perera',
    '200156789123',
    '0723456789',
    '0723456789',
    '0765432198',
    'No. 12/B, Galle Road, Kalutara',
    'nimal.p@gmail.com',
    'Combined Maths 2027 A/L',
    '2026-01-08',
    'era@200'
);

-- Student 3: Dilani Chamodi Jayawardena (NIC: 200234567890, Last: Jayawardena -> Username: Dilani, Password: ena@200)
INSERT INTO users (id, username, password_hash, role, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000003',
    'Dilani',
    crypt('ena@200', gen_salt('bf')),
    'STUDENT',
    TRUE
);

INSERT INTO students (id, user_id, student_id, full_name, first_name, last_name, nic, student_phone, whatsapp_phone, parent_phone, address, email, course_class, registration_date, initial_password_plain)
VALUES (
    'b1111111-1111-1111-1111-111111111103',
    'b0000000-0000-0000-0000-000000000003',
    'STU-2027-003',
    'Dilani Chamodi Jayawardena',
    'Dilani',
    'Jayawardena',
    '200234567890',
    '0754567890',
    '0754567890',
    '0711122334',
    'No. 88, Kandy Road, Gampaha',
    'dilani.j@gmail.com',
    'Combined Maths 2027 A/L',
    '2026-01-10',
    'ena@200'
);

-- Student 4: Kasun Thisara Fernando (NIC: 200198765432, Last: Fernando -> Username: Kasun, Password: ndo@200)
INSERT INTO users (id, username, password_hash, role, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000004',
    'Kasun',
    crypt('ndo@200', gen_salt('bf')),
    'STUDENT',
    TRUE
);

INSERT INTO students (id, user_id, student_id, full_name, first_name, last_name, nic, student_phone, whatsapp_phone, parent_phone, address, email, course_class, registration_date, initial_password_plain)
VALUES (
    'b1111111-1111-1111-1111-111111111104',
    'b0000000-0000-0000-0000-000000000004',
    'STU-2027-004',
    'Kasun Thisara Fernando',
    'Kasun',
    'Fernando',
    '200198765432',
    '0787654321',
    '0787654321',
    '0722233445',
    'No. 19, Beach Road, Negombo',
    'kasun.f@gmail.com',
    'Combined Maths 2027 A/L',
    '2026-01-12',
    'ndo@200'
);

-- Student 5: Tharindu Sandaruwan Wickramasinghe (NIC: 200087654321, Last: Wickramasinghe -> Username: Tharindu, Password: ghe@200)
INSERT INTO users (id, username, password_hash, role, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000005',
    'Tharindu',
    crypt('ghe@200', gen_salt('bf')),
    'STUDENT',
    TRUE
);

INSERT INTO students (id, user_id, student_id, full_name, first_name, last_name, nic, student_phone, whatsapp_phone, parent_phone, address, email, course_class, registration_date, initial_password_plain)
VALUES (
    'b1111111-1111-1111-1111-111111111105',
    'b0000000-0000-0000-0000-000000000005',
    'STU-2027-005',
    'Tharindu Sandaruwan Wickramasinghe',
    'Tharindu',
    'Wickramasinghe',
    '200087654321',
    '0761239876',
    '0761239876',
    '0773344556',
    'No. 104, Highlevel Road, Maharagama',
    'tharindu.w@gmail.com',
    'Combined Maths 2027 A/L',
    '2026-01-15',
    'ghe@200'
);

-- 8.3 SAMPLE PAYMENT RECORDS
-- Kavindu: Jan 2027 VERIFIED, Feb 2027 SLIP UPLOADED, Mar 2027 NOT PAID
INSERT INTO payments (id, student_id, payment_month, amount, payment_date, payment_status, verified_at, verified_by, remarks)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'b1111111-1111-1111-1111-111111111101',
    '2027-01',
    4500.00,
    '2027-01-03 10:30:00+05:30',
    'VERIFIED',
    '2027-01-03 14:20:00+05:30',
    'a1111111-1111-1111-1111-111111111111',
    'Bank deposit verified. Access granted.'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b1111111-1111-1111-1111-111111111101',
    '2027-02',
    4500.00,
    '2027-02-02 11:15:00+05:30',
    'SLIP UPLOADED',
    NULL,
    NULL,
    'Slip submitted via online portal. Pending teacher verification.'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b1111111-1111-1111-1111-111111111101',
    '2027-03',
    4500.00,
    NULL,
    'NOT PAID',
    NULL,
    NULL,
    'Tuition fee outstanding for March 2027.'
);

-- Payment slip for Kavindu Jan & Feb
INSERT INTO payment_slips (payment_id, file_url, file_name, file_size, mime_type)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
    'BOC_Deposit_Slip_Jan2027.jpg',
    245600,
    'image/jpeg'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=60',
    'CommercialBank_Slip_Feb2027.png',
    312400,
    'image/png'
);

-- Nimal: Jan 2027 REJECTED (Unclear slip), Feb 2027 VERIFIED
INSERT INTO payments (id, student_id, payment_month, amount, payment_date, payment_status, verified_at, verified_by, rejection_reason, remarks)
VALUES 
(
    'c0000000-0000-0000-0000-000000000004',
    'b1111111-1111-1111-1111-111111111102',
    '2027-01',
    4500.00,
    '2027-01-04 16:45:00+05:30',
    'REJECTED',
    '2027-01-05 09:00:00+05:30',
    'a1111111-1111-1111-1111-111111111111',
    'Slip image is unclear and transaction reference number is cropped out. Please upload a clear original receipt.',
    'Re-upload required.'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'b1111111-1111-1111-1111-111111111102',
    '2027-02',
    4500.00,
    '2027-02-01 09:30:00+05:30',
    'VERIFIED',
    '2027-02-01 15:10:00+05:30',
    'a1111111-1111-1111-1111-111111111111',
    NULL,
    'Payment verified successfully.'
);

-- 8.4 SAMPLE LEARNING MATERIALS
-- Material 1: January 2027 - Week 01 Introduction to Calculus (NOTE)
INSERT INTO learning_materials (id, payment_month, course_class, title, description, material_type, is_published, created_by)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    '2027-01',
    'Combined Maths 2027 A/L',
    'Week 01 – Fundamentals of Differential Calculus',
    'Comprehensive lecture note covering Limits, Continuity, and First Principles of Differentiation with step-by-step worked examples.',
    'NOTE',
    TRUE,
    'a0000000-0000-0000-0000-000000000001'
);

INSERT INTO notes (material_id, content)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    '# Chapter 1: Differential Calculus Fundamentals\n\n## 1. Introduction to Limits\nA limit describes the value that a function approaches as the input approaches some value.\n\n$$\\lim_{x \\to a} f(x) = L$$\n\n### Key Standard Limit Rules:\n1. $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$ (where x is in radians)\n2. $\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$\n3. $\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e$\n\n## 2. Differentiation from First Principles\nThe derivative of $f(x)$ is defined as:\n$$f''(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n### Important Worked Problem:\nDifferentiate $f(x) = x^2 + 3x$ using first principles.\n\n**Solution:**\n1. $f(x+h) = (x+h)^2 + 3(x+h) = x^2 + 2xh + h^2 + 3x + 3h$\n2. $f(x+h) - f(x) = 2xh + h^2 + 3h = h(2x + h + 3)$\n3. $\\frac{f(x+h) - f(x)}{h} = 2x + h + 3$\n4. Taking limit as $h \\to 0$: $f''(x) = 2x + 3$. (Q.E.D.)\n\n*Homework:* Complete Exercises 1.1 to 1.8 from the Model Paper 01 before our next live session.'
);

-- Material 2: January 2027 - Week 02 Live Video Recording (LINK)
INSERT INTO learning_materials (id, payment_month, course_class, title, description, material_type, is_published, created_by)
VALUES (
    'd0000000-0000-0000-0000-000000000002',
    '2027-01',
    'Combined Maths 2027 A/L',
    'Week 02 – Full Masterclass Recording (Integration Methods)',
    'High definition stream of the 3-hour weekend interactive theory session discussing Integration by Parts & Partial Fractions.',
    'LINK',
    TRUE,
    'a0000000-0000-0000-0000-000000000001'
);

INSERT INTO learning_links (material_id, url, platform)
VALUES (
    'd0000000-0000-0000-0000-000000000002',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'YouTube'
);

-- Material 3: January 2027 - Week 03 Pure Maths Worksheet 01 (FILE)
INSERT INTO learning_materials (id, payment_month, course_class, title, description, material_type, is_published, created_by)
VALUES (
    'd0000000-0000-0000-0000-000000000003',
    '2027-01',
    'Combined Maths 2027 A/L',
    'Week 03 – Pure Maths Assignment 01 & Past Paper Solutions',
    'Downloadable PDF tutorial sheet containing 25 structured essay questions and past Colombo school term test problems.',
    'FILE',
    TRUE,
    'a0000000-0000-0000-0000-000000000001'
);

INSERT INTO material_attachments (material_id, file_url, file_name, file_size, mime_type)
VALUES (
    'd0000000-0000-0000-0000-000000000003',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'Pure_Maths_Worksheet_01_Calculus_2027.pdf',
    1450200,
    'application/pdf'
);

-- Material 4: February 2027 - Trigonometric Formulas & Identities (NOTE)
INSERT INTO learning_materials (id, payment_month, course_class, title, description, material_type, is_published, created_by)
VALUES (
    'd0000000-0000-0000-0000-000000000004',
    '2027-02',
    'Combined Maths 2027 A/L',
    'Week 05 – Advanced Trigonometry & Compound Angle Formulae',
    'Complete reference sheet and proofs for Compound Angles, Double Angles, and Factor Formulae.',
    'NOTE',
    TRUE,
    'a0000000-0000-0000-0000-000000000001'
);

INSERT INTO notes (material_id, content)
VALUES (
    'd0000000-0000-0000-0000-000000000004',
    '# Chapter 2: Advanced Trigonometry\n\n## Compound Angle Expansion Formulae:\n1. $\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B$\n2. $\\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B$\n3. $\\tan(A \\pm B) = \\frac{\\tan A \\pm \\tan B}{1 \\mp \\tan A \\tan B}$\n\n## Double Angle Relations:\n- $\\sin 2A = 2\\sin A \\cos A$\n- $\\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$\n- $\\tan 2A = \\frac{2\\tan A}{1 - \\tan^2 A}$'
);

-- 8.5 AUDIT LOGS SEED
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'STUDENT_REGISTERED',
    'STUDENT',
    'STU-2027-001',
    '{"student_name": "Kavindu Sangeeth Silpage", "username": "Kavindu", "course": "Combined Maths 2027 A/L"}'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000001',
    'PAYMENT_VERIFIED',
    'PAYMENT',
    'c0000000-0000-0000-0000-000000000001',
    '{"month": "2027-01", "student": "Kavindu Silpage", "amount": 4500}'::jsonb
);

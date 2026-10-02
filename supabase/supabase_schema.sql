-- =====================================================================
-- ESQUEMA LIMPIO Y OPTIMIZADO PARA RERF DELIVERY APP (PostgreSQL / Supabase)
-- Programación II - UMG / RerF Logistics
--
-- Tablas activas y específicas en español:
-- 1. usuarios       (Perfiles de clientes, pilotos, moderadores y admin)
-- 2. envios         (Gestión de pedidos, entregas y GPS con piloto)
-- 3. bodega         (Almacenaje de paquetes en bodega personal)
-- 4. facturas       (Facturación y comprobantes de envíos)
-- 5. notificaciones (Alertas por usuario en tiempo real)
-- 6. mensajes       (Soporte con piloto/moderador y chat)
-- 7. favoritos      (Contactos y usuarios guardados en favoritos)
-- 8. reportes       (Reportes y denuncias revisadas por moderadores)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. TABLA: usuarios (Perfiles)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    address_references TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'piloto', 'moderador', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si existe la tabla anterior 'profiles', migrar datos a 'usuarios'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        INSERT INTO public.usuarios (id, first_name, last_name, email, phone, address, address_references, avatar_url, bio, role, created_at, updated_at)
        SELECT id, first_name, COALESCE(last_name, ''), email, phone, address, address_references, avatar_url, bio, role, created_at, updated_at
        FROM public.profiles
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- 2. TABLA: envios (Pedidos, Entregas y Rastreo GPS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.envios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT UNIQUE NOT NULL,
    sender_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT,
    delivery_address TEXT NOT NULL,
    address_references TEXT,
    scheduled_date TEXT,
    description TEXT,
    status TEXT DEFAULT 'pendiente' CHECK (
        status IN ('pendiente', 'aprobado', 'en_bodega', 'recolectado', 'en_camino', 'entregado', 'rechazado', 'cancelado')
    ),
    rejection_reason TEXT,
    cancellation_reason TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pendiente',
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    -- Campos habilitados por el moderador de escritorio para GPS y piloto
    agent_name TEXT,
    vehicle_model TEXT,
    vehicle_plate TEXT,
    estimated_time TEXT,
    driver_phone TEXT,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    warehouse_item_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si existe la tabla anterior 'shipments', migrar datos a 'envios'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shipments') THEN
        INSERT INTO public.envios (id, tracking_number, sender_id, recipient_name, recipient_phone, delivery_address, address_references, scheduled_date, description, status, rejection_reason, cancellation_reason, payment_method, payment_status, total_amount, created_at, updated_at)
        SELECT s.id, s.tracking_number, s.sender_id, s.recipient_name, s.recipient_phone, s.delivery_address, s.address_references, s.scheduled_date::TEXT, s.description, s.status, s.rejection_reason, s.cancellation_reason, s.payment_method, s.payment_status, s.total_amount, s.created_at, s.updated_at
        FROM public.shipments s
        ON CONFLICT (tracking_number) DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- 3. TABLA: bodega (Almacenaje de paquetes en bodega personal)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.bodega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    product_type TEXT NOT NULL,
    description TEXT,
    material TEXT DEFAULT 'fuerte' CHECK (material IN ('fragil', 'fuerte')),
    pickup_method TEXT DEFAULT 'entrega_personal' CHECK (pickup_method IN ('entrega_personal', 'recogida_piloto')),
    status TEXT DEFAULT 'almacenado' CHECK (status IN ('almacenado', 'solicitado', 'en_transito', 'retirado')),
    storage_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si existe 'warehouse_items', migrar a 'bodega'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'warehouse_items') THEN
        INSERT INTO public.bodega (id, user_id, product_type, description, material, pickup_method, status, storage_code, created_at, updated_at)
        SELECT id, user_id, product_type, description, material, pickup_method, status, storage_code, created_at, updated_at
        FROM public.warehouse_items
        ON CONFLICT (storage_code) DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- 4. TABLA: facturas (Comprobantes y facturación)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES public.envios(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pagado' CHECK (status IN ('pagado', 'pendiente', 'anulado')),
    payment_method TEXT,
    issued_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si existe 'invoices', migrar a 'facturas'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
        INSERT INTO public.facturas (id, invoice_number, user_id, shipment_id, description, amount, status, payment_method, issued_date, due_date, pdf_url, created_at)
        SELECT id, invoice_number, user_id, shipment_id, description, amount, status, payment_method, issued_date, due_date, pdf_url, created_at
        FROM public.invoices
        ON CONFLICT (invoice_number) DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- 5. TABLA: notificaciones
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si existe 'notifications', migrar a 'notificaciones'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        INSERT INTO public.notificaciones (id, user_id, title, message, type, is_read, link, created_at)
        SELECT id, user_id, title, message, type, is_read, link, created_at
        FROM public.notifications
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- 6. TABLA: mensajes (Chat y soporte)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    is_support BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si existe 'chat_messages', migrar a 'mensajes'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
        INSERT INTO public.mensajes (id, sender_id, receiver_id, is_support, is_bot, message, created_at)
        SELECT id, sender_id, receiver_id, is_support, is_bot, message, created_at
        FROM public.chat_messages
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- 7. TABLA: favoritos (Contactos frecuentes de los usuarios)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    favorite_user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, favorite_user_id)
);

-- Si existe 'user_favorites', migrar a 'favoritos'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_favorites') THEN
        INSERT INTO public.favoritos (id, user_id, favorite_user_id, created_at)
        SELECT id, user_id, favorite_user_id, created_at
        FROM public.user_favorites
        ON CONFLICT (user_id, favorite_user_id) DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- 8. TABLA: reportes (Denuncias de usuarios revisadas por moderadores)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.reportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si existe 'user_reports', migrar a 'reportes'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_reports') THEN
        INSERT INTO public.reportes (id, reporter_id, reported_user_id, reason, status, created_at)
        SELECT id, reporter_id, reported_user_id, reason, status, created_at
        FROM public.user_reports
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- LIMPIEZA DE TABLAS OBSOLETAS QUE YA NO SE USAN
-- =====================================================================
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.quotations CASCADE;
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.user_reports CASCADE;

-- =====================================================================
-- POLÍTICAS RLS (Row Level Security) 100% OPERATIVAS
-- Permite insertar, leer y actualizar desde la app móvil y app de escritorio
-- sin bloqueos de 401 Unauthorized
-- =====================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total usuarios" ON public.usuarios;
CREATE POLICY "Acceso total usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.envios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total envios" ON public.envios;
CREATE POLICY "Acceso total envios" ON public.envios FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.bodega ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total bodega" ON public.bodega;
CREATE POLICY "Acceso total bodega" ON public.bodega FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total facturas" ON public.facturas;
CREATE POLICY "Acceso total facturas" ON public.facturas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total notificaciones" ON public.notificaciones;
CREATE POLICY "Acceso total notificaciones" ON public.notificaciones FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total mensajes" ON public.mensajes;
CREATE POLICY "Acceso total mensajes" ON public.mensajes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total favoritos" ON public.favoritos;
CREATE POLICY "Acceso total favoritos" ON public.favoritos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total reportes" ON public.reportes FOR ALL USING (true) WITH CHECK (true);

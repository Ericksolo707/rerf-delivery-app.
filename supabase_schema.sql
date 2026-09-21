-- =====================================================================
-- ESQUEMA DE BASE DE DATOS PARA RERF APP (Aplicación de Envíos y Logística)
-- Compatible con Supabase (PostgreSQL 15+)
-- =====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
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

-- 3. TABLA: CONTACTOS FAVORITOS
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    favorite_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, favorite_user_id)
);

-- 4. TABLA: REPORTES DE USUARIOS
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_revision', 'resuelto', 'descartado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: BODEGA PERSONAL (Almacenaje de paquetes)
CREATE TABLE IF NOT EXISTS public.warehouse_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL,
    description TEXT,
    material TEXT NOT NULL CHECK (material IN ('fragil', 'fuerte')),
    pickup_method TEXT NOT NULL CHECK (pickup_method IN ('entrega_personal', 'recogida_piloto')),
    status TEXT DEFAULT 'almacenado' CHECK (status IN ('almacenado', 'solicitado', 'en_transito', 'retirado')),
    storage_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: ENVÍOS (Shipments)
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number TEXT UNIQUE NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT,
    delivery_address TEXT NOT NULL,
    address_references TEXT,
    scheduled_date DATE,
    description TEXT,
    status TEXT DEFAULT 'pendiente' CHECK (
        status IN ('pendiente', 'aprobado', 'en_camino', 'entregado', 'rechazado', 'cancelado')
    ),
    rejection_reason TEXT,
    cancellation_reason TEXT,
    payment_method TEXT CHECK (payment_method IN ('efectivo', 'contra_entrega', 'tarjeta')),
    payment_status TEXT DEFAULT 'pendiente' CHECK (payment_status IN ('pendiente', 'pagado', 'reembolsado')),
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    warehouse_item_id UUID REFERENCES public.warehouse_items(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: DETALLES DE PAQUETES DE UN ENVÍO
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    weight_kg NUMERIC(6, 2) NOT NULL,
    material TEXT NOT NULL CHECK (material IN ('fragil', 'fuerte')),
    dimensions TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: COTIZACIONES
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    weight_kg NUMERIC(6, 2) NOT NULL,
    material TEXT NOT NULL CHECK (material IN ('fragil', 'fuerte')),
    estimated_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA: FACTURAS (Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pagado' CHECK (status IN ('pagado', 'pendiente', 'anulado')),
    payment_method TEXT,
    issued_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABLA: NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'envio', 'pago', 'sistema', 'alerta')),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABLA: MENSAJES DE CHAT (Soporte humano y moderadores)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_support BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- TRIGGER: Creación automática de perfil al registrarse en auth.users
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'first_name', 'Usuario'),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        new.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo/usuarios autenticados
CREATE POLICY "Perfiles visibles para usuarios autenticados" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden ver sus propios envíos o envíos donde son destinatarios" ON public.shipments
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_user_id);
CREATE POLICY "Usuarios pueden crear envíos" ON public.shipments FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Usuarios pueden actualizar sus envíos" ON public.shipments FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Usuarios pueden ver sus artículos en bodega" ON public.warehouse_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden ver sus facturas" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden ver sus notificaciones" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden ver sus mensajes de chat" ON public.chat_messages
    FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

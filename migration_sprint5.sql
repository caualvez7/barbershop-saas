-- SQL Migration - Sprint 5 Infrastructure and RLS fixes
-- Run this in your Supabase SQL Editor to apply security, storage, and performance updates.

-- 1. Evaluations Table - Public Lead Ingress
DROP POLICY IF EXISTS "Permitir inserções públicas em evaluations" ON public.evaluations;
CREATE POLICY "Permitir inserções públicas em evaluations" ON public.evaluations
    FOR INSERT WITH CHECK (true);


-- 2. Subscriptions Table - Secure authenticated insertions
DROP POLICY IF EXISTS "Clientes podem assinar planos" ON public.subscriptions;
CREATE POLICY "Clientes podem assinar planos" ON public.subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (
        customer_id IS NULL OR
        auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id)
    );

DROP POLICY IF EXISTS "Permitir leitura de assinaturas" ON public.subscriptions;
CREATE POLICY "Permitir leitura de assinaturas" ON public.subscriptions
    FOR SELECT USING (true);


-- 3. Appointments Table - Public & Authenticated Insertions + Selects + Updates
DROP POLICY IF EXISTS "Clientes autenticados podem criar agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "Permitir inserção de agendamentos" ON public.appointments;
CREATE POLICY "Permitir inserção de agendamentos" ON public.appointments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de agendamentos" ON public.appointments;
CREATE POLICY "Permitir leitura de agendamentos" ON public.appointments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir atualização de agendamentos" ON public.appointments;
CREATE POLICY "Permitir atualização de agendamentos" ON public.appointments
    FOR UPDATE USING (true);


-- 4. Barbers Storage Bucket - Public Read & Authenticated Write
INSERT INTO storage.buckets (id, name, public) 
VALUES ('barbers', 'barbers', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for barber photos" ON storage.objects;
CREATE POLICY "Public read access for barber photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'barbers');

DROP POLICY IF EXISTS "Authenticated users can upload barber photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload barber photos" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'barbers');

DROP POLICY IF EXISTS "Authenticated owners can manage barber photos" ON storage.objects;
CREATE POLICY "Authenticated owners can manage barber photos" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'barbers') WITH CHECK (bucket_id = 'barbers');


-- 5. Performance Indexes for multi-tenant query speed
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON public.appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_barbershop ON public.subscriptions(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_barbershop ON public.customers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_customers_user ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_barbershop ON public.products(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_barbershop ON public.product_sales(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_product ON public.product_sales(product_id);

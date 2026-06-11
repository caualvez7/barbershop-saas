-- SQL Migration for Products and Product Sales tables
-- Run this in the Supabase SQL Editor to ensure the tables and RLS policies are properly set up.

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    volume_ml INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL
);

-- 2. Create Product Sales Table (Orders)
CREATE TABLE IF NOT EXISTS public.product_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    price_at_purchase NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL, -- 'pending' | 'picked_up' | 'cancelled'
    payment_method TEXT DEFAULT 'pickup'::text NOT NULL, -- 'pickup' | 'online'
    payment_status TEXT DEFAULT 'pending'::text NOT NULL -- 'pending' | 'paid'
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Products
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage products" ON public.products;
CREATE POLICY "Owners can manage products" ON public.products
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.barbershops 
        WHERE public.barbershops.id = public.products.barbershop_id 
        AND public.barbershops.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.barbershops 
        WHERE public.barbershops.id = public.products.barbershop_id 
        AND public.barbershops.user_id = auth.uid()
    ));

-- 5. RLS Policies for Product Sales (Orders)
DROP POLICY IF EXISTS "Allow public insert product_sales" ON public.product_sales;
CREATE POLICY "Allow public insert product_sales" ON public.product_sales
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can manage product_sales" ON public.product_sales;
CREATE POLICY "Owners can manage product_sales" ON public.product_sales
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.barbershops 
        WHERE public.barbershops.id = public.product_sales.barbershop_id 
        AND public.barbershops.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.barbershops 
        WHERE public.barbershops.id = public.product_sales.barbershop_id 
        AND public.barbershops.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Customers can view their own product_sales" ON public.product_sales;
CREATE POLICY "Customers can view their own product_sales" ON public.product_sales
    FOR SELECT TO authenticated
    USING (auth.uid() = (SELECT user_id FROM public.customers WHERE id = public.product_sales.customer_id));

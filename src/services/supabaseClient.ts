/**
 * supabaseClient.ts - Configuración Oficial de Supabase
 * Programación II - Sesión 7 UMG
 *
 * Responsabilidad: Inicializar el cliente Supabase con autenticación persistente
 * y variables de entorno EXPO_PUBLIC_* tal como se enseña en clase.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured: boolean = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && 
  (process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder')
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

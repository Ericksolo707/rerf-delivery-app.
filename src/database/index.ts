
import { supabase } from './supabase';
import { SupabaseAuthRepository } from './SupabaseRepository';

// Instancia singleton compartida de autenticación (DI por constructor)
export const authRepo = new SupabaseAuthRepository(supabase);

export { SupabaseAuthRepository } from './SupabaseRepository';
export type { IAuthRepository, ResultadoRegistro } from './IAuthRepository';
export type { UsuarioSesion } from '../models/UsuarioSesion';
export { traducirErrorAuth } from './traducirErrorAuth';
export { supabase, isSupabaseConfigured } from './supabase';

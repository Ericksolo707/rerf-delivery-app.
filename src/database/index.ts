/**
 * index.ts - Barril de Exportación de Base de Datos y Autenticación
 * Programación II - Sesión 6 y 7 UMG
 *
 * Responsabilidad: Centralizar los contratos, modelos e implementaciones
 * de autenticación con Supabase Auth.
 */

import { supabase } from './supabase';
import { SupabaseAuthRepository } from './SupabaseRepository';

// Instancia singleton compartida de autenticación (DI por constructor)
export const authRepo = new SupabaseAuthRepository(supabase);

export { SupabaseAuthRepository } from './SupabaseRepository';
export type { IAuthRepository, ResultadoRegistro } from './IAuthRepository';
export type { UsuarioSesion } from '../models/UsuarioSesion';
export { traducirErrorAuth } from './traducirErrorAuth';
export { supabase, isSupabaseConfigured } from './supabase';

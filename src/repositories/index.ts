/**
 * index.ts - Barril de Exportación de Repositorios
 * Programación II - Sesiones 5 y 6 UMG
 *
 * Responsabilidad: Centralizar la exportación de las clases e instancias
 * singleton obtenidas mediante el método getInstance() (Sesión 6).
 */

import { RepositorioBase } from './RepositorioBase';
import { RepositorioEnvios } from './RepositorioEnvios';
import { RepositorioBodega } from './RepositorioBodega';
import { RepositorioUsuarios } from './RepositorioUsuarios';
import { RepositorioFacturas } from './RepositorioFacturas';

// Instancias compartidas obtenidas exclusivamente vía Patrón Singleton (Sesión 6)
export const repositorioEnvios: RepositorioEnvios = RepositorioEnvios.getInstance();
export const repositorioBodega: RepositorioBodega = RepositorioBodega.getInstance();
export const repositorioUsuarios: RepositorioUsuarios = RepositorioUsuarios.getInstance();
export const repositorioFacturas: RepositorioFacturas = RepositorioFacturas.getInstance();

export {
  RepositorioBase,
  RepositorioEnvios,
  RepositorioBodega,
  RepositorioUsuarios,
  RepositorioFacturas,
};

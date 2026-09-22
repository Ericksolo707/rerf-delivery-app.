/**
 * index.ts - Barril de Exportación de Repositorios
 * Programación II - UMG
 *
 * Responsabilidad: Centralizar la exportación de las clases e instancias
 * singleton de los repositorios de datos de la aplicación.
 */

import { RepositorioEnvios } from './RepositorioEnvios';
import { RepositorioBodega } from './RepositorioBodega';
import { RepositorioUsuarios } from './RepositorioUsuarios';
import { RepositorioFacturas } from './RepositorioFacturas';

// Instancias compartidas (Singleton)
export const repositorioEnvios: RepositorioEnvios = new RepositorioEnvios();
export const repositorioBodega: RepositorioBodega = new RepositorioBodega();
export const repositorioUsuarios: RepositorioUsuarios = new RepositorioUsuarios();
export const repositorioFacturas: RepositorioFacturas = new RepositorioFacturas();

export {
  RepositorioEnvios,
  RepositorioBodega,
  RepositorioUsuarios,
  RepositorioFacturas,
};

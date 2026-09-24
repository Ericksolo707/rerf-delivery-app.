/**
 * RepositorioBase.ts - Clase Base Abstracta para Repositorios
 * Programación II - Sesión 5 UMG
 *
 * Responsabilidad: Definir la estructura obligatoria y los métodos polimórficos
 * que cualquier repositorio del sistema debe implementar.
 * Aplica conceptos de Clases Abstractas, Herencia y Polimorfismo.
 */

export abstract class RepositorioBase<T, TCreacion = Omit<T, 'id'>> {
  /**
   * Nombre de la entidad o tabla de datos que gestiona este repositorio
   */
  public abstract readonly nombreEntidad: string;

  /**
   * Devuelve todos los registros de la entidad
   * Obligatorio de implementar por las clases hijas.
   */
  public abstract listar(): Promise<T[]>;

  /**
   * Obtiene un registro específico por su identificador
   * Obligatorio de implementar por las clases hijas.
   */
  public abstract obtener(id: string): Promise<T | undefined>;

  /**
   * Registra una nueva entidad en el almacén de datos
   * Obligatorio de implementar por las clases hijas.
   */
  public abstract crear(datos: TCreacion): Promise<T>;

  /**
   * Actualiza los datos de un registro existente
   * Obligatorio de implementar por las clases hijas.
   */
  public abstract actualizar(id: string, datos: Partial<T>): Promise<T | undefined>;

  /**
   * Elimina un registro por su identificador
   * Obligatorio de implementar por las clases hijas.
   */
  public abstract eliminar(id: string): Promise<boolean>;
}

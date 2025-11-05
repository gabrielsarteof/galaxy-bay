/**
 * Interface abstrata para serviços de storage.
 * Permite trocar implementação (local, S3, Cloudinary) sem alterar lógica de negócio.
 * Princípio: Dependency Inversion (SOLID)
 */
export interface IStorageService {
  /**
   * Faz upload de arquivo para storage.
   * Sobrescreve arquivo se já existir no mesmo path.
   *
   * @param path - Caminho relativo do arquivo (ex: 'avatars/user123/avatar.jpg')
   * @param buffer - Conteúdo do arquivo em buffer
   * @param mimetype - Tipo MIME do arquivo (ex: 'image/jpeg')
   * @returns Path do arquivo salvo
   */
  upload(path: string, buffer: Buffer, mimetype: string): Promise<string>;

  /**
   * Deleta arquivo do storage.
   * Não lança erro se arquivo não existir.
   *
   * @param path - Caminho relativo do arquivo
   */
  delete(path: string): Promise<void>;

  /**
   * Gera URL pública para acessar arquivo.
   * Inclui query param ?v= para cache busting se fornecido.
   *
   * @param path - Caminho relativo do arquivo
   * @param version - Timestamp para invalidar cache (opcional)
   * @returns URL completa do arquivo
   */
  getPublicUrl(path: string, version?: number): string;

  /**
   * Verifica se arquivo existe no storage.
   *
   * @param path - Caminho relativo do arquivo
   * @returns true se arquivo existe, false caso contrário
   */
  exists(path: string): Promise<boolean>;
}

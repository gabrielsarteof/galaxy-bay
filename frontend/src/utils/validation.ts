export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validatePrice(price: string | number): { valid: boolean; error?: string } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { valid: false, error: 'Preço inválido' };
  }

  if (numPrice < 0) {
    return { valid: false, error: 'Preço não pode ser negativo' };
  }

  if (numPrice === 0) {
    return { valid: false, error: 'Preço deve ser maior que zero' };
  }

  if (numPrice > 1000000) {
    return { valid: false, error: 'Preço muito alto' };
  }

  return { valid: true };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB',
    };
  }

  return { valid: true };
}

export function validateNFTName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Nome muito longo (máximo 100 caracteres)' };
  }

  return { valid: true };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

export function validateTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function formatWalletAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!validateEthereumAddress(address)) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function validateOfferExpiration(expiration: Date): { valid: boolean; error?: string } {
  const now = new Date();
  const maxDays = 30;
  const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);

  if (expiration <= now) {
    return { valid: false, error: 'Data de expiração deve ser no futuro' };
  }

  if (expiration > maxDate) {
    return { valid: false, error: `Expiração máxima: ${maxDays} dias` };
  }

  return { valid: true };
}

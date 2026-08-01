import { validate as isValidUuid } from 'uuid';

const UUID_CANONICAL_LENGTH = 36;
const UUID_HEX_LENGTH = 32;
const UUID_BINARY_LENGTH = 16;

export function uuidToBuffer(uuid: string): Buffer {
  if (!isValidUuid(uuid)) throw new TypeError(`Invalid UUID: ${uuid}`);

  const normalizedUuid = uuid.toLowerCase();

  if (normalizedUuid.length !== UUID_CANONICAL_LENGTH) {
    throw new TypeError(
      `El UUID debe de tener formato canónico de ${normalizedUuid.length} caracteres`,
    );
  }

  const hex = normalizedUuid.replaceAll('-', '');

  if (hex.length !== UUID_HEX_LENGTH) {
    throw new TypeError(
      `El UUID debe contener ${UUID_HEX_LENGTH} caracteres hexadecimales`,
    );
  }

  return Buffer.from(hex, 'hex');
}

export function bufferToUuid(buffer: Buffer): string {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('El identificador recibido no es un buffer');
  }

  if (buffer.length !== UUID_BINARY_LENGTH) {
    throw new TypeError(
      `El UUID binario debe tener exactamente ${UUID_BINARY_LENGTH} bytes`,
    );
  }

  const hex = buffer.toString('hex');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

import { createHash } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const HASH_ALGORITHM = 'sha256';
const HASH_ENCODING = 'hex';

const HASH_SECRET = process.env.HASH_SECRET || '';

export const deterministicHash = (codigoUnico: string): string => {
  const hash = createHash(HASH_ALGORITHM);
  hash.update(HASH_SECRET + codigoUnico);
  return hash.digest(HASH_ENCODING).slice(0, 24); 
};

export const isValidHashMatch = (codigoUnico: string, storedHash: string): boolean => {
  return deterministicHash(codigoUnico) === storedHash;
};
import { customAlphabet } from 'nanoid';

export const generateId = (): string => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 20);
  return nanoid();
};

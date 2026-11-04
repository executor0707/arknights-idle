// Local save-file obfuscation. This is not DRM: it exists so an exported save is
// not a readable map of currencies/characters that can be edited by hand.
const MAGIC = 'rhodes-idle-save';
const FORMAT_VERSION = 3;
const SECRET = 'Rhodes Island Idle — exported save envelope v3';

const enc = new TextEncoder();
const dec = new TextDecoder();

function bytesToB64(bytes) {
  let out = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(out);
}

function b64ToBytes(text) {
  const raw = atob(text);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function deriveKey(salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(SECRET), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export function isEncryptedSave(value) {
  return !!value && value.format === MAGIC && typeof value.data === 'string';
}

export async function encryptSave(state) {
  if (!globalThis.crypto?.subtle) throw new Error('当前环境不支持加密导出');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(salt);
  const plain = enc.encode(JSON.stringify(state));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  return {
    format: MAGIC,
    v: FORMAT_VERSION,
    alg: 'AES-GCM',
    kdf: 'PBKDF2-SHA256-100000',
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    data: bytesToB64(new Uint8Array(cipher)),
  };
}

export async function decodeSaveFile(value) {
  if (!value || typeof value !== 'object') throw new Error('存档格式无效');
  if (!isEncryptedSave(value)) throw new Error('只支持新版加密存档，旧明文存档已失效');
  if (value.v !== FORMAT_VERSION || !value.salt || !value.iv) throw new Error('存档版本过旧或不受支持');
  if (!globalThis.crypto?.subtle) throw new Error('当前环境不支持解密存档');
  const salt = b64ToBytes(value.salt);
  const iv = b64ToBytes(value.iv);
  const key = await deriveKey(salt);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    b64ToBytes(value.data),
  );
  return JSON.parse(dec.decode(plain));
}

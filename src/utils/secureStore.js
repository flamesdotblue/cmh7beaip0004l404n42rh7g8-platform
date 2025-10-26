// Simple AES-GCM encryption wrapper for localStorage
// persist=true uses a stored key in localStorage; persist=false uses ephemeral in-memory key

let anonKeyPromise = null;

function toB64(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i=0; i<bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

function fromB64(b64) {
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i=0; i<str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes.buffer;
}

async function getKey(persist) {
  if (persist) {
    let raw = localStorage.getItem('mh_key');
    if (!raw) {
      const keyBytes = new Uint8Array(32);
      crypto.getRandomValues(keyBytes);
      raw = toB64(keyBytes);
      localStorage.setItem('mh_key', raw);
    }
    const keyBuf = fromB64(raw);
    return await crypto.subtle.importKey('raw', keyBuf, 'AES-GCM', false, ['encrypt','decrypt']);
  } else {
    if (!anonKeyPromise) {
      anonKeyPromise = (async ()=>{
        const keyBytes = new Uint8Array(32);
        crypto.getRandomValues(keyBytes);
        return await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt','decrypt']);
      })();
    }
    return await anonKeyPromise;
  }
}

async function encrypt(persist, data) {
  const key = await getKey(persist);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const enc = new TextEncoder().encode(JSON.stringify(data));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
  // store as iv.b64 + ':' + ct.b64
  return toB64(iv) + ':' + toB64(ct);
}

async function decrypt(persist, payload) {
  if (!payload) return null;
  const [ivB64, ctB64] = payload.split(':');
  const key = await getKey(persist);
  const iv = new Uint8Array(fromB64(ivB64));
  const ct = fromB64(ctB64);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  const str = new TextDecoder().decode(pt);
  return JSON.parse(str);
}

export async function setItem(name, value, persist=true) {
  const payload = await encrypt(persist, value);
  localStorage.setItem(name, payload);
  localStorage.setItem('mh_mode', persist ? 'persist' : 'anon');
}

export async function getItem(name, persist=true) {
  const payload = localStorage.getItem(name);
  if (!payload) return null;
  try {
    return await decrypt(persist, payload);
  } catch (e) {
    // if decryption fails because mode changed, try the other mode as a fallback
    try {
      return await decrypt(!persist, payload);
    } catch (_) {
      return null;
    }
  }
}

export function removeItem(name) { localStorage.removeItem(name); }

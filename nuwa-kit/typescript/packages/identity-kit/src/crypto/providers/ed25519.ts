import { CryptoProvider } from '../providers';
import { KEY_TYPE, KeyType } from '../../types';

// Universal helper to obtain a Web Crypto implementation in both browser and Node.js environments.
// 1. In browsers (and newer versions of Node.js that expose `globalThis.crypto`) we return the global object.
// 2. In other Node.js environments we fall back to the built-in `crypto.webcrypto` implementation that was
//    imported above. This avoids using CommonJS `require`, which is not available in ESM bundles.
function getCrypto(): Crypto {
  // Use the built-in Web Crypto implementation exposed on globalThis.
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) {
    return (globalThis as any).crypto as Crypto;
  }

  // If crypto is unavailable (e.g., very old Node versions), throw a descriptive error.
  throw new Error('Web Crypto API is not available in the current runtime');
}

export class Ed25519Provider implements CryptoProvider {
  private crypto: Crypto;

  constructor() {
    this.crypto = getCrypto();
  }

  async generateKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }> {
    const { publicKey, privateKey } = await this.crypto.subtle.generateKey(
      {
        name: 'Ed25519',
        namedCurve: 'Ed25519',
      },
      true,
      ['sign', 'verify']
    );

    const exportedPublic = new Uint8Array(await this.crypto.subtle.exportKey('raw', publicKey));
    const exportedPrivate = new Uint8Array(await this.crypto.subtle.exportKey('pkcs8', privateKey));

    return {
      publicKey: exportedPublic,
      privateKey: exportedPrivate,
    };
  }

  async sign(data: Uint8Array, privateKey: Uint8Array | CryptoKey): Promise<Uint8Array> {
    let key: CryptoKey;
    if (privateKey instanceof Uint8Array) {
      key = await this.crypto.subtle.importKey(
        'pkcs8',
        privateKey,
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519',
        },
        false,
        ['sign']
      );
    } else {
      key = privateKey;
    }

    const signature = await this.crypto.subtle.sign('Ed25519', key, data);

    return new Uint8Array(signature);
  }

  async verify(
    data: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array | JsonWebKey
  ): Promise<boolean> {
    let key: CryptoKey;
    if (publicKey instanceof Uint8Array) {
      key = await this.crypto.subtle.importKey(
        'raw',
        publicKey,
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519',
        },
        false,
        ['verify']
      );
    } else {
      key = await this.crypto.subtle.importKey(
        'jwk',
        publicKey,
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519',
        },
        false,
        ['verify']
      );
    }

    return await this.crypto.subtle.verify('Ed25519', key, signature, data);
  }

  getKeyType(): KeyType {
    return KEY_TYPE.ED25519;
  }
}

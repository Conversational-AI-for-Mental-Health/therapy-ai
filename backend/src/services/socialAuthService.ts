import { createRemoteJWKSet, jwtVerify } from 'jose';
import config from '../config';

type SocialProvider = 'google' | 'apple';

interface SocialClaims {
  sub: string;
  email?: string;
}

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
);
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

const getExpectedAudience = (provider: SocialProvider): string => {
  if (provider === 'google') {
    if (!config.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }
    return config.GOOGLE_CLIENT_ID;
  }

  if (!config.APPLE_CLIENT_ID) {
    throw new Error('APPLE_CLIENT_ID is not configured');
  }
  return config.APPLE_CLIENT_ID;
};

export const verifySocialToken = async (
  provider: SocialProvider,
  idToken: string,
): Promise<SocialClaims | null> => {
  try {
    if (!idToken || typeof idToken !== 'string') {
      return null;
    }

    const audience = getExpectedAudience(provider);
    const { payload } =
      provider === 'google'
        ? await jwtVerify(idToken, GOOGLE_JWKS, {
            issuer: ['https://accounts.google.com', 'accounts.google.com'],
            audience,
          })
        : await jwtVerify(idToken, APPLE_JWKS, {
            issuer: 'https://appleid.apple.com',
            audience,
          });

    if (!payload.sub || typeof payload.sub !== 'string') {
      return null;
    }

    return {
      sub: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
  } catch (error) {
    return null;
  }
};

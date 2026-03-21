import jwt, { type SignOptions } from "jsonwebtoken";

export function signJwt(payload: object) {
  const config = useRuntimeConfig();
  const options: SignOptions = {
    expiresIn: config.tokenExpires as unknown as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.tokenSecret as jwt.Secret, options);
}

export function verifyJwt(token: string) {
  const config = useRuntimeConfig();
  try {
    return jwt.verify(token, config.tokenSecret as jwt.Secret);
  } catch (err) {
    console.warn("JWT verify failed:", (err as Error).message);
    return null;
  }
}

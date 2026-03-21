import jwt from "jsonwebtoken";

export function signJwt(payload: object) {
  const config = useRuntimeConfig();
  return jwt.sign(payload, config.tokenSecret, { expiresIn: config.tokenExpires });
}

export function verifyJwt(token: string) {
  const config = useRuntimeConfig();
  try {
    return jwt.verify(token, config.tokenSecret);
  } catch (err) {
    return null;
  }
}

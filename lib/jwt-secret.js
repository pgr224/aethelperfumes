export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required. Set it in your environment before starting the app.');
  }
  return secret;
}

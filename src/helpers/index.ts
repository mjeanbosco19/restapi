import crypto from 'crypto';
const SECRET = 'MJB-RESTAPI-SECRET';
export const random = () => {
  const buffer = crypto.randomBytes(128);
  return buffer.toString('base64');
};
export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac('sha256', [salt, password].join('/'))
    .update(SECRET)
    .digest('hex');
};

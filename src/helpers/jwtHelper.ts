// import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

// const createToken = (payload: object, secret: Secret, expireTime: string) => {
//   return jwt.sign(payload, secret, { expiresIn: expireTime });
// };

// const verifyToken = (token: string, secret: Secret) => {
//   return jwt.verify(token, secret) as JwtPayload;
// };

// export const jwtHelper = { createToken, verifyToken };


import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

interface Payload {
  [key: string]: any; // generic payload object
}

const createToken = (payload: Payload, secret: Secret, expireTime: string | number): string => {
  const options: SignOptions = { expiresIn: expireTime };
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: Secret): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
};

export const jwtHelper = { createToken, verifyToken };

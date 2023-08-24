import express from 'express';
import { get, merge } from 'lodash';
import { getUserBySessionToken } from '../db/users';

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, 'identity._id') as unknown as string;
     if (currentUserId.toString() !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};  
export const isAuthenticaed = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = get(req, 'cookies.BOSCO_AUTH', '');
    if (!sessionToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await getUserBySessionToken(sessionToken);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    merge(req, { identity: user });
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

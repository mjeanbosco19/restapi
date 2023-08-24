import { createUser, getUserByEmail } from '../db/users';
import express from 'express';
import { random, authentication } from '../helpers';

/**
 * Handles a login login request.
 * Using the email, and password fields from the request body,
 * checks if the email is valid and the user's password is correct.
 * create a new session for the user.
 */

export const login = async (req: express.Request, res: express.Response) => {
  try {
    // Extract the email and password fields from the request body
    const { email, password } = req.body;

    // Check if any of the required fields are missing
    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing required fields: email and password are required',
      });
    }

    // Check if a user with the given email exists in the database
    const user = await getUserByEmail(email).select(
      '+authentication.salt +authentication.password'
    );
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const hashedPassword = authentication(
      password,
      user.authentication?.salt || ''
    );

    if (hashedPassword !== user.authentication?.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a new session for the user
    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );
    await user.save();

    res.cookie('BOSCO_AUTH', user.authentication.sessionToken, {
      domain: 'localhost',
      path: '/',
    });

    // Return the user's session token
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Handles a user registration request.
 * Extracts the username, email, and password fields from the request body,
 * checks if the email is unique, generates a random salt, hashes the user's password
 * using the salt, and creates a new user in the database.
 */
export const register = async (req: express.Request, res: express.Response) => {
  try {
    // Extract the username, email, and password fields from the request body
    const { username, email, password } = req.body;

    // Check if any of the required fields are missing
    if (!username || !email || !password) {
      return res.status(400).json({
        message:
          'Missing required fields: username, email and password are required',
      });
    }

    // Check if a user with the given email already exists in the database
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate a random salt and hash the user's password using the salt
    const salt = random();
    const hashedPassword = authentication(password, salt);

    // Create a new user in the database
    const user = await createUser({
      username,
      email,
      authentication: {
        salt,
        password: hashedPassword,
      },
    });

    // Return the newly created user
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

import { isOwner } from '../middlewares';
import { deleteUser, getAllUsers } from '../controllers/user';
import express from 'express';
export default (router: express.Router) => {
  router.get('/users', getAllUsers);
  router.delete('/users/:id', isOwner, deleteUser);
};

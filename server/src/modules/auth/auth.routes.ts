import {Router} from 'express';
import { githubCallback } from './auth.controller.js';

const router = Router();

router.get("/github/callback", githubCallback);

export default router;
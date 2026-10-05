import { Router } from "express";
import { analyzeSentiment } from "../controllers/sentiment.controller";

const router = Router();

router.post("/:reviewId/analyze", analyzeSentiment);

export default router;
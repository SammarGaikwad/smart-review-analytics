import { Router } from "express";
import * as WebAnalyticsController from "../controllers/webAnalytics.controller";

const router = Router();

router.get("/clickstream", WebAnalyticsController.getClickstream);
router.get("/ab-test", WebAnalyticsController.getAbTest);
router.get("/survey", WebAnalyticsController.getSurvey);
router.post("/crawl", WebAnalyticsController.crawl);
router.get("/index", WebAnalyticsController.getIndex);
router.get("/ranking", WebAnalyticsController.getRanking);
router.get("/seo", WebAnalyticsController.getSeo);
router.post("/search", WebAnalyticsController.search);

export default router;

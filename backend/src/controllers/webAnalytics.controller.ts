import { Request, Response } from "express";
import * as WebAnalyticsService from "../services/webAnalytics.service";

export const getClickstream = async (req: Request, res: Response) => {
    try {
        const result = await WebAnalyticsService.getClickstreamAnalytics();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAbTest = async (req: Request, res: Response) => {
    try {
        const result = await WebAnalyticsService.getAbTestResults();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getSurvey = async (req: Request, res: Response) => {
    try {
        const result = await WebAnalyticsService.getSurveyAnalytics();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const crawl = async (req: Request, res: Response) => {
    try {
        const result = await WebAnalyticsService.crawlPages();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getIndex = async (req: Request, res: Response) => {
    try {
        const result = await WebAnalyticsService.getIndex();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getRanking = async (req: Request, res: Response) => {
    try {
        const result = await WebAnalyticsService.getRanking();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getSeo = async (req: Request, res: Response) => {
    try {
        const result = await WebAnalyticsService.getSeoAnalysis();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const search = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;
        const result = await WebAnalyticsService.searchWeb(query);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

import axios from "axios";

const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://localhost:8000";

export const getClickstreamAnalytics = async () => {
    const res = await axios.get(`${ANALYTICS_URL}/api/analytics/web/clickstream`);
    return res.data?.data;
};

export const getAbTestResults = async () => {
    const res = await axios.get(`${ANALYTICS_URL}/api/analytics/web/ab-test`);
    return res.data?.data;
};

export const getSurveyAnalytics = async () => {
    const res = await axios.get(`${ANALYTICS_URL}/api/analytics/web/survey`);
    return res.data?.data;
};

export const crawlPages = async () => {
    const res = await axios.post(`${ANALYTICS_URL}/api/analytics/web/crawl`);
    return res.data?.data;
};

export const getIndex = async () => {
    const res = await axios.get(`${ANALYTICS_URL}/api/analytics/web/index`);
    return res.data?.data;
};

export const getRanking = async () => {
    const res = await axios.get(`${ANALYTICS_URL}/api/analytics/web/ranking`);
    return res.data?.data;
};

export const getSeoAnalysis = async () => {
    const res = await axios.get(`${ANALYTICS_URL}/api/analytics/web/seo`);
    return res.data?.data;
};

export const searchWeb = async (query: string) => {
    const res = await axios.post(`${ANALYTICS_URL}/api/analytics/web/search`, { query });
    return res.data?.data;
};

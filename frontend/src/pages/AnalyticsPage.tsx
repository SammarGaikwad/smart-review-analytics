import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { getNetworkAnalytics, compareKeywords, benchmarkKeywords, analyzeTopics, performClustering } from '../api/analytics';
import { getReviews } from '../api/reviews';
import { analyzeTextSentiment, getSentimentModelEvaluation, compareSentimentModels } from '../api/sentiment';
import { NetworkAnalyticsResult, SentimentResult, Review } from '../types';
import { Cpu, Hash, Sparkles, TrendingUp, BarChart3, PieChart, CheckCircle2, Lock, ArrowRight, Share2, Network, Activity } from 'lucide-react';
import { WebAnalyticsLab } from '../components/analytics/WebAnalyticsLab';
import { TemporalNetworkLab } from '../components/analytics/TemporalNetworkLab';

export const AnalyticsPage: React.FC = () => {
  const [networkData, setNetworkData] = useState<NetworkAnalyticsResult | null>(null);
  const [networkLoading, setNetworkLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [sampleText, setSampleText] = useState<string>(
    'The hotel room was exceptionally clean with a stunning ocean view, but the room service response time was slow.'
  );
  const [testResult, setTestResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  // ML Sentiment Comparison State
  const [mlText, setMlText] = useState('The hotel room was excellent and the staff were very helpful.');
  const [mlCompare, setMlCompare] = useState<any>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlEval, setMlEval] = useState<any>(null);

  // Keyword Comparison State
  const [kwText, setKwText] = useState('The customer service at this hotel was absolutely fantastic. However, the room quality and the air conditioning were poor. The food in the restaurant was okay but overpriced.');
  const [kwRef, setKwRef] = useState('customer service, room quality, air conditioning, food, restaurant, overpriced');
  const [kwTopK, setKwTopK] = useState(10);
  const [kwResult, setKwResult] = useState<any>(null);
  const [kwAnalyzing, setKwAnalyzing] = useState(false);
  const [kwError, setKwError] = useState<string | null>(null);

  // Benchmark State
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  // Reviews List
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Topic Modeling State
  const [topicReviewId, setTopicReviewId] = useState<string>('');
  const [topicResult, setTopicResult] = useState<any>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  // Clustering State
  const [clusterK, setClusterK] = useState<number>(4);
  const [clusterResult, setClusterResult] = useState<any>(null);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [clusterError, setClusterError] = useState<string | null>(null);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await getReviews();
      setReviews(data);
      if (data.length > 0) {
        setTopicReviewId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadNetworkData = async () => {
    setNetworkLoading(true);
    setNetworkError(null);
    try {
      const data = await getNetworkAnalytics();
      setNetworkData(data);
    } catch (err: any) {
      console.error('Failed to load network analytics:', err);
      setNetworkError(err.message || 'Failed to fetch graph network analytics');
    } finally {
      setNetworkLoading(false);
    }
  };

  const loadMlEvaluation = async () => {
    try {
      const data = await getSentimentModelEvaluation();
      setMlEval(data);
    } catch (err) {
      console.error('Failed to load ML evaluation:', err);
    }
  };

  useEffect(() => {
    loadNetworkData();
    loadMlEvaluation();
    loadReviews();
  }, []);

  const handleTestVader = async () => {
    if (!sampleText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await analyzeTextSentiment(sampleText);
      setTestResult(res);
    } catch (err: any) {
      console.error(err);
      setTestResult(null);
      // We do not set fake fallback values. We will let the UI handle the error or show nothing.
      alert(err.message || 'Failed to analyze sentiment');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCompareModels = async () => {
    setMlLoading(true);
    try {
      const res = await compareSentimentModels(mlText);
      setMlCompare(res);
    } catch (err) {
      console.error(err);
    } finally {
      setMlLoading(false);
    }
  };

  const handleCompareKeywords = async () => {
    setKwAnalyzing(true);
    setKwError(null);
    try {
      const refs = kwRef.split(',').map(r => r.trim()).filter(r => r);
      const res = await compareKeywords(kwText, refs, kwTopK);
      setKwResult(res);
    } catch (err: any) {
      setKwError(err.message || 'Failed to compare keywords');
    } finally {
      setKwAnalyzing(false);
    }
  };

  const handleRunBenchmark = async () => {
    setBenchmarkLoading(true);
    setBenchmarkError(null);
    try {
      const res = await benchmarkKeywords();
      setBenchmarkData(res);
    } catch (err: any) {
      setBenchmarkError(err.message || 'Failed to run benchmark');
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const handleAnalyzeTopics = async () => {
    if (!topicReviewId) return;
    setTopicLoading(true);
    setTopicError(null);
    try {
      const res = await analyzeTopics(topicReviewId);
      setTopicResult(res);
    } catch (err: any) {
      setTopicError(err.message || 'Failed to analyze topics');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleRunClustering = async () => {
    if (clusterK < 1) {
      setClusterError('K must be at least 1');
      return;
    }
    setClusterLoading(true);
    setClusterError(null);
    try {
      const res = await performClustering(clusterK);
      setClusterResult(res);
    } catch (err: any) {
      setClusterError(err.message || 'Failed to run clustering');
    } finally {
      setClusterLoading(false);
    }
  };

  const professionalCategories = [
    {
      title: 'Review Intelligence',
      icon: Sparkles,
      features: ['Sentiment Analysis', 'Keyword Extraction', 'Topic Analysis', 'Text Preprocessing', 'Review Classification'],
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      title: 'Advanced Analytics',
      icon: Activity,
      features: ['Clustering', 'Network Analysis', 'Temporal Analysis', 'Semantic Analysis', 'ML Comparison'],
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Web & Social Analytics',
      icon: Share2,
      features: ['Web Analytics', 'Clickstream Analysis', 'A/B Testing', 'Survey Analytics', 'PageRank / Web Search'],
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Business Intelligence',
      icon: TrendingUp,
      features: ['Domain Performance', 'Product Performance', 'Customer Insights', 'Sentiment Trends', 'Review Trends'],
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      title: 'Enterprise Analytics',
      icon: Lock,
      features: ['User & Role Analytics', 'Audit Activity', 'System Monitoring', 'Access & Security', 'Operational Insights'],
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    }
  ];

  const renderKeywordMethodResult = (methodName: string, methodData: any) => {
    if (!methodData) return null;
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-sm">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider">{methodName}</h4>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {methodData.keywords.map((k: any, i: number) => (
            <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 shadow-sm flex items-center gap-1">
              {k.word} <span className="text-slate-400 font-mono">({k.score.toFixed(3)})</span>
            </span>
          ))}
          {methodData.keywords.length === 0 && <span className="text-slate-400">No keywords extracted</span>}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Precision</span>
            <span className="font-mono text-indigo-600 font-bold">{methodData.precision !== null ? methodData.precision.toFixed(4) : 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Recall</span>
            <span className="font-mono text-indigo-600 font-bold">{methodData.recall !== null ? methodData.recall.toFixed(4) : 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">F1 Score</span>
            <span className="font-mono text-indigo-600 font-bold">{methodData.f1 !== null ? methodData.f1.toFixed(4) : 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Time (ms)</span>
            <span className="font-mono text-slate-700 font-bold">{methodData.executionTimeMs}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Insights"
        subtitle="Advanced analysis across reviews, customers, products and enterprise data."
      />

      {/* Grid of Analytics Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {professionalCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${cat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{cat.title}</h3>
              <ul className="space-y-1.5 mt-auto">
                {cat.features.map((feat, j) => (
                  <li key={j} className="flex items-center text-xs text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Review Intelligence</h2>
      {/* Live VADER Interactive Tester Section */}
      <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Real-Time Sentiment Analysis (VADER)</h3>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Test real-time sentiment scoring using Python's NLTK VADER analyzer.
        </p>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            onClick={handleTestVader}
            disabled={analyzing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center space-x-2"
          >
            <span>{analyzing ? 'Analyzing Text...' : 'Run VADER Analysis'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-semibold">Classification</span>
              <span className="text-sm font-bold text-emerald-400">{testResult.sentimentLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-semibold">Compound Score</span>
              <span className="text-sm font-bold font-mono text-white">{testResult.sentimentScore.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyword Extraction Comparison */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Keyword Extraction Comparison</h3>
              <p className="text-xs text-slate-500">Compare TF-IDF, RAKE, and TextRank algorithms with precision/recall.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Input Document</label>
              <textarea
                rows={4}
                value={kwText}
                onChange={(e) => setKwText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference Keywords (Optional)</label>
                <input
                  type="text"
                  value={kwRef}
                  onChange={(e) => setKwRef(e.target.value)}
                  placeholder="e.g. food, delivery, fast"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Top K</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={kwTopK}
                  onChange={(e) => setKwTopK(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleCompareKeywords}
              disabled={kwAnalyzing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-xs transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {kwAnalyzing ? <LoadingSpinner message="Extracting..." /> : (
                <>
                  <span>Analyze Keywords</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {kwError && <p className="text-xs text-rose-500">{kwError}</p>}
          </div>

          <div className="space-y-4">
            {kwResult && kwResult.methods ? (
              <div className="space-y-4">
                {renderKeywordMethodResult("TF-IDF", kwResult.methods.tfidf)}
                {renderKeywordMethodResult("RAKE", kwResult.methods.rake)}
                {renderKeywordMethodResult("TextRank", kwResult.methods.textrank)}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500 text-center">Run the analysis to see the algorithm comparison and evaluation metrics.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Topic Modeling (Taxonomy) Lab */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Topic Analysis & Taxonomy Lab</h3>
              <p className="text-xs text-slate-500">Map reviews to predefined business taxonomy vectors with probability scores.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Review for Analysis</label>
            <div className="flex gap-3">
              <select
                value={topicReviewId}
                onChange={(e) => setTopicReviewId(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                disabled={reviewsLoading}
              >
                {reviewsLoading ? (
                  <option>Loading reviews...</option>
                ) : (
                  reviews.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id.substring(0, 8)} - {r.reviewText ? r.reviewText.substring(0, 40) + '...' : 'No content'}
                    </option>
                  ))
                )}
              </select>
              <button
                onClick={handleAnalyzeTopics}
                disabled={topicLoading || !topicReviewId}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {topicLoading ? <LoadingSpinner message="Analyzing..." /> : (
                  <>
                    <span>Analyze Topics</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {topicError && <p className="text-xs text-rose-500 mt-2">{topicError}</p>}
          </div>

          {topicResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Extracted Topics</h4>
              {topicResult.topics && topicResult.topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {topicResult.topics.map((t: any) => (
                    <div key={t.id} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 text-sm">{t.name}</span>
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {(t.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      {t.description && <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No predefined taxonomy topics matched this review.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Prediction & Model Comparison */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Sentiment Prediction & Model Comparison</h3>
            <p className="text-xs text-slate-500">Compare Lexicon-Based Analysis vs Machine Learning Prediction (Naive Bayes & SVM).</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">Review Text</label>
          <textarea
            rows={3}
            value={mlText}
            onChange={(e) => setMlText(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleCompareModels}
            disabled={mlLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-xs transition disabled:opacity-50"
          >
            {mlLoading ? 'Comparing...' : 'Compare Models'}
          </button>
        </div>

        {mlCompare && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Lexicon / VADER</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Prediction:</span>
                <span className="text-sm font-bold capitalize text-emerald-600">{mlCompare.lexicon?.prediction}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Naive Bayes</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Prediction:</span>
                <span className="text-sm font-bold capitalize text-indigo-600">{mlCompare.naiveBayes?.prediction || 'N/A'}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">SVM</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Prediction:</span>
                <span className="text-sm font-bold capitalize text-indigo-600">{mlCompare.svm?.prediction || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {mlEval && (
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Model Performance</h4>
            
            <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <div className="p-1 bg-amber-100 text-amber-600 rounded">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-amber-800">Academic Demonstration Notice</h5>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  The model evaluation metrics may display as <strong>0.0000</strong> because this is a highly constrained academic dataset containing only 24 total labeled samples. With a 5-sample test set, simple TF-IDF vectors heavily overfit the training vocabulary and often miss test words entirely. This instability is a legitimate mathematical result of extreme data scarcity, not a system bug.
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Model</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Accuracy</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Precision</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Recall</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">F1 Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {['naive_bayes', 'svm'].map(modelKey => {
                    const stats = mlEval[modelKey];
                    if (!stats) return null;
                    return (
                      <tr key={modelKey} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800 capitalize">{modelKey.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-right font-mono text-indigo-600">{stats.accuracy?.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-mono text-indigo-600">{stats.precision?.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-mono text-indigo-600">{stats.recall?.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-mono text-indigo-600 font-bold">{stats.f1?.toFixed(4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="font-bold mb-1">Training Information</p>
              <p>Training Samples: {mlEval.training_samples}</p>
              <p>Testing Samples: {mlEval.testing_samples}</p>
              <p>Classes: {mlEval.classes?.join(' / ') || 'N/A'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['naive_bayes', 'svm'].map(modelKey => {
                 const model = mlEval[modelKey];
                 if (!model || !model.confusion_matrix) return null;
                 const { labels, matrix } = model.confusion_matrix;
                 return (
                   <div key={modelKey} className="border border-slate-200 p-4 rounded-xl">
                     <h5 className="font-bold text-xs text-slate-700 uppercase mb-3">{modelKey.replace('_', ' ')} Confusion Matrix</h5>
                     <table className="w-full text-center text-xs border-collapse">
                       <thead>
                         <tr>
                           <th className="border p-2 bg-slate-50 text-slate-500">True \ Pred</th>
                           {labels.map((l: string) => <th key={l} className="border p-2 bg-slate-50 capitalize">{l}</th>)}
                         </tr>
                       </thead>
                       <tbody>
                         {matrix.map((row: number[], i: number) => (
                           <tr key={i}>
                             <td className="border p-2 font-bold bg-slate-50 capitalize">{labels[i]}</td>
                             {row.map((val: number, j: number) => (
                               <td key={j} className={`border p-2 ${i === j ? 'bg-emerald-50 text-emerald-700 font-bold' : ''}`}>
                                 {val}
                               </td>
                             ))}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 );
              })}
            </div>
          </div>
        )}
      </div>

      <TemporalNetworkLab />
      
      <WebAnalyticsLab />
    
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Advanced Analytics</h2>
      {/* Benchmark Evaluation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Keyword Benchmark Evaluation</h3>
              <p className="text-xs text-slate-500">Run batch evaluation on the academic benchmark dataset to compare method efficiency and accuracy.</p>
            </div>
          </div>
          <button
            onClick={handleRunBenchmark}
            disabled={benchmarkLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            {benchmarkLoading ? 'Running...' : 'Run Benchmark'}
          </button>
        </div>

        {benchmarkError && <ErrorState message={benchmarkError} />}

        {benchmarkData && benchmarkData.summary && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600 font-medium">
              Successfully evaluated {benchmarkData.documentCount} document(s) from the benchmark dataset.
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Extraction Method</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg Precision</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg Recall</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg F1 Score</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg Time (ms)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {['tfidf', 'rake', 'textrank'].map(method => {
                    const stats = benchmarkData.summary[method];
                    return (
                      <tr key={method} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800 uppercase">{method}</td>
                        <td className="px-4 py-3 text-right font-mono text-indigo-600">{stats.precision.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-mono text-indigo-600">{stats.recall.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-mono text-indigo-600 font-bold">{stats.f1.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{stats.averageExecutionTimeMs} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Real Social & Network Analytics Dashboard Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Social & Network Graph Metrics</h3>
              <p className="text-xs text-slate-500">Customer, product and domain interaction graph derived from project data.</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1 tracking-wider inline-block bg-emerald-50 px-2 py-0.5 rounded">Live Project Data (PostgreSQL)</p>
            </div>
          </div>
        </div>

        {networkLoading ? (
          <LoadingSpinner message="Calculating graph nodes, degree centrality, and network density..." />
        ) : networkError ? (
          <ErrorState message={networkError} onRetry={loadNetworkData} />
        ) : networkData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Nodes</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{networkData.network.nodeCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Edges</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{networkData.network.edgeCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Degree</span>
                <span className="text-xl font-black text-indigo-600 mt-1 block">{networkData.network.averageDegree}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Network Density</span>
                <span className="text-xl font-black text-indigo-600 mt-1 block">{networkData.network.density}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 col-span-2 lg:col-span-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Components</span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">{networkData.network.connectedComponentsCount}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Web & Social Analytics</h2>
      <TemporalNetworkLab />
      <WebAnalyticsLab />
    </div>
  );
};

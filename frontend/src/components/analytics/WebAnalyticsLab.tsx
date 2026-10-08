import React, { useState, useEffect } from 'react';
import { getClickstreamAnalytics, getAbTestResults, getSurveyAnalytics, runWebCrawl, getWebIndex, getWebRanking, getSeoAnalysis, searchWeb } from '../../api/webAnalytics';
import { Globe, MousePointerClick, LayoutTemplate, MessageSquare, Search, FileText, BarChart, Hash, CheckSquare } from 'lucide-react';

export const WebAnalyticsLab: React.FC = () => {
  const [clickstream, setClickstream] = useState<any>(null);
  const [abTest, setAbTest] = useState<any>(null);
  const [survey, setSurvey] = useState<any>(null);
  
  const [crawlData, setCrawlData] = useState<any>(null);
  const [indexData, setIndexData] = useState<any>(null);
  const [rankingData, setRankingData] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('hotel');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    getClickstreamAnalytics().then(setClickstream).catch(console.error);
    getAbTestResults().then(setAbTest).catch(console.error);
    getSurveyAnalytics().then(setSurvey).catch(console.error);
  }, []);

  const handleCrawlAndIndex = async () => {
    try {
      await runWebCrawl();
      const index = await getWebIndex();
      setIndexData(index);
      const rank = await getWebRanking();
      setRankingData(rank);
      const seo = await getSeoAnalysis();
      setSeoData(seo);
      
      const crawl = await runWebCrawl(); // Just to get the payload for display
      setCrawlData(crawl);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const res = await searchWeb(searchQuery);
      setSearchResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <Globe className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase">Web Analytics & Search Lab</h2>
          <p className="text-sm text-slate-500">Clickstream, A/B Testing, Web Crawling, Indexing, Search, and PageRank.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Clickstream Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 text-slate-800">
            <MousePointerClick className="w-5 h-5" />
            <h3 className="font-bold">Clickstream & Web Traffic</h3>
            <span className="ml-3 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">Academic Demonstration — Offline Sample Dataset</span>
          </div>
          {clickstream ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block uppercase">Total Sessions</span>
                  <span className="text-lg font-bold">{clickstream.total_sessions}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block uppercase">Page Views</span>
                  <span className="text-lg font-bold">{clickstream.page_views}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block uppercase">Avg Duration</span>
                  <span className="text-lg font-bold">{clickstream.avg_session_duration}s</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block uppercase">Avg Pages/Session</span>
                  <span className="text-lg font-bold">{clickstream.avg_pages_per_session}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-xs text-slate-600 mb-2 uppercase">Top Pages</h4>
                  {Object.entries(clickstream.top_pages).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span>{k}</span><span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-600 mb-2 uppercase">Sources</h4>
                  {Object.entries(clickstream.traffic_sources).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span className="capitalize">{k}</span><span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : <p className="text-xs text-slate-500">Loading clickstream data...</p>}
        </div>

        {/* Section 2 & 3: A/B Testing & Surveys */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 text-slate-800">
              <LayoutTemplate className="w-5 h-5" />
              <h3 className="font-bold">A/B Testing</h3>
            </div>
            {abTest ? (
              <div className="text-sm">
                <p className="text-[10px] text-amber-600 font-semibold mb-3 uppercase bg-amber-50 p-2 rounded">Demonstration result — statistical significance not established.</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-xl border ${abTest.winner === 'Variant A' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <span className="font-bold block mb-1">Variant A</span>
                    <span className="text-xs text-slate-500">Conv. Rate: <b className="text-slate-800">{(abTest.variantA.conversionRate * 100).toFixed(1)}%</b></span>
                  </div>
                  <div className={`p-3 rounded-xl border ${abTest.winner === 'Variant B' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <span className="font-bold block mb-1">Variant B</span>
                    <span className="text-xs text-slate-500">Conv. Rate: <b className="text-slate-800">{(abTest.variantB.conversionRate * 100).toFixed(1)}%</b></span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                  <span className="font-semibold text-slate-700">Winner: {abTest.winner}</span>
                  <span className="text-indigo-600 font-bold">Lift: {(abTest.lift * 100).toFixed(1)}%</span>
                </div>
              </div>
            ) : <p className="text-xs text-slate-500">Loading A/B test data...</p>}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 text-slate-800">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-bold">Online Survey Analytics</h3>
              <span className="ml-3 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">Academic Demonstration — Offline Sample Dataset</span>
            </div>
            {survey ? (
              <div className="text-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold">
                    Score: {survey.average_score}/5
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{survey.total_responses} Responses</span>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-600 mb-2 uppercase">Distribution</h4>
                  {Object.entries(survey.distribution).sort((a,b) => Number(b[0]) - Number(a[0])).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between items-center text-xs py-1">
                      <span className="text-slate-600">{k} Stars</span>
                      <div className="w-2/3 h-2 bg-slate-100 rounded overflow-hidden flex-1 mx-3">
                        <div className="h-full bg-indigo-400" style={{width: `${(v / survey.total_responses) * 100}%`}}></div>
                      </div>
                      <span className="font-bold text-slate-800 w-6 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-xs text-slate-500">Loading survey data...</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Web Search & Retrieval</h3>
              <p className="text-xs text-slate-400">TF-IDF Indexing + PageRank Ranking</p>
              <p className="text-[10px] font-bold text-amber-500 uppercase mt-1">Academic Demonstration Corpus</p>
            </div>
          </div>
          <button onClick={handleCrawlAndIndex} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold transition">
            Run Web Crawl & Index
          </button>
        </div>

        {crawlData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Crawled Pages</h4>
                <div className="space-y-3">
                  {Object.values(crawlData.pages).map((p: any) => (
                    <div key={p.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-xs">
                      <div className="font-bold text-indigo-300 mb-1">{p.id}</div>
                      <div className="text-slate-300 mb-2 truncate">{p.title}</div>
                      <div className="flex gap-4 text-slate-500 font-mono">
                        <span>Words: {p.word_count}</span>
                        <span>Links: {p.links.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><Hash className="w-4 h-4"/> Inverted Index Snippet</h4>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 max-h-48 overflow-y-auto">
                  {indexData?.index && Object.entries(indexData.index).slice(0, 15).map(([term, docs]: any) => (
                    <div key={term} className="mb-1">
                      <span className="text-emerald-400">{term}:</span> [{docs.join(', ')}]
                    </div>
                  ))}
                  <div className="text-slate-600 mt-2">... (truncated)</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-800 pt-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><BarChart className="w-4 h-4"/> PageRank Scores</h4>
                <table className="w-full text-xs text-left text-slate-300 border-collapse">
                  <thead className="bg-slate-800 text-slate-500">
                    <tr>
                      <th className="p-2 border border-slate-700">Rank</th>
                      <th className="p-2 border border-slate-700">Page</th>
                      <th className="p-2 border border-slate-700">In</th>
                      <th className="p-2 border border-slate-700">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData?.pagerank?.map((r: any) => (
                      <tr key={r.page}>
                        <td className="p-2 border border-slate-700 font-bold text-white">{r.rank}</td>
                        <td className="p-2 border border-slate-700">{r.page}</td>
                        <td className="p-2 border border-slate-700">{r.inbound_links}</td>
                        <td className="p-2 border border-slate-700 text-indigo-300">{r.pagerank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> SEO Analysis</h4>
                <table className="w-full text-xs text-left text-slate-300 border-collapse">
                  <thead className="bg-slate-800 text-slate-500">
                    <tr>
                      <th className="p-2 border border-slate-700">Page</th>
                      <th className="p-2 border border-slate-700">Score</th>
                      <th className="p-2 border border-slate-700">Title</th>
                      <th className="p-2 border border-slate-700">Desc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoData?.seo_analysis?.map((s: any) => (
                      <tr key={s.page}>
                        <td className="p-2 border border-slate-700">{s.page}</td>
                        <td className="p-2 border border-slate-700 font-bold text-emerald-400">{s.seo_score}</td>
                        <td className="p-2 border border-slate-700">{s.title_present ? '✓' : '✗'}</td>
                        <td className="p-2 border border-slate-700">{s.meta_desc_present ? '✓' : '✗'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Search Query</h4>
              <div className="flex space-x-3 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white p-3 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Enter keywords..."
                />
                <button onClick={handleSearch} disabled={searchLoading} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm transition">
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults && searchResults.results && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 mb-2">Found {searchResults.results.length} result(s)</div>
                  {searchResults.results.map((res: any, idx: number) => (
                    <div key={res.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-indigo-400 font-bold text-base">{res.title} <span className="text-xs text-slate-500 font-mono ml-2">{res.id}</span></h5>
                        <span className="bg-slate-900 px-2 py-1 rounded text-xs font-mono text-emerald-400">Score: {res.final_score.toFixed(4)}</span>
                      </div>
                      <p className="text-sm text-slate-300">{res.snippet}</p>
                      <div className="flex gap-4 mt-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        <span>TF-IDF: {res.relevance}</span>
                        <span>PageRank: {res.pagerank}</span>
                      </div>
                    </div>
                  ))}
                  {searchResults.results.length === 0 && (
                    <div className="p-6 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                      No matching documents found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

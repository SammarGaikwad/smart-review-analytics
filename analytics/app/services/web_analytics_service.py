import json
import os
import re
import math
from typing import Dict, List, Any
from collections import defaultdict

class WebAnalyticsService:
    def __init__(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "datasets"))
        self.crawled_pages = {}
        self.inverted_index = defaultdict(list)
        self.pagerank_scores = {}
        self.link_graph = {}
        self.tf_idf = {}

    def get_clickstream_analytics(self) -> Dict[str, Any]:
        file_path = os.path.join(self.base_dir, "clickstream_sample.json")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return {"error": "Clickstream data not found"}

        sessions = set()
        events = len(data)
        page_views = sum(1 for d in data if d["event"] == "page_view")
        
        pages = defaultdict(int)
        sources = defaultdict(int)
        session_durations = defaultdict(int)
        session_events = defaultdict(int)

        for d in data:
            s_id = d["sessionId"]
            sessions.add(s_id)
            pages[d["page"]] += 1
            sources[d["source"]] += 1
            session_durations[s_id] += d.get("duration", 0)
            session_events[s_id] += 1

        total_sessions = len(sessions)
        avg_duration = sum(session_durations.values()) / total_sessions if total_sessions else 0
        avg_pages = page_views / total_sessions if total_sessions else 0

        return {
            "total_sessions": total_sessions,
            "total_events": events,
            "page_views": page_views,
            "avg_session_duration": round(avg_duration, 2),
            "avg_pages_per_session": round(avg_pages, 2),
            "top_pages": dict(sorted(pages.items(), key=lambda x: x[1], reverse=True)),
            "traffic_sources": dict(sorted(sources.items(), key=lambda x: x[1], reverse=True))
        }

    def get_ab_test_results(self) -> Dict[str, Any]:
        # Demonstration A/B testing stats
        variant_a = {"sessions": 1200, "conversions": 45}
        variant_b = {"sessions": 1250, "conversions": 65}
        
        rate_a = variant_a["conversions"] / variant_a["sessions"]
        rate_b = variant_b["conversions"] / variant_b["sessions"]
        
        lift = (rate_b - rate_a) / rate_a if rate_a > 0 else 0
        
        return {
            "variantA": {**variant_a, "conversionRate": round(rate_a, 4)},
            "variantB": {**variant_b, "conversionRate": round(rate_b, 4)},
            "lift": round(lift, 4),
            "winner": "Variant B" if rate_b > rate_a else "Variant A"
        }

    def get_survey_analytics(self) -> Dict[str, Any]:
        file_path = os.path.join(self.base_dir, "survey_sample.json")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return {"error": "Survey data not found"}
            
        responses = len(data)
        avg_score = sum(d["rating"] for d in data) / responses if responses else 0
        
        distribution = defaultdict(int)
        for d in data:
            distribution[str(d["rating"])] += 1
            
        return {
            "total_responses": responses,
            "average_score": round(avg_score, 2),
            "distribution": dict(distribution)
        }

    def crawl_pages(self):
        self.crawled_pages.clear()
        self.link_graph.clear()
        
        web_dir = os.path.join(self.base_dir, "web_pages")
        if not os.path.exists(web_dir):
            return {"error": "Web pages directory not found"}
            
        for filename in os.listdir(web_dir):
            if not filename.endswith(".html"):
                continue
                
            file_path = os.path.join(web_dir, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                html = f.read()
                
            title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
            title = title_match.group(1) if title_match else "No Title"
            
            desc_match = re.search(r"<meta name=\"description\" content=\"(.*?)\">", html, re.IGNORECASE)
            desc = desc_match.group(1) if desc_match else ""
            
            links = re.findall(r"<a href=\"(.*?)\">", html, re.IGNORECASE)
            
            # Extract basic text (remove tags)
            text = re.sub(r"<[^>]+>", " ", html)
            text = " ".join(text.split())
            
            # Count headings
            headings = len(re.findall(r"<h[1-6].*?>", html, re.IGNORECASE))
            
            page_id = filename
            
            self.crawled_pages[page_id] = {
                "id": page_id,
                "title": title,
                "description": desc,
                "links": links,
                "text": text,
                "word_count": len(text.split()),
                "headings": headings
            }
            self.link_graph[page_id] = links
            
        self._build_index()
        self._calculate_pagerank()
        
        return {"pages_crawled": len(self.crawled_pages), "pages": self.crawled_pages}

    def _build_index(self):
        self.inverted_index.clear()
        self.tf_idf.clear()
        
        stopwords = {"the", "and", "is", "in", "to", "of", "a", "our", "are"}
        df = defaultdict(int)
        tf = defaultdict(lambda: defaultdict(int))
        
        total_docs = len(self.crawled_pages)
        
        for doc_id, doc_data in self.crawled_pages.items():
            words = re.findall(r"\b\w+\b", doc_data["text"].lower())
            unique_words_in_doc = set()
            for w in words:
                if w not in stopwords:
                    tf[doc_id][w] += 1
                    unique_words_in_doc.add(w)
                    self.inverted_index[w].append(doc_id)
            
            for w in unique_words_in_doc:
                df[w] += 1
                
        # Deduplicate index
        for w in self.inverted_index:
            self.inverted_index[w] = list(set(self.inverted_index[w]))
            
        # Calc TF-IDF
        for doc_id, doc_tf in tf.items():
            self.tf_idf[doc_id] = {}
            for w, freq in doc_tf.items():
                tfidf_val = (freq / len(doc_tf)) * math.log(total_docs / df[w])
                self.tf_idf[doc_id][w] = tfidf_val

    def get_index(self):
        if not self.inverted_index:
            self.crawl_pages()
        # Sort words alphabetically
        sorted_index = {k: v for k, v in sorted(self.inverted_index.items())}
        return {"index": sorted_index}

    def _calculate_pagerank(self, iterations=10, d=0.85):
        if not self.crawled_pages:
            return
            
        nodes = list(self.crawled_pages.keys())
        n = len(nodes)
        
        self.pagerank_scores = {node: 1.0/n for node in nodes}
        
        for _ in range(iterations):
            new_pr = {}
            for node in nodes:
                # Find inbound links
                inbound = []
                for src, dests in self.link_graph.items():
                    if node in dests:
                        inbound.append(src)
                        
                pr_sum = 0
                for inc in inbound:
                    out_links = len(self.link_graph[inc])
                    if out_links > 0:
                        pr_sum += self.pagerank_scores[inc] / out_links
                        
                new_pr[node] = (1 - d)/n + d * pr_sum
                
            self.pagerank_scores = new_pr

    def get_pagerank(self):
        if not self.pagerank_scores:
            self.crawl_pages()
            
        result = []
        for node in self.crawled_pages.keys():
            inbound = sum(1 for srcs, dests in self.link_graph.items() if node in dests)
            outbound = len(self.link_graph.get(node, []))
            
            result.append({
                "page": node,
                "inbound_links": inbound,
                "outbound_links": outbound,
                "pagerank": round(self.pagerank_scores.get(node, 0), 4)
            })
            
        # Sort by PR
        result.sort(key=lambda x: x["pagerank"], reverse=True)
        for i, item in enumerate(result):
            item["rank"] = i + 1
            
        return {"pagerank": result}

    def search(self, query: str):
        if not self.crawled_pages:
            self.crawl_pages()
            
        query_words = re.findall(r"\b\w+\b", query.lower())
        
        results = []
        for doc_id, doc_data in self.crawled_pages.items():
            text_score = 0
            for w in query_words:
                text_score += self.tf_idf.get(doc_id, {}).get(w, 0)
                
            if text_score > 0:
                pr_score = self.pagerank_scores.get(doc_id, 0)
                final_score = 0.7 * text_score + 0.3 * pr_score
                
                results.append({
                    "id": doc_id,
                    "title": doc_data["title"],
                    "relevance": round(text_score, 4),
                    "pagerank": round(pr_score, 4),
                    "final_score": round(final_score, 4),
                    "snippet": doc_data["text"][:100] + "..."
                })
                
        results.sort(key=lambda x: x["final_score"], reverse=True)
        return {"results": results, "query": query}

    def get_seo_analysis(self):
        if not self.crawled_pages:
            self.crawl_pages()
            
        results = []
        for doc_id, data in self.crawled_pages.items():
            has_title = len(data["title"]) > 0 and data["title"] != "No Title"
            has_desc = len(data["description"]) > 0
            has_headings = data["headings"] > 0
            
            score = 0
            if has_title: score += 40
            if has_desc: score += 30
            if has_headings: score += 20
            if data["word_count"] > 10: score += 10
            
            results.append({
                "page": doc_id,
                "title_present": has_title,
                "meta_desc_present": has_desc,
                "headings_present": has_headings,
                "links": len(data["links"]),
                "seo_score": score
            })
            
        return {"seo_analysis": results}

web_analytics_service = WebAnalyticsService()

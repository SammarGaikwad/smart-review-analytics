# ASTMA Web Analytics & Search Lab

## 1. Objective
This document outlines the ASTMA Unit IV enhancements focusing on Web Analytics, Search Engines, Indexing, and Link Ranking. It implements a fully functioning academic "Web Analytics & Search Lab" designed strictly as a scalable educational demonstration of fundamental internet architectures and user traffic analysis.

## 2. Clickstream & Web Traffic Analysis
The **Clickstream Analytics** module ingests a structured JSON payload representing user sessions, timestamps, page paths, and traffic sources. It demonstrates core aggregation principles:
- **Session Identification:** Distinguishes unique browser visits.
- **Page Views & Source Tracking:** Evaluates traffic routing (e.g., Direct, Internal, Organic).
- **Time Analytics:** Calculates average session duration by differentiating sequential event timestamps.

## 3. A/B Testing
The **A/B Testing** demonstration compares two separate UI variants conceptually. It explicitly calculates:
- Base Conversion Rates (Conversions / Sessions)
- Relative Lift between variants

*Disclaimer:* Given the small demonstrative sample sizes, this implementation explicitly flags that statistical significance (e.g., p-values, t-tests) is not verified, conforming to rigorous academic honesty.

## 4. Online Surveys
The **Survey Analytics** module ingests small-scale response data (Likert scale / 1-5 ratings), calculating distribution densities, response counts, and weighted score averages to map qualitative user feedback into quantitative analytic blocks.

## 5. Web Crawling
A purely academic, self-contained Python **Web Crawler** was engineered. Instead of traversing the uncontrolled open web (which violates safety and robots.txt constraints), the crawler parses an isolated corpus of local `.html` files (`datasets/web_pages/`).
It parses structural DOM nodes:
- `<title>` for Headings.
- `<meta name="description">` for Summaries.
- `<a href="...">` for Link Graph Extraction.
- Standard Regex for stripping boilerplate HTML to extract raw text logic.

## 6. Web Indexing
The crawler automatically executes **Inverted Indexing**:
- Tokenization via standard word boundary regex.
- Normalization (lowercasing).
- Stopword elimination.
- Term-to-Document mapping (Inverted Index).

## 7. Search Engine & Retrieval
The API provides a fully operational `/search` endpoint using the inverted index to rapidly recall candidate documents.

## 8. Ranking Algorithms
Retrieved documents are scored using a dual-factor ranking equation:
`Final Score = 0.7 * TF-IDF (Text Relevance) + 0.3 * PageRank (Link Authority)`

- **TF-IDF Relevance:** Calculates exact term frequency vs. inverse document frequency.
- **PageRank:** Employs an iterative Power Method simulation (default 10 iterations, damping factor 0.85) to calculate structural link authority.

## 9. SEO Analysis
The **SEO Analyzer** assigns arbitrary numerical weights verifying structural integrity:
- Title Tag Presence
- Meta Description Presence
- Sufficient Word Counts
- Outbound Links
- Heading Tags (`<h1>` - `<h6>`)

*Note:* This does not represent Google's proprietary algorithm, but rather demonstrates the mechanical parsing required for Search Engine Optimization auditing.

## 10. ASTMA Unit IV Traceability
- **Web analytics tools** → Evaluated via the overarching UI Dashboard.
- **Clickstream analysis** → Implemented in `get_clickstream_analytics()`.
- **A/B testing** → Implemented in `get_ab_test_results()`.
- **Online surveys** → Implemented in `get_survey_analytics()`.
- **Web search and retrieval** → Handled securely via the local Search/Retrieval API.
- **Search engine optimization** → Represented by the SEO extraction module.
- **Web crawling** → HTML local parsing and link extraction.
- **Web indexing** → TF-IDF & Inverted Index JSON formulation.
- **Ranking algorithms** → Compound TF-IDF + Iterative PageRank structure.
- **Web traffic models** → Derived inherently via Clickstream tracking logic.

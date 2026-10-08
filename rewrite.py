import re

with open('frontend/src/pages/AnalyticsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ASTMA and syllabus strings
content = content.replace('ASTMA Keyword Benchmark Evaluation', 'Keyword Benchmark Evaluation')
content = content.replace('ASTMA Topic Modeling / Taxonomy Lab', 'Topic Analysis & Taxonomy Lab')
content = content.replace('ASTMA Review Clustering — K-Means Lab', 'Review Clustering (K-Means)')
content = content.replace('ASTMA Social & Network Graph Metrics', 'Social & Network Graph Metrics')
content = content.replace('ASTMA VADER NLP Engine Live Test', 'Real-Time Sentiment Analysis (VADER)')
content = content.replace('{/* ASTMA', '{/*')

# Split the sections
h2_idx = content.find('<h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Review Intelligence</h2>')

if h2_idx != -1:
    pre_content = content[:h2_idx]
    post_content = content[h2_idx:]
    
    def extract_block(start_comment, end_comment=None):
        global post_content
        idx = post_content.find(start_comment)
        if idx == -1: return ''
        if end_comment:
            end_idx = post_content.find(end_comment, idx)
            if end_idx == -1: return ''
            block = post_content[idx:end_idx]
            post_content = post_content[:idx] + post_content[end_idx:]
            return block
        else:
            next_idx = post_content.find('{/*', idx + 10)
            if next_idx == -1:
                block = post_content[idx:post_content.rfind('</div>')]
                post_content = post_content[:idx] + post_content[post_content.rfind('</div>'):]
            else:
                block = post_content[idx:next_idx]
                post_content = post_content[:idx] + post_content[next_idx:]
            return block

    b_keyword = extract_block('{/* Keyword Extraction Comparison */}')
    b_benchmark = extract_block('{/* Benchmark Evaluation */}')
    b_topic = extract_block('{/* Topic Modeling (Taxonomy) Lab */}')
    b_cluster = extract_block('{/* Review Clustering — K-Means Lab */}')
    
    b_network = extract_block('{/* Social & Network Analytics Dashboard Card */}', '{/* Live VADER')
    if not b_network: b_network = extract_block('{/* Real Social & Network Analytics Dashboard Card */}')
    
    b_vader = extract_block('{/* Live VADER')
    b_sentiment_pred = extract_block('{/* Sentiment Prediction & Model Comparison */}')
    
    b_temporal = ''
    if '<TemporalNetworkLab />' in post_content:
        b_temporal = '<TemporalNetworkLab />\n      '
        post_content = post_content.replace('<TemporalNetworkLab />', '')
    
    b_web = ''
    if '<WebAnalyticsLab />' in post_content:
        b_web = '<WebAnalyticsLab />\n    '
        post_content = post_content.replace('<WebAnalyticsLab />', '')

    new_body = """
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Review Intelligence</h2>
      """ + b_vader + b_keyword + b_topic + b_sentiment_pred + """
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Advanced Analytics</h2>
      """ + b_cluster + b_benchmark + b_network + b_temporal + """
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Web & Social Analytics</h2>
      """ + b_web

    pre_content = pre_content.replace('<h2 className="text-2xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">Review Intelligence</h2>', '')

    final_content = pre_content + new_body + "\n    </div>\n  );\n};\n"
    
    with open('frontend/src/pages/AnalyticsPage.tsx', 'w', encoding='utf-8') as f:
        f.write(final_content)
    print('Rewrote AnalyticsPage.tsx successfully!')

# Chat Analyzer - Project Documentation

## 1. Project Overview
**Chat Analyzer** is a privacy-first web application designed to analyze ChatGPT chat history files (`.json` or `.txt`). It provides users with deep insights into their communication patterns, emotional sentiment, and key discussion topics.

The application emphasizes **privacy** by performing initial parsing in the browser and explicitly stating that no data is sent to external servers for storage (though it uses an LLM integration for analysis).

## 2. Technology Stack
- **Frontend Framework**: React
- **Routing**: `react-router-dom`
- **Styling**: Tailwind CSS (Custom "Neo-Brutalism" design system)
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **State Management & Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **Backend/API Integration**: `base44` SDK (likely a custom or internal platform)
  - `base44.entities.ChatAnalysis`: Database entity for storing analysis results.
  - `base44.integrations.Core.InvokeLLM`: AI integration for generating insights.

## 3. Design System
The project features a distinct **Neo-Brutalism** aesthetic characterized by:
- **High Contrast**: Black borders (`border-3`, `border-4`), white/black text.
- **Vibrant Colors**:
  - Primary Blue: `#0066FF`
  - Accent Pink: `#FF006E`
  - Accent Green: `#39FF14`
  - Accent Yellow: `#FFD600`
- **Shadows**: Hard, offset shadows (e.g., `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`).
- **Typography**: Bold, uppercase headings and clear sans-serif text.

## 4. Key Features & Modules

### 4.1. Upload & Analysis (`pages/Upload.js`)
- **Functionality**:
  - Accepts `.json` (ChatGPT export) or `.txt` files.
  - Parses chat history client-side.
  - Intelligently samples messages to fit context windows.
  - Sends sampled data to an LLM via `base44.integrations.Core.InvokeLLM` to generate:
    - Top Topics (with keywords)
    - Sentiment Breakdown
    - Key Insights
    - Improvement Suggestions
    - Behavioral Patterns
  - Saves results to `ChatAnalysis` entity.
- **Privacy**: Emphasizes "Privacy First" approach.

### 4.2. Dashboard (`pages/Dashboard.js`)
- **Functionality**:
  - Displays a high-level overview of the analysis.
  - **Visualizations**:
    - Sentiment Pie Chart.
    - Top Topics Bar Chart.
  - **Stats**: Total messages, peak activity time, top topics count.
  - **Insights**: Lists key insights and behavioral patterns (recurring themes).
  - Allows switching between different analysis results.

### 4.3. Topics Explorer (`pages/Topics.js`)
- **Functionality**:
  - Lists all identified topics from the analysis.
  - Search functionality to filter topics.
  - Visual "mentions" bar for each topic.
  - Navigates to `TopicDetail` on click.
- **Note**: `pages/TopicChat.js` appears to be a duplicate of this file (potential cleanup needed).

### 4.4. Topic Detail (`pages/TopicDetail.js`)
- **Functionality**:
  - Deep dive into a specific topic.
  - Shows sentiment specific to that topic.
  - Filters global insights, suggestions, and themes to show only those relevant to the selected topic.
  - Provides a focused view of how the user engages with that specific subject.

### 4.5. Growth Insights (`pages/Insights.js`)
- **Functionality**:
  - Focuses on actionable improvement.
  - Categorizes suggestions by priority (High, Medium, Low).
  - **AI Action Plans**: Users can click "Get Action Plan" on any suggestion to generate a detailed, step-by-step guide using the LLM.
  - Action plans include root cause analysis, quick wins, long-term strategy, and success metrics.

## 5. File Structure
```
/
├── components/
│   └── SocialShare.js       # Component for sharing results
├── pages/
│   ├── Dashboard.js         # Main analysis overview
│   ├── Insights.js          # Actionable growth plans
│   ├── TopicChat.js         # (Duplicate of Topics.js)
│   ├── TopicDetail.js       # Detailed topic view
│   ├── Topics.js            # Topics list and search
│   └── Upload.js            # File upload and processing logic
├── layout.js                # Main application wrapper with navigation
└── Entities/
    └── ChatAnalysis.json    # Schema definition for analysis data
```

## 6. Data Schema (`ChatAnalysis`)
Based on usage, the `ChatAnalysis` entity contains:
- `file_name`: String
- `total_messages`: Number
- `date_range`: String
- `top_topics`: Array of `{ topic, count, keywords[] }`
- `sentiment_breakdown`: Object `{ positive, neutral, negative }`
- `key_insights`: Array of Strings
- `improvement_suggestions`: Array of `{ category, suggestion, priority }`
- `patterns`: Object `{ peak_activity_time, average_session_length, recurring_themes[] }`

## 7. Recommendations
- **Cleanup**: `pages/TopicChat.js` seems to be a copy of `pages/Topics.js`. Verify if it's needed or if it should be implemented differently.
- **Error Handling**: The `Upload.js` handles LLM errors gracefully, but ensure `base44` client initialization is robust.

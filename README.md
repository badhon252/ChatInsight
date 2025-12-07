# Chat Analyzer - Project Documentation

## 1. Project Overview
**Chat Analyzer** is a privacy-first web application designed to analyze ChatGPT chat history files (`.json` or `.txt`). It provides users with deep insights into their communication patterns, emotional sentiment, and key discussion topics.

The application operates entirely in the browser (Frontend-Only), ensuring that your personal chat data is never stored on an external server. AI analysis is performed by directly connecting to the OpenAI API from your browser.

## 2. Technology Stack
- **Frontend Framework**: React
- **Routing**: `react-router-dom`
- **Styling**: Tailwind CSS (Custom "Neo-Brutalism" design system)
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **State Management & Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **API Integration**: Direct OpenAI API calls via `fetch`
- **Persistence**: Browser `localStorage`

## 3. Architecture & Data Flow
This application uses a **Serverless / Frontend-Only** architecture:
1.  **Input**: User uploads a chat history file.
2.  **Processing**: File is parsed locally in the browser.
3.  **Analysis**: The app sends a request to OpenAI's API (using your personal API key) to generate insights.
4.  **Storage**: Analysis results are saved to `localStorage` in your browser.
5.  **Visualization**: The app reads from `localStorage` to display dashboards and charts.

**Security Note**: Your OpenAI API key is stored in a `.env` file. Since this is a client-side app, ensure you do not expose this key if deploying to a public URL. This setup is best suited for local usage.

## 4. Key Features & Modules

### 4.1. Upload & Analysis (`pages/Upload.jsx`)
- **Functionality**:
  - Accepts `.json` (ChatGPT export) or `.txt` files.
  - Parses chat history client-side.
  - Intelligently samples messages to fit context windows.
  - Sends sampled data to OpenAI via `apiClient` to generate:
    - Top Topics (with keywords)
    - Sentiment Breakdown
    - Key Insights
    - Improvement Suggestions
    - Behavioral Patterns
  - Saves results to `localStorage`.

### 4.2. Dashboard (`pages/Dashboard.jsx`)
- **Functionality**:
  - Displays a high-level overview of the analysis.
  - **Visualizations**:
    - Sentiment Pie Chart.
    - Top Topics Bar Chart.
  - **Stats**: Total messages, peak activity time, top topics count.
  - **Insights**: Lists key insights and behavioral patterns (recurring themes).
  - Allows switching between different analysis results.

### 4.3. Topics Explorer (`pages/Topics.jsx`)
- **Functionality**:
  - Lists all identified topics from the analysis.
  - Search functionality to filter topics.
  - Visual "mentions" bar for each topic.
  - Navigates to `TopicDetail` on click.

### 4.4. Topic Detail (`pages/TopicDetail.jsx`)
- **Functionality**:
  - Deep dive into a specific topic.
  - Shows sentiment specific to that topic.
  - Filters global insights, suggestions, and themes to show only those relevant to the selected topic.

### 4.5. Growth Insights (`pages/Insights.jsx`)
- **Functionality**:
  - Focuses on actionable improvement.
  - Categorizes suggestions by priority (High, Medium, Low).
  - **AI Action Plans**: Users can click "Get Action Plan" on any suggestion to generate a detailed, step-by-step guide using the LLM.

## 5. File Structure
```
/
├── .env                 # API Key configuration
├── src/
│   ├── api/
│   │   └── apiClient.js # Client-side API logic (OpenAI + LocalStorage)
│   ├── components/
│   │   ├── ui/          # Reusable UI components (Button, Input, Alert)
│   │   └── SocialShare.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Insights.jsx
│   │   ├── TopicDetail.jsx
│   │   ├── Topics.jsx
│   │   └── Upload.jsx
│   ├── App.jsx          # Router configuration
│   ├── main.jsx         # Entry point
│   └── utils.js         # Utility functions
└── Entities/
    └── ChatAnalysis.json # Schema definition (reference)
```

## 6. Setup & Running
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Configure API Key**:
    - Create a `.env` file in the root directory.
    - Add your OpenAI API key: `VITE_OPENAI_API_KEY=sk-...`
3.  **Run Locally**:
    ```bash
    npm run dev
    ```

// Client-side implementation of API client using localStorage and OpenAI API

const STORAGE_KEY = 'chat_analyses';

export const apiClient = {
  entities: {
    ChatAnalysis: {
      list: async (sort) => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          let analyses = stored ? JSON.parse(stored) : [];
          
          // Basic sorting implementation
          if (sort === '-created_date') {
            analyses.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          }
          
          return analyses;
        } catch (error) {
          console.error("Error listing analyses:", error);
          return [];
        }
      },
      create: async (data) => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const analyses = stored ? JSON.parse(stored) : [];
          
          const newAnalysis = {
            ...data,
            id: crypto.randomUUID(),
            created_date: new Date().toISOString()
          };
          
          analyses.unshift(newAnalysis);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
          
          return newAnalysis;
        } catch (error) {
          console.error("Error creating analysis:", error);
          throw error;
        }
      }
    }
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, response_json_schema }) => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
          throw new Error("Missing OpenAI API Key. Please add VITE_OPENAI_API_KEY to your .env file.");
        }

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini", // Using a widely available, capable model
              messages: [
                {
                  role: "system",
                  content: "You are a helpful assistant designed to output JSON."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              response_format: { type: "json_object" }
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
          }

          const data = await response.json();
          const content = data.choices[0].message.content;
          
          return JSON.parse(content);
        } catch (error) {
          console.error("LLM Invocation Error:", error);
          throw error;
        }
      }
    }
  }
};

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiClient } from "@/api/apiClient";
import { Upload as UploadIcon, FileText, AlertCircle, Sparkles, Shield, Zap, Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/json" || droppedFile.name.endsWith(".txt") || droppedFile.name.endsWith(".json"))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a JSON or TXT file containing your chat history");
    }
  }, []);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(10);
    setError(null); // Reset error state at the beginning of processing

    try {
      // Read file content
      const text = await file.text();
      setProgress(30);

      let messages = [];
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(text);
        messages = Array.isArray(parsed) ? parsed : parsed.messages || [];
      } catch {
        // If not JSON, treat as plain text and split by lines
        messages = text.split("\n").filter(line => line.trim());
      }

      if (messages.length === 0) {
        throw new Error("No messages found in the file");
      }

      setProgress(50);

      // Sample messages intelligently for large datasets
      const sampleMessages = (msgs, maxSamples = 40) => { // Reduced from 50 to 40
        if (msgs.length <= maxSamples) return msgs;
        
        const step = Math.max(1, Math.floor(msgs.length / maxSamples));
        const sampled = [];
        for (let i = 0; i < msgs.length; i += step) {
          if (sampled.length >= maxSamples) break;
          sampled.push(msgs[i]);
        }
        return sampled;
      };

      // Extract text content only, not full JSON
      const extractContent = (msg) => {
        const MAX_CHARS = 300; // Reduced from 500 to 300
        if (typeof msg === 'string') return msg.slice(0, MAX_CHARS);
        if (msg && typeof msg === 'object') {
          if (msg.content) return String(msg.content).slice(0, MAX_CHARS);
          if (msg.text) return String(msg.text).slice(0, MAX_CHARS);
          if (msg.message) return String(msg.message).slice(0, MAX_CHARS);
          if (msg.value) return String(msg.value).slice(0, MAX_CHARS);
          try {
            const jsonString = JSON.stringify(msg);
            return jsonString.slice(0, MAX_CHARS);
          } catch {
            return "[Unextractable content]";
          }
        }
        return String(msg).slice(0, MAX_CHARS);
      };

      const sampledMessages = sampleMessages(messages, 40);
      const messageContents = sampledMessages.map(extractContent).join("\n---\n");

      // Analyze with AI
      const analysisPrompt = `You are an expert communication analyst. Analyze this chat history deeply and provide comprehensive, actionable insights.

DATASET INFORMATION:
- Total messages: ${messages.length}
- Sample size: ${sampledMessages.length} messages (evenly distributed across entire history)

SAMPLE MESSAGES:
${messageContents}

ANALYSIS REQUIREMENTS:

Analyze the conversation patterns, topics, sentiment, and behavioral trends. Return detailed insights in JSON format:

1. **top_topics**: Array of 6-10 most discussed topics
   - Each topic should have: {topic, count, keywords[]}
   - Topics should be specific and meaningful (e.g., "Career Development" not just "Work")
   - Include 3-5 relevant keywords per topic that capture the essence of discussions

2. **sentiment_breakdown**: {positive, neutral, negative} 
   - Percentages that total 100%
   - Reflect the overall emotional tone across conversations

3. **key_insights**: Array of 7-10 deep insights about communication patterns
   - Be specific about what the patterns reveal
   - Focus on behavioral trends, communication style, topics of concern/interest
   - Examples: "Shows persistent interest in technical problem-solving", "Frequently seeks validation on career decisions", "Demonstrates growth mindset in learning contexts"
   - Each insight should be 1-2 sentences, specific and evidence-based

4. **improvement_suggestions**: Array of 8-12 detailed, actionable recommendations
   - Each suggestion must have: {category, suggestion, priority}
   - Priority levels: "high", "medium", or "low"
   - Categories should be specific (e.g., "Technical Communication", "Career Planning", "Work-Life Balance", "Learning Strategy")
   - Suggestions must be:
     * Highly specific and personalized to their chat patterns
     * Actionable with clear next steps
     * 2-3 sentences that include WHAT to do, WHY it matters, and HOW to start
     * Evidence-based on the actual conversation content
   - Examples of good suggestions:
     * "Your conversations show frequent context-switching between topics. Consider implementing a structured note-taking system (like daily themed sessions) to maintain focus and deepen understanding in each area before moving on."
     * "You often ask similar questions across different conversations. Create a personal knowledge base to document solutions and insights, which will help you build on previous learnings rather than restarting from scratch."
   - Distribute priorities: 3-4 high, 4-6 medium, 2-3 low

5. **patterns**: Behavioral and temporal patterns
   - peak_activity_time: When they're most active (be specific, e.g., "Late evenings 9-11 PM")
   - average_session_length: Estimated typical session duration
   - recurring_themes: Array of 5-8 recurring behavioral or topical themes you notice across conversations

IMPORTANT:
- Be honest and constructive, not generic
- Ground all insights in actual conversation patterns
- Make suggestions specific enough that the user knows exactly what action to take
- Focus on growth opportunities that will genuinely help them improve
- Consider the relationship between different topics and patterns
- Identify both strengths to leverage and areas needing development`;


      setProgress(70);

      const analysis = await apiClient.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            top_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  count: { type: "number" },
                  keywords: { type: "array", items: { type: "string" } }
                }
              }
            },
            sentiment_breakdown: {
              type: "object",
              properties: {
                positive: { type: "number" },
                neutral: { type: "number" },
                negative: { type: "number" }
              }
            },
            key_insights: {
              type: "array",
              items: { type: "string" }
            },
            improvement_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  suggestion: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            patterns: {
              type: "object",
              properties: {
                peak_activity_time: { type: "string" },
                average_session_length: { type: "string" },
                recurring_themes: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setProgress(90);

      // Save to database
      const savedAnalysis = await apiClient.entities.ChatAnalysis.create({
        file_name: file.name,
        total_messages: messages.length,
        date_range: "Analyzed " + new Date().toLocaleDateString(),
        ...analysis
      });

      setProgress(100);

      // Navigate to dashboard
      setTimeout(() => {
        navigate(createPageUrl("Dashboard") + "?id=" + savedAnalysis.id);
      }, 500);

    } catch (err) {
      console.error("Analysis error:", err);
      const errorMessage = err.message || "Unknown error occurred";
      
      if (errorMessage.includes("too large") || errorMessage.includes("token") || errorMessage.includes("limit") || errorMessage.includes("context window")) {
        setError("The file content is too large for AI analysis. Try a smaller chat history file or a file with fewer words per message.");
      } else if (errorMessage.includes("parse") || errorMessage.includes("JSON") || errorMessage.includes("Unexpected token")) {
        setError("Could not parse file. Please ensure it's a valid JSON or plain text chat history.");
      } else if (errorMessage.includes("No messages found")) {
        setError("The uploaded file does not contain any recognizable chat messages.");
      } else {
        setError("Error analyzing file: " + errorMessage);
      }
      
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-[#39FF14] px-6 py-2 border-3 border-black rotate-[-2deg] mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black uppercase text-sm tracking-wider">Privacy First Analysis</p>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
            UNDERSTAND YOUR
            <br />
            <span className="text-[#FF006E]">CHAT PATTERNS</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-bold text-black/70 max-w-2xl mx-auto">
            Upload your ChatGPT history and get AI-powered insights about your conversations, topics, and growth opportunities.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, title: "100% Private", desc: "Analyzed in browser" },
            { icon: Zap, title: "AI Powered", desc: "Deep insights" },
            { icon: Sparkles, title: "Actionable", desc: "Growth tips" }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border-3 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <feature.icon className="w-8 h-8 mb-3" strokeWidth={3} />
              <h3 className="font-black text-lg mb-2">{feature.title}</h3>
              <p className="font-bold text-sm text-black/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-4 border-dashed border-black p-12 text-center transition-all
              ${dragActive ? "bg-[#0066FF]/10 scale-[1.02]" : "bg-white"}
              ${file ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"}
            `}
          >
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />

            {!file ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-[#FFD600] border-4 border-black rotate-3 flex items-center justify-center">
                  <UploadIcon className="w-10 h-10" strokeWidth={3} />
                </div>
                
                <h2 className="text-3xl font-black mb-4">DROP YOUR CHAT HISTORY</h2>
                <p className="text-lg font-bold text-black/70 mb-6">
                  Drag & drop your JSON or TXT file here
                </p>
                
                <label htmlFor="file-upload">
                  <div className="inline-block cursor-pointer">
                    <Button
                      type="button"
                      className="bg-[#FF006E] hover:bg-[#FF006E]/90 text-white border-3 border-black font-black uppercase text-lg px-8 py-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                      asChild
                    >
                      <span>BROWSE FILES</span>
                    </Button>
                  </div>
                </label>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 mx-auto bg-[#39FF14] border-4 border-black flex items-center justify-center">
                  <FileText className="w-10 h-10" strokeWidth={3} />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black mb-2">{file.name}</h3>
                  <p className="font-bold text-black/60">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {processing && (
                  <div className="space-y-3">
                    <div className="w-full bg-black/10 border-3 border-black h-8">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-[#0066FF]"
                      />
                    </div>
                    <p className="font-black text-lg">ANALYZING... {progress}%</p>
                  </div>
                )}

                {!processing && (
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => setFile(null)}
                      variant="outline"
                      className="border-3 border-black font-black uppercase px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      REMOVE
                    </Button>
                    <Button
                      onClick={processFile}
                      className="bg-[#0066FF] hover:bg-[#0066FF]/90 text-white border-3 border-black font-black uppercase px-8 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                    >
                      ANALYZE NOW
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <Alert className="border-3 border-black bg-[#FF006E]/10">
              <AlertCircle className="h-5 w-5" strokeWidth={3} />
              <AlertDescription className="font-bold">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-[#FFD600] border-3 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 className="text-2xl font-black mb-4">HOW TO EXPORT YOUR CHAT HISTORY:</h3>
          <ol className="space-y-2 font-bold text-black/80">
            <li>1. Go to ChatGPT Settings</li>
            <li>2. Click "Data Controls"</li>
            <li>3. Select "Export Data"</li>
            <li>4. Download your conversations.json file</li>
            <li>5. Upload it here for analysis!</li>
          </ol>
        </motion.div>

        {/* Sharing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-[#0066FF] border-3 border-black flex items-center justify-center flex-shrink-0">
              <Share2 className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-2">SHARE YOUR INSIGHTS</h3>
              <p className="font-bold text-black/70">
                After analyzing your chat history, you can share your results with friends and colleagues!
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#39FF14]/20 border-3 border-black p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" strokeWidth={3} />
                <h4 className="font-black text-sm uppercase">What You Can Share</h4>
              </div>
              <ul className="space-y-1 text-sm font-bold text-black/80">
                <li>• Your top discussion topics</li>
                <li>• Conversation sentiment breakdown</li>
                <li>• Key behavioral insights</li>
                <li>• Total message statistics</li>
              </ul>
            </div>

            <div className="bg-[#FFD600]/20 border-3 border-black p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" strokeWidth={3} />
                <h4 className="font-black text-sm uppercase">What Stays Private</h4>
              </div>
              <ul className="space-y-1 text-sm font-bold text-black/80">
                <li>• Your actual chat messages</li>
                <li>• Personal information</li>
                <li>• Conversation details</li>
                <li>• Original chat files</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0066FF] border-3 border-black p-4 text-center">
            <p className="font-black text-white uppercase text-sm">
              🔒 Look for the "SHARE" button on Dashboard, Topics, and Insights pages!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
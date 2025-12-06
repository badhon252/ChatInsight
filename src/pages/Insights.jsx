import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, AlertCircle, CheckCircle, ArrowUpCircle, Sparkles, ChevronDown, ChevronUp, Loader2, Target, TrendingUp, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import SocialShare from "../components/SocialShare";

export default function Insights() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [generatingGuidance, setGeneratingGuidance] = useState(null);
  const [guidanceCache, setGuidanceCache] = useState({});
  
  const queryClient = useQueryClient();

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['chat-analyses'],
    queryFn: () => base44.entities.ChatAnalysis.list('-created_date'),
    initialData: [],
  });

  useEffect(() => {
    if (analyses.length > 0 && !selectedAnalysisId) {
      setSelectedAnalysisId(analyses[0].id);
    }
  }, [analyses, selectedAnalysisId]);

  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);

  const generateActionPlan = async (suggestion, index) => {
    const cacheKey = `${selectedAnalysisId}-${index}`;
    
    if (guidanceCache[cacheKey]) {
      setExpandedSuggestion(expandedSuggestion === index ? null : index);
      return;
    }

    setGeneratingGuidance(index);
    setExpandedSuggestion(index);

    try {
      const contextPrompt = `You are an expert personal development coach. Based on the user's chat analysis data, create a detailed, comprehensive, and highly actionable growth plan.

═══════════════════════════════════════════════════════════════
CHAT ANALYSIS CONTEXT
═══════════════════════════════════════════════════════════════

OVERALL STATISTICS:
• Total Messages Analyzed: ${selectedAnalysis.total_messages}
• Analysis Period: ${selectedAnalysis.date_range}
• Peak Activity Time: ${selectedAnalysis.patterns?.peak_activity_time || 'Unknown'}
• Average Session Length: ${selectedAnalysis.patterns?.average_session_length || 'Unknown'}

SENTIMENT BREAKDOWN:
• Positive: ${selectedAnalysis.sentiment_breakdown?.positive}%
• Neutral: ${selectedAnalysis.sentiment_breakdown?.neutral}%
• Negative: ${selectedAnalysis.sentiment_breakdown?.negative}%
${selectedAnalysis.sentiment_breakdown?.negative > 40 ? '\n⚠️ High negative sentiment detected - indicates challenges or frustrations' : ''}

TOP DISCUSSION TOPICS:
${selectedAnalysis.top_topics?.slice(0, 8).map((t, i) => `${i + 1}. ${t.topic} (${t.count} mentions) - Keywords: ${t.keywords?.slice(0, 3).join(', ')}`).join('\n') || 'Not available'}

KEY INSIGHTS FROM ANALYSIS:
${selectedAnalysis.key_insights?.map((insight, i) => `${i + 1}. ${insight}`).join('\n') || 'Not available'}

RECURRING BEHAVIORAL THEMES:
${selectedAnalysis.patterns?.recurring_themes?.map((theme, i) => `• ${theme}`).join('\n') || 'Not available'}

═══════════════════════════════════════════════════════════════
SPECIFIC IMPROVEMENT AREA TO ADDRESS
═══════════════════════════════════════════════════════════════

Category: ${suggestion.category}
Priority Level: ${suggestion.priority.toUpperCase()}
Suggestion: ${suggestion.suggestion}

═══════════════════════════════════════════════════════════════
REQUIRED OUTPUT
═══════════════════════════════════════════════════════════════

Create a comprehensive, personalized action plan that includes:

1. **root_cause** (3-4 sentences): 
   - Analyze what specific patterns in their chat history reveal about why this issue exists
   - Connect it to their discussion topics, sentiment patterns, and behavioral themes
   - Be specific about the evidence from their data
   - Identify the underlying root cause, not just symptoms

2. **why_matters** (3-4 sentences):
   - Explain the real-world impact of NOT addressing this
   - Connect to their goals based on what topics they discuss most
   - Show how this affects their overall communication effectiveness
   - Make it personally relevant to THEIR specific situation

3. **quick_wins** (3-4 concrete actions):
   - Immediate, actionable steps they can take TODAY
   - Each should be specific, measurable, and take less than 30 minutes
   - Directly address the improvement area
   - Examples: "Set a 15-minute timer and brainstorm 10 specific questions about X", "Create a simple checklist with these 5 items..."
   
4. **action_steps** (5-7 detailed steps):
   - A comprehensive, progressive action plan
   - Each step should be 2-3 sentences with specific instructions
   - Include WHAT to do, HOW to do it, and WHEN to do it
   - Steps should build on each other logically
   - Be concrete - avoid vague advice like "think more" or "try harder"
   - Reference their specific chat patterns and topics
   - Examples: "Week 1: Dedicate 20 minutes each day to document your learnings about [their top topic]. Create a simple markdown file with date, topic, key learning, and one question to explore next. Review this document every Friday."

5. **long_term** (4-5 sentences):
   - Strategic approach for sustained improvement over 3-6 months
   - How to build this into their routine permanently
   - How to measure and adjust over time
   - How this connects to their broader communication goals
   - Make it sustainable and realistic

6. **success_metrics** (4-5 specific, measurable indicators):
   - Concrete ways they can track progress
   - Should be observable changes in behavior or outcomes
   - Include both quantitative (numbers) and qualitative (feelings/observations) metrics
   - Examples: "Having 3+ focused, multi-turn conversations per week on a single topic without context-switching", "Feeling more confident when discussing [topic] without needing to re-ask basic questions"

IMPORTANT GUIDELINES:
• Be direct, honest, and constructive
• Reference their ACTUAL data - topics, themes, patterns
• No generic advice - everything must be personalized to THEIR analysis
• Write in a supportive coaching tone that acknowledges their strengths
• Make action steps so specific that there's no ambiguity about what to do
• Consider their peak activity time and session length when suggesting routines
• Connect suggestions to the topics they care most about (based on frequency)`;


      const guidance = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            root_cause: { type: "string" },
            why_matters: { type: "string" },
            action_steps: {
              type: "array",
              items: { type: "string" }
            },
            quick_wins: {
              type: "array",
              items: { type: "string" }
            },
            long_term: { type: "string" },
            success_metrics: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGuidanceCache(prev => ({
        ...prev,
        [cacheKey]: guidance
      }));

    } catch (error) {
      console.error("Error generating guidance:", error);
      setExpandedSuggestion(null);
    } finally {
      setGeneratingGuidance(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-black bg-[#FFD600] animate-pulse mx-auto mb-4" />
          <p className="font-black text-2xl">LOADING...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-[#0066FF] border-4 border-black rotate-12 flex items-center justify-center">
            <Lightbulb className="w-16 h-16 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black mb-4">NO INSIGHTS YET</h2>
          <p className="text-lg font-bold text-black/70 mb-6">
            Upload your chat history to get personalized insights!
          </p>
        </motion.div>
      </div>
    );
  }

  const priorityConfig = {
    high: { color: 'bg-[#FF006E]', icon: AlertCircle },
    medium: { color: 'bg-[#FFD600]', icon: ArrowUpCircle },
    low: { color: 'bg-[#39FF14]', icon: CheckCircle }
  };

  const suggestions = selectedAnalysis?.improvement_suggestions || [];
  const highPriority = suggestions.filter(s => s.priority?.toLowerCase() === 'high');
  const mediumPriority = suggestions.filter(s => s.priority?.toLowerCase() === 'medium');
  const lowPriority = suggestions.filter(s => s.priority?.toLowerCase() === 'low');

  const shareDescription = `I got ${suggestions.length} personalized improvement suggestions from my chat analysis, including ${highPriority.length} high-priority recommendations!`;

  const SuggestionCard = ({ suggestion, index, priority }) => {
    const isExpanded = expandedSuggestion === index;
    const isGenerating = generatingGuidance === index;
    const cacheKey = `${selectedAnalysisId}-${index}`;
    const guidance = guidanceCache[cacheKey];
    const priorityStyle = priorityConfig[priority];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 ${priorityStyle.color} border-3 border-black flex items-center justify-center flex-shrink-0`}>
              <priorityStyle.icon className="w-8 h-8" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 ${priorityStyle.color} border-2 border-black font-black text-xs uppercase mb-3`}>
                {suggestion.category}
              </div>
              <p className="text-lg font-bold leading-relaxed mb-4">{suggestion.suggestion}</p>
              
              <Button
                onClick={() => generateActionPlan(suggestion, index)}
                disabled={isGenerating}
                className="bg-[#0066FF] hover:bg-[#0066FF]/90 text-white border-3 border-black font-black uppercase text-sm px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={3} />
                    GENERATING...
                  </>
                ) : (
                  <>
                    {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" strokeWidth={3} /> : <ChevronDown className="w-4 h-4 mr-2" strokeWidth={3} />}
                    {isExpanded && guidance ? "HIDE ACTION PLAN" : "GET ACTION PLAN"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && guidance && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t-4 border-black p-6 bg-[#FAFAF9] space-y-6">
                {/* Root Cause */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-[#FF006E]" strokeWidth={3} />
                    <h4 className="font-black text-sm uppercase">Root Cause Analysis</h4>
                  </div>
                  <p className="font-bold text-sm leading-relaxed text-black/80">{guidance.root_cause}</p>
                </div>

                {/* Why It Matters */}
                <div className="bg-[#FFD600]/20 border-3 border-black p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" strokeWidth={3} />
                    <h4 className="font-black text-sm uppercase">Why This Matters</h4>
                  </div>
                  <p className="font-bold text-sm leading-relaxed">{guidance.why_matters}</p>
                </div>

                {/* Quick Wins */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-[#39FF14]" strokeWidth={3} />
                    <h4 className="font-black text-sm uppercase">Quick Wins (Start Today!)</h4>
                  </div>
                  <div className="space-y-2">
                    {guidance.quick_wins?.map((win, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-[#39FF14]/20 border-2 border-black p-3">
                        <span className="font-black text-lg flex-shrink-0">⚡</span>
                        <p className="font-bold text-sm leading-relaxed">{win}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Steps */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-[#0066FF]" strokeWidth={3} />
                    <h4 className="font-black text-sm uppercase">Step-by-Step Action Plan</h4>
                  </div>
                  <div className="space-y-3">
                    {guidance.action_steps?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white border-3 border-black p-4">
                        <div className="w-8 h-8 bg-[#0066FF] border-2 border-black flex items-center justify-center flex-shrink-0">
                          <span className="font-black text-white text-sm">{idx + 1}</span>
                        </div>
                        <p className="font-bold text-sm leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Long-term Strategy */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-[#8B00FF]" strokeWidth={3} />
                    <h4 className="font-black text-sm uppercase">Long-term Strategy</h4>
                  </div>
                  <p className="font-bold text-sm leading-relaxed text-black/80">{guidance.long_term}</p>
                </div>

                {/* Success Metrics */}
                <div className="bg-[#0066FF]/10 border-3 border-black p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-[#0066FF]" strokeWidth={3} />
                    <h4 className="font-black text-sm uppercase">Track Your Progress</h4>
                  </div>
                  <div className="space-y-2">
                    {guidance.success_metrics?.map((metric, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black bg-white" />
                        <span className="font-bold text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-black mb-2 leading-none">
                GROWTH <span className="text-[#0066FF]">INSIGHTS</span>
              </h1>
              <p className="text-xl font-bold text-black/70">
                AI-powered action plans based on your chat patterns
              </p>
            </div>
            
            <div className="flex gap-3 items-start">
              {analyses.length > 1 && (
                <select
                  value={selectedAnalysisId}
                  onChange={(e) => setSelectedAnalysisId(e.target.value)}
                  className="px-4 py-3 border-3 border-black font-bold bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {analyses.map(a => (
                    <option key={a.id} value={a.id}>{a.file_name}</option>
                  ))}
                </select>
              )}
              
              <SocialShare
                title="My Growth Insights"
                description={shareDescription}
              />
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0066FF] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-white flex-shrink-0" strokeWidth={3} />
              <p className="font-black text-white text-sm uppercase">
                Click "GET ACTION PLAN" on any suggestion to receive a comprehensive, AI-generated improvement strategy!
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Priority Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'High Priority', count: highPriority.length, color: 'bg-[#FF006E]' },
            { label: 'Medium Priority', count: mediumPriority.length, color: 'bg-[#FFD600]' },
            { label: 'Low Priority', count: lowPriority.length, color: 'bg-[#39FF14]' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`${item.color} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
            >
              <p className="font-black text-sm uppercase mb-2">{item.label}</p>
              <p className="text-5xl font-black">{item.count}</p>
            </motion.div>
          ))}
        </div>

        {/* High Priority Suggestions */}
        {highPriority.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-[#FF006E]" strokeWidth={3} />
              <h2 className="text-3xl font-black">HIGH PRIORITY</h2>
            </div>
            <div className="space-y-4">
              {highPriority.map((suggestion, idx) => (
                <SuggestionCard
                  key={`high-${idx}`}
                  suggestion={suggestion}
                  index={`high-${idx}`}
                  priority="high"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Medium Priority Suggestions */}
        {mediumPriority.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <ArrowUpCircle className="w-8 h-8 text-black" strokeWidth={3} />
              <h2 className="text-3xl font-black">MEDIUM PRIORITY</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {mediumPriority.map((suggestion, idx) => (
                <SuggestionCard
                  key={`medium-${idx}`}
                  suggestion={suggestion}
                  index={`medium-${idx}`}
                  priority="medium"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Low Priority Suggestions */}
        {lowPriority.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-black" strokeWidth={3} />
              <h2 className="text-3xl font-black">LOW PRIORITY</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowPriority.map((suggestion, idx) => (
                <SuggestionCard
                  key={`low-${idx}`}
                  suggestion={suggestion}
                  index={`low-${idx}`}
                  priority="low"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 bg-[#0066FF] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
        >
          <Sparkles className="w-12 h-12 text-white mx-auto mb-4" strokeWidth={3} />
          <h3 className="text-3xl font-black text-white mb-3">READY TO LEVEL UP?</h3>
          <p className="text-lg font-bold text-white/90 max-w-2xl mx-auto">
            Each action plan is AI-generated based on your specific chat patterns. Click any suggestion above to unlock personalized, step-by-step guidance for real growth!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
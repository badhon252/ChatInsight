import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Hash, TrendingUp, Target, Lightbulb, BarChart3, Tag, AlertCircle, ArrowUpCircle, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function TopicDetail() {
  const navigate = useNavigate();
  const [topicInfo, setTopicInfo] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get("topic");
    const keywords = urlParams.get("keywords");
    const id = urlParams.get("analysisId");

    if (topic && id) {
      setTopicInfo({
        topic,
        keywords: keywords ? keywords.split(",") : []
      });
      setAnalysisId(id);
    }
  }, []);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['chat-analysis', analysisId],
    queryFn: async () => {
      if (!analysisId) return null;
      const analyses = await apiClient.entities.ChatAnalysis.list();
      return analyses.find(a => a.id === analysisId);
    },
    enabled: !!analysisId,
  });



  if (isLoading || !topicInfo || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-black bg-[#0066FF] animate-pulse mx-auto mb-4" />
          <p className="font-black text-2xl">LOADING TOPIC...</p>
        </div>
      </div>
    );
  }

  // Filter related data
  const topicKeywordsLower = topicInfo.keywords.map(k => k.toLowerCase());
  const topicLower = topicInfo.topic.toLowerCase();

  const matchesTopicKeywords = (text) => {
    const textLower = text.toLowerCase();
    return topicKeywordsLower.some(kw => textLower.includes(kw)) || textLower.includes(topicLower);
  };

  const relatedInsights = analysis.key_insights?.filter(insight => 
    matchesTopicKeywords(insight)
  ) || [];

  const relatedSuggestions = analysis.improvement_suggestions?.filter(sugg => 
    matchesTopicKeywords(sugg.category + " " + sugg.suggestion)
  ) || [];

  const relatedThemes = analysis.patterns?.recurring_themes?.filter(theme =>
    matchesTopicKeywords(theme)
  ) || [];

  const topicData = analysis.top_topics?.find(t => t.topic === topicInfo.topic) || {};

  const sentimentData = [
    { name: 'Positive', value: analysis.sentiment_breakdown?.positive || 0, color: '#39FF14' },
    { name: 'Neutral', value: analysis.sentiment_breakdown?.neutral || 0, color: '#FFD600' },
    { name: 'Negative', value: analysis.sentiment_breakdown?.negative || 0, color: '#FF006E' }
  ];

  const priorityConfig = {
    high: { color: 'bg-[#FF006E]', icon: AlertCircle, label: 'HIGH' },
    medium: { color: 'bg-[#FFD600]', icon: ArrowUpCircle, label: 'MEDIUM' },
    low: { color: 'bg-[#39FF14]', icon: CheckCircle, label: 'LOW' }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate(createPageUrl("Topics"))}
            className="mb-6 bg-white text-black border-3 border-black font-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} />
            BACK TO TOPICS
          </Button>

          <div className="bg-[#0066FF] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#FFD600] border-4 border-black flex items-center justify-center rotate-6">
                    <Hash className="w-8 h-8" strokeWidth={3} />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-none mb-2">
                      {topicInfo.topic}
                    </h1>
                    <div className="flex items-center gap-2 text-white/90">
                      <TrendingUp className="w-4 h-4" strokeWidth={3} />
                      <span className="font-black text-lg">{topicData.count || 0} mentions</span>
                    </div>
                  </div>
                </div>

                {topicInfo.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {topicInfo.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/20 border-2 border-white/50 text-white font-bold text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>


            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-6 h-6 text-[#FFD600]" strokeWidth={3} />
              <span className="font-black text-sm uppercase text-black/60">Related Insights</span>
            </div>
            <p className="text-4xl font-black">{relatedInsights.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-[#FF006E]" strokeWidth={3} />
              <span className="font-black text-sm uppercase text-black/60">Improvement Areas</span>
            </div>
            <p className="text-4xl font-black">{relatedSuggestions.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Tag className="w-6 h-6 text-[#39FF14]" strokeWidth={3} />
              <span className="font-black text-sm uppercase text-black/60">Recurring Themes</span>
            </div>
            <p className="text-4xl font-black">{relatedThemes.length}</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Sentiment for This Topic */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6" strokeWidth={3} />
              <h2 className="text-2xl font-black">OVERALL SENTIMENT</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={3}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    border: '3px solid black', 
                    borderRadius: 0,
                    fontWeight: 'bold'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {sentimentData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Behavioral Patterns */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6" strokeWidth={3} />
              <h2 className="text-2xl font-black">PATTERNS</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-black text-xs uppercase text-black/60 mb-2">Peak Activity Time</p>
                <p className="text-xl font-black">{analysis.patterns?.peak_activity_time || "N/A"}</p>
              </div>
              <div>
                <p className="font-black text-xs uppercase text-black/60 mb-2">Avg Session Length</p>
                <p className="text-xl font-black">{analysis.patterns?.average_session_length || "N/A"}</p>
              </div>
              {relatedThemes.length > 0 && (
                <div>
                  <p className="font-black text-xs uppercase text-black/60 mb-2">Related Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedThemes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#39FF14]/30 border-2 border-black font-bold text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Insights */}
        {relatedInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-8 h-8 text-[#FFD600]" strokeWidth={3} />
              <h2 className="text-3xl font-black">RELATED INSIGHTS</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedInsights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.05 }}
                  className="bg-[#FFD600]/20 border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <p className="font-bold leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-1" strokeWidth={3} />
                    <span>{insight}</span>
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Improvement Suggestions */}
        {relatedSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-[#FF006E]" strokeWidth={3} />
              <h2 className="text-3xl font-black">IMPROVEMENT SUGGESTIONS</h2>
            </div>
            <div className="space-y-4">
              {relatedSuggestions.map((suggestion, idx) => {
                const config = priorityConfig[suggestion.priority] || priorityConfig.medium;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.05 }}
                    className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${config.color} border-3 border-black flex items-center justify-center flex-shrink-0`}>
                        <config.icon className="w-6 h-6" strokeWidth={3} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 ${config.color} border-2 border-black font-black text-xs uppercase`}>
                            {config.label}
                          </span>
                          <span className="px-2 py-1 bg-black/5 border-2 border-black font-bold text-xs">
                            {suggestion.category}
                          </span>
                        </div>
                        <p className="font-bold leading-relaxed">{suggestion.suggestion}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* No Related Data */}
        {relatedInsights.length === 0 && relatedSuggestions.length === 0 && relatedThemes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-black/40" strokeWidth={3} />
            <h3 className="text-2xl font-black mb-2">LIMITED SPECIFIC DATA</h3>
            <p className="font-bold text-black/70">
              No specific insights found for this topic in your analysis. Try exploring other topics or uploading more chat data!
            </p>
          </motion.div>
        )}


      </div>
    </div>
  );
}
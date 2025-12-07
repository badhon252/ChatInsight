import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Hash, Tag, TrendingUp, Search, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SocialShare from "../components/SocialShare";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Topics() {
  const navigate = useNavigate();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['chat-analyses'],
    queryFn: () => apiClient.entities.ChatAnalysis.list('-created_date'),
    initialData: [],
  });

  useEffect(() => {
    if (analyses.length > 0 && !selectedAnalysisId) {
      setSelectedAnalysisId(analyses[0].id);
    }
  }, [analyses, selectedAnalysisId]);

  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);

  const handleTopicClick = (topic) => {
    const params = new URLSearchParams({
      topic: topic.topic,
      keywords: topic.keywords?.join(",") || "",
      analysisId: selectedAnalysisId
    });
    navigate(createPageUrl("TopicDetail") + "?" + params.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-black bg-[#39FF14] animate-pulse mx-auto mb-4" />
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
          <div className="w-32 h-32 mx-auto mb-6 bg-[#FF006E] border-4 border-black rotate-[-6deg] flex items-center justify-center">
            <Hash className="w-16 h-16" strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black mb-4">NO TOPICS YET</h2>
          <p className="text-lg font-bold text-black/70 mb-6">
            Upload your chat history to discover your topics!
          </p>
        </motion.div>
      </div>
    );
  }

  const allTopics = selectedAnalysis?.top_topics || [];
  const filteredTopics = allTopics.filter(topic =>
    topic.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const colorPalette = ['#0066FF', '#FF006E', '#39FF14', '#FFD600', '#8B00FF'];

  const topTopicsText = allTopics.slice(0, 3).map(t => t.topic).join(", ");
  const shareDescription = `I discovered ${allTopics.length} key topics in my chat history! Top topics: ${topTopicsText}`;

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
                YOUR <span className="text-[#FF006E]">TOPICS</span>
              </h1>
              <p className="text-xl font-bold text-black/70">
                Click any topic to explore detailed insights
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
                title="My Chat Topics"
                description={shareDescription}
              />
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0066FF] border-3 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-white flex-shrink-0" strokeWidth={3} />
              <p className="font-black text-white text-sm uppercase">
                Click any topic to view comprehensive analysis and insights!
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={3} />
            <Input
              type="text"
              placeholder="SEARCH TOPICS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 border-3 border-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        </motion.div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic, idx) => {
            const color = colorPalette[idx % colorPalette.length];
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, rotate: idx % 2 === 0 ? 1 : -1 }}
                className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
                onClick={() => handleTopicClick(topic)}
              >
                {/* Topic Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-2 leading-tight group-hover:text-[#0066FF] transition-colors">
                      {topic.topic}
                    </h3>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" strokeWidth={3} />
                      <span className="font-black text-lg">{topic.count}</span>
                      <span className="font-bold text-sm text-black/60">mentions</span>
                    </div>
                  </div>
                  <div
                    className="w-12 h-12 border-3 border-black flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform"
                    style={{ backgroundColor: color }}
                  >
                    <Hash className="w-6 h-6" strokeWidth={3} />
                  </div>
                </div>

                {/* Keywords */}
                {topic.keywords && topic.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4" strokeWidth={3} />
                      <p className="font-black text-xs uppercase text-black/60">Keywords</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topic.keywords.slice(0, 5).map((keyword, kidx) => (
                        <span
                          key={kidx}
                          className="px-3 py-1 bg-black/5 border-2 border-black font-bold text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Bar */}
                <div className="pt-4 border-t-3 border-black mb-4">
                  <div className="h-3 bg-black/10 border-2 border-black">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (topic.count / (allTopics[0]?.count || 1)) * 100)}%` }}
                      transition={{ delay: idx * 0.05 + 0.3, duration: 0.6 }}
                      className="h-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-[#0066FF] hover:bg-[#0066FF]/90 text-white border-3 border-black font-black uppercase text-sm py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-all"
                >
                  <Eye className="w-4 h-4 mr-2" strokeWidth={3} />
                  VIEW DETAILS
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTopics.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-[#FFD600] border-4 border-black rotate-12 flex items-center justify-center">
              <Search className="w-12 h-12" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black mb-2">NO TOPICS FOUND</h3>
            <p className="text-lg font-bold text-black/70">
              Try a different search term
            </p>
          </motion.div>
        )}

        {/* Topic Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-[#0066FF] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 className="text-3xl font-black text-white mb-4">TOPIC INSIGHTS</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-3 border-black p-4">
              <p className="font-black text-sm uppercase text-black/60 mb-2">Total Topics</p>
              <p className="text-4xl font-black">{allTopics.length}</p>
            </div>
            <div className="bg-white border-3 border-black p-4">
              <p className="font-black text-sm uppercase text-black/60 mb-2">Most Discussed</p>
              <p className="text-xl font-black">{allTopics[0]?.topic || "N/A"}</p>
            </div>
            <div className="bg-white border-3 border-black p-4">
              <p className="font-black text-sm uppercase text-black/60 mb-2">Total Mentions</p>
              <p className="text-4xl font-black">
                {allTopics.reduce((sum, t) => sum + (t.count || 0), 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, TrendingUp, Brain, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import SocialShare from "../components/SocialShare";

export default function Dashboard() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['chat-analyses'],
    queryFn: () => base44.entities.ChatAnalysis.list('-created_date'),
    initialData: [],
  });

  useEffect(() => {
    // Check URL for analysis ID
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setSelectedAnalysisId(id);
    } else if (analyses.length > 0 && !selectedAnalysisId) {
      setSelectedAnalysisId(analyses[0].id);
    }
  }, [analyses]);

  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-black bg-[#0066FF] animate-pulse mx-auto mb-4" />
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
          <div className="w-32 h-32 mx-auto mb-6 bg-[#FFD600] border-4 border-black rotate-6 flex items-center justify-center">
            <MessageSquare className="w-16 h-16" strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black mb-4">NO ANALYSES YET</h2>
          <p className="text-lg font-bold text-black/70 mb-6">
            Upload your chat history to get started!
          </p>
        </motion.div>
      </div>
    );
  }

  if (!selectedAnalysis) return null;

  const sentimentData = [
    { name: 'Positive', value: selectedAnalysis.sentiment_breakdown?.positive || 0, color: '#39FF14' },
    { name: 'Neutral', value: selectedAnalysis.sentiment_breakdown?.neutral || 0, color: '#FFD600' },
    { name: 'Negative', value: selectedAnalysis.sentiment_breakdown?.negative || 0, color: '#FF006E' }
  ];

  const topicsData = selectedAnalysis.top_topics?.slice(0, 6).map(t => ({
    name: t.topic,
    count: t.count
  })) || [];

  const shareDescription = `I analyzed ${selectedAnalysis.total_messages} messages and discovered ${selectedAnalysis.top_topics?.length || 0} key topics in my conversations!`;

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
                YOUR ANALYSIS
              </h1>
              <p className="text-xl font-bold text-black/70">{selectedAnalysis.file_name}</p>
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
                title="My Chat Analysis Results"
                description={shareDescription}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { 
              icon: MessageSquare, 
              label: "Total Messages", 
              value: selectedAnalysis.total_messages || 0,
              color: "bg-[#0066FF]"
            },
            { 
              icon: Clock, 
              label: "Peak Time", 
              value: selectedAnalysis.patterns?.peak_activity_time || "N/A",
              color: "bg-[#FF006E]"
            },
            { 
              icon: Award, 
              label: "Top Topics", 
              value: selectedAnalysis.top_topics?.length || 0,
              color: "bg-[#39FF14]"
            }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`${stat.color} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden`}
            >
              <stat.icon className="w-12 h-12 mb-3 absolute top-4 right-4 opacity-20" strokeWidth={3} />
              <p className="font-black text-sm uppercase mb-2 text-black/70">{stat.label}</p>
              <p className="text-4xl font-black">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Sentiment Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h3 className="text-2xl font-black mb-6">SENTIMENT BREAKDOWN</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
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

          {/* Top Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h3 className="text-2xl font-black mb-6">TOP TOPICS</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicsData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#000"
                  strokeWidth={2}
                  style={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#000"
                  strokeWidth={2}
                  style={{ fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    border: '3px solid black', 
                    borderRadius: 0,
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="count" fill="#0066FF" stroke="#000" strokeWidth={3} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#FFD600] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8" strokeWidth={3} />
            <h3 className="text-3xl font-black">KEY INSIGHTS</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {selectedAnalysis.key_insights?.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                className="bg-white border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="font-bold flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <span>{insight}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Patterns */}
        {selectedAnalysis.patterns && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h3 className="text-3xl font-black mb-6">BEHAVIORAL PATTERNS</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-black text-sm uppercase text-black/60 mb-2">Peak Activity Time</p>
                <p className="text-2xl font-black">{selectedAnalysis.patterns.peak_activity_time}</p>
              </div>
              <div>
                <p className="font-black text-sm uppercase text-black/60 mb-2">Avg Session Length</p>
                <p className="text-2xl font-black">{selectedAnalysis.patterns.average_session_length}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-black text-sm uppercase text-black/60 mb-3">Recurring Themes</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAnalysis.patterns.recurring_themes?.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-[#39FF14] border-3 border-black font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
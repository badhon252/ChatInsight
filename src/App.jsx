import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import TopicDetail from './pages/TopicDetail';
import Insights from './pages/Insights';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/Upload" replace />} />
          <Route path="/Upload" element={<Upload />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Topics" element={<Topics />} />
          <Route path="/TopicDetail" element={<TopicDetail />} />
          <Route path="/Insights" element={<Insights />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

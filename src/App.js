import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import JoinCommunity from './components/JoinCommunity';
import CommunityPage from './components/CommunityPage';
import ExploreCommunities from './components/ExploreCommunities';
import SuccessStories from './components/SuccessStories';
import FAQs from './components/FAQs';
import Navbar from './components/Navbar';
import { supabase } from './utils/supabase';

function App() {
  console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/join-community" element={<JoinCommunity />} />
        <Route path="/community/:id" element={<CommunityPage />} />
        <Route path="/explore-communities" element={<ExploreCommunities />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/faqs" element={<FAQs />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App; 
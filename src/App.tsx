import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimeProvider } from './context/AnimeContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnimeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </Layout>
        </Router>
      </AnimeProvider>
    </ThemeProvider>
  );
};

export default App;

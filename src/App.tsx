import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimeProvider } from './context/AnimeContext';
import { CustomListProvider } from './context/CustomListContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import CustomListsPage from './pages/CustomListsPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnimeProvider>
        <CustomListProvider>
          <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/custom-lists" element={<CustomListsPage />} />
            </Routes>
          </Layout>
        </Router>
        </CustomListProvider>
      </AnimeProvider>
    </ThemeProvider>
  );
};

export default App;

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AnimeProvider } from './context/AnimeContext';
import { CustomListProvider } from './context/CustomListContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import StatsPage from './pages/StatsPage';
import CustomListsPage from './pages/CustomListsPage';
import AIToolsPage from './pages/AIToolsPage'; // Import the new AI Tools page
import theme from './theme'; // Import the custom theme

const App: React.FC = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <ThemeProvider>
      <AnimeProvider>
        <CustomListProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/custom-lists" element={<CustomListsPage />} />
                <Route path="/ai-tools" element={<AIToolsPage />} />
              </Routes>
            </Layout>
          </Router>
        </CustomListProvider>
      </AnimeProvider>
    </ThemeProvider>
  </MuiThemeProvider>
);

export default App;

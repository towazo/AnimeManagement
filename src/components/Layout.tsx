import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  BarChart as StatsIcon,
  Movie as MovieIcon,
  ListAlt as ListAltIcon // 追加
} from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <MovieIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            アニメアーカイブナビゲーター
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              startIcon={!isMobile && <HomeIcon />}
              sx={{ 
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                borderBottom: location.pathname === '/' ? '2px solid white' : 'none'
              }}
            >
              {isMobile ? <HomeIcon /> : 'ホーム'}
            </Button>
            <Button
              component={RouterLink}
              to="/stats"
              color="inherit"
              startIcon={!isMobile && <StatsIcon />}
              sx={{ 
                fontWeight: location.pathname === '/stats' ? 'bold' : 'normal',
                borderBottom: location.pathname === '/stats' ? '2px solid white' : 'none'
              }}
            >
              {isMobile ? <StatsIcon /> : '統計'}
            </Button>
            {/* 追加ここから */}
            <Button
              component={RouterLink}
              to="/custom-lists"
              color="inherit"
              startIcon={!isMobile && <ListAltIcon />}
              sx={{
                fontWeight: location.pathname === '/custom-lists' ? 'bold' : 'normal',
                borderBottom: location.pathname === '/custom-lists' ? '2px solid white' : 'none'
              }}
            >
              {isMobile ? <ListAltIcon /> : 'カスタムリスト'}
            </Button>
            {/* 追加ここまで */}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} アニメアーカイブナビゲーター
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;

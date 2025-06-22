import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const BubbleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
}));

const BubbleContent = styled(Box)(({ theme }) => ({
  backgroundColor: '#E3F2FD',
  color: '#1565C0',
  padding: theme.spacing(2),
  borderRadius: '16px 16px 16px 4px',
  position: 'relative',
  maxWidth: '80%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '2px solid #42A5F5',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    maxWidth: '85%',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -8,
    bottom: 8,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '0 8px 8px 0',
    borderColor: 'transparent #42A5F5 transparent transparent',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: -6,
    bottom: 10,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '0 6px 6px 0',
    borderColor: 'transparent #E3F2FD transparent transparent',
  },
}));

const TowazoBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BubbleContainer>
      <Avatar
        src="/towazo-mascot.png"
        alt="サイトマスコット towazo のイラスト"
        sx={{
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 },
          flexShrink: 0,
          border: '2px solid #42A5F5',
          backgroundColor: '#FFF8E1',
        }}
      />
      <BubbleContent>
        <Typography variant="body1" component="div" sx={{ lineHeight: 1.6 }}>
          {children}
        </Typography>
      </BubbleContent>
    </BubbleContainer>
  );
};

export default TowazoBubble;

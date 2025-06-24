import React from 'react';
import { Box, Typography, Avatar, styled } from '@mui/material';
import towazoImage from '../assets/towazo-mascot.png';

interface TowazoBubbleProps {
  children: React.ReactNode;
}

const BubbleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#F8F9FA',
  borderRadius: '16px',
  border: '1px solid #E3F2FD',
  boxShadow: '0 2px 8px rgba(66, 165, 245, 0.1)',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(8),
    top: theme.spacing(1),
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid #E3F2FD',
    borderBottom: '8px solid #E3F2FD',
    transform: 'rotate(45deg)',
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
    
    '&::before': {
      left: theme.spacing(6),
    },
  },
}));

const MessageContent = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: '#FFFFFF',
  padding: theme.spacing(2),
  borderRadius: '12px',
  border: '1px solid #E1F5FE',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  color: '#333333',
  
  '& p': {
    margin: 0,
    lineHeight: 1.6,
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const TowazoBubble: React.FC<TowazoBubbleProps> = ({ children }) => {
  return (
    <BubbleContainer>
      <Avatar
        src={towazoImage}
        alt="サイトマスコット towazo のイラスト"
        sx={{
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 },
          flexShrink: 0,
          border: '2px solid #42A5F5',
          backgroundColor: '#FFF8E1',
        }}
      />
      <MessageContent>
        <Typography variant="body1" component="div" sx={{ lineHeight: 1.6 }}>
          {children}
        </Typography>
      </MessageContent>
    </BubbleContainer>
  );
};

export default TowazoBubble;

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
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  borderRadius: '16px 16px 16px 4px',
  position: 'relative',
  maxWidth: '80%',
  boxShadow: theme.shadows[2],
  border: `2px solid ${theme.palette.primary.main}`,
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
    borderColor: `transparent ${theme.palette.primary.main} transparent transparent`,
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
    borderColor: `transparent ${theme.palette.primary.light} transparent transparent`,
  },
}));

const TowazoBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BubbleContainer>
      <Avatar
        src="/towazo-icon.svg"
        alt="サイトマスコット towazo のイラスト"
        sx={{
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          flexShrink: 0,
        }}
      />
      <BubbleContent>
        <Typography variant="body1" component="div">
          {children}
        </Typography>
      </BubbleContent>
    </BubbleContainer>
  );
};

export default TowazoBubble;

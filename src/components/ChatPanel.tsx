import React, { useState } from 'react';
import { Drawer, IconButton, Box, TextField, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useGemini } from '../hooks/useGemini';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ open, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const { loading, chatOptimize } = useGemini();

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    const userMsg = { role: 'user' as const, text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt('');
    const aiText = await chatOptimize(currentPrompt);
    if (aiText) {
      setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
    } else {
      setMessages((prev) => [...prev, { role: 'ai', text: 'エラーが発生しました。時間を置いて再試行してください。' }]);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box component="span" fontWeight="bold">視聴リスト最適化チャット</Box>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <ListItem key={idx} sx={{ whiteSpace: 'pre-wrap' }}>
              <ListItemText
                primary={msg.text}
                primaryTypographyProps={{ align: msg.role === 'user' ? 'right' : 'left' }}
              />
            </ListItem>
          ))}
          {loading && <CircularProgress size={24} sx={{ mx: 'auto', my: 2 }} />}
        </List>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="例: 今期アニメ5本だけ選んで"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <IconButton color="primary" onClick={handleSend} disabled={!prompt.trim() || loading}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatPanel;

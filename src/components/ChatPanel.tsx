import React, { useState } from 'react';
import { Drawer, IconButton, Box, TextField, List, ListItem, ListItemText, CircularProgress, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useGemini } from '../hooks/useGemini';
import TowazoBubble from './TowazoBubble';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

// towazoの口調に変換する関数
const convertToTowazoStyle = (text: string): string => {
  // 基本的な変換ルール
  let converted = text
    .replace(/です。/g, 'だね！')
    .replace(/ます。/g, 'るね！')
    .replace(/でしょう。/g, 'だと思うよ！')
    .replace(/おすすめします/g, 'おすすめするね')
    .replace(/いかがでしょうか/g, 'どうかな')
    .replace(/ください/g, 'してね')
    .replace(/^/, 'やあ！towazoだよ〜 ');
  
  // 末尾に親しみやすさを追加
  if (!converted.endsWith('ね！') && !converted.endsWith('よ！') && !converted.endsWith('〜')) {
    converted += 'ね！';
  }
  
  return converted;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ open, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { 
      role: 'ai', 
      text: 'やあ！僕はtowazoだよ〜 アニメのことなら何でも聞いてね！「今期のおすすめ教えて」「5本だけ選んで」みたいに気軽に話しかけてよ！'
    }
  ]);
  const { loading, chatOptimize } = useGemini();

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    const userMsg = { role: 'user' as const, text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt('');
    const aiText = await chatOptimize(currentPrompt);
    if (aiText) {
      const towazoText = convertToTowazoStyle(aiText);
      setMessages((prev) => [...prev, { role: 'ai', text: towazoText }]);
    } else {
      setMessages((prev) => [...prev, { role: 'ai', text: 'ごめんね〜エラーが起きちゃった！少し時間を置いてもう一度試してみてね！' }]);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">towazo のアニメ相談室</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
        <List sx={{ flexGrow: 1, overflowY: 'auto', px: 0 }}>
          {messages.map((msg, idx) => (
            <ListItem key={idx} sx={{ px: 0, py: 1, flexDirection: 'column', alignItems: 'stretch' }}>
              {msg.role === 'user' ? (
                <Box sx={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                  <Box
                    sx={{
                      backgroundColor: 'grey.100',
                      color: 'text.primary',
                      padding: 2,
                      borderRadius: '16px 16px 4px 16px',
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                  </Box>
                </Box>
              ) : (
                <TowazoBubble>
                  {msg.text}
                </TowazoBubble>
              )}
            </ListItem>
          ))}
          {loading && (
            <ListItem sx={{ px: 0, py: 1 }}>
              <TowazoBubble>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">考え中...</Typography>
                </Box>
              </TowazoBubble>
            </ListItem>
          )}
        </List>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="例: 今期アニメ5本だけ選んで"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend} 
            disabled={!prompt.trim() || loading}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatPanel;

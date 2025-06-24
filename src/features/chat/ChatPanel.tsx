import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, TextField, Button, Box, 
  List, ListItem, Typography, Paper, IconButton, CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useGemini } from '../../hooks/useGemini';
import TowazoBubble from '../../shared/components/TowazoBubble';
import { convertToTowazoStyle } from '../../shared/utils/towazoSpeech';
import { isEmpty } from '../../shared/utils/textProcessing';
import { Message, ChatPanelProps } from './types';

const ChatPanel: React.FC<ChatPanelProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { loading, chatOptimize } = useGemini();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (isEmpty(inputText) || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const aiResponse = await chatOptimize(inputText);
      
      if (!aiResponse || isEmpty(aiResponse)) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'ごめん、うまく答えられなかった。もう一度聞いてみて！',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: convertToTowazoStyle(aiResponse),
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('チャットエラー:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'エラーが起きちゃった。少し時間を置いてもう一度試してみて！',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInputText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        towazo チャット
        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          <List>
            {messages.length === 0 && (
              <ListItem>
                <TowazoBubble>
                  towazoだよ！ アニメのことなら何でも聞いてね！「今期のおすすめ教えて」「5本だけ選んで」みたいに気軽に話しかけてよ！
                </TowazoBubble>
              </ListItem>
            )}
            {messages.map((message) => (
              <ListItem key={message.id} sx={{ alignItems: 'flex-start' }}>
                {message.isUser ? (
                  <Paper 
                    sx={{ 
                      p: 2, 
                      ml: 'auto', 
                      maxWidth: '70%', 
                      bgcolor: '#E3F2FD',
                      borderRadius: '12px'
                    }}
                  >
                    <Typography>{message.text}</Typography>
                  </Paper>
                ) : (
                  <TowazoBubble>{message.text}</TowazoBubble>
                )}
              </ListItem>
            ))}
            {loading && (
              <ListItem>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography sx={{ color: '#666666' }}>towazo が考え中...</Typography>
                </Box>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            disabled={loading}
            sx={{
              '& .MuiInputBase-input': {
                color: '#333333',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#666666',
                opacity: 1,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={isEmpty(inputText) || loading}
            endIcon={<SendIcon />}
          >
            送信
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPanel;

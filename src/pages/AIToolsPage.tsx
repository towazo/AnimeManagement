import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, Avatar } from '@mui/material';
import ChatPanel from '../components/ChatPanel';
import ImageIdentifyDialog from '../components/ImageIdentifyDialog';
import towazoImage from '../assets/towazo-mascot.png';

const AIToolsPage: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Avatar
          src={towazoImage}
          alt="towazo"
          sx={{ width: 64, height: 64, border: '2px solid #42A5F5' }}
        />
        <Box>
          <Typography variant="h4" sx={{ color: '#1565C0', fontWeight: 'bold' }}>
            towazo アシスタント
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#666666' }}>
            僕と一緒にアニメを楽しもう！
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            border: '2px solid #E3F2FD',
            '&:hover': { boxShadow: '0 4px 12px rgba(66,165,245,0.2)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Avatar
                  src={towazoImage}
                  alt="towazo"
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="h5" gutterBottom sx={{ color: '#1565C0', mb: 0 }}>
                  アニメ相談チャット
                </Typography>
              </Box>
              <Typography sx={{ mb: 2, color: '#666666' }}>
                僕 towazo と一緒にアニメについて話そう！<br />
                「今期のおすすめ教えて」「5本だけ選んで」など、<br />
                何でも気軽に相談してね。
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setChatOpen(true)}
                sx={{ 
                  backgroundColor: '#42A5F5',
                  '&:hover': { backgroundColor: '#1976D2' }
                }}
              >
                towazo と話す
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            border: '2px solid #E3F2FD',
            '&:hover': { boxShadow: '0 4px 12px rgba(66,165,245,0.2)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Avatar
                  src={towazoImage}
                  alt="towazo"
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="h5" gutterBottom sx={{ color: '#1565C0', mb: 0 }}>
                  画像識別サービス
                </Typography>
              </Box>
              <Typography sx={{ mb: 2, color: '#666666' }}>
                アニメの画像をアップロードしてくれれば、<br />
                僕が作品名を推測するよ！<br />
                スクリーンショットでも何でもOKだよ。
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setImageDialogOpen(true)}
                sx={{ 
                  backgroundColor: '#42A5F5',
                  '&:hover': { backgroundColor: '#1976D2' }
                }}
              >
                画像を見てもらう
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      <ImageIdentifyDialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} />
    </Container>
  );
};

export default AIToolsPage;

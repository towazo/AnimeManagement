import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import ChatPanel from '../components/ChatPanel';
import ImageIdentifyDialog from '../components/ImageIdentifyDialog';

const AIToolsPage: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4 }}>
        AIアシスタント
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                視聴リスト最適化チャット
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                視聴済みアニメのリストを元に、AIが次に見るべきおすすめのアニメを提案します。
              </Typography>
              <Button variant="contained" onClick={() => setChatOpen(true)}>
                チャットを開始
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                画像からアニメを特定
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                アニメのスクリーンショットをアップロードして、タイトルを特定します。
              </Typography>
              <Button variant="contained" onClick={() => setImageDialogOpen(true)}>
                画像認識を開始
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

import React, { useContext, useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, Button, CircularProgress, List, ListItem, ListItemText, ListItemIcon, CardMedia } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Book as ArchiveIcon, AutoAwesome as AIIcon, ArrowForward as ArrowForwardIcon, Movie as MovieIcon } from '@mui/icons-material';
import { AnimeContext } from '../context/AnimeContext';
import { Anime } from '../types';
import { useGemini } from '../hooks/useGemini';

// Recommendation type definition
interface Recommendation {
  title: string;
  reason: string;
  imageUrl?: string;
}

// QuickAccess Component
const QuickAccess: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>クイックアクセス</Typography>
      <List>
        <ListItem button component={RouterLink} to="/archive">
          <ListItemIcon><ArchiveIcon color="primary" /></ListItemIcon>
          <ListItemText primary="アニメアーカイブ" />
        </ListItem>
        <ListItem button component={RouterLink} to="/ai-tools">
          <ListItemIcon><AIIcon color="primary" /></ListItemIcon>
          <ListItemText primary="AIアシスタント" />
        </ListItem>
      </List>
    </CardContent>
  </Card>
);

// RecentlyAdded Component
const RecentlyAdded: React.FC = () => {
  const animeContext = useContext(AnimeContext);
  if (!animeContext) return null;

  const recentAnime = [...animeContext.animeList]
    .sort((a, b) => new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime())
    .slice(0, 5);

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>最近追加したアニメ</Typography>
        {recentAnime.length > 0 ? (
          <List dense>
            {recentAnime.map(anime => (
              <ListItem key={anime.id}>
                <ListItemIcon><MovieIcon /></ListItemIcon>
                <ListItemText primary={anime.title} secondary={`視聴日: ${new Date(anime.watchedDate).toLocaleDateString()}`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">まだアニメが登録されていません。</Typography>
        )}
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button component={RouterLink} to="/archive" endIcon={<ArrowForwardIcon />}>
            アーカイブを見る
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// AIRecommender Component
const AIRecommender: React.FC = () => {
  const animeContext = useContext(AnimeContext);
  const { loading, chatOptimize } = useGemini();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (title: string) => {
    setImageErrors(prev => ({ ...prev, [title]: true }));
  };

  const getRecommendations = async () => {
    if (!animeContext || animeContext.animeList.length === 0) {
      return;
    }
    setError(null);
    setImageErrors({}); // Reset image errors

    const animeJson = JSON.stringify(
      animeContext.animeList.map((anime: Anime) => ({
        title: anime.title,
        genres: anime.genres,
        personalRating: anime.personalRating,
        notes: anime.notes,
        imageUrl: anime.imageUrl,
      })),
      null,
      2
    );

    const prompt = `以下は私が視聴したアニメのリストです。このリストの中から、私の好みの傾向に最も合致する作品を1つ選び、その理由を簡潔に説明してください。
応答は必ず以下のJSON形式のオブジェクトで返してください。他のテキストは含めないでください。
返却するJSONには、選んだアニメの'title'（既存リストと完全一致）、'reason'（200字以内）、そして'imageUrl'の3つのキーを必ず含めてください。

例:
{"title": "作品名1", "reason": "選んだ理由1", "imageUrl": "画像URL1"}

視聴リスト:
${animeJson}`;

    const result = await chatOptimize(prompt);

    if (!result) {
      setError('おすすめの取得に失敗しました。AIからの応答がありません。');
      return;
    }

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
          throw new Error("AIの応答にJSONオブジェクトが見つかりません。");
      }
      const cleanedResult = jsonMatch[0];
      const parsedResult: Recommendation = JSON.parse(cleanedResult);
      
      setRecommendations([parsedResult]);

    } catch (e) {
      console.error("AIからの応答の解析に失敗しました:", e, "応答:", result);
      setError('おすすめの取得に失敗しました。AIの応答が不正な形式です。');
    }
  };
  
  useEffect(() => {
    if (animeContext && animeContext.animeList.length > 0) {
      getRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeContext?.animeList.length]);

  if (!animeContext) {
    return <Card><CardContent><CircularProgress /></CardContent></Card>;
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">AIからのおすすめ</Typography>
          <Button 
            variant="contained" 
            onClick={getRecommendations} 
            disabled={loading || animeContext.animeList.length === 0}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AIIcon />}
          >
            {loading ? '分析中...' : '再取得'}
          </Button>
        </Box>

        {error && <Typography color="error" sx={{ my: 2 }}>{error}</Typography>}

        {recommendations.length === 0 && !loading && !error && (
            <Typography variant="body2" color="text.secondary">
                {animeContext.animeList.length > 0 
                    ? 'おすすめを分析中です...'
                    : '視聴履歴がありません。まずはアニメをいくつか登録してください。'}
            </Typography>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={imageErrors[rec.title] || !rec.imageUrl ? 'https://placehold.co/600x400/EEE/31343C.png?text=No+Image' : rec.imageUrl}
                  alt={rec.title}
                  sx={{ objectFit: 'cover' }}
                  onError={() => handleImageError(rec.title)}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {rec.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rec.reason}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};


// HomePage Component
const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ダッシュボード
        </Typography>
        <Typography variant="h6" color="text.secondary">
          ようこそ！あなたのアニメ活動をここで確認できます。
        </Typography>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <AIRecommender />
          <RecentlyAdded />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickAccess />
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;

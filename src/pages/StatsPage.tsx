import React from 'react';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { useAnime } from '../context/AnimeContext';
import { Genre } from '../types';

// Chart.jsコンポーネントを登録
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// ジャンルごとの色を定義
const genreColors: Record<Genre, string> = {
  'アクション': '#f44336',
  'コメディ': '#ff9800',
  'ドラマ': '#9c27b0',
  'ファンタジー': '#2196f3',
  'SF': '#00bcd4',
  '日常': '#4caf50',
  '恋愛': '#e91e63',
  'スポーツ': '#8bc34a',
  'ミステリー': '#673ab7',
  'ホラー': '#212121',
  'その他': '#757575'
};

const StatsPage: React.FC = () => {
  const { animeList } = useAnime();

  // ジャンルの分布データを計算
  const genreData = React.useMemo(() => {
    const genreCounts: Record<string, number> = {};
    
    animeList.forEach(anime => {
      anime.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    const labels = Object.keys(genreCounts);
    const data = Object.values(genreCounts);
    const backgroundColor = labels.map(genre => genreColors[genre as Genre]);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color),
          borderWidth: 1,
        },
      ],
    };
  }, [animeList]);

  // 評価の分布データを計算
  const ratingData = React.useMemo(() => {
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    animeList.forEach(anime => {
      ratingCounts[anime.personalRating] = (ratingCounts[anime.personalRating] || 0) + 1;
    });
    
    return {
      labels: ['1星', '2星', '3星', '4星', '5星'],
      datasets: [
        {
          label: 'アニメ数',
          data: Object.values(ratingCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [animeList]);

  // 年ごとの視聴数データを計算
  const yearlyWatchData = React.useMemo(() => {
    const yearCounts: Record<string, number> = {};
    
    animeList.forEach(anime => {
      const year = new Date(anime.watchedDate).getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    // 年を昇順にソート
    const sortedYears = Object.keys(yearCounts).sort();
    
    return {
      labels: sortedYears,
      datasets: [
        {
          label: '視聴したアニメ数',
          data: sortedYears.map(year => yearCounts[year]),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
      ],
    };
  }, [animeList]);

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'ジャンル分布',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '評価分布',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const yearlyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '年ごとの視聴数',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        統計ダッシュボード
      </Typography>
      
      <Typography variant="body1" paragraph>
        登録されたアニメ: {animeList.length}作品
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              ジャンル分布
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {animeList.length > 0 ? (
                <Pie data={genreData} options={pieOptions} />
              ) : (
                <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                  データがありません
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              評価分布
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {animeList.length > 0 ? (
                <Bar data={ratingData} options={barOptions} />
              ) : (
                <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                  データがありません
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              年ごとの視聴数
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {animeList.length > 0 ? (
                <Bar data={yearlyWatchData} options={yearlyOptions} />
              ) : (
                <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                  データがありません
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StatsPage;

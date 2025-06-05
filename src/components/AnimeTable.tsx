import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Chip,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Anime, Genre } from '../types';

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

interface AnimeTableProps {
  animeList: Anime[];
  onEdit: (anime: Anime) => void;
  onDelete: (id: string) => void;
  onRewatch: (id: string) => void;
}

const AnimeTable: React.FC<AnimeTableProps> = ({ animeList, onEdit, onDelete, onRewatch }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="アニメリスト">
        <TableHead>
          <TableRow>
            <TableCell>タイトル</TableCell>
            <TableCell align="center">年</TableCell>
            <TableCell align="center">ジャンル</TableCell>
            <TableCell align="center">評価</TableCell>
            <TableCell align="center">視聴日</TableCell>
            <TableCell align="center">メモ</TableCell>
            <TableCell align="center">アクション</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {animeList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body1" sx={{ py: 2 }}>
                  アニメが登録されていません
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            animeList.map((anime) => (
              <TableRow
                key={anime.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {anime.coverImage && (
                      <Box
                        component="img"
                        src={anime.coverImage}
                        alt={anime.title}
                        sx={{ width: 40, height: 40, mr: 2, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    <Typography variant="body1">{anime.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{anime.year || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {anime.genres.map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
                        sx={{
                          backgroundColor: genreColors[genre],
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.7rem'
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Rating value={anime.personalRating} readOnly size="small" />
                  </Box>
                </TableCell>
                <TableCell align="center">{formatDate(anime.watchedDate)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {anime.notes || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => onRewatch(anime.id)} title="再視聴">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onEdit(anime)} title="編集">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(anime.id)} title="削除">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AnimeTable;

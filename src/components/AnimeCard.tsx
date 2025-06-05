import React, { useState } from 'react'; // useState をインポート
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip, 
  Box, 
  Rating, 
  IconButton, 
  CardActions, 
  Menu, // 追加
  MenuItem // 追加
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, PlaylistAdd as PlaylistAddIcon } from '@mui/icons-material'; // PlaylistAddIcon を追加
import { Anime, Genre } from '../types';
import { useCustomLists } from '../context/CustomListContext'; // 追加

// ジャンルごとの色を定義
const genreColors: Record<Genre, string> = {
  'アクション': '#f44336',
  'コメディ': '#ff9800',
  'ドラマ': '#9c27b0',
  'ファンタジー': '#2196f3',
  'SF': '#673ab7',
  '日常': '#4caf50',
  '恋愛': '#e91e63',
  'スポーツ': '#00bcd4',
  'ミステリー': '#607d8b',
  'ホラー': '#795548',
  'その他': '#9e9e9e'
};

interface AnimeCardProps {
  anime: Anime;
  onEdit: (anime: Anime) => void;
  onDelete: (id: string) => void;
  onRewatch: (id: string) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onEdit, onDelete, onRewatch }) => {
  const { customLists, addAnimeToCustomList } = useCustomLists(); // 追加
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // 追加
  const open = Boolean(anchorEl); // 追加
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 追加: メニューハンドラ
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddToList = (listId: string) => {
    addAnimeToCustomList(listId, anime.id);
    handleMenuClose();
    // ここでユーザーにフィードバック（例: Snackbar）を表示することも検討できます
  };
  // --- 追加ここまで ---

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)'
      }
    }}>
      <CardMedia
        component="img"
        height="200"
        image={anime.coverImage || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={anime.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {anime.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={anime.personalRating} readOnly precision={0.5} size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({anime.personalRating})
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {anime.year ? `${anime.year}年` : ''}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          視聴日: {formatDate(anime.watchedDate)}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {anime.genres.map((genre) => (
            <Chip 
              key={genre} 
              label={genre} 
              size="small" 
              sx={{ 
                backgroundColor: genreColors[genre],
                color: 'white',
                fontWeight: 500
              }} 
            />
          ))}
        </Box>
        
        {anime.notes && (
          <Typography variant="body2" color="text.secondary">
            {anime.notes}
          </Typography>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        {/* 追加: リストに追加ボタンとメニュー */}
        <IconButton size="small" onClick={handleMenuClick} title="リストに追加">
          <PlaylistAddIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'add-to-list-button',
          }}
        >
          {customLists.length > 0 ? (
            customLists.map((list) => (
              <MenuItem key={list.id} onClick={() => handleAddToList(list.id)}>
                {list.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>カスタムリストがありません</MenuItem>
          )}
        </Menu>
        {/* --- 追加ここまで --- */}
        <IconButton size="small" onClick={() => onRewatch(anime.id)} title="再視聴">
          <RefreshIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onEdit(anime)} title="編集">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(anime.id)} title="削除">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default AnimeCard;

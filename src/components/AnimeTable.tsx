import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Rating,
  TablePagination,
  Checkbox,
  TableSortLabel,
  Tooltip,
  Menu, // 追加
  MenuItem, // 追加
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlaylistAdd as PlaylistAddIcon // 追加
} from '@mui/icons-material';
import { Anime, Genre } from '../types';
import { getHighQualityImageUrl, handleImageError } from '../utils/imageUtils';
import { useCustomLists } from '../context/CustomListContext'; // 追加

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
  onEdit: ((anime: Anime) => void) | undefined;
  onDelete: ((id: string) => void) | undefined;
  onRewatch: ((id: string) => void) | undefined;
  selectionMode?: boolean;
  selectedAnimeIds?: string[];
  onToggleSelection?: (id: string) => void;
}

const AnimeTable: React.FC<AnimeTableProps> = ({ 
  animeList, 
  onEdit, 
  onDelete, 
  onRewatch,
  selectionMode = false,
  selectedAnimeIds = [],
  onToggleSelection
}) => {
  const { customLists, addAnimeToCustomList } = useCustomLists(); // 追加
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // 追加
  const [currentAnimeForMenu, setCurrentAnimeForMenu] = useState<Anime | null>(null); // 追加
  const openMenu = Boolean(anchorEl); // 追加
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 追加: メニューハンドラ
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, anime: Anime) => {
    setAnchorEl(event.currentTarget);
    setCurrentAnimeForMenu(anime);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentAnimeForMenu(null);
  };

  const handleAddToListClick = (listId: string) => {
    if (currentAnimeForMenu) {
      addAnimeToCustomList(listId, currentAnimeForMenu.id);
    }
    handleMenuClose();
    // ここでユーザーにフィードバック（例: Snackbar）を表示することも検討できます
  };
  // --- 追加ここまで ---

  return (
    <> {/* MenuコンポーネントをTableContainerの外に置くためにFragmentを使用 */}
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="アニメリスト">
        <TableHead>
          <TableRow>
            {selectionMode && (
              <TableCell padding="checkbox" align="center">選択</TableCell>
            )}
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
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  ...(selectionMode && selectedAnimeIds.includes(anime.id) ? { backgroundColor: 'rgba(25, 118, 210, 0.08)' } : {})
                }}
                onClick={selectionMode && onToggleSelection ? () => onToggleSelection(anime.id) : undefined}
                hover={!!selectionMode}
              >
                {selectionMode && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAnimeIds.includes(anime.id)}
                      onChange={() => onToggleSelection && onToggleSelection(anime.id)}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={getHighQualityImageUrl(anime.imageUrl)}
                      alt={anime.title}
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        mr: 2, 
                        objectFit: 'cover', 
                        borderRadius: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onError={handleImageError}
                    />
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
                    {/* 追加: リストに追加ボタン */}
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, anime)}
                      title="リストに追加"
                    >
                      <PlaylistAddIcon fontSize="small" />
                    </IconButton>
                    {/* --- 追加ここまで --- */}
                  {onRewatch && (
                    <IconButton size="small" onClick={() => onRewatch(anime.id)} title="再視聴">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onEdit && (
                    <IconButton size="small" onClick={() => onEdit(anime)} title="編集">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton size="small" onClick={() => onDelete(anime.id)} title="削除">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
      {/* 追加: Menuコンポーネント */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'add-to-list-button-table',
        }}
      >
        {customLists.length > 0 ? (
          customLists.map((list) => (
            <MenuItem key={list.id} onClick={() => handleAddToListClick(list.id)}>
              {list.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>カスタムリストがありません</MenuItem>
        )}
        {customLists.length > 0 && currentAnimeForMenu && (
           <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.8rem', justifyContent: 'center' }}>
             「{currentAnimeForMenu.title}」をリストに追加
           </MenuItem>
        )}
      </Menu>
      {/* --- 追加ここまで --- */}
    </>
  );
};

export default AnimeTable;

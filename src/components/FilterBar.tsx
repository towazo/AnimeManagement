import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { Genre, SortOption } from '../types';
import { useTheme } from '../context/ThemeContext';

const GENRES: Genre[] = [
  'アクション',
  'コメディ',
  'ドラマ',
  'ファンタジー',
  'SF',
  '日常',
  '恋愛',
  'スポーツ',
  'ミステリー',
  'ホラー',
  'その他'
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'watchedDate_desc', label: '視聴日（新しい順）' },
  { value: 'title_asc', label: 'タイトル（昇順）' },
  { value: 'personalRating_desc', label: '評価（高い順）' }
];

interface FilterBarProps {
  searchTerm: string;
  selectedGenres: Genre[];
  sortBy: SortOption;
  viewMode: 'card' | 'table';
  onSearchChange: (term: string) => void;
  onGenreChange: (genres: Genre[]) => void;
  onSortChange: (sort: SortOption) => void;
  onViewModeToggle: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  selectedGenres,
  sortBy,
  viewMode,
  onSearchChange,
  onGenreChange,
  onSortChange,
  onViewModeToggle
}) => {
  const { mode, toggleTheme } = useTheme();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleGenreChange = (event: SelectChangeEvent<Genre[]>) => {
    const value = event.target.value as Genre[];
    onGenreChange(value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    onSortChange(event.target.value as SortOption);
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
      <TextField
        label="タイトル・メモを検索"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        size="small"
        sx={{ flexGrow: 1 }}
      />

      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel id="genre-filter-label">ジャンルでフィルター</InputLabel>
        <Select
          labelId="genre-filter-label"
          multiple
          value={selectedGenres}
          onChange={handleGenreChange}
          input={<OutlinedInput label="ジャンルでフィルター" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {GENRES.map((genre) => (
            <MenuItem key={genre} value={genre}>
              {genre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 180 }} size="small">
        <InputLabel id="sort-label">並び替え</InputLabel>
        <Select
          labelId="sort-label"
          value={sortBy}
          onChange={handleSortChange}
          label="並び替え"
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title={viewMode === 'card' ? 'テーブル表示に切り替え' : 'カード表示に切り替え'}>
          <IconButton onClick={onViewModeToggle} color="primary">
            {viewMode === 'card' ? <TableViewIcon /> : <CardViewIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={mode === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}>
          <IconButton onClick={toggleTheme} color="primary">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default FilterBar;

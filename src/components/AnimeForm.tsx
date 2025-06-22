import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Rating,
  Typography,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { Anime, Genre } from '../types';

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

interface AnimeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (anime: Omit<Anime, 'id'> | Anime) => void;
  anime?: Anime;
}

const initialAnime: Omit<Anime, 'id'> = {
  title: '',
  year: undefined,
  genres: [],
  personalRating: 3,
  notes: '',
  watchedDate: new Date().toISOString().split('T')[0],
  imageUrl: ''
};

const AnimeForm: React.FC<AnimeFormProps> = ({ open, onClose, onSave, anime }) => {
  const [formData, setFormData] = useState<Omit<Anime, 'id'> | Anime>(initialAnime);
  const [errors, setErrors] = useState<Partial<Record<keyof Anime, string>>>({});

  // アニメデータが提供された場合、フォームデータを初期化
  useEffect(() => {
    if (anime) {
      setFormData(anime);
    } else {
      setFormData(initialAnime);
    }
    setErrors({});
  }, [anime, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? (value ? parseInt(value, 10) : undefined) : value
    }));

    // エラーをクリア
    if (errors[name as keyof Anime]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGenreChange = (event: SelectChangeEvent<Genre[]>) => {
    const value = event.target.value as Genre[];
    setFormData(prev => ({
      ...prev,
      genres: value
    }));

    // エラーをクリア
    if (errors.genres) {
      setErrors(prev => ({ ...prev, genres: undefined }));
    }
  };

  const handleRatingChange = (_event: React.SyntheticEvent, value: number | null) => {
    setFormData(prev => ({
      ...prev,
      personalRating: value || 3
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Anime, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    // タイトルが入力されていない場合のみ、ジャンルの必須チェックを行う
    // タイトルが入力されている場合は、APIからジャンルを自動取得するため、ジャンルが空でもOK
    if (formData.genres.length === 0 && !formData.title.trim()) {
      newErrors.genres = '少なくとも1つのジャンルを選択してください';
    }

    if (!formData.watchedDate) {
      newErrors.watchedDate = '視聴日は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{anime ? 'アニメを編集' : '新しいアニメを追加'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="タイトル"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleChange}
            onBlur={() => console.log('タイトル欄からフォーカスが外れました')}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
          <TextField
            name="imageUrl"
            label="画像URL"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            margin="dense"
            name="year"
            label="年"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.year || ''}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
          />

          <FormControl fullWidth margin="dense" error={!!errors.genres}>
            <InputLabel id="genres-label">ジャンル</InputLabel>
            <Select
              labelId="genres-label"
              multiple
              name="genres"
              value={formData.genres}
              onChange={handleGenreChange}
              input={<OutlinedInput label="ジャンル" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
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
            {errors.genres && (
              <Typography variant="caption" color="error">
                {errors.genres}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography component="legend">評価</Typography>
            <Rating
              name="personalRating"
              value={formData.personalRating}
              onChange={handleRatingChange}
              precision={1}
            />
          </Box>

          <TextField
            margin="dense"
            name="watchedDate"
            label="視聴日"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.watchedDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.watchedDate}
            helperText={errors.watchedDate}
            required
          />

          <TextField
            margin="dense"
            name="imageUrl"
            label="カバー画像URL"
            type="url"
            fullWidth
            variant="outlined"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />

          <TextField
            margin="dense"
            name="notes"
            label="メモ"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={formData.notes || ''}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>キャンセル</Button>
          <Button type="submit" variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AnimeForm;

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Anime } from '../types';

interface BulkAnimeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (animes: Omit<Anime, 'id'>[]) => void;
}

const BulkAnimeForm: React.FC<BulkAnimeFormProps> = ({ open, onClose, onSave }) => {
  const [titlesText, setTitlesText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedTitles, setProcessedTitles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // タイトルテキストの変更ハンドラ
  const handleTitlesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitlesText(e.target.value);
    setError(null);
  };

  // フォームのリセット
  const resetForm = () => {
    setTitlesText('');
    setProcessedTitles([]);
    setError(null);
    setIsProcessing(false);
  };

  // ダイアログを閉じる際の処理
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 複数アニメの追加処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力テキストを行ごとに分割してタイトルリストを作成
    const titles = titlesText
      .split('\n')
      .map(title => title.trim())
      .filter(title => title.length > 0);
    
    if (titles.length === 0) {
      setError('少なくとも1つのタイトルを入力してください');
      return;
    }

    setIsProcessing(true);
    setProcessedTitles([]);

    // 各タイトルを処理して追加
    const animesToAdd: Omit<Anime, 'id'>[] = titles.map(title => ({
      title,
      year: undefined,
      genres: [],
      personalRating: 3,
      notes: '',
      watchedDate: new Date().toISOString().split('T')[0],
      coverImage: ''
    }));

    // 処理完了後、親コンポーネントに渡す
    setProcessedTitles(titles);
    onSave(animesToAdd);
    resetForm();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>複数アニメをまとめて追加</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            追加したいアニメのタイトルを1行に1つずつ入力してください。
            タイトルから自動的に放送年、ジャンル、カバー画像が取得されます。
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="アニメタイトル（1行に1つ）"
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            value={titlesText}
            onChange={handleTitlesChange}
            placeholder="例：\n進撃の巨人\nSPY×FAMILY\nぼっち・ざ・ろっく！"
            disabled={isProcessing}
            error={!!error}
            helperText={error}
          />

          {processedTitles.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1">処理されたタイトル：</Typography>
              <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
                <List dense>
                  {processedTitles.map((title, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={title} />
                      </ListItem>
                      {index < processedTitles.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            キャンセル
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isProcessing || !titlesText.trim()}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                処理中...
              </>
            ) : '追加'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BulkAnimeForm;

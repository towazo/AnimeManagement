import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, CircularProgress } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { useGemini } from '../hooks/useGemini';

interface AnimeResult {
  title: string;
  confidencePercent: number;
}

interface Props {}

const ImageIdentifyDialog: React.FC<Props> = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<AnimeResult | null>(null);
  const [error, setError] = useState<string>('');
  const { loading, imageIdentify } = useGemini();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult('');
    }
  };

  const handleIdentify = async () => {
    if (!file) return;
    setError('');
    setParsedResult(null);
    
    const base64 = await fileToBase64(file);
    const text = await imageIdentify(base64);
    
    if (text) {
      setResult(text);
      try {
        // JSONテキストを解析
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonText = jsonMatch[0];
          const parsed = JSON.parse(jsonText) as AnimeResult;
          setParsedResult(parsed);
        } else {
          setError('結果の解析に失敗しました');
        }
      } catch (err) {
        console.error('JSON解析エラー:', err);
        setError('結果の解析に失敗しました');
      }
    } else {
      setError('エラーが発生しました。時間を置いて再試行してください。');
    }
  };

  return (
    <>
      <IconButton
        color="secondary"
        sx={{ position: 'fixed', bottom: 144, right: 16, zIndex: 2000 }}
        onClick={() => setOpen(true)}
      >
        <PhotoCameraIcon />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          画像から作品推定
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            画像を選択
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
          {file && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">選択されたファイル: {file.name}</Typography>
              <img src={URL.createObjectURL(file)} alt="preview" style={{ maxWidth: '100%', marginTop: 8 }} />
            </Box>
          )}
          {loading && <CircularProgress />}
          {parsedResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">推定結果</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>{parsedResult.title}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>信頼度: {parsedResult.confidencePercent}%</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="error">{error}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>閉じる</Button>
          <Button onClick={handleIdentify} variant="contained" disabled={!file || loading}>判定</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageIdentifyDialog;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove data URI prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useGemini } from '../hooks/useGemini';
import TowazoBubble from './TowazoBubble';

interface ImageIdentifyDialogProps {
  open: boolean;
  onClose: () => void;
}

interface AnimeResult {
  title: string;
  confidencePercent: number;
}

// towazoの口調でコメントを生成する関数
const generateTowazoComment = (result: AnimeResult): string => {
  const { title, confidencePercent } = result;
  
  if (confidencePercent >= 90) {
    return `やったね！この画像は「${title}」だと思うよ〜！\n僕の自信度は${confidencePercent}%だから、かなり確信してるね！`;
  } else if (confidencePercent >= 70) {
    return `うーん、この画像は「${title}」かな？\n${confidencePercent}%くらいの確信度だから、たぶん合ってると思うよ！`;
  } else {
    return `ちょっと難しいけど、「${title}」かもしれないね〜\n${confidencePercent}%の確信度だから、もしかしたら違うかも...でも頑張って推測したよ！`;
  }
};

const ImageIdentifyDialog: React.FC<ImageIdentifyDialogProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<AnimeResult | null>(null);
  const [error, setError] = useState<string>('');
  const { loading, imageIdentify } = useGemini();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleClose = () => {
    setFile(null);
    setResult('');
    setParsedResult(null);
    setError('');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult('');
      setParsedResult(null);
      setError('');
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
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonText = jsonMatch[0];
          const parsed = JSON.parse(jsonText) as AnimeResult;
          setParsedResult(parsed);
        } else {
          // JSON形式以外のプレーンテキストを処理する
          setParsedResult({ title: text, confidencePercent: 100 });
        }
      } catch (err) {
        console.error('JSON解析エラー:', err);
        setError('ごめんね〜結果の解析でエラーが起きちゃった！もう一度試してみてね！');
      }
    } else {
      setError('うーん、エラーが起きちゃった！少し時間を置いてもう一度試してみてね〜');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        towazo の画像識別
        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleClose}>
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
        
        {!parsedResult && !error && !loading && file && (
          <TowazoBubble>
            画像をアップロードしてくれてありがとう！<br />
            「判定」ボタンを押すと、僕が画像を見てアニメ作品を推測するよ〜<br />
            どんな作品か楽しみだね！
          </TowazoBubble>
        )}
        
        {loading && (
          <TowazoBubble>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">画像を一生懸命見てるよ〜</Typography>
            </Box>
          </TowazoBubble>
        )}
        
        {parsedResult && (
          <TowazoBubble>
            {generateTowazoComment(parsedResult)}
          </TowazoBubble>
        )}
        
        {error && (
          <TowazoBubble>
            <Typography color="error">{error}</Typography>
          </TowazoBubble>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>閉じる</Button>
        <Button 
          variant="contained" 
          onClick={handleIdentify} 
          disabled={!file || loading}
          sx={{ minWidth: 80 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : '判定'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageIdentifyDialog;

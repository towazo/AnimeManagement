import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useGemini } from '../../hooks/useGemini';
import TowazoBubble from '../../shared/components/TowazoBubble';
import { AnimeResult, ImageIdentifyDialogProps } from './types';
import { generateTowazoComment, fileToBase64 } from './utils';
import { extractAnimeTitle, isEmpty } from '../../shared/utils/textProcessing';

const ImageIdentifyDialog: React.FC<ImageIdentifyDialogProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<AnimeResult | null>(null);
  const [error, setError] = useState<string>('');
  const { loading, imageIdentify } = useGemini();

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
    
    try {
      const base64 = await fileToBase64(file);
      const text = await imageIdentify(base64);
      
      if (text) {
        setResult(text);
        
        // JSON形式の解析を試行
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonText = jsonMatch[0];
          const parsed = JSON.parse(jsonText) as AnimeResult;
          setParsedResult(parsed);
        } else {
          // JSON形式以外のプレーンテキストを処理
          const title = extractAnimeTitle(text);
          if (isEmpty(title)) {
            setError('作品名が見つからなかったみたい。もう一度試してみて！');
          } else {
            setParsedResult({ title, confidencePercent: 100 });
          }
        }
      } else {
        setError('うーん、エラーが起きちゃった。少し時間を置いてもう一度試してみて。');
      }
    } catch (err) {
      console.error('画像識別エラー:', err);
      setError('ごめん、結果の解析でエラーが起きちゃった。もう一度試してみて！');
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
            <Typography variant="body2" sx={{ color: '#666666' }}>
              選択されたファイル: {file.name}
            </Typography>
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <img
                src={URL.createObjectURL(file)}
                alt="選択された画像"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          </Box>
        )}
        
        {parsedResult && (
          <Box sx={{ mb: 2 }}>
            <TowazoBubble>
              {generateTowazoComment(parsedResult)}
            </TowazoBubble>
          </Box>
        )}
        
        {error && (
          <Box sx={{ mb: 2 }}>
            <TowazoBubble>
              {error}
            </TowazoBubble>
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2, alignSelf: 'center' }}>
              画像を分析中...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>閉じる</Button>
        <Button 
          onClick={handleIdentify} 
          variant="contained" 
          disabled={!file || loading}
        >
          識別開始
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageIdentifyDialog;

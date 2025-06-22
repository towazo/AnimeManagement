import React, { useState, useEffect } from 'react';
import { Box, IconButton, useTheme, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { keyframes } from '@mui/system';

// フェードイン・アウトのアニメーション定義
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

interface ImageSlideshowProps {
  images: string[];
  autoPlayInterval?: number; // ミリ秒単位
  height?: string | number;
  quality?: 'high' | 'medium' | 'low'; // 画像品質設定
  displayMode?: 'natural' | 'cover' | 'contain'; // 画像表示モード
}

const ImageSlideshow: React.FC<ImageSlideshowProps> = ({
  images,
  autoPlayInterval = 5000, // デフォルト5秒
  height = '60vh',
  quality = 'high', // デフォルトは高品質
  displayMode = 'natural', // デフォルトは自然な表示
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [loadedImages, setLoadedImages] = useState<{[key: string]: boolean}>({});
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);

  // 画像のプリロード処理
  useEffect(() => {
    // 現在の画像と次の画像をプリロード
    const preloadImages = () => {
      const imagesToLoad = [];
      // 現在の画像
      imagesToLoad.push(images[currentIndex]);
      // 次の画像
      const nextIndex = (currentIndex + 1) % images.length;
      imagesToLoad.push(images[nextIndex]);
      // 前の画像
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      imagesToLoad.push(images[prevIndex]);

      // 重複を排除
      const uniqueImages = [...new Set(imagesToLoad)];
      
      // プリロード
      uniqueImages.forEach(src => {
        if (!preloadedImages.includes(src)) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => ({ ...prev, [src]: true }));
            setPreloadedImages(prev => [...prev, src]);
          };
          img.src = src;
        }
      });
    };

    preloadImages();
  }, [currentIndex, images]);

  // 自動再生のためのタイマー設定
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => {
      clearInterval(timer);
    };
  }, [currentIndex, autoPlayInterval]);

  // 次の画像に進む
  const goToNext = () => {
    if (isAnimating) return;
    setDirection('next');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsAnimating(false);
    }, 500); // フェードアウト時間
  };

  // 前の画像に戻る
  const goToPrev = () => {
    if (isAnimating) return;
    setDirection('prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setIsAnimating(false);
    }, 500); // フェードアウト時間
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderRadius: theme.shape.borderRadius,
        mb: 4,
      }}
    >
      {/* 背景ブラーエフェクト（同じ画像を背景にブラーをかけて表示） */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: loadedImages[images[currentIndex]] ? `url(${images[currentIndex]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          opacity: 0.5,
          transform: 'scale(1.2)', // ブラーのエッジを隠す
        }}
      />
      
      {/* 背景オーバーレイ */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)',
          zIndex: 1,
        }}
      />

      {/* 画像表示エリア */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {/* 画像読み込み中のローディング表示 */}
        {!loadedImages[images[currentIndex]] && (
          <Box
            sx={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              zIndex: 3,
              bgcolor: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}
        
        {/* 実際の画像 */}
        <Box
          sx={{
            position: 'relative',
            width: displayMode === 'cover' ? '100%' : 'auto',
            height: displayMode === 'cover' ? '100%' : 'auto',
            maxWidth: displayMode === 'contain' ? '100%' : (displayMode === 'natural' ? '85%' : '100%'),
            maxHeight: displayMode === 'contain' ? '100%' : (displayMode === 'natural' ? '85%' : '100%'),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: displayMode === 'natural' ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
            borderRadius: displayMode === 'natural' ? '8px' : '0',
            overflow: 'hidden',
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`スライド画像 ${currentIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: displayMode === 'natural' ? 'contain' : (displayMode === 'cover' ? 'cover' : 'contain'),
              objectPosition: 'center',
              animation: `${isAnimating ? fadeOut : fadeIn} 0.5s ease-in-out`,
              transition: 'all 0.5s ease-in-out',
            }}
            onLoad={() => setLoadedImages(prev => ({ ...prev, [images[currentIndex]]: true }))}
          />
        </Box>
      </Box>

      {/* オーバーレイグラデーション */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '30%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* ナビゲーションボタン - ホバー時のみ表示 */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '0 20px',
          opacity: 0,
          transition: 'opacity 0.3s',
          '&:hover': {
            opacity: 1,
          },
        }}
      >
        <IconButton
          onClick={goToPrev}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={goToNext}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          <ArrowForward />
        </IconButton>
      </Box>

      {/* インジケーター */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ImageSlideshow;

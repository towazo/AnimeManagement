import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Checkbox,
  IconButton,
  Tooltip,
  Pagination,
} from '@mui/material';
import { 
  Add as AddIcon, 
  ArrowDropDown as ArrowDropDownIcon,
  DeleteSweep as DeleteSweepIcon,
  Close as CloseIcon,
  SelectAll as SelectAllIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';
import AnimeTable from '../components/AnimeTable';
import AnimeForm from '../components/AnimeForm';
import BulkAnimeForm from '../components/BulkAnimeForm';
import FilterBar from '../components/FilterBar';
import ImportExportDialog from '../components/ImportExportDialog';
import { Anime } from '../types';

const HomePage: React.FC = () => {
  const {
    filteredAnimeList,
    filters,
    viewMode,
    addAnime,
    addBulkAnime,
    updateAnime,
    deleteAnime,
    deleteBulkAnime,
    markAsRewatched,
    setSearchTerm,
    setSelectedGenres,
    setSortBy,
    toggleViewMode,
    exportData,
    importData
  } = useAnime();

  const [formOpen, setFormOpen] = useState(false);
  const [bulkFormOpen, setBulkFormOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [animeToDelete, setAnimeToDelete] = useState<string | null>(null);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // 複数選択モードの状態管理
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // ページネーション関連の状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 1ページあたりの表示数
  
  // 検索やフィルターが変更されたときにページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.selectedGenres, filters.sortBy]);

  const handleAddMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  const handleAddClick = () => {
    setSelectedAnime(undefined);
    setFormOpen(true);
    handleAddMenuClose();
  };
  
  const handleBulkAddClick = () => {
    setBulkFormOpen(true);
    handleAddMenuClose();
  };

  const handleEditClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAnimeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (animeToDelete) {
      deleteAnime(animeToDelete);
      setSnackbar({
        open: true,
        message: 'アニメが削除されました',
        severity: 'success'
      });
    }
    setDeleteDialogOpen(false);
    setAnimeToDelete(null);
  };

  const handleRewatchClick = (id: string) => {
    markAsRewatched(id);
    setSnackbar({
      open: true,
      message: '再視聴としてマークされました',
      severity: 'success'
    });
  };
  
  // 複数選択モードの切り替え
  const toggleSelectionMode = () => {
    if (selectionMode) {
      // 選択モードを終了する場合は選択をクリア
      setSelectedAnimeIds([]);
    }
    setSelectionMode(!selectionMode);
    setCurrentPage(1); // 選択モード切替時にページを1に戻す
  };
  
  // アニメの選択状態を切り替え
  const toggleAnimeSelection = (id: string) => {
    setSelectedAnimeIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(animeId => animeId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // すべてのアニメを選択
  const selectAllAnime = () => {
    const allAnimeIds = filteredAnimeList.map(anime => anime.id);
    setSelectedAnimeIds(allAnimeIds);
  };
  
  // すべての選択を解除
  const clearAllSelection = () => {
    setSelectedAnimeIds([]);
  };
  
  // 複数削除ボタンのクリックハンドラ
  const handleBulkDeleteClick = () => {
    if (selectedAnimeIds.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };
  
  // 複数削除の確定処理
  const handleConfirmBulkDelete = () => {
    if (selectedAnimeIds.length > 0) {
      deleteBulkAnime(selectedAnimeIds);
      setSnackbar({
        open: true,
        message: `${selectedAnimeIds.length}件のアニメが削除されました`,
        severity: 'success'
      });
      setSelectedAnimeIds([]);
    }
    setBulkDeleteDialogOpen(false);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleFormSave = async (animeData: Anime | Omit<Anime, 'id'>) => {
    if ('id' in animeData) {
      updateAnime(animeData);
      setSnackbar({
        open: true,
        message: 'アニメが更新されました',
        severity: 'success'
      });
      setFormOpen(false);
    } else {
      const result = await addAnime(animeData);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'アニメが追加されました',
          severity: 'success'
        });
        setFormOpen(false);
      } else {
        // 重複エラーの場合
        setSnackbar({
          open: true,
          message: result.message || 'アニメの追加に失敗しました',
          severity: 'warning'
        });
        // フォームは閉じないでおく
      }
    }
  };

  const handleBulkFormSave = async (animesData: Omit<Anime, 'id'>[]) => {
    try {
      await addBulkAnime(animesData);
      setSnackbar({
        open: true,
        message: `${animesData.length}件のアニメが追加されました`,
        severity: 'success'
      });
      setBulkFormOpen(false);
    } catch (error: any) {
      console.error('複数アニメ追加エラー:', error);
      
      // 重複エラーの場合は、エラーメッセージを表示
      if (error.message && error.message.includes('重複')) {
        setSnackbar({
          open: true,
          message: error.message,
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: '一部のアニメの追加に失敗しました',
          severity: 'error'
        });
      }
      // エラーがあってもフォームを閉じる
      setBulkFormOpen(false);
    }
  };

  const handleImportExportOpen = () => {
    setImportExportOpen(true);
  };

  const handleImportExportClose = () => {
    setImportExportOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          アニメアーカイブ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectionMode ? (
            <>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<CloseIcon />}
                onClick={toggleSelectionMode}
              >
                選択モードを終了
              </Button>
              <Tooltip title="すべて選択">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SelectAllIcon />}
                  onClick={selectAllAnime}
                  disabled={filteredAnimeList.length === 0 || selectedAnimeIds.length === filteredAnimeList.length}
                >
                  すべて選択
                </Button>
              </Tooltip>
              <Tooltip title="選択解除">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ClearAllIcon />}
                  onClick={clearAllSelection}
                  disabled={selectedAnimeIds.length === 0}
                >
                  選択解除
                </Button>
              </Tooltip>
              <Tooltip title="選択したアニメを削除">
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleBulkDeleteClick}
                  disabled={selectedAnimeIds.length === 0}
                >
                  {selectedAnimeIds.length}件を削除
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <Button 
                variant="outlined" 
                onClick={toggleSelectionMode}
              >
                複数選択モード
              </Button>
              <Button variant="outlined" onClick={handleImportExportOpen}>
                インポート/エクスポート
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddClick}
              >
                アニメを追加
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBulkAddClick}
              >
                一括追加
              </Button>
            </>
          )}
        </Box>
      </Box>

      <FilterBar
        searchTerm={filters.searchTerm}
        selectedGenres={filters.selectedGenres}
        sortBy={filters.sortBy}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onGenreChange={setSelectedGenres}
        onSortChange={setSortBy}
        onViewModeToggle={toggleViewMode}
      />
      
      {/* 検索結果の件数表示 */}
      {filters.searchTerm && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            「{filters.searchTerm}」の検索結果: {filteredAnimeList.length}件
          </Typography>
        </Box>
      )}

      {filteredAnimeList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            アニメが見つかりません
          </Typography>
          <Typography variant="body1" color="text.secondary">
            検索条件を変更するか、新しいアニメを追加してください
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ mt: 2 }}
          >
            アニメを追加
          </Button>
        </Box>
      ) : viewMode === 'card' ? (
        <>
          <Grid container spacing={3}>
            {filteredAnimeList
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((anime) => (
            <Grid item key={anime.id} xs={12} sm={6} md={4}>
              <Box sx={{ position: 'relative' }}>
                {selectionMode && (
                  <Checkbox
                    checked={selectedAnimeIds.includes(anime.id)}
                    onChange={() => toggleAnimeSelection(anime.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '50%'
                    }}
                  />
                )}
                <AnimeCard
                  anime={anime}
                  onEdit={selectionMode ? undefined : handleEditClick}
                  onDelete={selectionMode ? undefined : handleDeleteClick}
                  onRewatch={selectionMode ? undefined : handleRewatchClick}
                  onClick={selectionMode ? () => toggleAnimeSelection(anime.id) : undefined}
                  selected={selectionMode && selectedAnimeIds.includes(anime.id)}
                />
              </Box>
            </Grid>
          ))}
          </Grid>
          {filteredAnimeList.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination 
                count={Math.ceil(filteredAnimeList.length / itemsPerPage)} 
                page={currentPage} 
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <>
          <AnimeTable
            animeList={filteredAnimeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            onEdit={selectionMode ? undefined : handleEditClick}
            onDelete={selectionMode ? undefined : handleDeleteClick}
            onRewatch={selectionMode ? undefined : handleRewatchClick}
            selectionMode={selectionMode}
            selectedAnimeIds={selectedAnimeIds}
            onToggleSelection={toggleAnimeSelection}
          />
          {filteredAnimeList.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination 
                count={Math.ceil(filteredAnimeList.length / itemsPerPage)} 
                page={currentPage} 
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column' }}>
        <Fab
          color="primary"
          aria-label="add"
          aria-controls="add-menu"
          aria-haspopup="true"
          onClick={handleAddMenuClick}
          sx={{ mb: addMenuAnchorEl ? 1 : 0 }}
        >
          <AddIcon />
          <ArrowDropDownIcon sx={{ ml: -1, fontSize: '1.2rem' }} />
        </Fab>
        <Menu
          id="add-menu"
          anchorEl={addMenuAnchorEl}
          open={Boolean(addMenuAnchorEl)}
          onClose={handleAddMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={handleAddClick}>アニメを追加</MenuItem>
          <MenuItem onClick={handleBulkAddClick}>複数アニメをまとめて追加</MenuItem>
        </Menu>
      </Box>

      <AnimeForm
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        anime={selectedAnime}
      />
      
      <BulkAnimeForm
        open={bulkFormOpen}
        onClose={() => setBulkFormOpen(false)}
        onSave={handleBulkFormSave}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>アニメを削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このアニメを削除してもよろしいですか？この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 複数削除確認ダイアログ */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        aria-labelledby="bulk-delete-dialog-title"
      >
        <DialogTitle id="bulk-delete-dialog-title">
          複数アニメの削除
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            選択した{selectedAnimeIds.length}件のアニメを削除します。この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleConfirmBulkDelete} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>

      <ImportExportDialog
        open={importExportOpen}
        onClose={handleImportExportClose}
        onExport={exportData}
        onImport={importData}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HomePage;

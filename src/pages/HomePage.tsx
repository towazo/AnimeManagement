import React, { useState } from 'react';
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
  MenuItem
} from '@mui/material';
import { Add as AddIcon, ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

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
    } else {
      await addAnime(animeData);
      setSnackbar({
        open: true,
        message: 'アニメが追加されました',
        severity: 'success'
      });
    }
    setFormOpen(false);
  };

  const handleBulkFormSave = async (animesData: Omit<Anime, 'id'>[]) => {
    try {
      await addBulkAnime(animesData);
      setSnackbar({
        open: true,
        message: `${animesData.length}件のアニメが追加されました`,
        severity: 'success'
      });
    } catch (error) {
      console.error('複数アニメ追加エラー:', error);
      setSnackbar({
        open: true,
        message: '一部のアニメの追加に失敗しました',
        severity: 'error'
      });
    }
    setBulkFormOpen(false);
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
        <Button variant="outlined" onClick={handleImportExportOpen}>
          インポート/エクスポート
        </Button>
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
        <Grid container spacing={3}>
          {filteredAnimeList.map((anime) => (
            <Grid item key={anime.id} xs={12} sm={6} md={4}>
              <AnimeCard
                anime={anime}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onRewatch={handleRewatchClick}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <AnimeTable
          animeList={filteredAnimeList}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRewatch={handleRewatchClick}
        />
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

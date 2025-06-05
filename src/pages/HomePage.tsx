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
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';
import AnimeTable from '../components/AnimeTable';
import AnimeForm from '../components/AnimeForm';
import FilterBar from '../components/FilterBar';
import ImportExportDialog from '../components/ImportExportDialog';
import { Anime } from '../types';

const HomePage: React.FC = () => {
  const {
    filteredAnimeList,
    filters,
    viewMode,
    addAnime,
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
  const [selectedAnime, setSelectedAnime] = useState<Anime | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [animeToDelete, setAnimeToDelete] = useState<string | null>(null);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAddClick = () => {
    setSelectedAnime(undefined);
    setFormOpen(true);
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
      await addAnime(animeData as Omit<Anime, 'id'>); // await を追加
      setSnackbar({
        open: true,
        message: '新しいアニメが追加されました',
        severity: 'success'
      });
    }
    setFormOpen(false);
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

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddClick}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      <AnimeForm
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        anime={selectedAnime}
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

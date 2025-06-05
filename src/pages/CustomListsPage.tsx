import React, { useState } from 'react';
import { useCustomLists } from '../context/CustomListContext';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CustomListsPage: React.FC = () => {
  const { customLists, addCustomList, deleteCustomList, updateCustomList } = useCustomLists();
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [editingList, setEditingList] = useState<ReturnType<typeof useCustomLists>['customLists'][0] | null>(null);
  const [editListName, setEditListName] = useState('');
  const [editListDescription, setEditListDescription] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  const handleAddList = () => {
    if (newListName.trim() !== '') {
      addCustomList(newListName.trim(), newListDescription.trim());
      setNewListName('');
      setNewListDescription('');
    }
  };

  const handleDeleteClick = (listId: string) => {
    setListToDelete(listId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (listToDelete) {
      deleteCustomList(listToDelete);
      setListToDelete(null);
    }
    setOpenDeleteDialog(false);
  };

  const handleEditClick = (list: ReturnType<typeof useCustomLists>['customLists'][0]) => {
    setEditingList(list);
    setEditListName(list.name);
    setEditListDescription(list.description || '');
  };

  const handleUpdateList = () => {
    if (editingList && editListName.trim() !== '') {
      updateCustomList(editingList.id, { name: editListName.trim(), description: editListDescription.trim() });
      setEditingList(null);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        カスタムリスト管理
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="新しいリスト名"
          variant="outlined"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          label="説明（任意）"
          variant="outlined"
          value={newListDescription}
          onChange={(e) => setNewListDescription(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleAddList} sx={{ height: 'fit-content', alignSelf: 'center' }}>
          リスト作成
        </Button>
      </Box>

      {editingList && (
        <Dialog open={!!editingList} onClose={() => setEditingList(null)}>
          <DialogTitle>リスト編集</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="リスト名"
              type="text"
              fullWidth
              variant="standard"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="説明（任意）"
              type="text"
              fullWidth
              variant="standard"
              value={editListDescription}
              onChange={(e) => setEditListDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingList(null)}>キャンセル</Button>
            <Button onClick={handleUpdateList}>更新</Button>
          </DialogActions>
        </Dialog>
      )}

      <Typography variant="h5" gutterBottom>
        作成済みリスト
      </Typography>
      {customLists.length === 0 ? (
        <Typography>カスタムリストはまだありません。</Typography>
      ) : (
        <List>
          {customLists.map((list) => (
            <ListItem
              key={list.id}
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(list)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(list.id)} sx={{ ml: 1}}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
              sx={{ borderBottom: '1px solid #eee' }}
            >
              <ListItemText primary={list.name} secondary={list.description || '説明なし'} />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>リスト削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            本当にこのリストを削除しますか？この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CustomListsPage;

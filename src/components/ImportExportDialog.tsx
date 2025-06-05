import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import { Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-export-tabpanel-${index}`}
      aria-labelledby={`import-export-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface ImportExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: () => string;
  onImport: (data: string) => boolean;
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  open,
  onClose,
  onExport,
  onImport
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setImportData('');
    setImportError(null);
    setImportSuccess(false);
  };

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anime_archive_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const success = onImport(importData);
      if (success) {
        setImportSuccess(true);
        setImportError(null);
        setImportData('');
      } else {
        setImportError('インポートに失敗しました。データ形式が正しくありません。');
        setImportSuccess(false);
      }
    } catch (e) {
      setImportError('インポートに失敗しました。有効なJSONデータを入力してください。');
      setImportSuccess(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>データのインポート/エクスポート</DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="import export tabs">
          <Tab icon={<DownloadIcon />} label="エクスポート" id="import-export-tab-0" />
          <Tab icon={<UploadIcon />} label="インポート" id="import-export-tab-1" />
        </Tabs>
      </Box>
      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" gutterBottom>
            現在のアニメデータをJSONファイルとしてエクスポートします。このファイルはバックアップとして保存するか、他のデバイスにインポートすることができます。
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              JSONファイルをダウンロード
            </Button>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" gutterBottom>
            以前にエクスポートしたJSONデータをインポートします。現在のデータは上書きされますのでご注意ください。
          </Typography>
          <TextField
            label="JSONデータを貼り付け"
            multiline
            rows={10}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!importError}
            helperText={importError}
          />
          {importSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              データが正常にインポートされました！
            </Alert>
          )}
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        {tabValue === 1 && (
          <Button
            onClick={handleImport}
            variant="contained"
            color="primary"
            disabled={!importData}
          >
            インポート
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportExportDialog;

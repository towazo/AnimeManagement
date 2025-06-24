export interface AnimeResult {
  title: string;
  confidencePercent: number;
}

export interface ImageIdentifyDialogProps {
  open: boolean;
  onClose: () => void;
}

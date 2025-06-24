export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

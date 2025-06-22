import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { migrateData } from './utils/migrateData';

// アプリケーション起動時にデータ移行を実行
migrateData();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// パフォーマンスを測定する場合はこの関数を呼び出します
reportWebVitals();

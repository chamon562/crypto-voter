import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {MoralisProvider} from 'react-moralis'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MoralisProvider appId='GcP5Rc5nS0DPABni7uXKFX2a3RpOwdCkl9W5TPFH' serverUrl='https://9f47psz0gmou.usemoralis.com:2053/server
'>
      
    <App />
    </MoralisProvider>
  </React.StrictMode>
);



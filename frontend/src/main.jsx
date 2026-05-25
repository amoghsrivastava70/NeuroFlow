import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const storedTheme = window.localStorage.getItem('neuroflow-theme');
const preferredTheme = storedTheme === 'light' || storedTheme === 'dark'
  ? storedTheme
  : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

document.documentElement.classList.toggle('dark', preferredTheme === 'dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

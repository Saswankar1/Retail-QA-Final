import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- This is the one you're missing
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



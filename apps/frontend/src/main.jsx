import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from "./redux/store.js";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    
        <ThemeProvider defaultTheme="dark" attribute="class">
          <App />
        
        </ThemeProvider>
      
    </Provider>
  </React.StrictMode>
)

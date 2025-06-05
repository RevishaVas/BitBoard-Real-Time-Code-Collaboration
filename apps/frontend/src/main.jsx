import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { RecoilRoot } from "recoil";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RecoilRoot>
        <ThemeProvider defaultTheme="dark" attribute="class">
          <App />
        </ThemeProvider>
      </RecoilRoot>
    </Provider>
  </StrictMode>
);

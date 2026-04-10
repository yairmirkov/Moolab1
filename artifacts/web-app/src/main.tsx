import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import App from "./App";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AppLogin from "./pages/AppLogin";
import Demo from "./pages/Demo";
import Feed from "./pages/Feed";
import "./index.css";

function syncUrlLangToStorage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang === "es" || urlLang === "en") {
    localStorage.setItem("ws_lang", urlLang);
  }
}

function LegacyApp() {
  syncUrlLangToStorage();
  return <App />;
}

const basePath = import.meta.env.BASE_URL;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basePath.endsWith("/") ? basePath.slice(0, -1) : basePath}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app-login" element={<AppLogin />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/legacy" element={<LegacyApp />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

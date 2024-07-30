import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://vwextkqnwkxzzjvkqoqt.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ContentLoader } from "./components/ui/loader";

// Полифилл для поддержки Intl на русском языке
if (typeof Intl !== "undefined") {
  // Форматирование дат на русском
  if (Intl.DateTimeFormat) {
    new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }
}

createRoot(document.getElementById("root")!).render(<App />);

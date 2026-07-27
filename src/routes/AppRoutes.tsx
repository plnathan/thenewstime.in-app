import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../features/news/pages/HomePage";

import NewsDetails from "../features/news/pages/NewsDetailPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/news/:slug" element={<NewsDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

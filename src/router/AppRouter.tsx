import { Routes, Route } from "react-router-dom";

//import HomePage from "../pages/Home/HomePage";
import HomePage from "@/pages/Home/HomePage";
// import NewsDetailPage from "../pages/NewsDetailPage";
import NotFoundPage from "../pages/NotFoundPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/news/:id" element={<NewsDetailPage />} /> */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;

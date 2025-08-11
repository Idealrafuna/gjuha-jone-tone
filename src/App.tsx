import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import About from "./pages/About";
import Explore from "./pages/Explore";
import SignIn from "./pages/SignIn";
import Onboarding from "./pages/Onboarding";
import Learn from "./pages/Learn";
import LessonDetail from "./pages/LessonDetail";
import Review from "./pages/Review";
import CultureCities from "./pages/CultureCities";
import CultureCityDetail from "./pages/CultureCityDetail";
import CultureFigures from "./pages/CultureFigures";
import CultureFigureDetail from "./pages/CultureFigureDetail";
import CultureTraditions from "./pages/CultureTraditions";
import CultureTraditionDetail from "./pages/CultureTraditionDetail";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminHome from "./pages/admin/AdminHome";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminCities from "./pages/admin/AdminCities";
import AdminFigures from "./pages/admin/AdminFigures";
import AdminTraditions from "./pages/admin/AdminTraditions";
import AdminVocab from "./pages/admin/AdminVocab";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import Cities from "./pages/Cities";
import CityDetail from "./pages/CityDetail";
import Figures from "./pages/Figures";
import FigureDetail from "./pages/FigureDetail";
import Traditions from "./pages/Traditions";
import TraditionDetail from "./pages/TraditionDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/cities/:slug" element={<CityDetail />} />
          <Route path="/figures" element={<Figures />} />
          <Route path="/figures/:slug" element={<FigureDetail />} />
          <Route path="/traditions" element={<Traditions />} />
          <Route path="/traditions/:slug" element={<TraditionDetail />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/learn" element={<Learn />} />
          <Route path="/lessons/:slug" element={<LessonDetail />} />
          <Route path="/learn/review" element={<Review />} />

          <Route path="/culture/cities" element={<CultureCities />} />
          <Route path="/culture/cities/:slug" element={<CultureCityDetail />} />
          <Route path="/culture/figures" element={<CultureFigures />} />
          <Route path="/culture/figures/:slug" element={<CultureFigureDetail />} />
          <Route path="/culture/traditions" element={<CultureTraditions />} />
          <Route path="/culture/traditions/:slug" element={<CultureTraditionDetail />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/lessons" element={<AdminLessons />} />
          <Route path="/admin/cities" element={<AdminCities />} />
          <Route path="/admin/figures" element={<AdminFigures />} />
          <Route path="/admin/traditions" element={<AdminTraditions />} />
          <Route path="/admin/vocab" element={<AdminVocab />} />
          <Route path="/admin/quizzes" element={<AdminQuizzes />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

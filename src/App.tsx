import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppDock } from "@/components/AppDock";
import { AccessibilityManager } from "@/components/AccessibilityManager";
import Home from "./pages/Home";
import FlashCards from "./pages/FlashCards";
import Quiz from "./pages/Quiz";
import Memory from "./pages/Memory";
import Thoughtscape from "./pages/Thoughtscape";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";


const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <AccessibilityManager />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppDock />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flashcards" element={<FlashCards />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/thoughtscape" element={<Thoughtscape />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
);


export default App;

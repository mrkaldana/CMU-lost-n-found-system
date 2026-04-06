import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ItemsProvider } from "@/context/ItemsContext";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index.tsx";
import Report from "./pages/Report.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminItems from "./pages/AdminItems.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ItemsProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/report" element={<Report />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/items" element={<AdminItems />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ItemsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Reunioes from "./pages/Reunioes";
import Pautas from "./pages/Pautas";
import Acompanhamento from "./pages/Acompanhamento";
import Membros from "./pages/Membros";
import Destinatarios from "./pages/Destinatarios";
import Configuracoes from "./pages/Configuracoes";
import Atas from "./pages/Atas";
import Documentacao from "./pages/Documentacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reunioes" element={<Reunioes />} />
          <Route path="/pautas" element={<Pautas />} />
          <Route path="/acompanhamento" element={<Acompanhamento />} />
          <Route path="/membros" element={<Membros />} />
          <Route path="/destinatarios" element={<Destinatarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/atas" element={<Atas />} />
          <Route path="/documentacao" element={<Documentacao />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  titulo: string;
  subtitulo?: string;
}

export function MainLayout({ children, titulo, subtitulo }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        <Header titulo={titulo} subtitulo={subtitulo} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

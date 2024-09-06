"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageContent } from "./PageContent";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex gap-16 min-h-screen flex-col items-center justify-between p-16">
        <PageContent />
      </main>
    </QueryClientProvider>
  );
}

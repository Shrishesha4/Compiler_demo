'use client';

import { CompilerDemo } from '../../components/CompilerDemo';
import { DemoGuide } from '../../components/DemoGuide';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br bg-neutral-800">
      <main className="container mx-auto px-4 py-8 relative">
        <div className="absolute top-4 right-4">
          <DemoGuide />
        </div>
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Visual Compiler Design Toolkit
          </h1>
        </header>
        
        <CompilerDemo />
      </main>
    </div>
  );
}
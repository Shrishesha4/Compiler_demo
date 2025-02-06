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
        <CompilerDemo />
      </main>
    </div>
  );
}
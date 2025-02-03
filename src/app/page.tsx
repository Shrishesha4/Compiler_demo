import { CompilerDemo } from '../components/CompilerDemo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Interactive Compiler Design Toolkit
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore and understand how compilers work through interactive visualization
          </p>
        </header>
        
        <CompilerDemo />
      </main>
    </div>
  );
}
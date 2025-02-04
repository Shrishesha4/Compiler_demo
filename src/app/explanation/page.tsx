'use client';

import Link from 'next/link';

export default function ExplanationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Understanding Our Compiler</h1>
          <p className="text-lg text-gray-300">
            A comprehensive guide to how our compiler works
          </p>
        </header>

        <section className="space-y-6">
          <div className="bg-neutral-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Compiler Overview</h2>
            <p className="text-gray-300">
              Our compiler processes source code through six main phases, each performing a specific transformation or analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔍 Lexical Analysis</h3>
              <p className="text-gray-300">
                Breaks down source code into tokens (keywords, identifiers, operators, etc.)
              </p>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🌳 Syntax Analysis</h3>
              <p className="text-gray-300">
                Builds an Abstract Syntax Tree (AST) from tokens, verifying grammatical structure
              </p>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">✨ Semantic Analysis</h3>
              <p className="text-gray-300">
                Checks for semantic correctness like type checking and scope resolution
              </p>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔄 Intermediate Code</h3>
              <p className="text-gray-300">
                Generates platform-independent intermediate representation
              </p>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">⚡ Optimization</h3>
              <p className="text-gray-300">
                Improves code efficiency through various optimization techniques
              </p>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">💻 Code Generation</h3>
              <p className="text-gray-300">
                Produces target machine code or assembly
              </p>
            </div>
          </div>
        </section>

        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try the Compiler
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCompilerClick = () => {
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8 relative pb-24">
      {isLoading && <LoadingSpinner fullScreen />}
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Educational Compiler Demo Toolkit</h1>
          <p className="text-lg text-gray-300">
          Effective tool for learning Compiler Design
          </p>
        </header>

        <section className="space-y-6">
          <div className="bg-neutral-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-300 space-y-4">
              <span className="block">
                This visual compiler project demonstrates the complete process of converting JavaScript-like source code into executable code. It provides real-time visualization of each compilation phase, making it an ideal tool for learning compiler design principles.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔍 Lexical Analysis</h3>
              <div className="text-gray-300 space-y-2">
                <p>The lexical analyzer (scanner) breaks down source code into tokens:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Identifies keywords, identifiers, operators</li>
                  <li>Removes whitespace and comments</li>
                  <li>Handles string and number literals</li>
                  <li>Reports lexical errors</li>
                </ul>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🌳 Syntax Analysis</h3>
              <div className="text-gray-300 space-y-2">
                <p>The parser constructs an Abstract Syntax Tree (AST):</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Validates grammatical structure</li>
                  <li>Builds hierarchical representation</li>
                  <li>Handles expressions and statements</li>
                  <li>Detects syntax errors</li>
                </ul>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">✨ Semantic Analysis</h3>
              <div className="text-gray-300 space-y-2">
                <p>The semantic analyzer checks for meaning and validity:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Type checking and inference</li>
                  <li>Scope resolution</li>
                  <li>Symbol table management</li>
                  <li>Variable declaration validation</li>
                </ul>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔄 Intermediate Code</h3>
              <div className="text-gray-300 space-y-2">
                <p>Generates intermediate representation:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Three-address code generation</li>
                  <li>Control flow analysis</li>
                  <li>Platform-independent format</li>
                  <li>Preparation for optimization</li>
                </ul>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">⚡ Optimization</h3>
              <div className="text-gray-300 space-y-2">
                <p>Performs code optimizations:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Constant folding and propagation</li>
                  <li>Dead code elimination</li>
                  <li>Loop optimization</li>
                  <li>Expression simplification</li>
                </ul>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">💻 Code Generation</h3>
              <div className="text-gray-300 space-y-2">
                <p>Produces final executable code:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Target code generation</li>
                  <li>Register allocation</li>
                  <li>Memory management</li>
                  <li>Final assembly</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Interactive Environment</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Real-time code execution</li>
                  <li>Step-by-step visualization</li>
                  <li>Syntax highlighting</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Educational Tools</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Phase-by-phase explanation</li>
                  <li>Visual AST representation</li>
                  <li>Detailed error messages</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-900 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Know the Developer</h2>
          <div className="flex flex-col md:flex-row items-center gap-6 text-gray-300">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Shrishesha Narmatesshvara</h3>
                <p className="text-gray-400">Computer Science Student</p>
              </div>
              <p>
                Passionate about compiler design and programming language theory. 
                This project was developed as part of learning compiler construction 
                principles and making them more accessible to others.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/shrishesha4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <i className="fa-brands fa-github"></i>
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com/in/shrishesha" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <i className="fa-brands fa-linkedin"></i>
                  LinkedIn
                </a>
                <a 
                  href="https://www.shrishesha.online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-globe"></i>
                  Website
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-900 to-transparent py-6">
        <div className="text-center">
          <Link 
            href="/compiler"
            className="inline-block px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold shadow-lg"
            onClick={handleCompilerClick}
          >
            Try the Compiler
          </Link>
        </div>
      </div>
    </div>
  );
}
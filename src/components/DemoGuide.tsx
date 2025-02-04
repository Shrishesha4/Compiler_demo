'use client';

import { useState } from 'react';

export const DemoGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
        title={isOpen ? "Hide Guide" : "Show Guide"}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-[32rem] bg-neutral-800 rounded-lg p-6 space-y-4 shadow-xl z-50">
          <section>
            <h3 className="text-xl font-semibold mb-2">How to Use the Compiler</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Enter your JavaScript code in the editor</li>
              <li>Click &quot;Run Compiler&quot; to execute and analyze the code</li>
              <li>View the compilation process and output in real-time</li>
              <li>Click &quot;View Phases&quot; to see detailed visualization of each phase</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Console Output Guide</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Regular output appears in white text</li>
              <li>Errors are displayed in red text</li>
              <li>The console supports standard JavaScript console.log() calls</li>
              <li>Objects and arrays are automatically formatted for readability</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Example Usage</h3>
            <div className="bg-neutral-900 p-4 rounded-md w-full">
              <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap break-words max-w-full">
{`// Basic function example
function square(x) {
    return x * x;
}

// Using console.log
console.log(square(5));  // Output: 25

// Working with objects
let obj = { name: &quot;test&quot; };
console.log(obj);  // Output: { &quot;name&quot;: &quot;test&quot; }`}
              </pre>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Compilation Phases</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>🔍 Lexical Analysis: Breaks code into tokens</li>
              <li>🌳 Syntax Analysis: Creates abstract syntax tree</li>
              <li>✨ Semantic Analysis: Checks types and scopes</li>
              <li>🔄 Intermediate Code: Generates platform-independent code</li>
              <li>⚡ Optimization: Improves code efficiency</li>
              <li>💻 Code Generation: Produces final executable code</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};
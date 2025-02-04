'use client';

import { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { PhaseVisualizer } from './PhaseVisualizer';
import { LoadingSpinner } from './LoadingSpinner';
import { CodeOutput } from './CodeOutput';

interface ConsoleOutput {
  type: 'log' | 'error';
  content: string;
}

export const CompilerDemo = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [activePhase, setActivePhase] = useState('lexical');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ConsoleOutput[]>([]);
  const [outputError, setOutputError] = useState<string>('');

  const executeCode = async (code: string): Promise<void> => {
    setOutput([]);
    setOutputError('');
  
    try {
      const logs: string[] = [];
      const context = {
        console: {
          log: (...args: unknown[]) => {
            const logMessage = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            logs.push(logMessage);
          }
        }
      };
  
      const wrappedCode = `
        (function() {
          let __result;
          
          ${code}
  
          // Evaluate the code and capture the result
          try {
            __result = eval(\`${code}\`);
            if (__result !== undefined) {
              console.log(__result);
            }
          } catch (e) {
            console.log('Error:', e.message);
          }
        })();
      `;
  
      const fn = new Function('context', `
        with (context) {
          try {
            ${wrappedCode}
          } catch (e) {
            console.log('Error:', e.message);
          }
        }
      `);
  
      await Promise.resolve(fn(context));
  
      setOutput(prev => [
        ...prev,
        ...(logs.length > 0 ? logs.map(log => ({ 
          type: 'log' as const, 
          content: log 
        })) : []),
        { type: 'log' as const, content: '\nCompilation Details:' },
        { type: 'log' as const, content: '-------------------' },
        { type: 'log' as const, content: 'Lexical Analysis ✓' },
        { type: 'log' as const, content: 'Syntax Analysis ✓' },
        { type: 'log' as const, content: 'Semantic Analysis ✓' },
        { type: 'log' as const, content: 'Intermediate Code ✓' },
        { type: 'log' as const, content: 'Optimized Code ✓' },
        { type: 'log' as const, content: 'Target Code ✓' }
      ]);
  
    } catch (error) {
      setOutputError((error as Error).message);
    }
  };
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showPhases, setShowPhases] = useState(false);

  const phases = [
    { 
      id: 'lexical', 
      title: 'Lexical Analysis', 
      icon: '🔍',
      description: [
        'Breaks code into tokens (lexemes)',
        'Identifies keywords, identifiers, operators',
        'Removes whitespace and comments',
        'First step in understanding code structure'
      ]
    },
    { 
      id: 'syntax', 
      title: 'Syntax Analysis', 
      icon: '🌳',
      description: [
        'Builds abstract syntax tree (AST)',
        'Validates code structure and grammar',
        'Checks for proper nesting and brackets',
        'Ensures code follows language rules'
      ]
    },
    { 
      id: 'semantic', 
      title: 'Semantic Analysis', 
      icon: '✨',
      description: [
        'Checks variable declarations and types',
        'Validates scope and visibility',
        'Ensures proper type compatibility',
        'Builds symbol table for references'
      ]
    },
    { 
      id: 'intermediate', 
      title: 'Intermediate Code', 
      icon: '🔄',
      description: [
        'Converts AST to three-address code',
        'Platform-independent representation',
        'Prepares code for optimization',
        'Simplifies complex expressions'
      ]
    },
    { 
      id: 'optimization', 
      title: 'Optimization', 
      icon: '⚡',
      description: [
        'Improves code efficiency',
        'Removes redundant operations',
        'Simplifies expressions',
        'Enhances performance'
      ]
    },
    { 
      id: 'codegen', 
      title: 'Code Generation', 
      icon: '💻',
      description: [
        'Produces target machine code',
        'Handles memory allocation',
        'Generates executable instructions',
        'Final compilation phase'
      ]
    }
  ];

  const handleRun = async () => {
    if (!sourceCode.trim()) {
      return;
    }
    setIsRunning(true);
    setOutput([]); 
    setOutputError('');
    
    try {
      await executeCode(sourceCode);
      // Remove setShowPhases(true) from here
    } catch (error) {
      setOutputError((error as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleViewPhases = () => {
    setShowPhases(true);
    setCurrentPhase(0);
    setActivePhase(phases[0].id);
  };

  const handleNextPhase = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(prev => prev + 1);
      setActivePhase(phases[currentPhase + 1].id);
    }
  };

  const handlePreviousPhase = () => {
    if (currentPhase > 0) {
      setCurrentPhase(prev => prev - 1);
      setActivePhase(phases[currentPhase - 1].id);
    }
  };

  const handleSourceCodeChange = (code: string) => {
    setSourceCode(code);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors ${
            isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? 'Processing...' : 'Run Compiler'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4 relative">
          <CodeEditor
            value={sourceCode}
            onChange={handleSourceCodeChange}
          />
          <CodeOutput 
            output={output} 
            error={outputError}
            onViewPhases={handleViewPhases}
          />
          {isRunning && <LoadingSpinner />}
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl text-white  sm:text-2xl font-bold mb-4">Compiler Visualization Dashboard</h2>
          <div className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-white">
            <div className="text-sm">
              &quot;Run Compiler&quot; to start the compilation process.
              You&apos;ll see each phase step by step.
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {phases.map((phase) => (
              <div key={phase.id} className="bg-neutral-700 p-3 sm:p-4 rounded-lg">
                <h3 className="text-white sm:text-lg font-semibold mb-2">
                  {phase.icon} {phase.title}
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {phase.description.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showPhases && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-hidden">
          <div className="h-screen w-screen flex items-center justify-center p-2 sm:p-4">
            <div className="bg-neutral-800 w-full max-w-7xl rounded-lg h-[95vh] sm:h-[90vh] flex flex-col relative">
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-[200px]">
                <div className="flex justify-between items-center sticky top-0 bg-neutral-800 py-2 z-10">
                  <button
                    onClick={handlePreviousPhase}
                    disabled={currentPhase === 0}
                    className="px-2 sm:px-4 py-2 text-sm sm:text-white bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
                  >
                    Previous
                  </button>
                  <span className="text-white sm:text-3xl font-semibold px-2">
                    {phases[currentPhase].icon} {phases[currentPhase].title}
                  </span>
                  <button
                    onClick={handleNextPhase}
                    disabled={currentPhase === phases.length - 1}
                    className="px-2 sm:px-4 py-2 text-sm sm:text-white bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
                  >
                    Next
                  </button>
                </div>
                <div className="bg-neutral-900 rounded-lg p-3 sm:p-6 overflow-x-auto">
                  <div className="min-w-[300px]">
                    <PhaseVisualizer
                      sourceCode={sourceCode}
                      phase={activePhase}
                      onChange={setSourceCode}
                    />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-neutral-800 border-t border-neutral-700">
                <div className="p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 mb-4">
                    {phases.map((phase, index) => (
                      <button
                        key={phase.id}
                        onClick={() => {
                          setCurrentPhase(index);
                          setActivePhase(phase.id);
                        }}
                        className={`p-2 sm:p-4 rounded-lg text-center transition-colors ${
                          currentPhase === index
                            ? 'bg-blue-500 text-white'
                            : 'bg-neutral-700 hover:bg-neutral-600'
                        }`}
                      >
                        <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{phase.icon}</div>
                        <div className="text-xs text-white sm:text-sm">{phase.title}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center border-t border-neutral-700 pt-4"> 
                    <button
                      onClick={() => setShowPhases(false)}
                      className="sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
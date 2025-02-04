'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CompilerService, ASTNode } from '../services/compiler';
import mermaid from 'mermaid';
import { LoadingSpinner } from './LoadingSpinner';

interface PhaseVisualizerProps {
  sourceCode: string;
  phase: string;
  onChange: (code: string) => void;
}

const phaseExplanations = {
  lexical: {
    title: 'Lexical Analysis',
    description: 'Breaks down source code into tokens (keywords, identifiers, operators, etc.)',
    example: 'let x = 5 + 3;',
  },
  syntax: {
    title: 'Syntax Analysis',
    description: 'Builds an Abstract Syntax Tree (AST) from tokens, verifying grammatical structure',
    example: 'let x = 5 + 3;',
  },
  semantic: {
    title: 'Semantic Analysis',
    description: 'Checks for semantic correctness like type checking and scope resolution',
    example: 'let x = 5 + 3;',
  },
  intermediate: {
    title: 'Intermediate Code',
    description: 'Generates platform-independent intermediate representation',
    example: 'let x = 5 + 3;',
  },
  optimization: {
    title: 'Optimization',
    description: 'Improves code efficiency through various optimization techniques',
    example: 'let x = 5 + 3;',
  },
  codegen: {
    title: 'Code Generation',
    description: 'Produces target machine code or assembly',
    example: 'let x = 5 + 3;',
  },
};

export const PhaseVisualizer = ({ sourceCode, phase, onChange }: PhaseVisualizerProps) => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'monospace'
    });
  }, []);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const visualizeSyntaxAnalysis = useCallback(async () => {
    try {
      const tokens = CompilerService.lexicalAnalysis(sourceCode);
      const ast = CompilerService.syntaxAnalysis(tokens);
      
      if (!visualizationRef.current) return;
      
      const graph = createMermaidAST(ast);
      const element = document.createElement('div');
      element.className = 'w-full h-full';
      visualizationRef.current.appendChild(element);
  
      try {
        const { svg } = await mermaid.render('ast-diagram', graph);
        if (element) {
          element.innerHTML = svg;
        }
      } catch (mermaidError) {
        console.error('Mermaid rendering error:', mermaidError);
        setError('Failed to render AST visualization');
      }
    } catch (error) {
      console.error('Syntax analysis error:', error);
      setError((error as Error).message);
    }
  }, [sourceCode]);

  useEffect(() => {
    console.log('PhaseVisualizer - phase changed:', phase, 'source:', sourceCode);
    
    if (!sourceCode || !sourceCode.trim()) {
      console.log('No source code provided');
      setError('Please enter some code to analyze');
      return;
    }
  
    if (!visualizationRef.current) {
      console.log('No visualization ref');
      return;
    }
  
    visualizationRef.current.innerHTML = '';
    setError(null);
    setIsLoading(true);
  
    try {
      const trimmedCode = sourceCode.trim();
      switch (phase) {
        case 'lexical':
          console.log('Visualizing lexical analysis');
          visualizeLexicalAnalysis(trimmedCode);
          break;
        case 'syntax':
          visualizeSyntaxAnalysis();
          break;
        case 'semantic':
          visualizeSemanticAnalysis(sourceCode);
          break;
        case 'intermediate':
          visualizeIntermediateCode(sourceCode);
          break;
        case 'optimization':
          visualizeOptimization(sourceCode);
          break;
        case 'codegen':
          visualizeCodeGeneration(sourceCode);
          break;
      }
    } catch (error) {
      console.error('Visualization error:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [sourceCode, phase, visualizeSyntaxAnalysis]);

  // Add these new visualization methods
  const visualizeSemanticAnalysis = (code: string) => {
    try {
      const tokens = CompilerService.lexicalAnalysis(code);
      const ast = CompilerService.syntaxAnalysis(tokens);
      if (!ast) throw new Error('Failed to generate AST');
      
      const { symbolTable } = CompilerService.semanticAnalysis(ast);
      
      const element = document.createElement('div');
      element.className = 'space-y-4';
      element.innerHTML = `
        <div class="bg-gray-900 dark:bg-gray-700 p-4 rounded-lg">
          <h4 class="font-bold mb-2">Symbol Table</h4>
          <pre class="text-sm">${JSON.stringify([...symbolTable.entries()], null, 2)}</pre>
        </div>
      `;
      visualizationRef.current?.appendChild(element);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const visualizeIntermediateCode = (code: string) => {
    try {
      const tokens = CompilerService.lexicalAnalysis(code);
      const ast = CompilerService.syntaxAnalysis(tokens);
      if (!ast) throw new Error('Failed to generate AST');
      
      const irCode = CompilerService.generateIntermediateCode(ast);
      
      const element = document.createElement('div');
      element.className = 'bg-gray-900 dark:bg-gray-700 p-4 rounded-lg';
      element.innerHTML = `
        <h4 class="font-bold mb-2">Three-Address Code</h4>
        <pre class="text-sm">${irCode.join('\n')}</pre>
      `;
      visualizationRef.current?.appendChild(element);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const visualizeOptimization = (code: string) => {
    try {
      const tokens = CompilerService.lexicalAnalysis(code);
      const ast = CompilerService.syntaxAnalysis(tokens);
      if (!ast) throw new Error('Failed to generate AST');
      
      const irCode = CompilerService.generateIntermediateCode(ast);
      const optimizedCode = CompilerService.optimize(irCode);
      
      const element = document.createElement('div');
      element.className = 'space-y-4';
      element.innerHTML = `
        <div class="bg-gray-900 dark:bg-gray-700 p-4 rounded-lg">
          <h4 class="font-bold mb-2">Before Optimization</h4>
          <pre class="text-sm">${irCode.join('\n')}</pre>
        </div>
        <div class="bg-gray-900 dark:bg-gray-700 p-4 rounded-lg">
          <h4 class="font-bold mb-2">After Optimization</h4>
          <pre class="text-sm">${optimizedCode.join('\n')}</pre>
        </div>
      `;
      visualizationRef.current?.appendChild(element);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const visualizeCodeGeneration = (code: string) => {
    try {
      const tokens = CompilerService.lexicalAnalysis(code);
      const ast = CompilerService.syntaxAnalysis(tokens);
      if (!ast) throw new Error('Failed to generate AST');
      
      const irCode = CompilerService.generateIntermediateCode(ast);
      const optimizedCode = CompilerService.optimize(irCode);
      const targetCode = CompilerService.generateTargetCode(optimizedCode);
      
      const element = document.createElement('div');
      element.className = 'bg-gray-900 dark:bg-gray-700 p-4 rounded-lg';
      element.innerHTML = `
        <h4 class="font-bold mb-2">Assembly-like Code</h4>
        <pre class="text-sm">${targetCode.join('\n')}</pre>
      `;
      visualizationRef.current?.appendChild(element);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const visualizeLexicalAnalysis = (code: string) => {
    const tokens = CompilerService.lexicalAnalysis(code);
    
    if (!visualizationRef.current) return;

    const tokenList = document.createElement('div');
    tokenList.className = 'grid grid-cols-4 gap-4 p-4';
    
    tokens.forEach(token => {
      const tokenElement = document.createElement('div');
      tokenElement.className = 'bg-gray-900 dark:bg-gray-700 p-3 rounded-lg';
      tokenElement.innerHTML = `
        <div class="font-bold text-sm">${token.type}</div>
        <div class="text-gray-600 dark:text-gray-300">${token.value}</div>
        <div class="text-xs text-gray-500">Line: ${token.line}, Col: ${token.column}</div>
      `;
      tokenList.appendChild(tokenElement);
    });

    visualizationRef.current.appendChild(tokenList);
  };

  const createMermaidAST = (node: ASTNode): string => {
    let graph = 'graph TD\n';
    let counter = 0;

    function traverse(node: ASTNode, parentId: string = 'root'): void {
      const currentId = `node${counter++}`;
      graph += `  ${currentId}["${node.type}${node.value ? ': ' + node.value : ''}"]\n`;
      
      if (parentId !== currentId) {
        graph += `  ${parentId} --> ${currentId}\n`;
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, currentId));
      }
    }

    traverse(node);
    return graph;
  };

  const handleTryExample = () => {
    const example = phaseExplanations[phase as keyof typeof phaseExplanations]?.example;
    if (example) {
      // Notify parent component to update code editor
      onChange(example);
    }
  };

  return (
    <div className="relative">
      {isLoading && <LoadingSpinner />}
      <div ref={visualizationRef} className="space-y-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {phaseExplanations[phase as keyof typeof phaseExplanations]?.title || phase}
            </h3>
            <button
              onClick={handleTryExample}
              className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            >
              Try Example
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {phaseExplanations[phase as keyof typeof phaseExplanations]?.description}
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
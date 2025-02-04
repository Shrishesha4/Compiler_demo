'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ASTNode, CompilerService, Token } from '../services/compiler';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface CompilerStepVisualizerProps {
  sourceCode: string;
  onClose: () => void;
  isRunning: boolean;
  onComplete: () => void;
}

interface StepData {
  tokens?: Token[];
  ast?: ASTNode;
  symbolTable?: Map<string, unknown>;
  irCode?: string[];
  before?: string[];
  after?: string[];
  targetCode?: string[];
  error?: string;
}

export const CompilerStepVisualizer = ({ sourceCode, onClose, isRunning, onComplete }: CompilerStepVisualizerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<StepData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const steps = useMemo(() => [
    { id: 'lexical', title: 'Lexical Analysis', icon: '🔍', 
      description: 'Breaking down the source code into tokens...' },
    { id: 'syntax', title: 'Syntax Analysis', icon: '🌳',
      description: 'Building the Abstract Syntax Tree...' },
    { id: 'semantic', title: 'Semantic Analysis', icon: '✨',
      description: 'Checking for semantic correctness...' },
    { id: 'intermediate', title: 'Intermediate Code', icon: '🔄',
      description: 'Generating intermediate representation...' },
    { id: 'optimization', title: 'Optimization', icon: '⚡',
      description: 'Optimizing the code...' },
    { id: 'codegen', title: 'Code Generation', icon: '💻',
      description: 'Generating target code...' }
  ], []);

  const processStep = useCallback((step: number) => {
    try {
      const trimmedCode = sourceCode.trim();
      const tokens = CompilerService.lexicalAnalysis(trimmedCode);
      console.log('Lexical analysis tokens:', tokens);
      
      const ast = CompilerService.syntaxAnalysis(tokens);
      console.log('Syntax analysis AST:', ast);
      
      switch (steps[step].id) {
        case 'lexical':
          setStepData({ tokens });
          break;
        case 'syntax':
          setStepData({ ast });
          break;
        case 'semantic':
          const { symbolTable } = CompilerService.semanticAnalysis(ast);
          console.log('Symbol table:', symbolTable);
          setStepData({ symbolTable });
          break;
        case 'intermediate':
          const irCode = CompilerService.generateIntermediateCode(ast);
          console.log('IR Code:', irCode);
          setStepData({ irCode });
          break;
        case 'optimization':
          const irCodeForOpt = CompilerService.generateIntermediateCode(ast);
          const optimizedCode = CompilerService.optimize(irCodeForOpt);
          console.log('Before optimization:', irCodeForOpt);
          console.log('After optimization:', optimizedCode);
          setStepData({ before: irCodeForOpt, after: optimizedCode });
          break;
        case 'codegen':
          const irCodeForGen = CompilerService.generateIntermediateCode(ast);
          const optimizedForGen = CompilerService.optimize(irCodeForGen);
          const targetCode = CompilerService.generateTargetCode(optimizedForGen);
          console.log('Target code:', targetCode);
          setStepData({ targetCode });
          break;
      }
    } catch (error) {
      console.error('Step processing error:', error);
      setStepData({ error: (error as Error).message });
    }
  }, [sourceCode, steps]);

  useEffect(() => {
    if (isRunning) {
      setCurrentStep(0);
      setIsTransitioning(true);
      processStep(0);
    }
  }, [isRunning, processStep]);

  useEffect(() => {
    if (isTransitioning && currentStep < steps.length) {
      const timer = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
          processStep(currentStep + 1);
        } else {
          setIsTransitioning(false);
          onComplete();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isTransitioning, processStep, steps.length, onComplete]);

  useEffect(() => {
    processStep(currentStep);
  }, [currentStep, sourceCode, processStep]);

  const renderStepContent = () => {
    if (!stepData) return null;
    if (stepData.error) {
      return (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          {stepData.error}
        </div>
      );
    }

    switch (steps[currentStep].id) {
      case 'lexical':
        return (
          <div className="grid grid-cols-4 gap-4">
            {stepData.tokens?.map((token: Token, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900 p-3 rounded-lg"
              >
                <div className="font-bold">{token.type}</div>
                <div className="text-gray-600">{token.value}</div>
                <div className="text-xs text-gray-500">
                  Line: {token.line}, Col: {token.column}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'syntax':
        return (
          <div className="bg-gray-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Abstract Syntax Tree</h4>
            <pre className="text-sm overflow-auto">
              {stepData.ast ? JSON.stringify(stepData.ast, null, 2) : 'No AST data'}
            </pre>
          </div>
        );

      case 'semantic':
        return (
          <div className="bg-gray-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Symbol Table</h4>
            <pre className="text-sm overflow-auto">
              {stepData.symbolTable ? 
                JSON.stringify([...stepData.symbolTable.entries()], null, 2) : 
                'No symbol table data'}
            </pre>
          </div>
        );

      case 'intermediate':
        return (
          <div className="bg-gray-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Three-Address Code</h4>
            <pre className="text-sm">
              {stepData.irCode?.join('\n') || 'No IR code generated'}
            </pre>
          </div>
        );

      case 'optimization':
        return (
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Before Optimization</h4>
              <pre className="text-sm">{stepData.before?.join('\n') || 'No code'}</pre>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-bold mb-2">After Optimization</h4>
              <pre className="text-sm">{stepData.after?.join('\n') || 'No code'}</pre>
            </div>
          </div>
        );

      case 'codegen':
        return (
          <div className="bg-gray-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Assembly Code</h4>
            <pre className="text-sm">
              {stepData.targetCode?.join('\n') || 'No target code generated'}
            </pre>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-neutral-500 rounded-lg w-[80vw] h-[80vh] p-6 relative">
        {isTransitioning && <LoadingSpinner />}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-red-400"
        >
          ✕
        </button>

        <div className="flex h-full">
          <div className="w-48 border-r">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-full text-left p-4 flex items-center ${
                  currentStep === index ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <span className="mr-2">{step.icon}</span>
                {step.title}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <h2 className="text-2xl font-bold mb-4">
                  {steps[currentStep].icon} {steps[currentStep].title}
                </h2>
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
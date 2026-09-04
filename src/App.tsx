import React, { useState } from 'react';
import './styles/index.css';
import './styles/idss-theme.css';
import type { AlgorithmName, OptimizationResult, Task } from './core';
import { optimize, OptimizationValidationError } from './core';
import { TaskInput } from './components/TaskInput';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { ResultsView } from './components/ResultsView';
import { BenchmarkChart } from './components/BenchmarkChart';
import { CostLookup } from './components/CostLookup';

const EXAMPLE_PROJECTS: Task[] = [
  { id: 'customer-portal-upgrade', name: 'Customer Portal Upgrade', cost: 20000, value: 90, dependsOn: [] },
  { id: 'data-warehouse-migration', name: 'Data Warehouse Migration', cost: 35000, value: 120, dependsOn: [] },
  { id: 'mobile-app-redesign', name: 'Mobile App Redesign', cost: 15000, value: 60, dependsOn: ['customer-portal-upgrade'] },
  { id: 'ai-chatbot-pilot', name: 'AI Chatbot Pilot', cost: 25000, value: 110, dependsOn: ['data-warehouse-migration'] },
  { id: 'employee-training-platform', name: 'Employee Training Platform', cost: 10000, value: 40, dependsOn: [] },
  { id: 'security-compliance-audit', name: 'Security Compliance Audit', cost: 8000, value: 70, dependsOn: [] },
];
const EXAMPLE_BUDGET = '70000';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [capacity, setCapacity] = useState('20');
  const [algorithm, setAlgorithm] = useState<AlgorithmName>('dp');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAddTask(task: Task) {
    setTasks((prev) => [...prev, task]);
    setResult(null);
  }

  function handleRemoveTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setResult(null);
  }

  function handleLoadExample() {
    setTasks(EXAMPLE_PROJECTS);
    setCapacity(EXAMPLE_BUDGET);
    setResult(null);
    setError(null);
  }

  function handleRunOptimization() {
    setError(null);
    const parsedCapacity = Number(capacity);

    try {
      const optimizationResult = optimize({ tasks, capacity: parsedCapacity, algorithm });
      setResult(optimizationResult);
    } catch (err) {
      setResult(null);
      if (err instanceof OptimizationValidationError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while optimizing.');
      }
    }
  }

  return (
    <div className="module-container">
      <h1>Project Portfolio Planner</h1>
      <p>
        You have a fixed budget for the quarter and a list of candidate projects. Each needs its own budget and
        delivers an expected value or ROI score, and some can&apos;t start until others finish. Enter your projects
        below and this tool will recommend which ones to approve to get the most value without going over budget or
        breaking any prerequisite.
      </p>

      <div className="module-content">
        <h2>1. Candidate projects</h2>
        <button type="button" className="load-example-button" onClick={handleLoadExample}>
          Load example scenario
        </button>
        <TaskInput tasks={tasks} onAddTask={handleAddTask} onRemoveTask={handleRemoveTask} />
        <CostLookup tasks={tasks} />
      </div>

      <div className="module-content">
        <h2>2. Budget &amp; method</h2>
        <label className="capacity-input">
          Total available budget ($)
          <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </label>
        <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />
        <button type="button" onClick={handleRunOptimization} disabled={tasks.length === 0}>
          Get recommendation
        </button>
        {error && <p className="form-error">{error}</p>}
      </div>

      {result && (
        <div className="module-content">
          <h2>3. Decision</h2>
          <ResultsView result={result} tasks={tasks} capacity={Number(capacity)} algorithm={algorithm} />
        </div>
      )}

      <div className="module-content">
        <h2>4. How fast is each method? (Performance benchmark)</h2>
        <p className="benchmark-intro">
          This uses sample portfolios of different sizes, not your own projects, to show how each method holds up as
          the number of candidates grows.
        </p>
        <BenchmarkChart />
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import './styles/index.css';
import type { AlgorithmName, OptimizationResult, Task } from './core';
import { optimize, OptimizationValidationError } from './core';
import { TaskInput } from './components/TaskInput';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { ResultsView } from './components/ResultsView';
import { BenchmarkChart } from './components/BenchmarkChart';
import { CostLookup } from './components/CostLookup';

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
      <h1>Resource Optimizer</h1>
      <p>
        Select and order tasks under a resource budget and dependency constraints, comparing an exact Dynamic Programming
        solver, an exact Branch &amp; Bound solver, and a Greedy heuristic.
      </p>

      <div className="module-content">
        <h2>1. Tasks</h2>
        <TaskInput tasks={tasks} onAddTask={handleAddTask} onRemoveTask={handleRemoveTask} />
        <CostLookup tasks={tasks} />
      </div>

      <div className="module-content">
        <h2>2. Configuration</h2>
        <label className="capacity-input">
          Resource capacity
          <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </label>
        <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />
        <button type="button" onClick={handleRunOptimization} disabled={tasks.length === 0}>
          Run optimization
        </button>
        {error && <p className="form-error">{error}</p>}
      </div>

      {result && (
        <div className="module-content">
          <h2>3. Results</h2>
          <ResultsView result={result} tasks={tasks} />
        </div>
      )}

      <div className="module-content">
        <h2>4. Benchmark: runtime vs. input size</h2>
        <BenchmarkChart />
      </div>
    </div>
  );
}

export default App;

import { ReservoirNetwork } from './reservoir';
import { PSystem } from './p-system';
import { HypergraphNetwork } from './hypergraph';
import { DataPipeline } from './data-pipeline';
import { TrainingMonitor } from './training-monitor';
import { MemoryManager } from './memory-manager';

export interface DeepTreeEchoConfig {
  reservoirConfig: {
    inputDim: number;
    reservoirDim: number;
    outputDim: number;
    spectralRadius?: number;
    density?: number;
  };
  pSystemConfig: {
    membraneCount: number;
    evolutionRules: string[];
  };
  hypergraphConfig: {
    maxEdgeSize: number;
    initialConnections: number;
  };
  memoryConfig: {
    maxMemoryMB: number;
    defragThreshold: number;
  };
}

export class DeepTreeEcho {
  private root: ReservoirNetwork;
  private pSystem: PSystem;
  private hypergraph: HypergraphNetwork;
  private children: Map<string, ReservoirNetwork>;
  private dataPipeline: DataPipeline;
  private trainingMonitor: TrainingMonitor;
  private memoryManager: MemoryManager;

  constructor(config: DeepTreeEchoConfig) {
    this.memoryManager = new MemoryManager(config.memoryConfig.maxMemoryMB);
    this.setupMemoryMonitoring();

    this.root = new ReservoirNetwork(config.reservoirConfig);
    this.pSystem = new PSystem(config.pSystemConfig);
    this.hypergraph = new HypergraphNetwork(config.hypergraphConfig);
    this.children = new Map();

    this.dataPipeline = new DataPipeline(
      this.children,
      this.pSystem,
      this.hypergraph
    );
    
    this.trainingMonitor = new TrainingMonitor(
      this.root,
      this.pSystem,
      this.dataPipeline
    );

    this.registerComponents();
  }

  private setupMemoryMonitoring() {
    this.memoryManager.on('allocation', ({ id, size }) => {
      console.debug(`Memory allocated: ${size} bytes for ${id}`);
    });

    this.memoryManager.on('memory_freed', ({ id, size }) => {
      console.debug(`Memory freed: ${size} bytes from ${id}`);
    });

    this.memoryManager.on('gc_complete', ({ freed }) => {
      console.debug(`Garbage collection completed: ${freed} bytes freed`);
      
      const stats = this.memoryManager.getStats();
      if (stats.fragmentationRatio > 0.3) {
        this.memoryManager.defragment();
      }
    });
  }

  private async registerComponents() {
    await this.memoryManager.allocate(
      'root_reservoir',
      this.estimateSize(this.root),
      this.root,
      2
    );

    await this.memoryManager.allocate(
      'p_system',
      this.estimateSize(this.pSystem),
      this.pSystem,
      2
    );

    await this.memoryManager.allocate(
      'hypergraph',
      this.estimateSize(this.hypergraph),
      this.hypergraph,
      1
    );
  }

  private estimateSize(obj: any): number {
    return JSON.stringify(obj).length * 2;
  }

  // Declarative Layer Methods
  async fit(inputs: number[][], targets: number[][]) {
    try {
      const trainingId = `training_${Date.now()}`;
      await this.memoryManager.allocate(
        trainingId,
        (inputs.length * inputs[0].length + targets.length * targets[0].length) * 8,
        { inputs, targets },
        1
      );

      await this.root.fit(inputs, targets);
      this.pSystem.optimize_partitioning();
      this.hypergraph.updateConnections();

      const stats = this.memoryManager.getStats();
      console.debug('Memory stats after training:', stats);

      return {
        success: true,
        memoryStats: stats
      };
    } catch (error) {
      console.error('Training failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Procedural Layer Methods
  async evolve() {
    await this.pSystem.execute_rules();
    this.hypergraph.connect(this.pSystem.getHyperedges());
    this.optimizeTopology();
  }

  // Associative Layer Methods
  private optimizeTopology() {
    const evolutionStrategy = this.pSystem.apply_evolutionary_algorithms();
    this.root.updateTopology(evolutionStrategy);
    for (const child of this.children.values()) {
      child.updateTopology(evolutionStrategy);
    }
  }

  // Memory System Integration
  getState() {
    return {
      semantic: {
        categories: ['Neural Networks', 'Adaptive Systems', 
                    'Computational Intelligence', 'Evolutionary Algorithms'],
        capabilities: this.pSystem.getCurrentCapabilities()
      },
      episodic: {
        reservoirState: this.root.getState(),
        childStates: Array.from(this.children.entries()),
        pSystemState: this.pSystem.getState()
      },
      procedural: {
        currentRules: this.pSystem.getCurrentRules(),
        evolutionMetrics: this.getEvolutionMetrics()
      }
    };
  }

  private getEvolutionMetrics() {
    return {
      topologyOptimization: this.pSystem.getOptimizationMetrics(),
      reservoirPerformance: this.root.getPerformanceMetrics(),
      hypergraphConnectivity: this.hypergraph.getConnectivityMetrics()
    };
  }

  async cleanup() {
    this.memoryManager.destroy();
    
    this.children.clear();
    this.dataPipeline = null;
    this.trainingMonitor = null;
  }

  getMemoryStats() {
    return this.memoryManager.getStats();
  }
} 
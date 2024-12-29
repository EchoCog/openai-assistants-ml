import { ReservoirNetwork } from 'reservoirpy';
import { PSystem } from './p-system';
import { HypergraphNetwork } from './hypergraph';

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
}

export class DeepTreeEcho {
  private root: ReservoirNetwork;
  private pSystem: PSystem;
  private hypergraph: HypergraphNetwork;
  private children: Map<string, ReservoirNetwork>;

  constructor(config: DeepTreeEchoConfig) {
    this.root = new ReservoirNetwork(config.reservoirConfig);
    this.pSystem = new PSystem(config.pSystemConfig);
    this.hypergraph = new HypergraphNetwork(config.hypergraphConfig);
    this.children = new Map();
  }

  // Declarative Layer Methods
  async fit(inputs: number[][], targets: number[][]) {
    await this.root.fit(inputs, targets);
    this.pSystem.optimize_partitioning();
    this.hypergraph.updateConnections();
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
} 
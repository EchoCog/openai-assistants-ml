import { ReservoirNetwork } from './reservoir';
import { PSystem } from './p-system';
import { HypergraphNetwork } from './hypergraph';
import { DataValidator } from './data-validator';
import * as np from 'numpy-ts';

interface DataStream {
  id: string;
  data: number[][];
  metadata: {
    timestamp: number;
    source: string;
    type: string;
    validation?: {
      isValid: boolean;
      errors: any[];
    };
    preprocessing?: {
      transformations: string[];
      statistics: any;
    };
  };
}

interface PipelineMetrics {
  throughput: number;
  latency: number;
  memoryUsage: number;
  activeStreams: number;
}

export class DataPipeline {
  private streams: Map<string, DataStream>;
  private metrics: PipelineMetrics;
  private reservoirs: Map<string, ReservoirNetwork>;
  private pSystem: PSystem;
  private hypergraph: HypergraphNetwork;
  private validator: DataValidator;

  constructor(
    reservoirs: Map<string, ReservoirNetwork>,
    pSystem: PSystem,
    hypergraph: HypergraphNetwork
  ) {
    this.streams = new Map();
    this.metrics = {
      throughput: 0,
      latency: 0,
      memoryUsage: 0,
      activeStreams: 0
    };
    this.reservoirs = reservoirs;
    this.pSystem = pSystem;
    this.hypergraph = hypergraph;
    this.validator = new DataValidator();
    this.setupValidationListeners();
  }

  private setupValidationListeners() {
    this.validator.on('validation_error', (error) => {
      console.error('Data validation error:', error);
      this.emit('validation_error', error);
    });

    this.validator.on('preprocessing_error', (error) => {
      console.error('Data preprocessing error:', error);
      this.emit('preprocessing_error', error);
    });
  }

  async ingestData(stream: DataStream) {
    const startTime = Date.now();
    
    try {
      // Validate data
      const validationResult = await this.validator.validate(stream.data);
      stream.metadata.validation = validationResult;

      if (!validationResult.isValid) {
        const criticalErrors = validationResult.errors
          .filter(e => e.severity === 'error');
        if (criticalErrors.length > 0) {
          throw new Error(
            `Critical validation errors: ${criticalErrors.map(e => e.message).join(', ')}`
          );
        }
      }

      // Preprocess data
      const preprocessingResult = await this.validator.preprocess(stream.data);
      stream.data = preprocessingResult.data;
      stream.metadata.preprocessing = {
        transformations: preprocessingResult.transformations,
        statistics: preprocessingResult.metadata.statistics
      };
      
      // Store stream
      this.streams.set(stream.id, stream);
      
      // Update metrics
      this.updateMetrics(startTime);
      
      // Process through reservoirs
      await this.processStream(stream);
      
      return {
        success: true,
        streamId: stream.id,
        processingTime: Date.now() - startTime,
        validation: stream.metadata.validation,
        preprocessing: stream.metadata.preprocessing
      };
    } catch (error) {
      console.error('Data ingestion failed:', error);
      return {
        success: false,
        error: error.message,
        validation: stream.metadata.validation
      };
    }
  }

  private async processStream(stream: DataStream) {
    // Convert data to appropriate format
    const data = np.array(stream.data);
    
    // Determine optimal reservoir based on data type
    const targetReservoir = this.selectReservoir(stream);
    
    // Update P-System based on new data
    this.pSystem.optimize_partitioning();
    
    // Process data through selected reservoir
    await targetReservoir.fit(data, data);
    
    // Update hypergraph connections based on data flow
    this.updateConnections(stream.id, targetReservoir);
  }

  private selectReservoir(stream: DataStream): ReservoirNetwork {
    // Get P-System recommendations
    const membraneState = this.pSystem.getState();
    
    // Find optimal reservoir based on current state
    let bestReservoir: ReservoirNetwork | undefined;
    let bestScore = -Infinity;
    
    for (const [id, reservoir] of this.reservoirs.entries()) {
      const score = this.calculateReservoirScore(reservoir, stream, membraneState);
      if (score > bestScore) {
        bestScore = score;
        bestReservoir = reservoir;
      }
    }
    
    return bestReservoir || this.reservoirs.values().next().value;
  }

  private calculateReservoirScore(
    reservoir: ReservoirNetwork,
    stream: DataStream,
    membraneState: any
  ): number {
    const metrics = reservoir.getPerformanceMetrics();
    const streamComplexity = this.calculateStreamComplexity(stream);
    
    return (
      (1 - metrics.trainingError) * 0.4 +
      (1 - metrics.validationError) * 0.3 +
      (1 - streamComplexity) * 0.3
    );
  }

  private calculateStreamComplexity(stream: DataStream): number {
    // Simple complexity measure based on data variance
    const data = np.array(stream.data);
    return np.var(data) / np.max(data);
  }

  private updateConnections(streamId: string, reservoir: ReservoirNetwork) {
    // Create hyperedges based on data flow
    const edges = this.streams.size > 1
      ? Array.from(this.streams.keys())
          .filter(id => id !== streamId)
          .map(id => [streamId, id])
      : [];
    
    this.hypergraph.connect(edges);
  }

  private updateMetrics(startTime: number) {
    const currentTime = Date.now();
    const processingTime = currentTime - startTime;
    
    this.metrics = {
      throughput: this.streams.size / (processingTime / 1000),
      latency: processingTime,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      activeStreams: this.streams.size
    };
  }

  getMetrics(): PipelineMetrics {
    return { ...this.metrics };
  }

  getStreamInfo(streamId: string): DataStream | undefined {
    return this.streams.get(streamId);
  }

  async clearStream(streamId: string) {
    this.streams.delete(streamId);
    this.updateMetrics(Date.now());
  }

  async revertPreprocessing(streamId: string): Promise<number[][]> {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    if (!stream.metadata.preprocessing?.transformations) {
      return stream.data;
    }

    return this.validator.reverseTransform(
      stream.data,
      stream.metadata.preprocessing.transformations
    );
  }

  getValidationRules() {
    return this.validator.getValidationRules();
  }

  getPreprocessingSteps() {
    return this.validator.getPreprocessingSteps();
  }
} 
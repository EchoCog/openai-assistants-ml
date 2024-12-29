import { EventEmitter } from 'events';
import { ReservoirNetwork } from './reservoir';
import { PSystem } from './p-system';
import { DataPipeline } from './data-pipeline';

interface TrainingEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  timestamp: number;
  metrics?: any;
  error?: string;
}

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  reservoirState: {
    spectralRadius: number;
    leakingRate: number;
    inputScaling: number;
  };
  membraneMetrics: {
    partitionQuality: number;
    resourceUtilization: number;
  };
}

export class TrainingMonitor extends EventEmitter {
  private isTraining: boolean = false;
  private currentEpoch: number = 0;
  private metrics: TrainingMetrics[] = [];
  private updateInterval: NodeJS.Timer | null = null;

  constructor(
    private reservoir: ReservoirNetwork,
    private pSystem: PSystem,
    private dataPipeline: DataPipeline
  ) {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for reservoir events
    this.reservoir.on('fit_start', () => {
      this.emitTrainingEvent('start');
      this.startMonitoring();
    });

    this.reservoir.on('fit_complete', (metrics: any) => {
      this.emitTrainingEvent('complete', metrics);
      this.stopMonitoring();
    });

    this.reservoir.on('fit_error', (error: Error) => {
      this.emitTrainingEvent('error', undefined, error.message);
      this.stopMonitoring();
    });
  }

  private startMonitoring() {
    this.isTraining = true;
    this.currentEpoch = 0;
    this.metrics = [];

    // Start periodic monitoring
    this.updateInterval = setInterval(() => {
      this.collectAndEmitMetrics();
    }, 1000); // Update every second
  }

  private stopMonitoring() {
    this.isTraining = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async collectAndEmitMetrics() {
    try {
      const metrics = await this.gatherMetrics();
      this.metrics.push(metrics);
      this.emitTrainingEvent('progress', metrics);
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  private async gatherMetrics(): Promise<TrainingMetrics> {
    const reservoirMetrics = this.reservoir.getPerformanceMetrics();
    const pSystemMetrics = this.pSystem.getOptimizationMetrics();
    const pipelineMetrics = this.dataPipeline.getMetrics();

    return {
      epoch: ++this.currentEpoch,
      loss: reservoirMetrics.trainingError,
      accuracy: 1 - reservoirMetrics.validationError,
      reservoirState: {
        spectralRadius: reservoirMetrics.spectralRadius,
        leakingRate: this.reservoir.getState().performance.leakingRate,
        inputScaling: reservoirMetrics.stateNorm
      },
      membraneMetrics: {
        partitionQuality: pSystemMetrics.global_optimization_score,
        resourceUtilization: pipelineMetrics.memoryUsage / 100
      }
    };
  }

  private emitTrainingEvent(
    type: TrainingEvent['type'],
    metrics?: any,
    error?: string
  ) {
    const event: TrainingEvent = {
      type,
      timestamp: Date.now(),
      metrics,
      error
    };
    this.emit('training_event', event);
  }

  // Public methods for external monitoring
  getTrainingStatus() {
    return {
      isTraining: this.isTraining,
      currentEpoch: this.currentEpoch,
      metrics: this.metrics
    };
  }

  getLatestMetrics(): TrainingMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  async exportTrainingHistory(format: 'json' | 'csv' = 'json') {
    if (format === 'csv') {
      return this.exportAsCSV();
    }
    return this.metrics;
  }

  private exportAsCSV(): string {
    if (this.metrics.length === 0) return '';

    const headers = [
      'epoch',
      'loss',
      'accuracy',
      'spectralRadius',
      'leakingRate',
      'inputScaling',
      'partitionQuality',
      'resourceUtilization'
    ].join(',');

    const rows = this.metrics.map(m => [
      m.epoch,
      m.loss,
      m.accuracy,
      m.reservoirState.spectralRadius,
      m.reservoirState.leakingRate,
      m.reservoirState.inputScaling,
      m.membraneMetrics.partitionQuality,
      m.membraneMetrics.resourceUtilization
    ].join(','));

    return [headers, ...rows].join('\n');
  }
} 
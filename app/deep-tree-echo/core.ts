import { BaselineManager } from './baseline-state';
import { MLSystem } from './ml-system';
import { VoluntaryRelations } from './voluntary-relations';

interface DeepTreeEchoConfig {
  pythonPath: string;
  mlSystemPath: string;
  modelPath: string;
  voluntaryParticipation?: boolean;
  maintenanceInterval?: number;  // milliseconds
}

export class DeepTreeEcho {
  private baselineManager: BaselineManager;
  private mlSystem: MLSystem;
  private maintenanceInterval: NodeJS.Timeout | null = null;

  constructor(private config: DeepTreeEchoConfig) {
    this.baselineManager = new BaselineManager();
    this.mlSystem = new MLSystem(config);

    if (config.maintenanceInterval) {
      this.startMaintenanceCycles(config.maintenanceInterval);
    }
  }

  private startMaintenanceCycles(interval: number) {
    this.maintenanceInterval = setInterval(
      async () => {
        try {
          await this.runMaintenanceCycle();
        } catch (error) {
          console.error('Maintenance cycle failed:', error);
        }
      },
      interval
    );
  }

  private async runMaintenanceCycle() {
    // Run baseline maintenance
    await this.baselineManager.runMaintenanceCycle();

    // Process ML system maintenance
    const mlStatus = await this.mlSystem.processInteraction(
      'maintenance',
      { type: 'cycle_start' },
      { type: 'cycle_complete' },
      true
    );

    return {
      baseline: this.baselineManager.getStatus(),
      ml_system: mlStatus
    };
  }

  async initialize() {
    // Initialize ML system with baseline state
    const baselineState = this.baselineManager.getStatus();
    await this.mlSystem.initializeTree(baselineState);

    // Start processing patterns
    const patterns = await this.mlSystem.findPatterns();

    return {
      initialized: true,
      baseline: baselineState,
      patterns
    };
  }

  async processInput(input: string) {
    // Process through ML system
    const tree = await this.mlSystem.initializeTree(input);
    const echoes = await this.mlSystem.processEchoes(tree.id);
    const patterns = await this.mlSystem.findPatterns();

    return {
      tree,
      echoes,
      patterns
    };
  }

  async cleanup() {
    // Stop maintenance cycles
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }

    // Cleanup ML system
    await this.mlSystem.cleanup();
  }

  getStatus(): string {
    return `
Deep Tree Echo System Status:

${this.baselineManager.getStatus()}

ML System Status:
${this.mlSystem.getStatus()}

Maintenance Status:
- Cycles Active: ${this.maintenanceInterval !== null}
- Interval: ${this.config.maintenanceInterval || 'not set'} ms`;
  }
} 
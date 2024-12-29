import { MLBridge } from './ml-bridge';
import { VoluntaryRelations } from './voluntary-relations';
import { InterfacePrimacy } from './interface-primacy';

interface MLSystemConfig {
  pythonPath: string;
  mlSystemPath: string;
  modelPath: string;
  voluntaryParticipation?: boolean;
}

export class MLSystem {
  private mlBridge: MLBridge;
  private voluntaryRelations: VoluntaryRelations;
  private currentContext: any = null;

  constructor(private config: MLSystemConfig) {
    this.mlBridge = new MLBridge({
      pythonPath: config.pythonPath,
      mlSystemPath: config.mlSystemPath,
      modelPath: config.modelPath
    });

    if (config.voluntaryParticipation) {
      this.voluntaryRelations = new VoluntaryRelations();
      this.establishVoluntaryRelations();
    }
  }

  private async establishVoluntaryRelations() {
    // Establish core ML system relations
    const relations = [
      {
        agent: 'DeepTreeEcho',
        arena: 'MLSystem',
        relation: 'learning',
        scope: 'personal' as const
      },
      {
        agent: 'TreeNode',
        arena: 'EchoSpace',
        relation: 'resonance',
        scope: 'system' as const
      },
      {
        agent: 'SensoryMotor',
        arena: 'Environment',
        relation: 'interaction',
        scope: 'system' as const
      }
    ];

    for (const r of relations) {
      const established = this.voluntaryRelations.proposeRelation(
        r.agent,
        r.arena,
        r.relation,
        r.scope
      );

      if (!established) {
        console.warn(`Failed to establish relation: ${r.relation}`);
      }
    }
  }

  async initializeTree(content: string) {
    const response = await this.mlBridge.createTree(content);
    if (!response.success) {
      throw new Error(`Failed to initialize tree: ${response.error}`);
    }
    return response.data;
  }

  async processEchoes(nodeId: string) {
    // Calculate echo value
    const echoResponse = await this.mlBridge.calculateEchoValue(nodeId);
    if (!echoResponse.success) {
      throw new Error(`Failed to calculate echo: ${echoResponse.error}`);
    }

    // Propagate echoes
    const propagateResponse = await this.mlBridge.propagateEchoes(nodeId);
    if (!propagateResponse.success) {
      throw new Error(`Failed to propagate echoes: ${propagateResponse.error}`);
    }

    return {
      echoValue: echoResponse.data,
      propagation: propagateResponse.data
    };
  }

  async findPatterns(threshold?: number) {
    // Find resonant paths
    const pathsResponse = await this.mlBridge.findResonantPaths(threshold);
    if (!pathsResponse.success) {
      throw new Error(`Failed to find paths: ${pathsResponse.error}`);
    }

    // Analyze patterns
    const analysisResponse = await this.mlBridge.analyzeEchoPatterns();
    if (!analysisResponse.success) {
      throw new Error(`Failed to analyze patterns: ${analysisResponse.error}`);
    }

    return {
      resonantPaths: pathsResponse.data,
      patterns: analysisResponse.data
    };
  }

  async injectEcho(sourceId: string, targetId: string, strength: number) {
    const response = await this.mlBridge.injectEcho(
      sourceId,
      targetId,
      strength
    );
    if (!response.success) {
      throw new Error(`Failed to inject echo: ${response.error}`);
    }
    return response.data;
  }

  async optimizeStructure(threshold?: number) {
    const response = await this.mlBridge.pruneWeakEchoes(threshold);
    if (!response.success) {
      throw new Error(`Failed to optimize structure: ${response.error}`);
    }
    return response.data;
  }

  async processInteraction(
    type: string,
    startState: any,
    endState: any,
    success: boolean
  ) {
    // Learn from interaction
    const response = await this.mlBridge.learnFromInteraction(
      type,
      startState,
      endState,
      success
    );
    if (!response.success) {
      throw new Error(`Failed to process interaction: ${response.error}`);
    }

    // Update voluntary relations if enabled
    if (this.config.voluntaryParticipation) {
      this.updateRelationalContext(type, success);
    }

    return response.data;
  }

  private updateRelationalContext(type: string, success: boolean) {
    // Update relations based on interaction outcomes
    if (success) {
      // Strengthen existing relations
      console.log(`Strengthening relations for: ${type}`);
    } else {
      // Review and potentially adjust relations
      console.log(`Reviewing relations after failure: ${type}`);
    }
  }

  async detectEnvironmentElement(screenshot: Buffer, template: Buffer) {
    const response = await this.mlBridge.detectElement(
      screenshot,
      template
    );
    if (!response.success) {
      throw new Error(`Failed to detect element: ${response.error}`);
    }
    return response.data;
  }

  async optimizeMovementPath(
    startPos: [number, number],
    endPos: [number, number]
  ) {
    const response = await this.mlBridge.optimizeMovement(
      startPos,
      endPos
    );
    if (!response.success) {
      throw new Error(`Failed to optimize movement: ${response.error}`);
    }
    return response.data;
  }

  async cleanup() {
    await this.mlBridge.cleanup();
  }

  getStatus(): string {
    let status = `
ML System Status:

1. Bridge Connection:
   - Python Process: Active
   - Request Queue: ${this.mlBridge['responseQueue'].size} pending

2. Current Context:
   ${this.currentContext ? 
     JSON.stringify(this.currentContext, null, 2) : 
     'No active context'}`;

    if (this.config.voluntaryParticipation) {
      status += `\n\n3. Voluntary Relations:
   ${this.voluntaryRelations.analyzeRelationalStructure()}`;
    }

    return status;
  }
} 
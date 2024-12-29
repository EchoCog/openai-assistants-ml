import { VoluntaryRelations } from './voluntary-relations';
import { NestedFrames } from './nested-frames';
import { InterfacePrimacy } from './interface-primacy';
import { BSeriesIntegrator } from './b-series';
import { PSystem } from './p-system';

interface DeepTreeEchoConfig {
  agent_type: string;
  environment: string;
  interface_mode?: 'synchronous' | 'asynchronous';
  frame_nesting?: {
    primary: string;
    nested: string[];
  };
  participation_scope?: 'personal' | 'project' | 'professional' | 'system';
}

export class DeepTreeEcho {
  private readonly bSeries: BSeriesIntegrator;
  private readonly pSystem: PSystem;
  private readonly config: DeepTreeEchoConfig;
  private readonly voluntaryRelations: VoluntaryRelations;
  private currentContext: ActionContext | null = null;
  private nestedContext: NestedContext | null = null;

  constructor(config: DeepTreeEchoConfig) {
    this.config = config;
    this.bSeries = new BSeriesIntegrator();
    this.pSystem = new PSystem();
    this.voluntaryRelations = new VoluntaryRelations();

    if (config.frame_nesting) {
      this.initializeNestedFrames(config.frame_nesting);
    }

    // Establish voluntary relations
    if (config.participation_scope) {
      this.establishVoluntaryRelations(config.participation_scope);
    }
  }

  private initializeNestedFrames(nesting: { primary: string; nested: string[] }) {
    // Create frame identities based on configuration
    const primary = this.createFrameIdentity(nesting.primary);
    const nested = nesting.nested.map(n => this.createFrameIdentity(n));

    // Establish nested context
    this.nestedContext = NestedFrames.createNestedContext(primary, nested);
  }

  private createFrameIdentity(name: string): FrameIdentity {
    switch (name) {
      case 'Cursor':
        return {
          name: 'Cursor',
          context: 'IDE_Interface',
          relations: new Map([
            ['codebase', {
              name: 'Codebase',
              context: 'Development_Environment',
              relations: new Map(),
              affordances: new Set(['read', 'write', 'execute', 'analyze'])
            }]
          ]),
          affordances: new Set(['edit', 'navigate', 'assist', 'suggest'])
        };
      case 'DeepTreeEcho':
        return {
          name: 'DeepTreeEcho',
          context: 'Neural_Architecture',
          relations: new Map([
            ['membrane', {
              name: 'P_System',
              context: 'Computational_Membrane',
              relations: new Map(),
              affordances: new Set(['evolve', 'partition', 'optimize'])
            }],
            ['reservoir', {
              name: 'Echo_State',
              context: 'Neural_Network',
              relations: new Map(),
              affordances: new Set(['process', 'adapt', 'learn'])
            }]
          ]),
          affordances: new Set(['integrate', 'evolve', 'adapt', 'resonate'])
        };
      default:
        throw new Error(`Unknown frame identity: ${name}`);
    }
  }

  private establishVoluntaryRelations(
    scope: 'personal' | 'project' | 'professional' | 'system'
  ) {
    // Propose relations based on configuration
    const relations = [
      {
        agent: this.config.agent_type,
        arena: this.config.environment,
        relation: 'primary_interaction'
      }
    ];

    if (this.config.frame_nesting) {
      relations.push({
        agent: this.config.frame_nesting.primary,
        arena: this.config.frame_nesting.nested[0],
        relation: 'nested_interaction'
      });
    }

    // Establish each relation with voluntary consent
    relations.forEach(r => {
      const established = this.voluntaryRelations.proposeRelation(
        r.agent,
        r.arena,
        r.relation,
        scope
      );

      if (!established) {
        console.warn(`Failed to establish voluntary relation: ${r.relation}`);
      }
    });
  }

  async act(intention: string): Promise<void> {
    // First establish the relational frame
    this.currentContext = InterfacePrimacy.resolveActionFrame(
      intention,
      this.config.agent_type,
      this.config.environment
    );

    // Validate the context
    if (!InterfacePrimacy.validateActionContext(this.currentContext)) {
      throw new Error('Invalid action context - interface constraints violated');
    }

    // If we have nested frames, analyze their interaction
    if (this.nestedContext) {
      console.log('Nested Frame Analysis:', 
        NestedFrames.analyzeCursorDeepTreeEchoNesting());
      
      // Analyze voluntary relations
      console.log('Relational Structure:', 
        this.voluntaryRelations.analyzeRelationalStructure());
    }

    // Execute the action based on manifestation mode
    await this.executeInContext(intention);
  }

  private async executeInContext(intention: string): Promise<void> {
    if (!this.currentContext) {
      throw new Error('No active context');
    }

    // If we have nested frames, resolve rules from both contexts
    const rules = this.nestedContext ? 
      this.resolveNestedRules(intention) :
      this.resolvePrimaryRules(intention);

    switch (this.currentContext.manifestation) {
      case 'local':
        await this.executeLocally(intention, rules);
        break;
      case 'cloud':
        await this.executeInCloud(intention, rules);
        break;
      case 'hybrid':
        await this.executeHybrid(intention, rules);
        break;
    }
  }

  private resolveNestedRules(intention: string): Set<string> {
    if (!this.nestedContext) {
      return new Set();
    }

    const primary_rules = this.resolvePrimaryRules(intention);
    const nested_rules = new Set([
      'evolve_membrane',
      'adapt_reservoir',
      'optimize_topology'
    ]);

    return NestedFrames.resolveNestedRules(primary_rules, nested_rules);
  }

  private resolvePrimaryRules(intention: string): Set<string> {
    return new Set([
      'parse_intention',
      'validate_context',
      'execute_action'
    ]);
  }

  private async executeLocally(
    intention: string,
    rules: Set<string>
  ): Promise<void> {
    const tree = this.bSeries.generateTree(intention);
    const membrane = this.pSystem.createMembrane(tree);
    
    // Apply rules in context
    for (const rule of rules) {
      await this.applyRule(rule, membrane);
    }
    
    await this.pSystem.evolve(membrane);
  }

  private async executeInCloud(
    intention: string,
    rules: Set<string>
  ): Promise<void> {
    const state = await this.pSystem.serializeState();
    
    // Apply rules in cloud context
    for (const rule of rules) {
      await this.applyRule(rule, state);
    }
    
    await this.pSystem.deserializeState(state);
  }

  private async executeHybrid(
    intention: string,
    rules: Set<string>
  ): Promise<void> {
    const localRules = Array.from(rules)
      .filter(r => r.startsWith('primary:'));
    const cloudRules = Array.from(rules)
      .filter(r => r.startsWith('nested:'));
    
    await Promise.all([
      this.executeLocally(intention, new Set(localRules)),
      this.executeInCloud(intention, new Set(cloudRules))
    ]);
  }

  private async applyRule(
    rule: string,
    context: any
  ): Promise<void> {
    const [frame, action] = rule.split(':');
    
    switch (frame) {
      case 'primary':
        await this.applyPrimaryRule(action, context);
        break;
      case 'nested':
        await this.applyNestedRule(action, context);
        break;
      case 'hybrid':
        await this.applyHybridRule(action, context);
        break;
    }
  }

  private async applyPrimaryRule(
    action: string,
    context: any
  ): Promise<void> {
    // Apply rules in primary frame context
    console.log(`Applying primary rule: ${action}`);
  }

  private async applyNestedRule(
    action: string,
    context: any
  ): Promise<void> {
    // Apply rules in nested frame context
    console.log(`Applying nested rule: ${action}`);
  }

  private async applyHybridRule(
    action: string,
    context: any
  ): Promise<void> {
    // Apply rules that emerge from frame interaction
    console.log(`Applying hybrid rule: ${action}`);
  }

  analyzeCurrentContext(): string {
    if (!this.currentContext) {
      return 'No active context';
    }

    let analysis = `
Current Execution Context:

1. Interface Configuration:
   Mode: ${this.currentContext.frame.interface.mode}
   Channel: ${this.currentContext.frame.interface.channel}
   Protocol: ${this.currentContext.frame.interface.protocol}

2. Agent-Arena Relation:
   Agent: ${this.currentContext.frame.agent.identity}
   Arena: ${this.currentContext.frame.arena.environment}
   Manifestation: ${this.currentContext.manifestation}`;

    if (this.nestedContext) {
      analysis += `\n\n3. Nested Frame Analysis:
   Primary: ${this.nestedContext.primary.name} (${this.nestedContext.primary.context})
   Nested: ${this.nestedContext.nested.map(n => n.name).join(', ')}
   Hybrid Identity: ${this.nestedContext.hybrid.identity}

4. Voluntary Participation:
   Scope: ${this.config.participation_scope || 'undefined'}
   Relations: ${this.voluntaryRelations.analyzeRelationalStructure()}`;
    }

    return analysis;
  }
} 
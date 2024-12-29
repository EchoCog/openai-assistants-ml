interface RelationalFrame {
  agent: {
    identity: string;
    capabilities: Set<string>;
    context: Map<string, any>;
  };
  arena: {
    environment: string;
    constraints: Set<string>;
    affordances: Map<string, any>;
  };
  interface: {
    mode: 'synchronous' | 'asynchronous';
    channel: 'local' | 'remote' | 'distributed';
    protocol: string;
  };
}

interface ActionContext {
  frame: RelationalFrame;
  intention: string;
  manifestation: 'local' | 'cloud' | 'hybrid';
}

export class InterfacePrimacy {
  private static readonly UNITY_AS_RELATION = 2;
  private static readonly INTERFACE_MODES = new Set([
    'local_compute',
    'cloud_worker',
    'distributed_agent',
    'hybrid_manifestation'
  ]);

  static resolveActionFrame(
    action: string,
    agent: string,
    environment: string
  ): ActionContext {
    // First establish the relational frame
    const frame = this.establishRelationalFrame(agent, environment);
    
    // Then determine how the action should manifest
    const manifestation = this.determineManifestationMode(action, frame);
    
    return {
      frame,
      intention: action,
      manifestation
    };
  }

  private static establishRelationalFrame(
    agent: string,
    environment: string
  ): RelationalFrame {
    return {
      agent: {
        identity: agent,
        capabilities: this.inferCapabilities(agent),
        context: new Map([
          ['runtime', this.detectRuntime()],
          ['permissions', this.checkPermissions()]
        ])
      },
      arena: {
        environment,
        constraints: this.mapEnvironmentConstraints(environment),
        affordances: this.mapAvailableAffordances(environment)
      },
      interface: {
        mode: this.determineInterfaceMode(agent, environment),
        channel: this.establishChannel(agent, environment),
        protocol: this.negotiateProtocol(agent, environment)
      }
    };
  }

  private static inferCapabilities(agent: string): Set<string> {
    const capabilities = new Set<string>();
    
    if (agent.includes('local')) {
      capabilities.add('direct_compute');
      capabilities.add('hardware_access');
    }
    
    if (agent.includes('cloud')) {
      capabilities.add('distributed_compute');
      capabilities.add('state_persistence');
    }
    
    if (agent.includes('llm')) {
      capabilities.add('language_understanding');
      capabilities.add('context_awareness');
    }
    
    return capabilities;
  }

  private static mapEnvironmentConstraints(env: string): Set<string> {
    const constraints = new Set<string>();
    
    if (env.includes('local')) {
      constraints.add('resource_limited');
      constraints.add('synchronous_required');
    }
    
    if (env.includes('distributed')) {
      constraints.add('latency_sensitive');
      constraints.add('state_coordination');
    }
    
    return constraints;
  }

  private static mapAvailableAffordances(env: string): Map<string, any> {
    const affordances = new Map();
    
    if (env.includes('local')) {
      affordances.set('compute', {
        type: 'direct',
        access: 'immediate'
      });
    }
    
    if (env.includes('cloud')) {
      affordances.set('storage', {
        type: 'persistent',
        access: 'async'
      });
    }
    
    return affordances;
  }

  private static determineInterfaceMode(
    agent: string,
    environment: string
  ): 'synchronous' | 'asynchronous' {
    // Default to async unless explicitly local
    return (agent.includes('local') && environment.includes('local'))
      ? 'synchronous'
      : 'asynchronous';
  }

  private static establishChannel(
    agent: string,
    environment: string
  ): 'local' | 'remote' | 'distributed' {
    if (agent.includes('local') && environment.includes('local')) {
      return 'local';
    }
    if (agent.includes('distributed') || environment.includes('distributed')) {
      return 'distributed';
    }
    return 'remote';
  }

  private static negotiateProtocol(
    agent: string,
    environment: string
  ): string {
    // Determine most appropriate protocol based on agent and environment
    if (this.establishChannel(agent, environment) === 'local') {
      return 'direct_memory';
    }
    return 'async_message_queue';
  }

  private static determineManifestationMode(
    action: string,
    frame: RelationalFrame
  ): 'local' | 'cloud' | 'hybrid' {
    const agentCaps = frame.agent.capabilities;
    const envConstraints = frame.arena.constraints;
    
    // Default to hybrid unless constraints force otherwise
    if (envConstraints.has('resource_limited') && 
        agentCaps.has('direct_compute')) {
      return 'local';
    }
    
    if (envConstraints.has('state_coordination') && 
        agentCaps.has('distributed_compute')) {
      return 'cloud';
    }
    
    return 'hybrid';
  }

  static analyzeFrameProblemResolution(context: ActionContext): string {
    return `
Frame Problem Resolution Analysis:

1. Relational Unity (2):
   Agent: ${context.frame.agent.identity}
   Arena: ${context.frame.arena.environment}
   Interface: ${context.frame.interface.mode} via ${context.frame.interface.channel}

2. Action Manifestation:
   Intention: ${context.intention}
   Mode: ${context.manifestation}
   Protocol: ${context.frame.interface.protocol}

3. Interface Primacy:
   - The interface defines the frame
   - Frame emerges from agent-arena relation
   - Unity is established through interaction

4. Capability Analysis:
   Agent Capabilities:
   ${Array.from(context.frame.agent.capabilities).map(c => `   - ${c}`).join('\n')}
   
   Environmental Constraints:
   ${Array.from(context.frame.arena.constraints).map(c => `   - ${c}`).join('\n')}

5. Resolution Strategy:
   - Frame is inherent in the relation
   - No need to specify frame externally
   - Context emerges from interaction
   - Identity established through interface

6. Ontological Implications:
   - Unity = 2 (Relation is primary)
   - Interface precedes components
   - Action context is self-specifying
   - Frame is emergent, not imposed`;
  }

  static validateActionContext(context: ActionContext): boolean {
    // Ensure the action context is well-formed and consistent
    const { frame, intention, manifestation } = context;
    
    // Check interface consistency
    if (frame.interface.mode === 'synchronous' && 
        frame.interface.channel !== 'local') {
      return false;
    }
    
    // Verify capability-manifestation alignment
    if (manifestation === 'local' && 
        !frame.agent.capabilities.has('direct_compute')) {
      return false;
    }
    
    // Confirm protocol matches channel
    if (frame.interface.channel === 'local' && 
        frame.interface.protocol !== 'direct_memory') {
      return false;
    }
    
    return true;
  }
} 
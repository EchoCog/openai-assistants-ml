export interface PSystemRule {
  type: string;
  pattern: string;
  action: (membrane: any) => void;
  priority: number;
}

export class PSystemRules {
  static readonly TOPOLOGY_RULES: PSystemRule[] = [
    {
      type: 'division',
      pattern: 'a -> [b][c]',
      action: (membrane) => {
        // Divide membrane into two child membranes
        const childA = { ...membrane, id: `${membrane.id}_a` };
        const childB = { ...membrane, id: `${membrane.id}_b` };
        return [childA, childB];
      },
      priority: 1
    },
    {
      type: 'fusion',
      pattern: '[a][b] -> c',
      action: (membranes) => {
        // Fuse two membranes into one
        const [memA, memB] = membranes;
        return {
          id: `${memA.id}_${memB.id}`,
          objects: new Set([...memA.objects, ...memB.objects])
        };
      },
      priority: 2
    }
  ];

  static readonly EVOLUTION_RULES: PSystemRule[] = [
    {
      type: 'spectral_radius_adaptation',
      pattern: 'high_error -> adjust_radius',
      action: (membrane) => {
        const currentError = membrane.getPerformanceMetrics().error;
        const newRadius = currentError > 0.5 ? 0.8 : 0.95;
        return {
          type: 'modify_spectral_radius',
          value: newRadius
        };
      },
      priority: 3
    },
    {
      type: 'density_adaptation',
      pattern: 'low_activity -> increase_density',
      action: (membrane) => {
        const activity = membrane.getPerformanceMetrics().activity;
        const newDensity = activity < 0.3 ? 0.2 : 0.1;
        return {
          type: 'modify_density',
          value: newDensity
        };
      },
      priority: 4
    }
  ];

  static readonly COMMUNICATION_RULES: PSystemRule[] = [
    {
      type: 'antiport',
      pattern: '(a, out; b, in)',
      action: (membranes) => {
        const [source, target] = membranes;
        const object = source.objects.values().next().value;
        source.objects.delete(object);
        target.objects.add(object);
      },
      priority: 5
    },
    {
      type: 'symport',
      pattern: '(ab, in)',
      action: (membrane) => {
        const [objA, objB] = membrane.objects;
        membrane.parent.objects.delete(objA);
        membrane.parent.objects.delete(objB);
        membrane.objects.add(objA);
        membrane.objects.add(objB);
      },
      priority: 6
    }
  ];

  static readonly OPTIMIZATION_RULES: PSystemRule[] = [
    {
      type: 'resource_allocation',
      pattern: 'high_load -> redistribute',
      action: (membrane) => {
        const load = membrane.getResourceMetrics().load;
        if (load > 0.8) {
          return {
            type: 'division',
            threshold: load
          };
        }
        return null;
      },
      priority: 7
    },
    {
      type: 'performance_optimization',
      pattern: 'low_performance -> optimize',
      action: (membrane) => {
        const metrics = membrane.getPerformanceMetrics();
        return {
          type: 'modify_leaking_rate',
          value: metrics.error > 0.3 ? 0.4 : 0.2
        };
      },
      priority: 8
    }
  ];

  // Rule application strategies
  static applyRules(membrane: any, ruleSet: PSystemRule[]) {
    // Sort rules by priority
    const sortedRules = [...ruleSet].sort((a, b) => a.priority - b.priority);
    
    // Apply rules in priority order
    for (const rule of sortedRules) {
      if (this.matchesPattern(membrane, rule.pattern)) {
        const result = rule.action(membrane);
        if (result) {
          this.applyResult(membrane, result);
        }
      }
    }
  }

  private static matchesPattern(membrane: any, pattern: string): boolean {
    // Pattern matching logic
    switch (pattern) {
      case 'high_error':
        return membrane.getPerformanceMetrics().error > 0.5;
      case 'low_activity':
        return membrane.getPerformanceMetrics().activity < 0.3;
      case 'high_load':
        return membrane.getResourceMetrics().load > 0.8;
      case 'low_performance':
        return membrane.getPerformanceMetrics().error > 0.3;
      default:
        return false;
    }
  }

  private static applyResult(membrane: any, result: any) {
    switch (result.type) {
      case 'division':
        const children = this.TOPOLOGY_RULES[0].action(membrane);
        membrane.parent.replaceChild(membrane, children);
        break;
      case 'modify_spectral_radius':
      case 'modify_density':
      case 'modify_leaking_rate':
        membrane.reservoir.applyRule(result);
        break;
      default:
        console.warn('Unknown rule result type:', result.type);
    }
  }
} 
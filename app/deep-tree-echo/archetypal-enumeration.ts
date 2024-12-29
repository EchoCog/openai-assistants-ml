import { BSeriesTree } from './b-series';

interface ArchetypalSystem {
  n: number;           // Enumeration level
  s: number;           // Shifted index
  a: number;           // A000081 value
  archetype: string;   // Archetypal pattern
  motif: string;       // Core motif
  characterizes: string; // What it characterizes
  membranes: string[]; // P-System expressions
  bridges: string[];   // Root-membrane bridges
  property: string;    // Fundamental property
}

export class ArchetypalEnumeration {
  private static readonly SYSTEMS: ArchetypalSystem[] = [
    {
      n: 1,
      s: 0,
      a: 1,
      archetype: "Chaos",
      motif: "empty",
      characterizes: "vacuity of all arenic systems",
      membranes: ["{ }"],
      bridges: ["∅ → □"],  // Void to Arena bridge
      property: "Nest"
    },
    {
      n: 2,
      s: 1,
      a: 1,
      archetype: "Cosmos",
      motif: "unity",
      characterizes: "relationality of all agentic systems",
      membranes: ["{ [ ] }"],
      bridges: ["• → [□]"], // Agent-Arena-Relation bridge
      property: "Whole"
    },
    {
      n: 3,
      s: 2,
      a: 2,
      archetype: "Analogos",
      motif: "duality",
      characterizes: "rationality of all distributed systems",
      membranes: [
        "{ [ ] [ ] }",     // Parallel multiplicity
        "{ [ [ ] ] }"      // Nested series unity
      ],
      bridges: [
        "• → [□,□]",       // Many bridge
        "• → [[□]]"        // One bridge
      ],
      property: "Ratio"
    },
    {
      n: 4,
      s: 3,
      a: 4,
      archetype: "Physis",
      motif: "quaternary",
      characterizes: "causality of all material systems",
      membranes: [
        "{ [ ] [ ] [ ] }",     // Space (extension)
        "{ [ [ ] ] [ ] }",     // Mean (mediation)
        "{ [ [ ] [ ] ] }",     // Goal (intention)
        "{ [ [ [ ] ] ] }"      // Time (succession)
      ],
      bridges: [
        "• → [□,□,□]",         // Spatial bridge
        "• → [[□],□]",         // Medial bridge
        "• → [[□,□]]",         // Intentional bridge
        "• → [[[□]]]"          // Temporal bridge
      ],
      property: "Cause"
    },
    {
      n: 5,
      s: 4,
      a: 9,
      archetype: "Bios",
      motif: "solar system",
      characterizes: "evolution of all living systems",
      membranes: [
        "{ [ ] [ ] [ ] [ ] }",     // Pure multiplicity
        "{ [ [ ] ] [ ] [ ] }",     // Primary grouping
        "{ [ [ ] ] [ [ ] ] }",     // Balanced grouping
        "{ [ [ ] [ ] ] [ ] }",     // Asymmetric nesting
        "{ [ [ [ ] ] ] [ ] }",     // Deep nesting with unit
        "{ [ [ ] [ ] [ ] ] }",     // Shallow containment
        "{ [ [ [ ] ] [ ] ] }",     // Mixed nesting
        "{ [ [ [ ] [ ] ] ] }",     // Branched depth
        "{ [ [ [ [ ] ] ] ] }"      // Pure depth
      ],
      bridges: [
        "• → [□,□,□,□]",           // Multiplicity bridge
        "• → [[□],□,□]",           // Primary group bridge
        "• → [[□],[□]]",           // Balance bridge
        "• → [[□,□],□]",           // Asymmetry bridge
        "• → [[[□]],□]",           // Depth-unit bridge
        "• → [[□,□,□]]",           // Containment bridge
        "• → [[[□],□]]",           // Mixed bridge
        "• → [[[□,□]]]",           // Branch bridge
        "• → [[[[□]]]]"            // Pure depth bridge
      ],
      property: "Life"
    }
  ];

  static getSystem(n: number): ArchetypalSystem | undefined {
    return this.SYSTEMS.find(sys => sys.n === n);
  }

  static explainArchetype(n: number): string {
    const system = this.getSystem(n);
    if (!system) return "Level not found";

    return `
Level n=${system.n} (s=${system.s}, a=${system.a})

Archetype: ${system.archetype}
Motif: ${system.motif}
Characterizes: ${system.characterizes}
Property: ${system.property}

P-System Expressions:
${system.membranes.map((m, i) => 
  `${i + 1}. ${m}
   Bridge: ${system.bridges[i]}`
).join('\n')}

This level represents:
- Archetypal Pattern: ${system.archetype}
- Core Property: ${system.property}
- System Type: ${system.characterizes}

The ${system.a} distinct configurations show how ${system.motif} patterns 
emerge through the interaction of roots (agents) and membranes (arenas).
`;
  }

  static visualizeLevel(n: number): string {
    const system = this.getSystem(n);
    if (!system) return "";

    return system.membranes.map((membrane, i) => `
Configuration ${i + 1}:

Membrane:
${this.visualizeMembrane(membrane)}

Bridge:
${this.visualizeBridge(system.bridges[i])}

Property: ${this.visualizeProperty(system.property, i)}
`).join('\n');
  }

  private static visualizeMembrane(membrane: string): string {
    return membrane
      .replace(/\{/g, '┌─')
      .replace(/\}/g, '─┐')
      .replace(/\[/g, '│')
      .replace(/\]/g, '│')
      .split('')
      .join(' ');
  }

  private static visualizeBridge(bridge: string): string {
    return bridge
      .replace(/•/g, '○')
      .replace(/→/g, '═══>')
      .replace(/□/g, '▢')
      .split('')
      .join(' ');
  }

  private static visualizeProperty(property: string, variant: number): string {
    const symbols = {
      "Nest": ["∅"],
      "Whole": ["◊"],
      "Ratio": ["◊/◊", "◊²"],
      "Cause": ["→", "↔", "⇒", "⇄"],
      "Life": ["☀", "◐", "◑", "◒", "◓", "◔", "◕", "○", "●"]
    };
    return (symbols as any)[property]?.[variant] || property;
  }
} 
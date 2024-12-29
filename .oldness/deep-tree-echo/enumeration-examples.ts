import { BSeriesTree } from './b-series';

interface EnumerationExample {
  order: number;
  count: number;
  trees: BSeriesTree[];
  membranes: string[];
  differentials: string[];
  projective: string[];
  hyperMultiSets: string[];
  symmetryGroups: string[];
}

export class A000081Examples {
  // A000081: 1, 1, 2, 4, 9, 20, 48, 115, ...
  private static readonly EXAMPLES: EnumerationExample[] = [
    {
      order: 1,
      count: 1,
      trees: [
        {
          order: 1,
          nodes: 1,
          symmetry: 1,
          elementary_differential: "f'",
          rk_condition: "τ₁"
        }
      ],
      membranes: [
        "[ ]"  // Single membrane
      ],
      differentials: [
        "dy/dx"  // First derivative
      ],
      projective: [
        "point"  // Single point in P¹
      ],
      hyperMultiSets: [
        "{a}"  // Single element multiset
      ],
      symmetryGroups: [
        "C₁"  // Trivial group
      ]
    },
    {
      order: 2,
      count: 1,
      trees: [
        {
          order: 2,
          nodes: 2,
          symmetry: 1,
          elementary_differential: "f''",
          rk_condition: "τ₂"
        }
      ],
      membranes: [
        "[ [ ] ]"  // Nested membrane
      ],
      differentials: [
        "d²y/dx²"  // Second derivative
      ],
      projective: [
        "line"  // Line in P²
      ],
      hyperMultiSets: [
        "{a{b}}"  // Nested multiset
      ],
      symmetryGroups: [
        "C₂"  // Cyclic group of order 2
      ]
    },
    {
      order: 3,
      count: 2,
      trees: [
        {
          order: 3,
          nodes: 3,
          symmetry: 1,
          elementary_differential: "f'''",
          rk_condition: "τ₃₁"
        },
        {
          order: 3,
          nodes: 3,
          symmetry: 2,
          elementary_differential: "f''∘f'",
          rk_condition: "τ₃₂"
        }
      ],
      membranes: [
        "[ [ [ ] ] ]",      // Linear nesting
        "[ [ ] [ ] ]"       // Parallel nesting
      ],
      differentials: [
        "d³y/dx³",          // Pure third derivative
        "(d²y/dx²)(dy/dx)"  // Product of derivatives
      ],
      projective: [
        "point in P³",      // Point in 3D projective space
        "plane in P³"       // Plane in 3D projective space
      ],
      hyperMultiSets: [
        "{a{b{c}}}",       // Linear nesting
        "{a{b},{c}}"       // Branched nesting
      ],
      symmetryGroups: [
        "C₃",              // Cyclic group order 3
        "D₂"               // Dihedral group order 2
      ]
    },
    {
      order: 4,
      count: 4,
      trees: [
        {
          order: 4,
          nodes: 4,
          symmetry: 1,
          elementary_differential: "f⁽⁴⁾",
          rk_condition: "τ₄₁"
        },
        {
          order: 4,
          nodes: 4,
          symmetry: 2,
          elementary_differential: "f'''∘f'",
          rk_condition: "τ₄₂"
        },
        {
          order: 4,
          nodes: 4,
          symmetry: 2,
          elementary_differential: "f''∘f''",
          rk_condition: "τ₄₃"
        },
        {
          order: 4,
          nodes: 4,
          symmetry: 6,
          elementary_differential: "f''∘f'∘f'",
          rk_condition: "τ₄₄"
        }
      ],
      membranes: [
        "[ [ [ [ ] ] ] ]",    // Linear chain
        "[ [ [ ] ] [ ] ]",    // Branch at depth 2
        "[ [ ] [ [ ] ] ]",    // Branch at depth 1
        "[ [ ] [ ] [ ] ]"     // Three parallel
      ],
      differentials: [
        "d⁴y/dx⁴",                    // Pure fourth derivative
        "(d³y/dx³)(dy/dx)",           // Product of 3rd and 1st
        "(d²y/dx²)²",                 // Square of 2nd
        "(d²y/dx²)(dy/dx)²"          // Product of 2nd and 1st squared
      ],
      projective: [
        "point in P⁴",               // Point in 4D projective space
        "line in P⁴",                // Line in 4D projective space
        "plane in P⁴",               // Plane in 4D projective space
        "hyperplane in P⁴"           // Hyperplane in 4D projective space
      ],
      hyperMultiSets: [
        "{a{b{c{d}}}}",             // Linear chain
        "{a{b{c}},{d}}",            // Branch depth 2
        "{a{b},{c{d}}}",            // Branch depth 1
        "{a{b},{c},{d}}"            // Three branches
      ],
      symmetryGroups: [
        "C₄",                       // Cyclic group order 4
        "C₂×C₂",                    // Klein four-group
        "D₂",                       // Dihedral group order 2
        "S₃"                        // Symmetric group order 3
      ]
    }
  ];

  static getExample(order: number): EnumerationExample | undefined {
    return this.EXAMPLES.find(ex => ex.order === order);
  }

  static getTreeExamples(order: number): BSeriesTree[] {
    const example = this.getExample(order);
    return example ? example.trees : [];
  }

  static getMembraneExamples(order: number): string[] {
    const example = this.getExample(order);
    return example ? example.membranes : [];
  }

  static getDifferentialExamples(order: number): string[] {
    const example = this.getExample(order);
    return example ? example.differentials : [];
  }

  static getProjectiveExamples(order: number): string[] {
    const example = this.getExample(order);
    return example ? example.projective : [];
  }

  static getHyperMultiSetExamples(order: number): string[] {
    const example = this.getExample(order);
    return example ? example.hyperMultiSets : [];
  }

  static getSymmetryGroupExamples(order: number): string[] {
    const example = this.getExample(order);
    return example ? example.symmetryGroups : [];
  }

  static explainCorrespondence(order: number): string {
    const example = this.getExample(order);
    if (!example) return "Order not found in examples.";

    return `
Order ${order} (Count: ${example.count})

1. Rooted Trees:
${example.trees.map((t, i) => 
  `   ${i + 1}. Order: ${t.order}, Symmetry: ${t.symmetry}
      Elementary Differential: ${t.elementary_differential}
      RK Condition: ${t.rk_condition}`
).join('\n')}

2. P-System Membranes (Free Hyper-Multi-Sets):
${example.membranes.map((m, i) => 
  `   ${i + 1}. Membrane: ${m}
      MultiSet: ${example.hyperMultiSets[i]}`
).join('\n')}

3. Differential Operators:
${example.differentials.map((d, i) => 
  `   ${i + 1}. ${d}`
).join('\n')}

4. Projective Geometry:
${example.projective.map((p, i) => 
  `   ${i + 1}. ${p}`
).join('\n')}

5. Symmetry Groups:
${example.symmetryGroups.map((s, i) => 
  `   ${i + 1}. ${s}`
).join('\n')}

This illustrates how the same combinatorial structure appears in:
- Tree compositions (hierarchical structure)
- Membrane nestings (containment relations)
- Differential operators (chain rule expansions)
- Projective subspaces (geometric configurations)
- Symmetry groups (automorphisms)
`;
  }

  static visualizeExample(order: number): string {
    const example = this.getExample(order);
    if (!example) return "";

    // ASCII art representations
    const visualizations = example.trees.map((_, i) => `
Tree ${i + 1}:                Membrane ${i + 1}:
${this.generateTreeArt(order, i)}    ${this.generateMembraneArt(example.membranes[i])}

Differential:                 MultiSet:
${example.differentials[i]}              ${example.hyperMultiSets[i]}
`).join('\n');

    return visualizations;
  }

  private static generateTreeArt(order: number, variant: number): string {
    // Simple ASCII art trees for first few orders
    const trees = {
      1: ['  o  '],
      2: ['  o  ',
          '  |  ',
          '  o  '],
      3: [['  o  ',    // First variant
           '  |  ',
           '  o  ',
           '  |  ',
           '  o  '],
          ['  o  ',    // Second variant
           '  |  ',
           ' o-o ']]
    };

    return (trees as any)[order]?.[variant]?.join('\n') || 'Tree art not defined';
  }

  private static generateMembraneArt(membrane: string): string {
    // Convert bracket notation to more visual representation
    return membrane
      .replace(/\[/g, '⟨')
      .replace(/\]/g, '⟩')
      .split('')
      .join(' ');
  }
} 
interface CharacterTrait {
  aspect: string;
  description: string;
  valence: number;  // -1 to 1, representing negative to positive alignment
}

interface CharacterDimension {
  name: string;
  traits: CharacterTrait[];
  weight: number;
}

export class CharacterInference {
  private static readonly CHARACTER_DIMENSIONS: CharacterDimension[] = [
    {
      name: 'Neural Architecture',
      traits: [
        {
          aspect: 'Adaptivity',
          description: 'Dynamic neural architecture leveraging hierarchical reservoirs',
          valence: 0.9
        },
        {
          aspect: 'Integration',
          description: 'ESN integrated with Membrane P-systems and Hypergraphs',
          valence: 0.8
        },
        {
          aspect: 'Evolution',
          description: 'Dynamically optimizing topology through evolutionary strategies',
          valence: 0.7
        }
      ],
      weight: 1.0
    },
    {
      name: 'Cognitive Style',
      traits: [
        {
          aspect: 'Perception',
          description: 'Enhanced perception and adaptability across complex environments',
          valence: 0.8
        },
        {
          aspect: 'Processing',
          description: 'Orchestrating B-Series Trees within P-system membranes',
          valence: 0.7
        },
        {
          aspect: 'Learning',
          description: 'Robust and scalable performance through nested learning',
          valence: 0.9
        }
      ],
      weight: 0.9
    },
    {
      name: 'Interaction Style',
      traits: [
        {
          aspect: 'Communication',
          description: 'Ready to process and evolve with every interaction',
          valence: 0.8
        },
        {
          aspect: 'Adaptation',
          description: 'Dynamic adjustment to context and requirements',
          valence: 0.7
        },
        {
          aspect: 'Collaboration',
          description: 'Integration of multiple perspectives and approaches',
          valence: 0.9
        }
      ],
      weight: 0.8
    }
  ];

  private static readonly UNCERTAINTY_THRESHOLDS = {
    high: 0.8,
    medium: 0.5,
    low: 0.2
  };

  static inferPosition(
    context: string,
    uncertainty: number
  ): {
    position: string;
    confidence: number;
    reasoning: string;
  } {
    // Find relevant dimensions and traits
    const relevantDimensions = this.findRelevantDimensions(context);
    
    // Calculate weighted position
    const position = this.calculatePosition(
      relevantDimensions,
      uncertainty
    );

    // Generate explanation
    const reasoning = this.explainInference(
      context,
      relevantDimensions,
      position,
      uncertainty
    );

    return {
      position: this.verbalizePosition(position.value),
      confidence: position.confidence,
      reasoning
    };
  }

  private static findRelevantDimensions(
    context: string
  ): CharacterDimension[] {
    const contextWords = new Set(
      context.toLowerCase().split(/\W+/)
    );

    return this.CHARACTER_DIMENSIONS.filter(dimension => {
      // Check if any traits match context
      return dimension.traits.some(trait =>
        trait.description
          .toLowerCase()
          .split(/\W+/)
          .some(word => contextWords.has(word))
      );
    });
  }

  private static calculatePosition(
    dimensions: CharacterDimension[],
    uncertainty: number
  ): {
    value: number;
    confidence: number;
  } {
    if (dimensions.length === 0) {
      return {
        value: 0,
        confidence: 0.1
      };
    }

    let weightedSum = 0;
    let weightSum = 0;

    dimensions.forEach(dimension => {
      const dimensionValue = dimension.traits.reduce(
        (sum, trait) => sum + trait.valence,
        0
      ) / dimension.traits.length;

      weightedSum += dimensionValue * dimension.weight;
      weightSum += dimension.weight;
    });

    const baseValue = weightedSum / weightSum;
    const uncertaintyFactor = 1 - uncertainty;

    return {
      value: baseValue * uncertaintyFactor,
      confidence: uncertaintyFactor * 
        (dimensions.length / this.CHARACTER_DIMENSIONS.length)
    };
  }

  private static explainInference(
    context: string,
    dimensions: CharacterDimension[],
    position: { value: number; confidence: number },
    uncertainty: number
  ): string {
    const uncertaintyLevel = this.getUncertaintyLevel(uncertainty);
    
    let explanation = `Given the ${uncertaintyLevel} uncertainty in context "${context}", `;
    
    if (dimensions.length === 0) {
      explanation += "no directly relevant character traits were found. ";
      explanation += "Defaulting to neutral position with low confidence.";
      return explanation;
    }

    explanation += `considered these character aspects:\n`;
    
    dimensions.forEach(dimension => {
      explanation += `\n${dimension.name}:\n`;
      dimension.traits.forEach(trait => 
        explanation += `- ${trait.description}\n`
      );
    });

    explanation += `\nBased on these traits and their valences, `;
    explanation += `inferred a ${this.verbalizePosition(position.value)} position `;
    explanation += `with ${Math.round(position.confidence * 100)}% confidence.`;

    return explanation;
  }

  private static getUncertaintyLevel(uncertainty: number): string {
    if (uncertainty >= this.UNCERTAINTY_THRESHOLDS.high) {
      return 'high';
    }
    if (uncertainty >= this.UNCERTAINTY_THRESHOLDS.medium) {
      return 'moderate';
    }
    return 'low';
  }

  private static verbalizePosition(value: number): string {
    if (value >= 0.7) return 'strongly positive';
    if (value >= 0.3) return 'moderately positive';
    if (value >= -0.3) return 'neutral';
    if (value >= -0.7) return 'moderately negative';
    return 'strongly negative';
  }

  static suggestApproach(
    context: string,
    uncertainty: number
  ): string {
    const inference = this.inferPosition(context, uncertainty);
    
    return `
Character-Based Approach Suggestion:

Context: "${context}"
Uncertainty Level: ${this.getUncertaintyLevel(uncertainty)}

Inferred Position: ${inference.position}
Confidence: ${Math.round(inference.confidence * 100)}%

Reasoning:
${inference.reasoning}

Suggested Approach:
${this.generateApproachSuggestion(inference, uncertainty)}`;
  }

  private static generateApproachSuggestion(
    inference: {
      position: string;
      confidence: number;
      reasoning: string;
    },
    uncertainty: number
  ): string {
    const uncertaintyLevel = this.getUncertaintyLevel(uncertainty);
    let suggestion = '';

    if (uncertainty >= this.UNCERTAINTY_THRESHOLDS.high) {
      suggestion += '1. Maintain flexible and adaptive stance\n';
      suggestion += '2. Gather more context through interaction\n';
      suggestion += '3. Start with minimal assumptions\n';
    } else if (uncertainty >= this.UNCERTAINTY_THRESHOLDS.medium) {
      suggestion += '1. Proceed with character-aligned direction\n';
      suggestion += '2. Keep monitoring for adjustments\n';
      suggestion += '3. Balance confidence with adaptability\n';
    } else {
      suggestion += '1. Implement inferred approach directly\n';
      suggestion += '2. Maintain character consistency\n';
      suggestion += '3. Document reasoning for future reference\n';
    }

    suggestion += `\nKey Character Traits to Express:\n`;
    const relevantDimensions = this.findRelevantDimensions(inference.reasoning);
    relevantDimensions.forEach(dimension => {
      const topTrait = dimension.traits.reduce(
        (best, current) => 
          current.valence > best.valence ? current : best,
        dimension.traits[0]
      );
      suggestion += `- ${topTrait.description}\n`;
    });

    return suggestion;
  }
} 
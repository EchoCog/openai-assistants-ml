import * as np from 'numpy-ts';
import { EventEmitter } from 'events';

interface ValidationRule {
  name: string;
  validate: (data: any) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

interface PreprocessingStep {
  name: string;
  transform: (data: any) => any;
  reversible: boolean;
  inverse?: (data: any) => any;
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    rule: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

interface PreprocessingResult {
  data: any;
  transformations: string[];
  metadata: {
    originalShape: number[];
    transformedShape: number[];
    statistics: {
      mean: number;
      std: number;
      min: number;
      max: number;
    };
  };
}

export class DataValidator extends EventEmitter {
  private rules: Map<string, ValidationRule>;
  private preprocessingPipeline: PreprocessingStep[];
  private cachedStats: Map<string, any>;

  constructor() {
    super();
    this.rules = new Map();
    this.preprocessingPipeline = [];
    this.cachedStats = new Map();
    this.initializeDefaultRules();
    this.initializeDefaultPreprocessing();
  }

  private initializeDefaultRules() {
    this.addRule({
      name: 'shape_consistency',
      validate: (data: number[][]) => 
        data.every(row => row.length === data[0].length),
      message: 'Inconsistent data shape detected',
      severity: 'error'
    });

    this.addRule({
      name: 'nan_check',
      validate: (data: number[][]) => 
        !data.some(row => row.some(val => isNaN(val))),
      message: 'NaN values detected in data',
      severity: 'error'
    });

    this.addRule({
      name: 'infinity_check',
      validate: (data: number[][]) => 
        !data.some(row => row.some(val => !isFinite(val))),
      message: 'Infinite values detected in data',
      severity: 'error'
    });

    this.addRule({
      name: 'value_range',
      validate: (data: number[][]) => {
        const flattened = data.flat();
        const max = Math.max(...flattened);
        const min = Math.min(...flattened);
        return max < 1e6 && min > -1e6;
      },
      message: 'Values outside acceptable range',
      severity: 'warning'
    });
  }

  private initializeDefaultPreprocessing() {
    this.addPreprocessingStep({
      name: 'remove_nan',
      transform: (data: number[][]) => 
        data.map(row => row.map(val => isNaN(val) ? 0 : val)),
      reversible: false
    });

    this.addPreprocessingStep({
      name: 'standardize',
      transform: (data: number[][]) => {
        const npData = np.array(data);
        const mean = np.mean(npData);
        const std = np.std(npData);
        this.cachedStats.set('standardize', { mean, std });
        return np.divide(np.subtract(npData, mean), std);
      },
      reversible: true,
      inverse: (data: number[][]) => {
        const stats = this.cachedStats.get('standardize');
        const npData = np.array(data);
        return np.add(np.multiply(npData, stats.std), stats.mean);
      }
    });

    this.addPreprocessingStep({
      name: 'clip_outliers',
      transform: (data: number[][]) => {
        const npData = np.array(data);
        const q1 = np.percentile(npData, 25);
        const q3 = np.percentile(npData, 75);
        const iqr = q3 - q1;
        const lower = q1 - 1.5 * iqr;
        const upper = q3 + 1.5 * iqr;
        return np.clip(npData, lower, upper);
      },
      reversible: false
    });
  }

  addRule(rule: ValidationRule) {
    this.rules.set(rule.name, rule);
  }

  addPreprocessingStep(step: PreprocessingStep) {
    this.preprocessingPipeline.push(step);
  }

  async validate(data: any): Promise<ValidationResult> {
    const errors = [];
    
    for (const [name, rule] of this.rules.entries()) {
      if (!rule.validate(data)) {
        errors.push({
          rule: name,
          message: rule.message,
          severity: rule.severity
        });
        this.emit('validation_error', {
          rule: name,
          message: rule.message,
          severity: rule.severity
        });
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }

  async preprocess(data: any): Promise<PreprocessingResult> {
    const originalShape = Array.isArray(data) ? 
      [data.length, data[0].length] : [data.length];
    
    let transformedData = data;
    const appliedTransformations = [];

    for (const step of this.preprocessingPipeline) {
      try {
        transformedData = step.transform(transformedData);
        appliedTransformations.push(step.name);
      } catch (error) {
        this.emit('preprocessing_error', {
          step: step.name,
          error: error.message
        });
        throw error;
      }
    }

    const npData = np.array(transformedData);
    const transformedShape = Array.isArray(transformedData) ?
      [transformedData.length, transformedData[0].length] : 
      [transformedData.length];

    return {
      data: transformedData,
      transformations: appliedTransformations,
      metadata: {
        originalShape,
        transformedShape,
        statistics: {
          mean: np.mean(npData),
          std: np.std(npData),
          min: np.min(npData),
          max: np.max(npData)
        }
      }
    };
  }

  async reverseTransform(data: any, transformations: string[]): Promise<any> {
    let reversedData = data;
    
    // Apply inverse transformations in reverse order
    for (const stepName of transformations.reverse()) {
      const step = this.preprocessingPipeline.find(s => s.name === stepName);
      if (step?.reversible && step.inverse) {
        reversedData = step.inverse(reversedData);
      }
    }

    return reversedData;
  }

  getValidationRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  getPreprocessingSteps(): PreprocessingStep[] {
    return [...this.preprocessingPipeline];
  }
} 
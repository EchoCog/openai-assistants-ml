import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';

interface MLConfig {
  pythonPath: string;
  mlSystemPath: string;
  modelPath: string;
}

interface MLResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class MLBridge extends EventEmitter {
  private pythonProcess: any;
  private responseQueue: Map<string, (response: MLResponse) => void>;
  private requestId: number;

  constructor(private config: MLConfig) {
    super();
    this.responseQueue = new Map();
    this.requestId = 0;
    this.initializePythonProcess();
  }

  private initializePythonProcess() {
    this.pythonProcess = spawn(this.config.pythonPath, [
      path.join(this.config.mlSystemPath, 'deep_tree_echo.py'),
      '--model-path', this.config.modelPath
    ]);

    this.pythonProcess.stdout.on('data', (data: Buffer) => {
      try {
        const response = JSON.parse(data.toString());
        const callback = this.responseQueue.get(response.id);
        if (callback) {
          callback(response);
          this.responseQueue.delete(response.id);
        }
      } catch (error) {
        console.error('Error parsing Python response:', error);
      }
    });

    this.pythonProcess.stderr.on('data', (data: Buffer) => {
      console.error('Python Error:', data.toString());
    });

    this.pythonProcess.on('close', (code: number) => {
      console.log('Python process exited with code:', code);
      this.emit('closed', code);
    });
  }

  private async sendCommand(
    command: string,
    params: any = {}
  ): Promise<MLResponse> {
    return new Promise((resolve) => {
      const id = (this.requestId++).toString();
      this.responseQueue.set(id, resolve);

      const request = {
        id,
        command,
        params
      };

      this.pythonProcess.stdin.write(
        JSON.stringify(request) + '\n'
      );
    });
  }

  async createTree(content: string): Promise<MLResponse> {
    return this.sendCommand('create_tree', { content });
  }

  async calculateEchoValue(nodeId: string): Promise<MLResponse> {
    return this.sendCommand('calculate_echo', { node_id: nodeId });
  }

  async propagateEchoes(nodeId: string): Promise<MLResponse> {
    return this.sendCommand('propagate_echoes', { node_id: nodeId });
  }

  async findResonantPaths(threshold?: number): Promise<MLResponse> {
    return this.sendCommand('find_resonant_paths', { threshold });
  }

  async analyzeEchoPatterns(): Promise<MLResponse> {
    return this.sendCommand('analyze_patterns');
  }

  async injectEcho(
    sourceId: string,
    targetId: string,
    strength: number
  ): Promise<MLResponse> {
    return this.sendCommand('inject_echo', {
      source_id: sourceId,
      target_id: targetId,
      strength
    });
  }

  async pruneWeakEchoes(threshold?: number): Promise<MLResponse> {
    return this.sendCommand('prune_weak_echoes', { threshold });
  }

  async detectElement(
    screenshot: Buffer,
    template: Buffer
  ): Promise<MLResponse> {
    return this.sendCommand('detect_element', {
      screenshot: screenshot.toString('base64'),
      template: template.toString('base64')
    });
  }

  async optimizeMovement(
    startPos: [number, number],
    endPos: [number, number]
  ): Promise<MLResponse> {
    return this.sendCommand('optimize_movement', {
      start_pos: startPos,
      end_pos: endPos
    });
  }

  async learnFromInteraction(
    type: string,
    startState: any,
    endState: any,
    success: boolean
  ): Promise<MLResponse> {
    return this.sendCommand('learn_interaction', {
      type,
      start_state: startState,
      end_state: endState,
      success
    });
  }

  async cleanup(): Promise<void> {
    return new Promise((resolve) => {
      this.pythonProcess.on('close', resolve);
      this.pythonProcess.kill();
    });
  }
} 
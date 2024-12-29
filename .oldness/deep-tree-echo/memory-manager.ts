import { EventEmitter } from 'events';
import * as np from 'numpy-ts';

interface MemoryBlock {
  id: string;
  size: number;
  used: number;
  data: WeakRef<any>;
  lastAccessed: number;
  priority: number;
}

interface MemoryStats {
  totalAllocated: number;
  totalUsed: number;
  blockCount: number;
  fragmentationRatio: number;
  averageUtilization: number;
}

export class MemoryManager extends EventEmitter {
  private blocks: Map<string, MemoryBlock>;
  private maxMemory: number;
  private cleanupInterval: NodeJS.Timer;
  private registry: FinalizationRegistry<string>;

  constructor(maxMemoryMB: number = 1024) {
    super();
    this.blocks = new Map();
    this.maxMemory = maxMemoryMB * 1024 * 1024; // Convert to bytes
    this.registry = new FinalizationRegistry(this.cleanup.bind(this));
    
    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performGarbageCollection();
    }, 60000); // Run every minute
  }

  async allocate(
    id: string,
    size: number,
    data: any,
    priority: number = 1
  ): Promise<boolean> {
    try {
      // Check if we need to free up space
      if (this.getTotalMemoryUsed() + size > this.maxMemory) {
        await this.freeUpSpace(size);
      }

      // Create weak reference to data
      const weakRef = new WeakRef(data);
      
      // Register for cleanup when object is garbage collected
      this.registry.register(data, id);

      // Create memory block
      const block: MemoryBlock = {
        id,
        size,
        used: size,
        data: weakRef,
        lastAccessed: Date.now(),
        priority
      };

      this.blocks.set(id, block);
      this.emit('allocation', { id, size });
      
      return true;
    } catch (error) {
      console.error('Memory allocation failed:', error);
      this.emit('allocation_error', { id, error });
      return false;
    }
  }

  async access(id: string): Promise<any> {
    const block = this.blocks.get(id);
    if (!block) {
      throw new Error(`Memory block ${id} not found`);
    }

    // Update access time
    block.lastAccessed = Date.now();
    
    // Get data from weak reference
    const data = block.data.deref();
    if (!data) {
      // Data was garbage collected
      this.blocks.delete(id);
      throw new Error(`Data for block ${id} has been collected`);
    }

    return data;
  }

  private async freeUpSpace(required: number) {
    let freed = 0;
    const sortedBlocks = Array.from(this.blocks.values())
      .sort((a, b) => {
        // Sort by priority (lower first) and then by last accessed time
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.lastAccessed - b.lastAccessed;
      });

    for (const block of sortedBlocks) {
      if (freed >= required) break;

      // Check if data is still referenced
      const data = block.data.deref();
      if (!data) {
        // Already garbage collected
        this.blocks.delete(block.id);
        freed += block.size;
        continue;
      }

      // If low priority and old, free it
      if (block.priority < 2 && 
          Date.now() - block.lastAccessed > 300000) { // 5 minutes
        this.blocks.delete(block.id);
        freed += block.size;
        this.emit('memory_freed', { id: block.id, size: block.size });
      }
    }

    if (freed < required) {
      throw new Error('Could not free enough memory');
    }
  }

  private cleanup(id: string) {
    const block = this.blocks.get(id);
    if (block) {
      this.blocks.delete(id);
      this.emit('cleanup', { id, size: block.size });
    }
  }

  private async performGarbageCollection() {
    const before = this.getTotalMemoryUsed();
    
    // Check all blocks for garbage collected data
    for (const [id, block] of this.blocks.entries()) {
      if (!block.data.deref()) {
        this.blocks.delete(id);
      }
    }

    const freed = before - this.getTotalMemoryUsed();
    if (freed > 0) {
      this.emit('gc_complete', { freed });
    }
  }

  getStats(): MemoryStats {
    const totalAllocated = this.getTotalMemoryUsed();
    const totalUsed = Array.from(this.blocks.values())
      .reduce((sum, block) => sum + block.used, 0);

    return {
      totalAllocated,
      totalUsed,
      blockCount: this.blocks.size,
      fragmentationRatio: 1 - (totalUsed / totalAllocated),
      averageUtilization: totalUsed / this.maxMemory
    };
  }

  private getTotalMemoryUsed(): number {
    return Array.from(this.blocks.values())
      .reduce((sum, block) => sum + block.size, 0);
  }

  async defragment() {
    const stats = this.getStats();
    if (stats.fragmentationRatio < 0.2) return; // Only defrag if fragmentation > 20%

    // Collect all valid blocks
    const validBlocks = Array.from(this.blocks.entries())
      .filter(([_, block]) => block.data.deref())
      .sort((a, b) => b[1].priority - a[1].priority);

    // Clear current blocks
    this.blocks.clear();

    // Reallocate blocks
    for (const [id, block] of validBlocks) {
      const data = block.data.deref();
      if (data) {
        await this.allocate(id, block.size, data, block.priority);
      }
    }

    this.emit('defragmentation_complete', this.getStats());
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.blocks.clear();
    this.emit('destroyed');
  }
} 
import type { FrameSequenceDefinition } from "./types";

export interface SequenceRepositoryEntry<Repository> {
  definition: FrameSequenceDefinition;
  repository: Repository;
}

export interface SequenceRepositoryActivation<Repository> {
  current: SequenceRepositoryEntry<Repository>;
  previous?: SequenceRepositoryEntry<Repository>;
}

export interface VisibleSequenceSnapshot<Repository, Visual> {
  sequenceId: string;
  repository: Repository | null;
  progress: number;
  visual: Visual;
}

/**
 * Owns repository identity independently from visible canvas state. Inactive
 * prewarm can only add/get a pooled repository; activation is the sole method
 * allowed to change the active entry.
 */
export class SequenceRepositoryPool<Repository> {
  private readonly entries = new Map<
    string,
    SequenceRepositoryEntry<Repository>
  >();
  private active?: SequenceRepositoryEntry<Repository>;
  private readonly create: (
    definition: FrameSequenceDefinition,
  ) => Repository;
  private readonly release: (repository: Repository) => void;

  constructor(
    create: (definition: FrameSequenceDefinition) => Repository,
    release: (repository: Repository) => void,
  ) {
    this.create = create;
    this.release = release;
  }

  prewarm(
    definition: FrameSequenceDefinition,
  ): SequenceRepositoryEntry<Repository> {
    return this.getOrCreate(definition);
  }

  activate(
    definition: FrameSequenceDefinition,
  ): SequenceRepositoryActivation<Repository> {
    const previous = this.active;
    const current = this.getOrCreate(definition);
    this.active = current;
    return { current, previous };
  }

  getActive(): SequenceRepositoryEntry<Repository> | undefined {
    return this.active;
  }

  dispose(): void {
    for (const entry of this.entries.values()) {
      this.release(entry.repository);
    }
    this.entries.clear();
    this.active = undefined;
  }

  private getOrCreate(
    definition: FrameSequenceDefinition,
  ): SequenceRepositoryEntry<Repository> {
    const existing = this.entries.get(definition.id);
    if (existing) return existing;

    const entry = {
      definition,
      repository: this.create(definition),
    };
    this.entries.set(definition.id, entry);
    return entry;
  }
}

export function routeSequencePrewarm<Repository, Visual>(
  pool: SequenceRepositoryPool<Repository>,
  definition: FrameSequenceDefinition,
  visible: VisibleSequenceSnapshot<Repository, Visual>,
): {
  repository: Repository;
  visible: VisibleSequenceSnapshot<Repository, Visual>;
} {
  return {
    repository: pool.prewarm(definition).repository,
    visible,
  };
}

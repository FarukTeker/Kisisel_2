import type { Logger } from '@nestjs/common';

/**
 * Per-run scratch space handed to every stage. `payload` is the item flowing
 * through the pipeline; `meta` lets stages pass extra data downstream.
 */
export interface StageContext<T> {
  payload: T;
  readonly logger: Logger;
  meta: Record<string, unknown>;
}

/**
 * A single unit of work in a pipeline. Implementations are NestJS providers so
 * they can inject Prisma / Groq / Config. Adding a stage = create a provider +
 * append it to the relevant ordered token array (see tokens.ts).
 */
export interface PipelineStage<T> {
  readonly name: string;
  process(ctx: StageContext<T>): Promise<void>;
}

/** Wraps a stage failure with the failing stage's name for diagnostics. */
export class StageError extends Error {
  constructor(
    public readonly stage: string,
    public readonly cause: unknown,
  ) {
    super(
      `Stage "${stage}" failed: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'StageError';
  }
}

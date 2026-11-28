export type ClockState = 'running';
export type ClockEventName = 'frame';
export type ClockContextKey = 'frames' | 'subsecond' | 'second' | 'minute' | 'hour';

export interface CreateClockOptions<TContext extends Record<ClockContextKey, any>, TEvent extends { type: ClockEventName }> {
  context?: TContext;
  hydrate: ParentNode;
}

export interface ClockMachine<TContext extends Record<ClockContextKey, any>, TEvent extends { type: ClockEventName }> {
  state: ClockState;
  context: TContext;
  nodes: ChildNode[];
  send(event: TEvent | TEvent['type']): void;
  subscribe(listener: (machine: ClockMachine<TContext, TEvent>) => void): () => void;
  start(): ClockMachine<TContext, TEvent>;
  stop(): void;
}

export function createClock<TContext extends Record<ClockContextKey, any> = Record<ClockContextKey, any>, TEvent extends { type: ClockEventName } = { type: ClockEventName }>(options: CreateClockOptions<TContext, TEvent>): ClockMachine<TContext, TEvent>;

// Each machine with a view as a component: its props are its context.
export type ClockProps = Partial<Record<ClockContextKey, unknown>>;
export declare const Clock: (props: ClockProps) => unknown;

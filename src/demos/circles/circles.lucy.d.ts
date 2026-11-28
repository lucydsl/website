export type BoxState = 'starting' | 'live';
export type BoxEventName = 'tick';
export type BoxContextKey = 'ticker' | 'style' | 'count' | 'content';

export interface CreateBoxOptions<TContext extends Record<BoxContextKey, any>, TEvent extends { type: BoxEventName }> {
  context?: TContext;
}

export interface BoxMachine<TContext extends Record<BoxContextKey, any>, TEvent extends { type: BoxEventName }> {
  state: BoxState;
  context: TContext;
  dom: DocumentFragment;
  nodes: ChildNode[];
  send(event: TEvent | TEvent['type']): void;
  subscribe(listener: (machine: BoxMachine<TContext, TEvent>) => void): () => void;
  start(): BoxMachine<TContext, TEvent>;
  stop(): void;
}

export function createBox<TContext extends Record<BoxContextKey, any> = Record<BoxContextKey, any>, TEvent extends { type: BoxEventName } = { type: BoxEventName }>(options?: CreateBoxOptions<TContext, TEvent>): BoxMachine<TContext, TEvent>;

export type CirclesState = 'starting' | 'filling' | 'stopped' | 'running';
export type CirclesEventName = 'start' | 'tick' | 'stop';
export type CirclesContextKey = 'ticker' | 'boxes' | 'timing';

export interface CreateCirclesOptions<TContext extends Record<CirclesContextKey, any>, TEvent extends { type: CirclesEventName }> {
  context?: TContext;
  hydrate: ParentNode;
}

export interface CirclesMachine<TContext extends Record<CirclesContextKey, any>, TEvent extends { type: CirclesEventName }> {
  state: CirclesState;
  context: TContext;
  nodes: ChildNode[];
  send(event: TEvent | TEvent['type']): void;
  subscribe(listener: (machine: CirclesMachine<TContext, TEvent>) => void): () => void;
  start(): CirclesMachine<TContext, TEvent>;
  stop(): void;
}

export function createCircles<TContext extends Record<CirclesContextKey, any> = Record<CirclesContextKey, any>, TEvent extends { type: CirclesEventName } = { type: CirclesEventName }>(options: CreateCirclesOptions<TContext, TEvent>): CirclesMachine<TContext, TEvent>;

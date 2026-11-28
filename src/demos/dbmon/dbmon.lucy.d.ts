export type QueryState = 'starting' | 'live';
export type QueryEventName = 'frame';
export type QueryContextKey = 'ticker' | 'sample' | 'elapsed' | 'className' | 'text';

export interface CreateQueryOptions<TContext extends Record<QueryContextKey, any>, TEvent extends { type: QueryEventName }> {
  context?: TContext;
}

export interface QueryMachine<TContext extends Record<QueryContextKey, any>, TEvent extends { type: QueryEventName }> {
  state: QueryState;
  context: TContext;
  dom: DocumentFragment;
  nodes: ChildNode[];
  send(event: TEvent | TEvent['type']): void;
  subscribe(listener: (machine: QueryMachine<TContext, TEvent>) => void): () => void;
  start(): QueryMachine<TContext, TEvent>;
  stop(): void;
}

export function createQuery<TContext extends Record<QueryContextKey, any> = Record<QueryContextKey, any>, TEvent extends { type: QueryEventName } = { type: QueryEventName }>(options?: CreateQueryOptions<TContext, TEvent>): QueryMachine<TContext, TEvent>;

export type DatabaseState = 'starting' | 'filling' | 'live';
export type DatabaseEventName = 'frame';
export type DatabaseContextKey = 'ticker' | 'queries' | 'count' | 'countClass';
export interface DatabaseInput {
  name: unknown;
}

export interface CreateDatabaseOptions<TContext extends Record<DatabaseContextKey, any> & DatabaseInput, TEvent extends { type: DatabaseEventName }> {
  context: TContext;
}

export interface DatabaseMachine<TContext extends Record<DatabaseContextKey, any> & DatabaseInput, TEvent extends { type: DatabaseEventName }> {
  state: DatabaseState;
  context: TContext;
  dom: DocumentFragment;
  nodes: ChildNode[];
  send(event: TEvent | TEvent['type']): void;
  subscribe(listener: (machine: DatabaseMachine<TContext, TEvent>) => void): () => void;
  start(): DatabaseMachine<TContext, TEvent>;
  stop(): void;
}

export function createDatabase<TContext extends Record<DatabaseContextKey, any> & DatabaseInput = Record<DatabaseContextKey, any> & DatabaseInput, TEvent extends { type: DatabaseEventName } = { type: DatabaseEventName }>(options: CreateDatabaseOptions<TContext, TEvent>): DatabaseMachine<TContext, TEvent>;

export type DbmonState = 'starting' | 'filling' | 'running';
export type DbmonEventName = 'frame' | 'mutate';
export type DbmonContextKey = 'ticker' | 'mutations' | 'databases' | 'fps';

export interface CreateDbmonOptions<TContext extends Record<DbmonContextKey, any>, TEvent extends { type: DbmonEventName }> {
  context?: TContext;
  hydrate: ParentNode;
}

export interface DbmonMachine<TContext extends Record<DbmonContextKey, any>, TEvent extends { type: DbmonEventName }> {
  state: DbmonState;
  context: TContext;
  nodes: ChildNode[];
  send(event: TEvent | TEvent['type']): void;
  subscribe(listener: (machine: DbmonMachine<TContext, TEvent>) => void): () => void;
  start(): DbmonMachine<TContext, TEvent>;
  stop(): void;
}

export function createDbmon<TContext extends Record<DbmonContextKey, any> = Record<DbmonContextKey, any>, TEvent extends { type: DbmonEventName } = { type: DbmonEventName }>(options: CreateDbmonOptions<TContext, TEvent>): DbmonMachine<TContext, TEvent>;

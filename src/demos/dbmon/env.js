// What dbmon.lucy imports: the pseudo-database and the animation frames
// that drive it, after DBMon's ENV.js.

// How many rows: a primary and a replica for each of 50 clusters.
const ROWS = 100;
const QUERIES = 5;

// The share of machines that take a new sample each frame, from 0 to 1.
let mutations = 0.5;

// One requestAnimationFrame loop for every machine that spawns frames. Each
// is sent a frame as it starts (on the server too, so the HTML has data),
// then one every animation frame.
const subscribers = new Set();
let loop = null;
const FIRST = { type: 'frame', data: { first: true } };
const FRAME = { type: 'frame', data: { first: false } };

function tick() {
  for(const machine of subscribers) {
    machine.send(FRAME);
  }
  loop = subscribers.size > 0 ? requestAnimationFrame(tick) : null;
}

export function frames({ parent }) {
  return {
    start() {
      parent.send(FIRST);
      if(typeof requestAnimationFrame === 'function') {
        subscribers.add(parent);
        loop ??= requestAnimationFrame(tick);
      }
      return this;
    },
    stop() {
      subscribers.delete(parent);
    },
    send() {}
  };
}

// Filling the lists.
export const moreRows = context => (context.databases?.length ?? 0) < ROWS;
export const moreQueries = context => (context.queries?.length ?? 0) < QUERIES;
export const rowName = context => {
  const index = context.databases?.length ?? 0;
  return `cluster${Math.floor(index / 2) + 1}${index % 2 ? 'slave' : ''}`;
};

// A frame changes a machine with the chance the mutations slider sets; the
// first always does.
export const shouldUpdate = (context, event) => event.data.first || Math.random() < mutations;

// A query: how long it has run, in seconds, and what it is.
export const sampleQuery = () => {
  const elapsed = Math.random() * 15;
  let text = 'SELECT blah FROM something';
  if(Math.random() < 0.2) {
    text = '<IDLE> in transaction';
  }
  if(Math.random() < 0.1) {
    text = 'vacuum';
  }
  return { elapsed, text };
};

export const elapsedText = ({ sample: { elapsed } }) => {
  if(elapsed < 60) {
    return elapsed.toFixed(2);
  }
  const [seconds, ms] = (elapsed % 60).toFixed(2).split('.');
  return `${Math.floor(elapsed / 60)}:${seconds.padStart(2, '0')}.${ms}`;
};

export const elapsedClass = ({ sample: { elapsed } }) =>
  elapsed >= 10 ? 'query query--long' : elapsed >= 1 ? 'query query--warn' : 'query query--short';

export const queryText = context => context.sample.text;

// A database: how many queries it's running.
export const queryCount = () => Math.floor(Math.random() * 10 + 1) * (Math.random() < 0.1 ? 3 : 1);

export const countClass = ({ count }) =>
  count >= 20 ? 'count count--high' : count >= 10 ? 'count count--warn' : 'count count--ok';

// The page: frames per second, measured over each second.
let frameCount = 0;
let since = 0;
let fps = 0;
export const framesPerSecond = () => {
  const now = typeof performance === 'object' ? performance.now() : 0;
  frameCount++;
  if(now - since >= 1000) {
    fps = Math.round((frameCount * 1000) / (now - since));
    frameCount = 0;
    since = now;
  }
  return fps;
};

// The slider, as a percentage.
export const defaultMutations = () => mutations * 100;
export const setMutations = (context, event) => {
  mutations = Number(event.data.target.value) / 100;
  return mutations * 100;
};

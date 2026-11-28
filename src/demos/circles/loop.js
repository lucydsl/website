// What circles.lucy imports: the benchmark's loop, which sends every
// machine that spawns ticks a tick, as often as setTimeout(0) allows, and
// the functions that turn a box's count into where it is and what it shows.

const BOXES = 300;

const subscribers = new Set();
let timer = null;
const TICK = { type: 'tick' };

// How long the loops took, as the original measures them: from the start
// of one to the start of the next.
let loopTime = 0;
let loopCount = 0;
let totalTime = 0;

function loop() {
  const last = loopTime || performance.now();
  loopTime = performance.now();
  loopCount++;
  totalTime += loopTime - last;
  for(const machine of subscribers) {
    machine.send(TICK);
  }
  timer = setTimeout(loop, 0);
}

export function ticks({ parent }) {
  return {
    start() {
      subscribers.add(parent);
      return this;
    },
    stop() {
      subscribers.delete(parent);
    },
    send() {}
  };
}

export const startLoop = () => {
  loopTime = loopCount = totalTime = 0;
  timer ??= setTimeout(loop, 0);
};

export const stopLoop = () => {
  clearTimeout(timer);
  timer = null;
};

export const moreBoxes = context => (context.boxes?.length ?? 0) < BOXES;

export const nextCount = ({ count = 0 }) => count + 1;

export const boxStyle = ({ count = 0 }) =>
  `top: ${Math.sin(count / 10) * 10}px; left: ${Math.cos(count / 10) * 10}px; background: rgb(0, 0, ${count % 255});`;

export const boxContent = ({ count }) => count % 100;

// Every 30 loops, as the original does; in between, the text stays.
export const timingText = context => loopCount % 30 === 0
  ? `Performed ${loopCount} iterations in ${totalTime.toFixed(2)} ms (average ${(totalTime / loopCount).toFixed(2)} ms per loop).`
  : context.timing;

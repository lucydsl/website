// What clock.lucy imports: an actor that sends its parent a frame event on
// every animation frame, with the seconds since midnight as its data, and
// the functions that turn those seconds into each hand's rotation.

export function animationFrames({ parent }) {
  let id;
  const tick = () => {
    const midnight = new Date().setHours(0, 0, 0, 0);
    parent.send({ type: 'frame', data: (Date.now() - midnight) / 1000 });
    id = requestAnimationFrame(tick);
  };
  return {
    start() {
      // On the server there are no frames: the clock is rendered as it
      // starts, at twelve, and set going in the browser.
      if(typeof requestAnimationFrame === 'function') {
        tick();
      }
      return this;
    },
    stop() {
      if(typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(id);
      }
    },
    send() {}
  };
}

const rotate = turn => `rotate(${(turn * 360).toFixed(1)})`;

export const subsecondTurn = (context, event) => rotate(event.data % 1);
export const secondTurn = (context, event) => rotate((event.data % 60) / 60);
export const minuteTurn = (context, event) => rotate(((event.data / 60) % 60) / 60);
export const hourTurn = (context, event) => rotate(((event.data / 3600) % 12) / 12);

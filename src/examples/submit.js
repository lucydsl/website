export default function createMachine({ actions, context = {}, guards } = {}) {
  const listeners = new Set();
  const states = {
    form: {
      submit(event) {
        if(guards.canSubmit(machine.context, event)) {
          actions.thank(machine.context, event);
          machine.state = 'sent';
          machine.done = true;
        }
      }
    },
    sent: {}
  };
  function notify() {
    for(const listener of listeners) {
      listener(machine);
    }
  }
  const machine = {
    state: 'form',
    context,
    done: false,
    send(event) {
      if(typeof event === 'string') {
        event = { type: event };
      }
      const handler = states[machine.state][event.type];
      if(handler) {
        handler(event);
        notify();
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      notify();
      return machine;
    },
    stop() {
      listeners.clear();
    }
  };
  return machine;
}

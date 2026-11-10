---
layout: ../../layouts/Language.astro
title: Language Overview
sections:
  - References:
    - Variables
    - Symbols
  - Machine
  - State:
    - Initial state
    - Final state
    - Nested state
  - Transitions:
    - Event
    - Immediate
    - Delay
    - Special events
  - Actions:
    - Assign
  - Guards
  - Invoke
  - Actors
---

# The Lucy Language Guide

## References

In Lucy there are a few ways to reference other things in a Lucy programs.

An __identifier__ is any sort of named item that can be referenced elsewhere. Lucy has the `use` statement for importing other machine, guards and actions.

Some examples of identifiers:

* A use reference: `use './util' { log }`
* A named machine `machine one {}`

Additionally there are a couple of special types of references in Lucy programs.

### Variables

An [action](docs/language/#actions) or a [guard](docs/language/#guards) can be given a name, in which case they are an immutable __variable__.

```lucy
use './util' { log }

action logTransition = log
```

### Symbols

__Symbols__ are an important part of Lucy programs, they allow you to refer to an item that will be passed in when a machine is created. For example:

```lucy
state idle {
  pay => guard(:hasFunds) => purchase
}

state purchase {}
```

Here `:hasFunds` refers to a function that is passed in on the JavaScript side, when the machine is created. A `symbol` can be used anywhere a normal reference can be used.

```js
import createMachine from './register.js';

const machine = createMachine({
  context: {
    funds: 10
  },
  guards: {
    hasFunds: (context) => context.funds > 20
  }
});
```

Each kind of symbol goes in its own option: `actions`, `guards`, `assigns` (the values for [assign](docs/language/#assign)), `delays`, and `services` (what [invoke](docs/language/#invoke) and [spawn](docs/language/#spawning) call). Each function is called with `(context, event)`. A machine only reads the options it uses.

## Machine

In Lucy a __machine__ can be defined 2 different ways. 

### Named machines

The first way to define a machine is by using the `machine` keyword followed by a name.

```lucy
machine toggleMachine {
  state on {
    toggle => off
  }

  state off {
    toggle => on
  }
}
```

This compiles to a JavaScript module that exports a function to create the machine, named `create` followed by the machine's name. The output is plain JavaScript, with no runtime library:

__out.js__

```js
export function createToggleMachine({ context = {} } = {}) {
  const listeners = new Set();
  const states = {
    on: {
      toggle() {
        machine.state = 'off';
      }
    },
    off: {
      toggle() {
        machine.state = 'on';
      }
    }
  };
  function notify() {
    for(const listener of listeners) {
      listener(machine);
    }
  }
  const machine = {
    state: 'on',
    context,
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
```

The biggest benefit to naming a machine is when you want to have multiple machines in the same Lucy module. Each will be exported, but you can also use them internally like so:

```lucy
machine walk {
  initial state walk {
    delay(10s) => stop
  }

  final state stop {}
}

machine stoplight {
  state red {
    invoke(walk) {
      done => green
    }
  }

  state green {}
}
```

### Implicit machines

A Lucy file can have top-level states, in which case there is an implicit machine. The `machine` keyword is not needed in this case, and a single machine is exported as the module's default export, a function named `createMachine`.

```lucy
state idle {}
```

__out.js__ (the first line)

```js
export default function createMachine({ context = {} } = {}) {
```

### Using a machine

Each factory takes an optional object of options, `{ context, actions, guards, assigns, delays, services }`, and returns a machine:

```js
import { createToggleMachine } from './toggle.js';

const machine = createToggleMachine({ context: { clicks: 0 } });

machine.subscribe(m => console.log(m.state, m.context));
machine.start();         // on { clicks: 0 }
machine.send('toggle');  // off { clicks: 0 }
machine.stop();
```

* `state` is the name of the current state, or a dotted path such as `'red.walk'` inside a [nested state](docs/language/#nested-state).
* `context` is the machine's data, a plain object. It starts as the `context` option (or `{}`), and each [assign](docs/language/#assign) replaces it with a new object.
* `send(event)` takes an event's type, or an object like `{ type: 'set', data: 5 }`, and runs the transition at once. An event the current state doesn't handle is ignored.
* `subscribe(listener)` calls the listener with the machine after each change. It returns a function that unsubscribes.
* `start()` enters the initial state (running its entry actions, delays and invokes) and returns the machine.
* `stop()` clears timers, drops pending invokes, stops child machines and removes the listeners.
* `done` is there when the machine has [final states](docs/language/#final-state), and becomes `true` when one is entered.

The `.js` file comes from compiling the `.lucy` file with `lucyc` (`lucyc --out-file toggle.js toggle.lucy`) or from JavaScript; see the [install page](install/).

## State

A __state block__ allows us to describe events and transitions from one state to another. A simple state block looks like:

```lucy
state idle {
  click => next
}

state next {}
```

In the above `idle` is the name of the state, `click` is an event that occurs within the state, and `next` is another state that is transitioned into when the click event occurs.

### Initial state

The `initial` state is the state that the machine is first in when the machine starts. Machines *are not* required to have an initial state; without one, the machine starts in the first state. You can mark a state as initial using the `initial` modifier:

```lucy
initial state idle {}
```

### Final state

A final state is a state which cannot be transitioned out of. When the machine enters one, its `done` property becomes `true`. A machine that [invokes](docs/language/#invoke) this one gets a `done` event at that point.

```lucy
initial state loading {
  error => broken
}

final state broken {

}
```

A final state can still have `@entry` actions, but any transitions in it are never taken, and the compiler warns about them.

### Nested state

You can define nested states by defining a new machine inside any given state.

```lucy
machine light {
  initial state green {
    timer => yellow
  }

  state yellow {
    timer => red
  }

  state red {
    timer => green

    machine pedestrian {
      initial state walk {
        countdown => wait
      }

      state wait {
        countdown => stop
      }

      final state stop {}
    }
  }
}
```

When the light enters `red`, it also enters the nested machine's initial state, so its `state` is `'red.walk'`, then `'red.wait'` and `'red.stop'`. Events that `red` handles still work in its nested states: `timer` moves from any of them back to `green`.

A transition can target a nested state with the same dotted path:

```lucy
initial state idle {
  fetch => fetching

  machine idling {
    initial state noError {}

    state errored {}
  }
}

state fetching {
  reportError => idle.errored
}
```

## Transitions

Moving from one [state](docs/language/#state) to another is called a __transition__. A transition can occur for a number of reasons, illuminated below. Most commonly however, a transition occurs because of an __event__, such as a user clicking a button.

A transition can also have [guards](docs/language/#guards) and [actions](docs/language/#actions). When it's taken, the guards are checked first, and if any of them fails nothing happens. Otherwise the current state's `@exit` actions run, then the transition's actions in the order they're written, and then the new state is entered and its `@entry` actions run.

### Event

An event occurs based on some action that takes place outside of the state machine. Often these are user-driven actions, like typing into a text input. In Lucy an event is represented by a given name, with an arrow `=>` pointing to what should occur given that event.

```lucy
state idle {
  click => loadingUser
}

state loadingUser {
  // ...
}
```

#### on(event)

Using `click =>` is how you will almost always define transitions in Lucy. It's worth noting that it's a shorthand for the following syntax:

```lucy
state idle {
  on(click) => loadingUser
}

state loadingUser {}
```

This can *rarely* be useful. For example, `delay` is a keyword in Lucy so this will result in a compilation error:

```lucy
state idle {
  delay => loadingUser
}
```

However if you use the on() function you can have events named delay:

```lucy
state idle {
  on(delay) => loadingUser
}

state loadingUser {}
```

### Immediate

An __immediate__ transition is one that occurs immediately upon entering a state. Immediate transitions are useful to perform some side-effect in a temporary state before moving to another state.

In Lucy an immediate is specified by using the `=>` token *without* an event name, like so:

```lucy
action setUser = assign(user, :addUserToContext)

state loading {
  complete => assignData
}

state assignData {
  => setUser => loaded
}

state loaded {}
```

### Delay

A delay transitions out of state after a given timeframe.

```lucy
initial state loading {
  delay(2s) => idle
}

state idle {
  click => done
}

final state done {}
```

Delays can be specified using either:

* __Integer__: Any integer is interpreted as milliseconds:

  ```lucy
  initial state loading {
    delay(200) => idle
  }

  state idle {}
  ```

  Above the `loading` state transitions to `idle` after 200 milliseconds.

* __Timeframe__: A timeframe is an integer followed by a suffix of either:
  * __ms__: Milliseconds
  * __s__: Seconds
  * __m__: Minutes

  ```lucy
  initial state wait {
    delay(2s) => start
  }

  state start {}
  ```

  Above the `wait` state transitions to `start` after a delay of __2 seconds__.


* __Function__: a function imported from JavaScript or provided via a symbol (in the `delays` option) can be used to specify a dynamic delay. This is useful when the context of the state machine is needed to determine the length of the delay. The function is called with `(context, event)` and must return a number of milliseconds.

  ```lucy
  state green {
    delay(:lightDelay) => yellow
  }

  state yellow {
    delay(:yellowLightDelay) => red
  }

  final state red {}
  ```

### Special events

Additionally Lucy has the concept of 2 special events, `@entry` and `@exit`. The `@` symbol denotes a builtin event type, similar in concept of local variables in Ruby.

#### @entry

The `@entry` event occurs when first entering a state. It provides a way to perform [actions](docs/language/#actions) without exiting the state.

```lucy
state first {
  click => second
}

state second {
  @entry => action(:log)

  // We remain in the `second` state
}
```

#### @exit

The `@exit` event occurs when exiting a state. It provides a way to perform [actions](docs/language/#actions) without needing an intermediate state.

```lucy
state first {
  click => second
  @exit => action(:log)
}

final state second {}
```

## Actions

An __action__ is a way to perform a side-effect either during a transition or during entry/exit of a state. Actions can be used to (among other things):

* Do logging.
* Add a value to the machine's data using `assign`.
* Spawn new actor machines.
* Send messages to actors.

Actions can be named at the top level of a machine using the `action` keyword. You can also use `action` as a function inside of a transition or entry/exit.

### Named actions

Name actions start with keyword `action`, then a name for the action, followed by an equal sign and a reference (such as a symbol).

Named actions are useful when you think you might want to reuse the action, or to give the action a more descriptive name.

```lucy
action logTransition = :log

state ping {
  ping => logTransition => pong
}

state pong {
  ping => ping
}
```

### Inline actions

Inline actions are used by calling the `action` keyword as a function, followed by the reference.

```lucy
state ping {
  ping => action(:log) => pong
}

state pong {
  ping => ping
}
```

### Assign

An __assign__ is a special kind of action that assigns a *value* to a property of the machine's data, its __context__. The context is a plain object, `machine.context`; an assign doesn't change it in place but replaces it with a new object that has the new value.

#### Named actions

Since an assign is a form of an action, you can create a named action for the assign using the `action` assignment form:

```lucy
action addLoadedUser = assign(user, :pluckUser)

state idle {
  enter => addLoadedUser => loaded
}

state loaded {}
```

Here we are assigning the __user__ property to the machine's data. `pluckUser` is being used as a reducer, passed in the `assigns` option. It is called with the context and the event coming from `enter`, which might contain data such as a list of users, and returns something that is assigned to `user`.

```js
const machine = createMachine({
  assigns: {
    pluckUser: (context, event) => event.data.users[0]
  }
});
```

With only a property name, `assign(user)` assigns the event's `data`.

#### Inline assigns

Like normal actions, an `assign` can also be used inline in a transition. You can use it this way to avoid having to name an action.

```lucy
state idle {
  enter => assign(user, :pluckUser) => loaded
}

state loaded {}
```

## Guards

A __guard__ is used to interrupt a transition, giving you a chance to dynamically decide if the transition should occur or be rejected.

Like with actions, you can either created named guards, or use guards inline during an event.

### Named guards

A named guard is created using the `guard` keyword, followed by a reference that will be called to determine if the transition should proceed.

```lucy
guard isValidCard = :validCreditCard

state idle {
  enter => isValidCard => purchasing
}

state purchasing {}
```

### Inline guards

A guard can also be called like a function, inline inside of the transition. The argument is the reference used to dynamically determine if the transition should proceed.

```lucy
state idle {
  enter => guard(:validCreditCard) => purchasing
}

state purchasing {}
```

## Invoke

The keyword `invoke` is used to call external code and wait until it is complete. This could be a function that returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), or a Machine. The invoke starts when the state is entered and is dropped if the state is left first. For a promise, the `done` event is sent with the resolved value as its `data`, and the `error` event if it rejects. If it is a machine, the `done` event will be sent when the machine reaches its [final state](docs/language/#final-state).

Invoking promises:

__utils.js__

```js
export function getUsers(context, event) {
  return fetch('/users').then(res => res.json());
}
```

__machine.lucy__

```lucy
use './utils.js' { getUsers }

initial state loading {
  invoke(getUsers) {
    done => assign(users) => loaded
    error => failed
  }
}

state loaded {}

state failed {}
```

The function can also be a symbol, `invoke(:getUsers)`, passed in the `services` option.

Invoking other machines:

```lucy
machine light {
  initial state green {
    delay(30s) => yellow
  }

  state yellow {
    delay(10s) => red
  }

  final state red {}
}

machine main {
  state idle {
    invoke(light) {
      done => idle
    }
  }
}
```

## Actors

Actors allow you to create new machines and keep a reference to them within your own machine, through an [assign reference](docs/language/#assign). You can send messages to the new machine, and they can send messages back to you.

Spawning a machine is a little like using [invoke](docs/language/#invoke) on a machine. Unlike with __invoke__, a spawned machine does not block your current machine from transitioning.

### Spawning

To create an actor within your machine, use the __spawn__ function call. Spawn *can only* be used within an assign expression. This is how you save a reference to the spawned machine.

```lucy
machine todoItem {
  state idle {}
}

machine app {
  state idle {
    new => assign(todo, spawn(todoItem))
  }
}
```

The spawned machine is created by calling its factory and started, and the reference is saved to the context. A spawned machine is created without options, so give it what it needs with `use` rather than symbols, as below. Spawned machines are stopped when their parent is.

### Sending messages to actors

Once you've spawned a machine you can send messages to it using the __send__ action. The first argument is the referenced actor, the second is an event to send.

```lucy
use './api.js' { deleteTodo }

machine todoItem {
  state idle {
    delete => deleting
  }
  state deleting {
    invoke(deleteTodo) {
      done => deleted
    }
  }
  final state deleted {}
}

machine app {
  state idle {
    new => assign(todo, spawn(todoItem))
    delete => send(todo, delete)
  }
}
```

Here during the `delete` event of our app we use the send action to tell our referenced `todo` actor to receive the `delete` event.

### Sending messages to the parent

Likewise, an actor can send messages back to their parent using the special `parent` keyword with `send`:

```lucy
use './api.js' { deleteTodo }

machine todoItem {
  state idle {
    delete => deleting
  }
  state deleting {
    invoke(deleteTodo) {
      done => deleted
    }
  }
  final state deleted {
    @entry => send(parent, deletedTodo)
  }
}

machine app {
  state idle {
    new => assign(todo, spawn(todoItem))
    delete => send(todo, delete)
    deletedTodo => action(:updateUI)
  }
}
```

> Note: the current compiler doesn't give spawned machines a reference to their parent yet, so `send(parent, ...)` compiles but fails when it runs.

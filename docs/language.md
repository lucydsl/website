---
layout: language.njk
title: Language Overview
tags: page
sections:
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

This translates to JavaScript where this machine is exported by its name:

```js
import { Machine } from 'xstate';

export const toggleMachine = Machine({
  states: {
    on: {
      on: {
        toggle: 'off'
      }
    },
    off: {
      on: {
        toggle: 'on'
      }
    }
  }
});
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
    invoke walk {
      done => green
    }
  }

  state green {}
}
```

### Implicit machines

A Lucy file can have top-level states, in which case there is an implicit machine. The `machine` keyword is not needed in this case, and a single machine is exported (as the default JavaScript) export.

```lucy
state idle {}
```

__out.js__

```js
import { Machine } from 'xstate';

export default Machine({
  states: {
    idle: {

    }
  }
});
```

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

The `initial` state is the state that the machine is first in when the machine starts. Machines *are not* required to have an initial state, but most FSM runtimes expect one. You can mark a state as initial using the `initial` modifier:

```lucy
initial state idle {}
```

### Final state

A final state is a state which cannot be transitioned out of.

```lucy
initial state loading {
  error => broken
}

final state broken {

}
```

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

## Transitions

Moving from one [state](#state) to another is called a __transition__. A transition can occur for a number of reasons, illuminated below. Most commonly however, a transition occurs because of an __event__, such as a user clicking a button.

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
```

### Immediate

An __immediate__ transition is one that occurs immediately upon entering a state. Immediate transitions are useful to perform some side-effect in a temporary state before moving to another state.

In Lucy an immediate is specified by using the `=>` token *without* an event name, like so:

```lucy
use './util' { addUserToContext }

action setUser = addUserToContext

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


* __Function__: a function imported from JavaScript can be used to specify a dynamic delay. This is useful when the context of the state machine is needed to determine the length of the delay. The function must return an integer.

  ```lucy
  use './util' { lightDelay }

  state green {
    delay(lightDelay) => yellow
  }

  state yellow {
    delay(yellowLightDelay) => red
  }

  final state red {}
  ```

### Special events

Additionally Lucy has the concept of 2 special events, `@entry` and `@exit`. The `@` symbol denotes a builtin event type, similar in concept of local variables in Ruby.

#### @entry

The `@entry` event occurs when first entering a state. It provides a way to perform [actions](#actions) without exiting the state.

```lucy
use './util' { log }

state first {
  click => second
}

state second {
  @entry => action(log)

  // We remain in the `second` state
}
```

#### @exit

The `@exit` event occurs when exiting a state. It provides a way to peform [actions](#actions) within needing an intermediate state.

```lucy
use './util' { log }

state first {
  click => second
  @exit => action(log)
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

Name actions start with keyword `action`, then a name for the action, followed by an equal sign and an external reference.

Named actions are useful when you think you might want to reuse the action, or to give the action a more descriptive name.

```lucy
use './util' { log }

action logTransition = log

state ping {
  ping => logTransition => pong
}

state pong {
  ping => ping
}
```

### Inline actions

Inline actions are used by calling the `action` keyword as a function, followed by the external value (a JavaScript function).

```lucy
use './util' { log }

state ping {
  ping => action(log) => pong
}

state pong {
  ping => ping
}
```

### Assign

An __assign__ is a special kind of action that assigns a *value* to the machine's data (in XState this is called the [context](https://xstate.js.org/docs/guides/context.html)).

#### Named actions

Since an assign is a form of an action, you can create a named action for the assign using the `action` assignment form:

```lucy
use './util' { loadUsers, pluckUser }

action addLoadedUser = assign(user, pluckUser)

state idle {
  enter => addLoadedUser => loaded
}

state loaded {}
```

Here we are assigning the __user__ property to the machine's data. `pluckUser` is being used as a reducer. It takes in the event coming from `enter`, which might contain data such as a list of users, and returns something that is assigned to `user`.

#### Inline assigns

Like normal actions, an `assign` can also be used inline in a transition. You can use it this way to avoid having to name an action.

```lucy
use './util' { loadUsers, pluckUser }

state idle {
  enter => assign(user, pluckUser) => loaded
}

state loaded {}
```

## Guards

A __guard__ is used to interrupt a transition, giving you a chance to dynamically decide if the transition should occur or be rejected.

Like with actions, you can either created named guards, or use guards inline during an event.

### Named guards

A named guard is created using the `guard` keyword, followed by an imported JavaScript value (a function) that will be called to determine if the transition should proceed.

```lucy
use './util' { validCreditCard }

guard isValidCard = validCreditCard

state idle {
  enter => isValidCard => purchasing
}

state purchasing {}
```

### Inline guards

A guard can also be called like a function, inline inside of the transition. The argument is the external JavaScript function used to dynamically determine if the transition should proceed.

```lucy
use './util' { validCreditCard }

state idle {
  enter => guard(validCreditCard) => purchasing
}

state purchasing {}
```

## Invoke

The keyword `invoke` is used to call external code and wait until it is complete. This could be a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or a Machine. If it is a machine, the `done` event will be sent when the machine reaches its [final state](docs/language/#final-state).

Invoking promises:

__utils.js__

```js
export function getUsers() {
  return fetch('/users');
}
```

__machine.lucy__

```lucy
use './utils.js' { getUsers }

state idle {
  invoke getUsers {
    done => assign(users)
  }
}
```

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
  idle {
    invoke light {
      done => idle
    }
  }
}
```

## Actors

Actors allow you to create new machines and keep a reference to them within your own machine, through an [assign reference](#assign). You can send messages to the new machine, and they can send messages back to you.

Spawning a machine is a little like using [invoke](#invoke) on a machine. Unlike with __invoke__, a spawned machine does not block your current machine from transitioning.

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

### Sending messages to actors

Once you've spawned a machine you can send messages to it using the __send__ action. The first argument is the referenced actor, the second is an event to send.

```lucy
use './api' { deleteTodo }

machine todoItem {
  state idle {
    delete => deleting
  }
  state deleting {
    invoke deleteTodo {
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
use './api' { deleteTodo, updateUI }

machine todoItem {
  state idle {
    delete => deleting
  }
  state deleting {
    invoke deleteTodo {
      done => deleted
    }
  }
  final state deleted {
    enter => send(parent, deletedTodo)
  }
}

machine app {
  state idle {
    new => assign(todo, spawn(todoItem))
    delete => send(todo, delete)
    deleted => action(updateUI)
  }
}
```
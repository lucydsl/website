---
layout: language.njk
title: Language Overview
tags: page
sections:
  - State:
    - Initial state
    - Final state
  - Transitions:
    - Event
    - Immediate
    - Delay
    - Special events
  - Invoke
  - Actors
---

# The Lucy Language Guide

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
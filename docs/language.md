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
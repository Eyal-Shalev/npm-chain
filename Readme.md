# Chain [![npm version](https://badge.fury.io/js/%40eyalsh%2Fchain.svg)](https://badge.fury.io/js/%40eyalsh%2Fchain)
Provides a _promise-like_ object that allows method chaining without memory or computation overhead.

## Example
```javascript
import chain from '@eyalsh/chain/lib/index.js'

const c = chain('foo')
  .with(console.log, e => console.error(e.message)) // Stdout: foo
  .then(function(v) {
    throw new Error(v);
  })
  .with(console.log, e => console.error(e.message)) // Stderr: foo
  .catch(() => 'bar')
  .finally(() => console.log('will always run'));

console.log(c); // Output: Chain {current: "bar", reason: null}
console.log(c.eject()); // Output: bar

c.then(v => {throw new Error(v)});

try {
  c.eject()
} catch (e) {
  console.error(e.message) // Stderr: bar
}
```

## API
### `chain(current?, reason?)` or `new Chain(current?, reason?)`
Creates a new `Chain` object with either a value or a rejection reason.

### `Chain.then(onfulfilled?, onrejected?): Chain`
Applies modifications on the current value or rejection reason.  
_Reject a chain by throwing an error in either callbacks._

### `Chain.catch(onrejected?): Chain`
Toggles a chain from rejected state to fulfilled state and applies modification on the rejection reason.  
_Reject a chain by throwing an error in the callback._

### `Chain.with(onfulfilled?, onrejected?): Chain`
Performs side-effects with the current value or rejection reason.  
_These callbacks do not replace the current value or rejection and reason, and cannot toggle a chain state._

### `Chain.eject(): any`
Returns the current value of the chain, or throws an error with the rejection reason if rejected.

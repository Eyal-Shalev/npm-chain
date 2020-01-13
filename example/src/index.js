import chain from '@eyalsh/chain/lib/index';

const sleep = (timeout, ...args) => new Promise(resolve => {
  setTimeout(resolve, timeout, ...args);
});

const c = chain('chain')
  .then(x => ['Hello', x])
  .then(async x => await sleep(500, x.join(' ')))
  .then(x => (
    chain(document.getElementById('result'))
      .with(el => el.innerHTML = x)
  ))
  .with(x => console.log(1, x))
  .eject();

console.log(2, c);

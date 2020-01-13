import chain, { reject } from './index';

test('fulfilled', () => {
  chain('foo')
    .catch(() => fail())
    .then(name => `Hello ${name}`)
    .catch(() => fail())
    .then(v => expect(v).toEqual('Hello foo'))
    .eject();
});

test('rejected', () => {
  reject('bar')
    .then(() => fail())
    .catch(name => `Goodbye ${name}`)
    .then(e => expect(e).toEqual('Goodbye bar'))
    .eject();
});

test('throw', () => {
  chain()
    .then(() => {
      throw new Error('catch me');
    })
    .catch(e => expect(e.message).toEqual('catch me'))
    .eject();
});

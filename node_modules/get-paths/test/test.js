const test = require('ava');

const getPaths = require('..');

test('returns a function', t => {
  t.true(typeof getPaths === 'function');
});

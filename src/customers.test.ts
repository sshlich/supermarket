import assert from 'node:assert/strict'
import { arrive, greeting, judge, TAGS } from './customers.ts'

// every customer wants one to three different, known tags
for (let i = 0; i < 200; i++) {
  const c = arrive(i)
  assert.ok(c.wants.length >= 1 && c.wants.length <= 3)
  assert.equal(new Set(c.wants).size, c.wants.length)
  assert.ok(c.wants.every(t => t in TAGS))
  assert.ok(greeting(c).includes(TAGS[c.wants[0]].say))
}

const c = { id: 1, name: 'Test', wants: ['drink', 'tool'], mood: 0 }
assert.deepEqual(judge(c, []).met, [])
assert.deepEqual(judge(c, [['food']]).met, [])
assert.deepEqual(judge(c, [['drink', 'fragile']]).met, ['drink'])
assert.ok(judge(c, [['drink']]).say.includes(TAGS.tool.say))
assert.deepEqual(judge(c, [['drink'], ['tool']]).met, ['drink', 'tool'])
console.log('customers ok')

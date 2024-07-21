// https://stackoverflow.com/questions/78739104/how-can-i-avoid-duplicating-key-in-value-and-duplicating-type-and-const-definit
import _ from 'lodash'
import { describe, expect, test } from 'vitest'
import { z } from 'zod'

// type Name = 'foo' | 'bar'

// type ProviderFuncFromString = (data: string) => { name: Name; data: string }

// type ProviderFuncFromNumber = (numb: number) => { name: Name; data: string }

// function providerFuncFromStringFactory(name: Name): ProviderFuncFromString {
//   return (data) => ({ name, data })
// }

// function providerFuncFromNumberFactory(name: Name): ProviderFuncFromNumber {
//   return (numb) => ({ name, data: numb.toString() })
// }

// type ProviderMap = {
//   foo: ProviderFuncFromString
//   bar: ProviderFuncFromNumber
// }

// const providerMap: ProviderMap = {
//   foo: providerFuncFromStringFactory('foo'),
//   bar: providerFuncFromNumberFactory('bar'),
// }

// -------------

const NameSchema = z.enum(['foo', 'bar'])

const ProviderFuncFromStringSchema = z
  .function()
  .args(z.string())
  .returns(
    z.object({
      name: NameSchema,
      data: z.string(),
    }),
  )

type ProviderFuncFromStringType = z.infer<typeof ProviderFuncFromStringSchema>

const ProviderFuncFromNumberSchema = z
  .function()
  .args(z.number())
  .returns(
    z.object({
      name: NameSchema,
      data: z.string(),
    }),
  )

type ProviderFuncFromNumberType = z.infer<typeof ProviderFuncFromNumberSchema>

function providerFuncFromStringFactory(
  name: z.infer<typeof NameSchema>,
): ProviderFuncFromStringType {
  return (data: string) => ({ name, data })
}

function providerFuncFromNumberFactory(
  name: z.infer<typeof NameSchema>,
): ProviderFuncFromNumberType {
  return (numb: number) => ({ name, data: numb.toString() })
}

const ProviderMapSchema = z.object({
  foo: ProviderFuncFromStringSchema,
  bar: ProviderFuncFromNumberSchema,
})

const providerMap1 = {
  foo: providerFuncFromStringFactory('foo'),
  bar: providerFuncFromNumberFactory('bar'),
}

const providerMap2 = Object.fromEntries([
  ['foo', providerFuncFromNumberFactory('foo')],
  ['bar', providerFuncFromNumberFactory('bar')],
])

const providerMap3 = {
  foo: providerFuncFromNumberFactory('foo'),
  bar: providerFuncFromNumberFactory('bar'),
}

describe('scratchpad tests', () => {
  test('test zod schema validation', () => {
    const res1 = ProviderMapSchema.safeParse(providerMap1)
    const res2 = ProviderMapSchema.safeParse(providerMap2)
    const res3 = ProviderMapSchema.safeParse(providerMap3)
    expect([res1.success, res2.success, res3.success]).toStrictEqual([
      true,
      true, // I was hoping for this to be false
      true, // I was hoping for this to be false
    ])
  })
})

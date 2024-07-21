/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable id-length */
/* eslint-disable lodash/prefer-lodash-method */
// https://stackoverflow.com/questions/78739104/how-can-i-avoid-duplicating-key-in-value-and-duplicating-type-and-const-definit
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash'
type Name = 'foo' | 'bar'

type ProviderFuncFromString = (data: string) => { name: Name; data: string }
type ProviderFuncFromNumber = (numb: number) => { name: Name; data: string }

function providerFuncFromStringFactory(name: Name): ProviderFuncFromString {
  return (data) => ({ name, data })
}

function providerFuncFromNumberFactory(name: Name): ProviderFuncFromNumber {
  return (numb) => ({ name, data: numb.toString() })
}

function mappy<T extends object>(m: { [K in keyof T]: (name: K) => T[K] }): T {
  return Object.fromEntries(
    Object.entries(m).map(([k, v]) => [k, (v as any)(k)]),
  ) as any
}

const providerMap = mappy({
  foo: providerFuncFromStringFactory,
  bar: providerFuncFromNumberFactory,
})
type ProviderMap = typeof providerMap
//   ^?

const xyz = providerMap.foo('bar')

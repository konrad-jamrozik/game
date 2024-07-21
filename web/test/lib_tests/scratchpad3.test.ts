/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable id-length */
/* eslint-disable lodash/prefer-lodash-method */
// https://stackoverflow.com/questions/78739104/how-can-i-avoid-duplicating-key-in-value-and-duplicating-type-and-const-definit
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash'
type StringAction = 'foo'
type NumberAction = 'bar' | 'buz'
type Name = StringAction | NumberAction

type ProviderFuncFromString<K extends StringAction> = (data: string) => {
  name: K
  data: string
}
type ProviderFuncFromNumber<K extends NumberAction> = (numb: number) => {
  name: K
  data: string
}

function providerFuncFromStringFactory<K extends StringAction>(
  name: K,
): ProviderFuncFromString<K> {
  return (data: string) => ({ name, data: String(data) })
}

function providerFuncFromNumberFactory<K extends NumberAction>(
  name: K,
): ProviderFuncFromNumber<K> {
  return (numb) => ({ name, data: numb.toString() })
}

type ActionToFunctionMap = {
  [K in Name]: K extends StringAction
    ? ProviderFuncFromString<K>
    : K extends NumberAction
      ? ProviderFuncFromNumber<K>
      : never
}

const providerMap: ActionToFunctionMap = {
  foo: providerFuncFromStringFactory('foo'),
  bar: providerFuncFromNumberFactory('bar'),
  buz: providerFuncFromNumberFactory('buz'),
}

type Action = keyof ActionToFunctionMap
const action: Action = 'bar'
console.log(providerMap[action](4))

const xyz = providerMap.bar(10)

console.log(xyz)

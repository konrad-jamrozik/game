import _ from 'lodash'
import { describe, expect, test } from 'vitest'

describe('localStorage tests', () => {
  test('test storage limit', () => {
    localStorage.clear()
    const key1 = 'testKey1'
    const valueLength = 5_000_000 - key1.length
    const totalLength = key1.length + valueLength

    const value = _.repeat('a', valueLength)
    console.log(
      `Setting storage for key1. key.length + valueLength: ${totalLength}`,
    )
    // https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem
    localStorage.setItem(key1, value)
    expect(() => {
      // This shows that once 5_000_000 bytes are stored, the storage is full and not a single
      // byte can be added.
      localStorage.setItem('a', '')
    }).toThrow() // Expecting https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#quotaexceedederror
  })
})

// future work issue when trying to store 300 turns:
// Uncaught (in promise) DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'gameSessionData' exceeded the quota.
// https://stackoverflow.com/questions/23977690/setting-the-value-of-dataurl-exceeded-the-quota
// https://stackoverflow.com/questions/2989284/what-is-the-max-size-of-localstorage-values
// https://arty.name/localstorage.html
// https://en.wikipedia.org/wiki/Web_storage#Storage_size
// https://superuser.com/questions/836266/how-to-actually-change-html5-localstorage-size-in-browsers
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// Recommendations to use for localStorage:
// https://chatgpt.com/share/b1109c2f-306b-441b-b690-f05435902fc2
// https://github.com/marcuswestin/store.js#list-of-all-plugins
// Related, from React doc: https://github.com/immerjs/immer

// IndexedDB:
// https://www.rdegges.com/2018/please-stop-using-local-storage/
// https://en.wikipedia.org/wiki/Indexed_Database_API
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
// https://javascript.info/indexeddb
// https://medium.com/@KevinBGreene/type-safe-indexeddb-using-typescript-declarative-schema-and-codegen-8708f16ca374
// https://dev.to/falcosan/indexeddb-in-typescript-1nea

// import solidLogo from './assets/solid.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import RunSimulation from './RunSimulation';
import { onMount } from "solid-js";
import { Datepicker, Input, initTE } from "tw-elements";
import { createSignal } from "solid-js";

function App() {

  onMount(() => {
    initTE({ Datepicker, Input });
  });  

  // This probably can be refactored to use:
  // Resources: 
  // - https://www.solidjs.com/tutorial/async_resources
  // - https://docs.solidjs.com/guides/foundations/solid-primitives#createresource
  // Context: 
  // - https://www.solidjs.com/tutorial/stores_context
  // - https://docs.solidjs.com/references/api-reference/component-apis/createContext
  const [message, setMessage] = createSignal("");
  const messageSignal = { message, setMessage };

  return (
    <>
      <RunSimulation {...messageSignal} />
    </>
  )
}

export default App

      {/* <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={solidLogo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
      <h1>Vite + Solid</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
        <MyComponent />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Solid logos to learn more
      </p> */}


            {/* <div
        class="relative mb-3"
        data-te-datepicker-init
        data-te-input-wrapper-init
      >
        <input
          type="text"
          class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
          placeholder="Select a date"
        />
        <label
          for="floatingInput"
          class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
        >
          Select a date
        </label>
      </div> */}

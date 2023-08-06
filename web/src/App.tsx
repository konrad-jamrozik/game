// import solidLogo from './assets/solid.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import RunSimulationComponent from './RunSimulationComponent';
import { onMount } from "solid-js";
import { Input, initTE } from "tw-elements";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import NumberInputComponent from './NumberInputComponent';
import DataTableComponent from './DataTableComponent';
import { Agent } from './types';

function App() {

  onMount(() => {
    initTE({ Input });
  });  

  // This probably can be refactored to use:
  // Resources: 
  // - https://www.solidjs.com/tutorial/async_resources
  // - https://docs.solidjs.com/guides/foundations/solid-primitives#createresource
  // Context: 
  // - https://www.solidjs.com/tutorial/stores_context
  // - https://docs.solidjs.com/references/api-reference/component-apis/createContext
  const [message, setMessage] = createSignal("");
  const [input, setInput] = createSignal(30);
  const [simulationRunDone, setSimulationRunDone] = createSignal(false);
  const [agents, setAgents] = createStore<Agent[]>([])
  return (
    <>
      <NumberInputComponent {...{input, setInput, label:"Turns"}}/>
      <RunSimulationComponent {...{input, message, setMessage, setSimulationRunDone, agents, setAgents}} />
      <DataTableComponent simulationRunDone={simulationRunDone} agents={agents} />
    </>
  )
}

export default App

{/* <div>
<a href="https://vitejs.dev" target="_blank">
  <img src={viteLogo} class="logo" alt="Vite logo" />
</a>
<a href="https://solidjs.com" target="_blank">
  <img src={solidLogo} class="logo solid" alt="Solid logo" />
</a>
</div> */}

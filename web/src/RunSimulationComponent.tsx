import { Accessor, Setter } from 'solid-js';

function RunSimulationComponent(props: {
  input: Accessor<number>
  message: Accessor<string>
  setMessage: Setter<string>
}) {
  props.setMessage("pending")

  const handleClick = () => {
    const apiUrl = "https://api-game-lib.azurewebsites.net/exampleGameSession"

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        props.setMessage(`Done! Money: ${data.Assets.Money}`)
        console.log(data)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
      })
  }

  return (
    <div>
      <Button onClick={() => handleClick()} input={props.input}  />
      <p class="mb-4 text-center">Simulation result: {props.message()}</p>
    </div>
  )
}

function Button(props: { onClick: () => void, input: Accessor<number> }) {
  return (
    <button
      class="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
      onClick={props.onClick}
    >
      Run simulation for {props.input()} turns
    </button>
  )
}

export default RunSimulationComponent;

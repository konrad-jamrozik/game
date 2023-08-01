import { onCleanup } from 'solid-js';

function MyComponent() {

  const handleClick = () => {

    // Define the API URL
    const apiUrl = 'https://api-game-lib.azurewebsites.net/initialGameState';

    // Fetch the data from the API
    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
        // Do something with the data, e.g., update the state of your component
        console.log(data);
    })
    .catch((error) => {
        // Handle any errors that occurred during the fetch
        console.error('Error fetching data:', error);
    });

    // Cleanup the effect when the component is unmounted
    onCleanup(() => {
    // Cancel any ongoing fetch requests or perform other cleanup tasks if necessary
    });

  };

  return (
    <div>
      {/* Button component that handles the click event */}
      <Button onClick={() => handleClick()} />

      <div>My SolidJS Component</div>
    </div>
  );
}

// Button component that receives the onClick prop and displays the button
function Button(props: { onClick: () => void }) {
  return <button onClick={props.onClick}>Click me</button>;
}

export default MyComponent;

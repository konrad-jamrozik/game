import { Datatable, initTE } from "tw-elements"
import { onMount, createEffect } from "solid-js";
import { Accessor } from 'solid-js';
import { Store } from 'solid-js/store';
import { Agent } from "./types";

initTE({ Datatable })

function DataTableComponent(props: {
  simulationRunDone: Accessor<boolean>,
  agents: Store<Agent[]>
}) {
  let tableRef: HTMLDivElement | undefined

  const tableInit = {
    columns: [
      { label: 'Id', field: 'Id', sort: true },
      { label: 'CurrentState', field: 'CurrentState', sort: true },
      { label: 'TurnHired', field: 'TurnHired', sort: true },
    ],
    rows: [
      { Id: 0, CurrentState: "InitAgent", TurnHired: 0 }
    ] as Agent[],
  };

  onMount(() => {
    const datatable = new Datatable(tableRef, tableInit);
    createEffect(() => {
      if (props.simulationRunDone() === false) {
        return
      }

      datatable.update(
        {
          rows: Object.values(props.agents).map((agent: Agent) => ({
            Id: agent.Id, CurrentState: agent.CurrentState, TurnHired: agent.TurnHired
          })),
        },
        { loading: false }
      );
    })
  })

  return (
    <div ref={tableRef} id="tableId"></div>
  )
}

export default DataTableComponent

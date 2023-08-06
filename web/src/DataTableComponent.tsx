import { Datatable, initTE } from "tw-elements"
import { onMount } from "solid-js";

initTE({ Datatable })

function DataTableComponent() {
  let tableRef: HTMLDivElement | undefined

  const advancedData = {
    columns: [
      { label: 'Name', field: 'name', sort: true },
      { label: 'Position', field: 'position', sort: false },
      { label: 'Office', field: 'office', sort: false },
      { label: 'Age', field: 'age', sort: false },
      { label: 'Start date', field: 'date', sort: true },
      { label: 'Salary', field: 'salary', sort: false },
    ],
    rows: [
      { name: "Tiger Nixon", position: "System Architect", office: "Edinburgh", age: 61, date: "2011/04/25", salary: "$320,800" },
      { name: "Garrett Winters", position: "Accountant", office: "Tokyo", age: 63, date: "2011/07/25", salary: "$170,750" },
      { name: "Haley Kennedy", position: "Senior Marketing Designer", office: "London", age: 43, date: "2012/12/18", salary: "$313,500" }
    ],
  };

  onMount(() => {
    new Datatable(tableRef, advancedData);
  })

  return (
    <div ref={tableRef} id="tableId"></div>
  )
}

export default DataTableComponent

window.addEventListener("load", init);

function init() {

  var tableContain = document.createElement("div");
  tableContain.id = "tableContain";
  document.body.appendChild(tableContain);
  
  var sidebarContain = document.createElement("div");
  sidebarContain.classList.add("sidebarContainer");
  document.body.appendChild(sidebarContain);
  
  pubsub.subscribe("tableGenerated", function(dimensions) {
    tableDisplay.init(dimensions.rows, dimensions.cols, document.getElementById("tableContain"));
  });
  
  tableData.init();
  sidebar.init(sidebarContain);
  tableData.generateTable(60, 26);

}
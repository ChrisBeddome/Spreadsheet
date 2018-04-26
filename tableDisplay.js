var tableDisplay = function() {

  var refs = {};

  function renderTable(rows, cols) {
    var table = document.createElement("table");

    for (var i = 0; i < rows + 1; i++) { //add 1 row for header row
      var row = i === 0 ? document.createElement("thead") : document.createElement("tr");
      for (var j = 0; j < cols + 1; j++) { //add 1 column for header column
        var col;
        if (j === 0 && i === 0) { //if top-right cell
          col = document.createElement("th");
        } else if (i === 0) { //if cell is in first row
          col = document.createElement("th");
          col.textContent = String.fromCharCode(j + 64);
        } else if (j === 0) { //if cell is in first column
          col = document.createElement("th");
          col.textContent = i;
        } else {
          col = document.createElement("td");
        }
        row.appendChild(col);
      } 
      table.appendChild(row);
    }
    refs.container.appendChild(table);

    cacheDom("table", table);
    cacheDom("rows", Array.prototype.slice.call(document.querySelectorAll("#tableContain tr")));
  }

  function generateHighlighter() {
    var highlight = document.createElement("div");
    highlight.classList.add("highlight");
    refs.table.prepend(highlight);
    cacheDom("highlight", highlight);
  }

  function cacheDom(name, element) {
    refs[name] = element;
  }

  function bindEvents() {
    refs.table.addEventListener("mousedown", function(e) {
      if (e.which !== 1) {
        return;
      }

      var td = e.target.closest("td");

      if (td) {
        var row = td.parentElement;
        var rowNum = refs.rows.indexOf(row);
        var colNum = Array.prototype.slice.call(row.children).indexOf(td) - 1;
        
        pubsub.publish("cellClicked", {row: rowNum, col: colNum});
      }
    });

    refs.highlight.addEventListener("click", function() {
      var cell = sidebar.getSelectedCell()
      pubsub.publish("cellClicked", cell);
    });

    pubsub.subscribe("cellSelected", highlightCell);
    pubsub.subscribe("cellSelected", highlightHeaders);
    pubsub.subscribe("cellSelected", highlighterText);
    pubsub.subscribe("tableReset", reset);
    pubsub.subscribe("cellUpdated", updateCellContent);
    pubsub.subscribe("rowAdded", addRow);
    pubsub.subscribe("colAdded", addCol);
    pubsub.subscribe("formulaCalculated", updateCellContent);
    pubsub.subscribe("stuffTyped", highlighterText);
    pubsub.subscribe("dataEntered", highlighterText);
  }

  function highlightCell(position) {
    var cell = refs.rows[position.row].children[position.col + 1]; //add 1 to position.col so header is ignored
    var coords = {top: cell.offsetTop, left: cell.offsetLeft};
    refs.highlight.style.top = coords.top + "px";
    refs.highlight.style.left = coords.left + "px";
  }

  function highlightHeaders(position) {
    removeHeaderHighlights();

    var head = document.querySelector("#tableContain thead");
    var headerTop = head.children[position.col + 1];
    headerTop.classList.add("selectedHeaderTop");

    if (position.row !== 0) {
      headerTop.classList.add("selectedHeaderTopAug");
    }

    var headerLeft = refs.rows[position.row].children[0];
    headerLeft.classList.add("selectedHeaderLeft");
    
    if (position.col !== 0) {
      headerLeft.classList.add("selectedHeaderLeftAug");
    }
  }

  function removeHeaderHighlights() {
    var topHeaders = document.getElementsByClassName("selectedHeaderTop");
    for (var i = 0; i < topHeaders.length; i++) {
      topHeaders[i].classList.remove("selectedHeaderTop");
    }
    var leftHeaders = document.getElementsByClassName("selectedHeaderLeft");
    for (var i = 0; i < leftHeaders.length; i++) {
      leftHeaders[i].classList.remove("selectedHeaderLeft");
    }
    var topHeadersAug = document.getElementsByClassName("selectedHeaderTopAug");
    for (var i = 0; i < topHeadersAug.length; i++) {
      topHeadersAug[i].classList.remove("selectedHeaderTopAug");
    }
    var leftHeadersAug = document.getElementsByClassName("selectedHeaderLeftAug");
    for (var i = 0; i < leftHeadersAug.length; i++) {
      leftHeadersAug[i].classList.remove("selectedHeaderLeftAug");
    }
  }

  function addRow(amt) {
    if (!amt) {
      amt = 1;
    }

    var rowAmt = refs.rows.length;
    var colAmt = refs.rows[0].children.length;
    for (var i = 0; i < amt; i++) {
      var row = document.createElement("tr"); 
      for (var j = 0; j < colAmt; j++) {
        var col;
        if (j === 0) {
          col = document.createElement("th");
          col.textContent = rowAmt + i + 1;
        } else {
          col = document.createElement("td");
        }
        row.appendChild(col);
      }
      refs.rows.push(row);
      refs.table.appendChild(row);
    }

    refs.rows[refs.rows.length-1].scrollIntoView();
  }

  function addCol(amt) {
    if (!amt) {
      amt = 1;
    }

    var rowAmt = refs.rows.length;
    var colAmt = refs.rows[0].children.length;
    var head = document.querySelector("#tableContain thead");

    for (var i = 0; i < amt; i++) {
      var cell = document.createElement("th");
      cell.textContent = String.fromCharCode(colAmt + 64 + i);
      head.appendChild(cell);
    }

    for (var i = 0; i < rowAmt; i++) {
      for (var j = 0; j < amt; j++) {
        var cell = document.createElement("td");
        refs.rows[i].appendChild(cell);
      }
    }

    var cols = head.children.length;
    head.children[cols - 1].scrollIntoView();
  }
  
  function highlighterText(text) {
    if (typeof text == "string") {
      refs.highlight.textContent = text;
    } else {
      refs.highlight.textContent = "";
    }
  }

  function updateCellContent(data) {
    var row = data.row;
    var col = data.col;
    var val = data.val;
    var cell = refs.rows[row].children[col + 1]; //add 1 to position.col so header is ignored
    cell.textContent = val;
  }

  function init(rows, cols, container) {
    cacheDom("container", container);
    renderTable(rows, cols);
    generateHighlighter();
    highlightCell({row: 0, col: 0});
    highlightHeaders({row: 0, col: 0});
    bindEvents();
  }

  function reset() {
    while (refs.container.children.length > 0) {
      refs.container.removeChild(refs.container.children[0]);
    }
    refs = {};

    pubsub.unsubscribe("cellSelected", highlightCell);
    pubsub.unsubscribe("cellSelected", highlightHeaders);
    pubsub.unsubscribe("cellSelected", highlighterText);
    pubsub.unsubscribe("tableReset", reset);
    pubsub.unsubscribe("cellUpdated", updateCellContent);
    pubsub.unsubscribe("rowAdded", addRow);
    pubsub.unsubscribe("colAdded", addCol);
    pubsub.unsubscribe("formulaCalculated", updateCellContent);
    pubsub.unsubscribe("stuffTyped", highlighterText);
    pubsub.unsubscribe("dataEntered", highlighterText);
  }
  
  return {
    init: init
  }

}();
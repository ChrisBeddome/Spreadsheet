var sidebar = function() {
  var refs = {};
  var selectedCell = null;

  function init(container) {
    refs.container = container;
    render();
    bindEvents();
    refs.input.focus();
  }

  function render() {
    var sidebar = document.createElement("div");

    var cellDisplay = document.createElement("h1");
    cellDisplay.textContent = "A1";
    sidebar.appendChild(cellDisplay);
    
    var input = document.createElement("input");
    input.classList.add("mainInput");
    
    sidebar.appendChild(input);
    
    var addRowBtn = document.createElement("button");
    addRowBtn.textContent = "Add Row";
    sidebar.appendChild(addRowBtn);
    
    var addColBtn = document.createElement("button");
    addColBtn.textContent = "Add Column";
    sidebar.appendChild(addColBtn);

    var clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear Data";
    sidebar.appendChild(clearBtn);

    var saveBtn = document.createElement("button");
    saveBtn.textContent = "Save Data";
    sidebar.appendChild(saveBtn);

    var loadBtn = document.createElement("button");
    loadBtn.textContent = "Load Data";
    sidebar.appendChild(loadBtn);

    refs.input = input;
    refs.cellDisplay = cellDisplay;
    refs.addRowBtn = addRowBtn;
    refs.addColBtn = addColBtn;
    refs.clearBtn = clearBtn;
    refs.saveBtn = saveBtn;
    refs.loadBtn = loadBtn;
    refs.sidebar = sidebar;
    refs.container.appendChild(sidebar);
  }

  function getSelectedCell() {
    return selectedCell;
  }

  function updateCellDisplay(location) {
    var row = location.row + 1;
    var col = String.fromCharCode(location.col + 65);

    refs.cellDisplay.textContent = col + row;

    console.log(location);
  }

  function bindEvents() {
    refs.input.addEventListener("keypress", function(e) {
      var val = refs.input.value;
      if (e.which === 13) {
        pubsub.publish("dataEntered", {cell: selectedCell, value: val});
        selectedCell.row += 1;
        pubsub.publish("cellSelected", selectedCell);
      } 
    });

    refs.input.addEventListener("input", function(e) {
      if (e.which !== 13) {
        var val = refs.input.value;
        pubsub.publish("stuffTyped", val);
      }
    })

    refs.addRowBtn.addEventListener("click", function() {
      pubsub.publish("requestAddRow");
    });

    refs.addColBtn.addEventListener("click", function() {
      pubsub.publish("requestAddCol");
    });

    pubsub.subscribe("cellClicked", function(location) {
      selectedCell = location;
      pubsub.publish("cellSelected", location);
    })
  
    pubsub.subscribe("cellSelected", function(location) {
      refs.input.value = tableData.getCellValue(location);
      setTimeout(function() {refs.input.focus();}, 0);
      updateCellDisplay(location);
    })

    pubsub.subscribe("tableGenerated", function() {
      selectedCell = {row: 0, col: 0};
      updateCellDisplay(selectedCell);
    });

    refs.clearBtn.addEventListener("click", function() {
      tableData.generateTable(60, 26);
    });

    refs.saveBtn.addEventListener("click", function() {
      loadSave.renderSaveScreen();
    });
    
    refs.loadBtn.addEventListener("click", function() {
      loadSave.renderLoadScreen();
    });
  }

  return {
    init: init,
    getSelectedCell: getSelectedCell
  }
}();
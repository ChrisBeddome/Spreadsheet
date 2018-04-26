var tableData = function() {
  var data = [];

  function Cell(type, value) {
    this.type = type;
    this.value = value;
  }

  function generateTable(rows, cols) {
    resetTable();
    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) {
        row.push(new Cell(null, null));
      }
      data.push(row);
    }
    pubsub.publish("tableGenerated", {rows: rows, cols: cols});
  }

  function loadData(tableData) {
    data = tableData;
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        pubsub.publish("cellUpdated", {row: i, col: j, val: data[i][j].value});
      }
    }
  }

  function resetTable() {
    data = [];
    pubsub.publish("tableReset");
  }

  function updateCell(info) {
    var formula = checkIfFormula(info.value);
    var position = info.cell;
    var cell = data[position.row][position.col];

    if (formula) {
      cell.type = "formula";
    } else {
      cell.type = "alphanum";
    }
    cell.value = info.value;
    pubsub.publish("cellUpdated", {row: info.cell.row, col: info.cell.col, val: info.value});
  }

  function checkFormulas() {
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        if (data[i][j].type === "formula") {
          evaluateFormula(data[i][j].value, i, j);
        } 
      }
    }
  }

  function evaluateFormula(formula, row, col) {
    var mode = formula.slice(0, formula.indexOf("("));
    var cellFrom = formula.slice(formula.indexOf("(") + 1, formula.indexOf(":"));
    var cellTo = formula.slice(formula.indexOf(":") + 1, formula.indexOf(")"));

    var coordsFrom = getCoords(cellFrom);
    var coordsTo = getCoords(cellTo);

    var cells = getArea(coordsFrom, coordsTo); 

    if (mode === "=SUM") {
      var sum = calculateSumFromCells(cells);
      //HACK, BAD!
      setTimeout(function() {
        pubsub.publish("formulaCalculated", {row: row, col: col, val: sum});
      }, 0);
    }
  }

  function getCoords(cell) {
    var letter = cell[0].toUpperCase();
    var col = letter.charCodeAt(0) - 65;
    var row = cell.substring(1) - 1;
    
    return {row: row, col: col};
  }

  function getArea(from, to) {
    var cells = [];
    for (var i = from.row; i <= to.row; i++) {
      for (var j = from.col; j <= to.col; j++) {
        cells.push({row: i, col: j});
      }
    }
    return cells;
  }

  function calculateSumFromCells(cells) {
    var acc = 0;

    for (var i = 0; i < cells.length; i++) {
      var cell = data[cells[i].row][cells[i].col];
      if (!isNaN(cell.value) && cell.value != null) {
        acc += Number(cell.value);
      }
    }

    return acc;
  }

  function addRow() {
    var row = [];
    for (var i = 0; i < data[0].length; i++) {
      row.push(new Cell(null, null));
    }
    data.push(row);

    pubsub.publish("rowAdded");
  }

  function addCol() {
    for (var i = 0; i < data.length; i++) {
      data[i].push(new Cell(null, null));
    }

    pubsub.publish("colAdded");
  }

  function checkIfFormula(value) {
    var pattern = /[:|\(|\)]/;
    var ar = value.split(pattern);

    if (ar.length < 3) {
      return false;
    } else {
      return true;
    }
  }

  function bindEvents() {
    pubsub.subscribe("dataEntered", updateCell);
    pubsub.subscribe("requestAddRow", addRow);
    pubsub.subscribe("requestAddCol", addCol);
    pubsub.subscribe("cellUpdated", checkFormulas);
  }

  function init() {
    bindEvents();
  }

  function getCellValue(position) {
    return data[position.row][position.col].value;
  }

  function getData() {
    return data;
  }

  return {
    init: init,
    generateTable: generateTable,
    getCellValue: getCellValue,
    getData: getData,
    loadData: loadData
  }
}();
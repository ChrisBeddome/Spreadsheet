var loadSave = function() {
  function saveTable(name) {
    name = name + ".tblData";
    var data = tableData.getData();
    var json = JSON.stringify({data: data});
    localStorage.setItem(name, json);
  }

  function loadTable(name) {
 

    var json = localStorage.getItem(name);
    var data = JSON.parse(json).data;

    tableData.generateTable(data.length, data[0].length);
    tableData.loadData(data);
  }

  function renderSaveScreen() {
    var screen = document.createElement("div");
    screen.classList.add("coverScreen");

    var container = document.createElement("div");
    container.classList.add("saveContainer");

    var header = document.createElement("h3");
    header.textContent = "File Name:";

    var input = document.createElement("input");
    input.id = "saveInput";

    var saveButton = document.createElement("button");
    saveButton.textContent = "Save";

    saveButton.addEventListener("click", function() {
      var name = document.getElementById("saveInput").value;
      saveTable(name);
      closeCoverScreen();
    });

    var closeButton = document.createElement("button");
    closeButton.textContent = "Cancel";

    closeButton.addEventListener("click", closeCoverScreen);

    container.appendChild(header);
    container.appendChild(input);
    container.appendChild(saveButton);
    container.appendChild(closeButton);
    screen.appendChild(container);

    document.body.appendChild(screen);

    input.focus();
  }

  function renderLoadScreen() {
    var screen = document.createElement("div");
    screen.classList.add("coverScreen");

    var container = document.createElement("div");
    container.classList.add("loadContainer");

    var header = document.createElement("h3");
    header.textContent = "Select File";

    var filesContainer = document.createElement("div");
    filesContainer.classList.add("filesContainer");

    for (var key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        if (key.indexOf(".tblData") != -1) {
          var button = document.createElement("button");
          var text = key.substr(0, key.indexOf(".tblData"));
          button.textContent = text;
          (function (name) {
            button.addEventListener("click", function() {
              loadTable(name);
              closeCoverScreen();
            });
          })(key);
        
          filesContainer.appendChild(button);
        }
      }
    }

    var closeButton = document.createElement("button");
    closeButton.textContent = "Cancel";

    closeButton.addEventListener("click", closeCoverScreen);

    container.appendChild(header);
    container.appendChild(filesContainer);
    container.appendChild(closeButton);
    screen.appendChild(container);

    document.body.appendChild(screen);
  }




  function closeCoverScreen() {
    document.body.removeChild(document.getElementsByClassName("coverScreen")[0]);
  }

  return {
    saveTable: saveTable,
    loadTable: loadTable,
    renderSaveScreen: renderSaveScreen,
    renderLoadScreen: renderLoadScreen
  };

}();
//for display purposes
var canvas;
var ctx;
var CANVASWIDTH = 800;

//display optional settings.
var autoWeights = false;
var buttonsOpen = false;
var pathOpen = false;
var anim = new Array();

//graph data
//contains: startX,startY,endX,endY,point1 index, point2 index,weight,TF Dual
//point 1 going to point 2 if digraph
//dual headed arrows are represented as 2 different edges
var edges = new Array();
//contains: x,y
var vertices = new Array();

//path for recording pathway between vertices
var pathArr = new Array();

//radius of points
//var RADIUS = 12000/window.innerWidth;

//records the point that was last touched
var lastHit = new Array();
//records whether the last canvas touch was at a vertex
var isLastHit = false;

//is a feature of whether edges are directed or not, asserted by user checkbox
var isDigraph = false;

//boolean variables specifying what kind of arrows
var arr1 = false;
var arr2 = false;
//dual headed
var arr3 = false;
//saves the immeadiate points of an arrow when drawing, as well as point 1 index and point 2 index
var arrowPoints = new Array();

function getPointRadius() {
  if (screen.width > 1100) {
    return 10;
  } else {
    return 20;
  }
}

function automaticWeights() {
  if (!animationInProgress) {
    var checkBox = document.getElementById("edgeCheck");
    if (checkBox.checked == true) {
      autoWeights = true;
    } else {
      autoWeights = false;
    }
  }
}
//change to or from digraph depending on checkbox status
function changeToFromDi() {
  if (!animationInProgress) {
    var checkBox = document.getElementById("myCheck");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //when changing from one graph type to another, wipe previously stored data and update display
    edges = [];
    closeButtons();
    displayListOfEdges();
    vertices = [];
    isLastHit = false;
    lastHit = [];

    if (checkBox.checked == true) {
      isDigraph = true;
    } else {
      closeButtons();
      isDigraph = false;
    }
  }
}
//returns true if falid
function checkValidV(vEnt) {
  var v = vEnt.replace(/^\s+/, "").replace(/\s+$/, "");
  var v = parseInt(v, 10);
  if (v == "") {
    alert("Error: No entry.");
    return false;
  } else if (isNaN(v)) {
    alert("Error: Must be a postive integer.");
    return false;
  } else if (
    v <= 0 ||
    v > vertices.length / 2 ||
    v <= 0 ||
    v > vertices.length / 2
  ) {
    alert("Error: Not in range of vertices.");
    return false;
  } else {
    return true;
    //depthFirstSearch(v);
  }
}

var isDFS;
function DFS() {
  isDFS = true;
  var v = document.getElementById("vSearch").value;
  search(v);
}
function BFS() {
  isDFS = false;
  var v = document.getElementById("vSearch").value;
  search(v);
}

function search(v) {
  if (animationInProgress) {
  } else {
    var graph = makeGraphMatrix();
    searchOrder = [];
    closePath();
    var validSearch = checkValidV(v);
    if (!validSearch) {
    } else {
      v--;
      var visited = new Array();

      for (var i = 0; i < vertices.length / 2; i++) {
        visited[i] = false;
      }
      if (isDFS) {
        DFSRecur(v, visited);
      } else {
        BFSLoop(v, visited);
      }
      var searchOrderDisplay = new Array();
      for (var i = 0; i < searchOrder.length; i++) {
        searchOrderDisplay.push(searchOrder[i] + 1);
      }
      pathOpen = true;
      animationInProgress = true;
      document.getElementById("searchtool").innerHTML = "";
      if (isDFS) {
        document.getElementById("edges").innerHTML = "Depth First Search";
      } else {
        document.getElementById("edges").innerHTML = "Breadth First Search";
      }
      document.getElementById("edgeslist").innerHTML =
        "Order from " +
        (v + 1) +
        " :" +
        "<br>" +
        searchOrderDisplay +
        "<br>" +
        "<button onclick='stopAnimation()'>Stop Animation</button>";

      highlightSearch();
    }
  }
}
function stopAnimation() {
  anim.forEach(function(timer) {
    clearTimeout(timer);
  });
  animationInProgress = false;
  pathOpen = false;
  closePath();
}

var searchOrder = new Array();

function BFSLoop(v, visited) {
  makeAdjacencyList();
  visited[v] = true;
  var que = [];
  que.push(v);
  while (que.length != 0) {
    var vQue = que.shift();
    searchOrder.push(vQue);
    var adjacencyList = makeAdjacencyList();
    var adjacent = adjacencyList[vQue];
    for (var i = 0; i < adjacent.length; i++) {
      var next = adjacent[i];
      if (!visited[next]) {
        visited[next] = true;
        que.push(next);
      }
    }
  }
}

function makeAdjacencyList() {
  var adjacencyList = [];
  for (var i = 0; i < vertices.length / 2; i++) {
    var row = [];
    var graph = makeGraphMatrix();
    for (var j = 0; j < vertices.length / 2; j++) {
      if (graph[i][j] != Infinity) {
        row.push(j);
      }
    }
    adjacencyList.push(row);
  }
  return adjacencyList;
}

function DFSRecur(v, visited) {
  visited[v] = true;
  searchOrder.push(v);
  var graph = makeGraphMatrix();
  for (var j = 0; j < vertices.length / 2; j++) {
    //if it is connected
    if (graph[v][j] != Infinity) {
      //if it has not already been visited
      if (!visited[j]) {
        DFSRecur(j, visited);
      }
    }
  }
}

var animationInProgress = false;

function highlightSearch() {
  anim = [];
  for (var i = 0; i < searchOrder.length; i++) {
    highlightSpecificPoint(
      vertices[searchOrder[i] * 2],
      vertices[searchOrder[i] * 2 + 1],
      "blue",
      searchOrder[i] + 1,
      i
    );
  }
}

function highlightSpecificPoint(x, y, color, label, i) {
  anim.push(
    setTimeout(function() {
      ctx.beginPath();
      var r = getPointRadius();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.fillText(label, x - 6, y + 1);
      if (i == searchOrder.length - 1) {
        animationInProgress = false;
      }
    }, (i + 1) * 1000)
  );
}


//multidimensional array for adjacency matrix representing graph. used for search and path algorithms
function makeGraphMatrix() {
  var graph = [];
  //each iteration is the process of making a row for a vertice
  for (var i = 0; i < vertices.length / 2; i++) {
    var newArr = new Array();
    //fill the array first with 0s before we find any edges
    for (var j = 0; j < vertices.length / 2; j++) {
      newArr[j] = Infinity;
    }
    for (var j = 0; j < edges.length; j += 8) {
      //get vertices edges connect
      var v1 = parseFloat(edges[j + 4], 10);
      var v2 = parseFloat(edges[j + 5], 10);
      //if v1 is current row, update column for v2
      if (v1 == i + 1) {
        newArr[v2 - 1] = parseFloat(edges[j + 6], 10);
        //if v2 is current row, update column for v1 IF it is a digraph. digraph v2->v1 only works for dual headed arrows
      } else if (isDigraph && v2 == i + 1 && edges[j + 7]) {
        newArr[v1 - 1] = parseFloat(edges[j + 6], 10);
        //if it is not a digraph v2->v1 or v1->v2 does not matter
      } else if (!isDigraph && v2 == i + 1) {
        newArr[v1 - 1] = parseFloat(edges[j + 6], 10);
      }
    }

    graph.push(newArr);
  }
  return graph;
}

//dijkstra implementation for finding shortest path between v1 to v2
function dijkstra(v1, v2) {
  var pathExists = true;
  //reset pathArray because we will find a new path
  pathArr = [];
  //make new graph matrix in case there were updates
  var graph = makeGraphMatrix();

  //integer array of smallest distances
  var smallestDists = new Array();
  var nVertices = graph[0].length;

  //boolean array of checked vertices
  var checked = new Array();

  //all distances will start at infinity and vertices unchecked
  for (var i = 0; i < nVertices; i++) {
    smallestDists[i] = Infinity;
    checked[i] = false;
  }

  //subtract 1 because v1 is one ahead of the exact location.
  //distance between v1 and itself is 0
  smallestDists[v1 - 1] = 0;

  //int array to store path tree
  var parents = new Array();

  //indicates no parent
  parents[v1 - 1] = -1;

  //iterate through all vertices
  for (var j = 1; j < nVertices; j++) {
    //consider the closest vertice to not exist yet
    var nearestV = -1;
    //smallestD begins at infinity because no paths found yet
    var smallestD = Infinity;

    //iterate through each vertice
    for (var i = 0; i < nVertices; i++) {
      //check if it has been checked and whether it's distance is smaller, then update
      if (checked[i] == false && smallestDists[i] < smallestD) {
        nearestV = i;
        smallestD = smallestDists[i];
      }
    }
    //point has been evaluated for shortest path
    checked[nearestV] = true;

    //if nearestV == -1, path between the vertice does not exist. do nothing
    if (nearestV == -1) {
    } else {
      //iterate thorugh vertices and update parent tree
      for (var n = 0; n < nVertices; n++) {
        //edgeD is the edge distance. Becomes newest D.
        var edgeD = graph[nearestV][n];
        if (smallestD + edgeD < smallestDists[n]) {
          parents[n] = nearestV;
          smallestDists[n] = smallestD + edgeD;
        }
      }
    }
  }
  if (smallestDists[v2 - 1] == Infinity) {
    pathOpen = true;
    document.getElementById("searchtool").innerHTML = "";
    document.getElementById("edges").innerHTML = "Shortest Path";
    document.getElementById("edgeslist").innerHTML =
      "Path does not exist" +
      "<br><br>" +
      "<button onclick='closePath()'>Close</button>";
  } else {
    //updates path array
    pathSpecific(v2 - 1, parents);
    highlightPath();
    //displays path on screen and length
    printSolution(v1, v2, smallestDists, parents);
  }
  graph = [];
}

//displays path on screen and length
function printSolution(v1, v2, smallestDists, parents, pathExists) {
  var v2New = v2 - 1;
  var path = v1 + "→" + v2 + "<br>";
  path += "Length: ";
  path += smallestDists[v2New] + "<br>";
  //iterate through path array to record length
  //path arrays is ordered v2->v1 so go in reverse
  for (var j = pathArr.length - 1; j >= 0; j--) {
    //exclude final -> from list
    if (j != 0) {
      path += pathArr[j] + "→";
    } else {
      path += pathArr[j];
    }
  }
  //set global variable to display that the path is open
  pathOpen = true;
  document.getElementById("searchtool").innerHTML = "";
  document.getElementById("edges").innerHTML = "Shortest Path";
  document.getElementById("edgeslist").innerHTML =
    path + "<br><br>" + "<button onclick='closePath()'>Close</button>";
}

//closes path display and resets edge list display as well as unhighlights
function closePath() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pathOpen = false;
  redrawEdges();
  redrawPoints();
  displayListOfEdges();
  document.getElementById("edges").innerHTML = "Edges List";
  document.getElementById("searchtool").innerHTML =
    "<label for='fname'>Search:</label><br /><label for='fname'>V1:</label><input type='text' id='v1In' name='city' list='v1' size='1' /><label for=fname'>(Optional) V2:</label><input type='text' id='v2In' name='city' list='v2' size='1' /><button onclick='interpretSearch()'>Enter</button>";
}

//updates path array for v2->v1. parents is the saved paths leading to v1 and v is v2.
function pathSpecific(v, parents) {
  var nextV = v;
  //keep track of index in path array
  var cnt = 0;
  //-1 indicates you have made it to the parent
  while (nextV != -1) {
    pathArr[cnt] = nextV + 1;
    cnt++;
    nextV = parents[nextV];
  }
}

//onload graphics
window.onload = function() {
  isDigraph = false;
  canvas = document.getElementById("canvasArea");
  ctx = canvas.getContext("2d");
  //line = canvas.getContext("2d");
};

//canvas is clicked
document.getElementById("canvasArea").addEventListener("click", canvasClick);

document.addEventListener("keyup", chooseDirectionKeyboard);

//returns index if edge already exists. If no edge, returns -1
function doesEdgeExist(x1, y1, x2, y2) {
  var i = 0;
  for (i = 0; i < edges.length; i = i + 8) {
    //if point 1=point 1 and point 2 = point 2
    //OR point 1=point 2 and point 2=point 1 (meaning same edge)
    if (
      (edges[i] == x1 &&
        edges[i + 1] == y1 &&
        edges[i + 2] == x2 &&
        edges[i + 3] == y2) ||
      (edges[i] == x2 &&
        edges[i + 1] == y2 &&
        edges[i + 2] == x1 &&
        edges[i + 3] == y1)
    ) {
      return i;
    }
  }
  return -1;
}

//arrow1 is when x1,y1,-->x2,y2
function arrow1() {
  var w = 1;
  if (autoWeights) {
    w = addWeightDefault();
    if (w == -1) {
      return;
    }
  }
  arr1 = true;
  drawArrow(
    arrowPoints[0],
    arrowPoints[1],
    arrowPoints[2],
    arrowPoints[3],
    "black"
  );
  //first 4 values are the beginning and end points, then indice of point 1 and indice of point 2, weight
  edges.push(
    arrowPoints[0],
    arrowPoints[1],
    arrowPoints[2],
    arrowPoints[3],
    arrowPoints[4],
    arrowPoints[5],
    w,
    false
  );

  displayListOfEdges();
  closeButtons();
}

//arrow1 is when x2,y2,-->x1,y1
function arrow2() {
  var w = 1;
  if (autoWeights) {
    w = addWeightDefault();
    if (w == -1) {
      return;
    }
  }
  arr2 = true;
  //first 4 values are the beginning and end points, then indice of point 2 and indice of point 1, weight
  drawArrow(
    arrowPoints[2],
    arrowPoints[3],
    arrowPoints[0],
    arrowPoints[1],
    "black"
  );
  edges.push(
    arrowPoints[2],
    arrowPoints[3],
    arrowPoints[0],
    arrowPoints[1],
    arrowPoints[5],
    arrowPoints[4],
    w,
    false
  );
  displayListOfEdges();
  closeButtons();
}

//arrow points at point1 and point 2. Draws and stores two separate arrows
function dualHeadArrow() {
  var w = 1;
  if (autoWeights) {
    w = addWeightDefault();
    if (w == -1) {
      return;
    }
  }
  arr3 = true;
  drawArrow(
    arrowPoints[0],
    arrowPoints[1],
    arrowPoints[2],
    arrowPoints[3],
    "black"
  );
  edges.push(
    arrowPoints[2],
    arrowPoints[3],
    arrowPoints[0],
    arrowPoints[1],
    arrowPoints[5],
    arrowPoints[4],
    w,
    true
  );
  drawArrow(
    arrowPoints[2],
    arrowPoints[3],
    arrowPoints[0],
    arrowPoints[1],
    "black"
  );
  displayListOfEdges();
  closeButtons();
}

//evaluate when canvas is clicked
function canvasClick(event) {
  //if path display is open, close  to default display
  if (animationInProgress == true) {
  } else {
    if (pathOpen) {
      pathOpen = false;
      closePath();
    }
    //if button direction choices display is open, close  to default display
    if (buttonsOpen) {
      buttonsOpen = false;
      closeButtons();
    }

    if (screen.width < 1100) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width; // relationship bitmap vs. element for X
      var scaleY = canvas.height / rect.height;
      var x = (event.clientX - rect.left) * scaleX;
      var y = (event.clientY - rect.top) * scaleY;
    } else {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
    }

    //boolean variable indicating whether click on previous vertice was made
    var inBound = determineIfInbound(x, y);
    if (inBound == false) {
      //if last hit, forget memory of last hit for connecting purposes
      if (isLastHit == true) {
        isLastHit = false;
        //draw over last touched point in black.
        drawPoint(lastHit[0], lastHit[1], "black", lastHit[2]);
      } else {
        //add new vertice
        vertices.push(x, y);
        drawPoint(x, y, "black", vertices.length - 2);
      }
    }
  }
}

//function to determine whether click was made on a vertice
function determineIfInbound(x, y) {
  var i = 0;
  //iterate through vertices
  for (i = 0; i < vertices.length; i = i + 2) {
    var xc = vertices[i];
    var yc = vertices[i + 1];
    //use formula for finding if point is made within a circle
    var r = getPointRadius();
    if (Math.sqrt(Math.pow(x - xc, 2) + Math.pow(y - yc, 2), 2) <= r) {
      highlight(vertices[i], vertices[i + 1], i);
      return true;
    }
  }
  return false;
}

//once a vertice has been removed, update the vertice indices on the display and edge array
function updateEdgeIndices() {
  //for each edge
  for (var i = 0; i < edges.length; i += 8) {
    //iterate through each vertice
    for (var j = 0; j < vertices.length; j += 2) {
      //if edge corresponds with given vertice based on x and y location of v1
      if (edges[i] == vertices[j] && edges[i + 1] == vertices[j + 1])
        edges[i + 4] = Math.ceil((j + 1) / 2);
      //if edge corresponds with given vertice based on x and y location of v2
      if (edges[i + 2] == vertices[j] && edges[i + 3] == vertices[j + 1])
        edges[i + 5] = Math.ceil((j + 1) / 2);
    }
  }
}

//remove an edge from the display and array
function removeEdge(i) {
  //remove all edge info
  isLastHit = false;
  document.getElementById("edges").innerHTML = "Edges List";
  edges.splice(i, 8);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  redrawEdges();
  redrawPoints();
}

//highlight path array by updating display
function highlightPath() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  highlightPathEdges();
  highlightPathVer();
}

//highlight vertices in path array
function highlightPathVer() {
  //iterate through vertices
  for (var i = 0; i < vertices.length; i += 2) {
    //indicates whether v matched with any of the path points
    var hit = false;
    //iterate through vs in path
    for (var j = 0; j < pathArr.length; j++) {
      //if v is in the path, highlight the point and update hit
      if (pathArr[j] == Math.ceil((i + 1) / 2)) {
        drawPoint(vertices[i], vertices[i + 1], "blue", i);
        hit = true;
      }
    }
    //if not in path, still draw because canvas was cleared
    if (hit == false) drawPoint(vertices[i], vertices[i + 1], "black", i);
  }
}

//highlight the edges connected in the path
function highlightPathEdges() {
  if (isDigraph) {
    for (var i = 0; i < edges.length; i = i + 8) {
      if (edges[i + 7] == true) {
        if (isPathEdge(i)) {
          drawArrow(edges[i + 2], edges[i + 3], edges[i], edges[i + 1], "blue");
          drawArrow(edges[i], edges[i + 1], edges[i + 2], edges[i + 3], "blue");
        } else {
          drawArrow(
            edges[i + 2],
            edges[i + 3],
            edges[i],
            edges[i + 1],
            "black"
          );
          drawArrow(
            edges[i],
            edges[i + 1],
            edges[i + 2],
            edges[i + 3],
            "black"
          );
        }
      } else {
        if (isPathEdge(i)) {
          drawArrow(edges[i], edges[i + 1], edges[i + 2], edges[i + 3], "blue");
        } else {
          drawArrow(
            edges[i],
            edges[i + 1],
            edges[i + 2],
            edges[i + 3],
            "black"
          );
        }
      }
    }
  } else {
    for (var i = 0; i < edges.length; i = i + 8) {
      if (isPathEdge(i)) {
        drawLine(edges[i], edges[i + 1], edges[i + 2], edges[i + 3], "blue");
      } else {
        drawLine(edges[i], edges[i + 1], edges[i + 2], edges[i + 3], "black");
      }
    }
  }
}

//check if edge is within the path array given beginning index of edge
function isPathEdge(edgeIndex) {
  for (var j = 0; j < pathArr.length; j++) {
    //check if vertices in edge match vertices in path
    if (
      (edges[edgeIndex + 4] == pathArr[j] &&
        edges[edgeIndex + 5] == pathArr[j + 1]) ||
      (edges[edgeIndex + 5] == pathArr[j] &&
        edges[edgeIndex + 4] == pathArr[j + 1])
    ) {
      return true;
    }
  }
  return false;
}

//remove a point and edges connected to said point
function removePointAndEdges(x, y) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //iterate through vertices and remove vertice
  for (var i = 0; i < vertices.length; i = i + 2) {
    if (vertices[i] == x && vertices[i + 1] == y) {
      vertices.splice(i, 2);
      i = i - 2;
    }
  }
  //iterate through edges. if edge was connected to deleted vertice, remove edge
  for (i = 0; i < edges.length; i = i + 8) {
    if (
      (edges[i] == x && edges[i + 1] == y) ||
      (edges[i + 2] == x && edges[i + 3] == y)
    ) {
      edges.splice(i, 8);
      i = i - 8;
    }
  }
  //update edge indices as vertex indices have changed
  updateEdgeIndices();
}

//draw points all at once after canvas clear
function redrawPoints() {
  for (var i = 0; i < vertices.length; i = i + 2) {
    drawPoint(vertices[i], vertices[i + 1], "black", i);
  }
}

//draw edges all at once after canvas clear
function redrawEdges() {
  if (isDigraph) {
    for (var i = 0; i < edges.length; i = i + 8) {
      //if dual arrow
      if (edges[i + 7] == true) {
        drawArrow(edges[i + 2], edges[i + 3], edges[i], edges[i + 1], "black");
        drawArrow(edges[i], edges[i + 1], edges[i + 2], edges[i + 3], "black");
      } else {
        drawArrow(edges[i], edges[i + 1], edges[i + 2], edges[i + 3], "black");
      }
    }
    //if not digraph
  } else {
    for (var i = 0; i < edges.length; i = i + 8) {
      drawLine(edges[i], edges[i + 1], edges[i + 2], edges[i + 3], "black");
    }
  }
  displayListOfEdges();
}
var dirButtonsOpen = false;
//if buttons for choosing keyboard is on display, enable keyboard shortcuts
function chooseDirectionKeyboard(event) {
  if (buttonsOpen && dirButtonsOpen) {
    //key 1
    if (event.keyCode == 49) {
      arrow1();
      //key 2
    } else if (event.keyCode == 50) {
      arrow2();
      //key 3
    } else if (event.keyCode == 51) {
      dualHeadArrow();
    }
  }
}

//updates to display buttons for directions for dualheaded arrow
function chooseDirection(x1, y1, x2, y2, label1, label2) {
  buttonsOpen = true;
  dirButtonsOpen = true;

  document.getElementById("searchtool").innerHTML = "";
  document.getElementById("edges").innerHTML = "Choose Direction";
  document.getElementById("edgeslist").innerHTML =
    "Press buttons or use Keyboard Shortcut (KS). Hint: For order matching order of selection, use KS: 2" +
    "<br>" +
    "<center>" +
    "<button onclick='arrow1()'>" +
    label1 +
    " to " +
    label2 +
    "   (KS: 1)  " +
    "</button>" +
    "<br>" +
    "<button onclick='arrow2()'>" +
    label2 +
    " to " +
    label1 +
    "   (KS: 2)  " +
    "</button>" +
    "<br>" +
    "<button onclick='dualHeadArrow()'>" +
    "Dual Headed Arrow" +
    "     (KS: 3)  " +
    "</button>" +
    "</center>";
}

//close dualheaded arrow buttons
function closeButtons() {
  buttonsOpen = false;
  dirButtonsOpen = false;
  restoreEdgeList();
}


//display edges after function is called that displays something else
function restoreEdgeList() {
  displayListOfEdges();
  document.getElementById("edges").innerHTML = "Edges List";
  document.getElementById("searchtool").innerHTML =
    "<label for='fname'>Search:</label><br /><label for='fname'>V1:</label><input type='text' id='v1In' name='city' list='v1' size='1' /><label for=fname'>(Optional) V2:</label><input type='text' id='v2In' name='city' list='v2' size='1' /><button onclick='interpretSearch()'>Enter</button>";
}

//draw edge on ugraph
function drawLine(xs, ys, xe, ye, color) {
  var xen = xe - xs;
  var yen = ye - ys;
  var d = Math.hypot(xen, yen);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(xs, ys);
  ctx.lineTo(xe, ye);
  ctx.stroke();
}

//returns the edge of the circle for arrow to hit
function edgeOfCircle(v1, v2, d) {
  var newV2 = v2 - v1;
  newV2 *= d - 1.4 * getPointRadius();
  newV2 /= d;
  newV2 += v1;
  return newV2;
}

//draw edge in directed graph
function drawArrow(x1, y1, x2, y2, color) {
  ctx.beginPath();
  var newX = x2 - x1;
  var newY = y2 - y1;
  var d = Math.hypot(newX, newY);

  //find edge of circle for arrow to hit
  var xe = edgeOfCircle(x1, x2, d);
  var ye = edgeOfCircle(y1, y2, d);
  var ys = edgeOfCircle(y2, y1, d);
  var xs = edgeOfCircle(x2, x1, d);

  var headlen = 10; // length of head in pixels
  var dx = xe - xs;
  var dy = ye - ys;

  var angle = Math.atan2(dy, dx);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.moveTo(xs, ys);
  ctx.lineTo(xe, ye);
  ctx.lineTo(
    xe - headlen * Math.cos(angle - Math.PI / 6),
    ye - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(xe, ye);
  ctx.lineTo(
    xe - headlen * Math.cos(angle + Math.PI / 6),
    ye - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

//draw vertice
function drawPoint(x, y, color, label) {
  ctx.beginPath();
  var r = getPointRadius();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "white";

  //fill with vertice label. altered because given label
  //is index of x of xy pair for v rather than numbered vertice.
  //x-6 and y+1 is for centering
  if (screen.width < 1100) {
    ctx.font = "25px Arial";
    ctx.fillText(Math.floor(label / 2) + 1, x - 15, y + 3);
  } else {
    ctx.fillText(Math.floor(label / 2) + 1, x - 6, y + 1);
  }
}

//highlight when vertice is selected for future connection
function highlight(x, y, i) {
  if (isLastHit == true) {
    //check is not same circle hit twice
    var r = getPointRadius();
    if (
      Math.sqrt(Math.pow(x - lastHit[0], 2) + Math.pow(y - lastHit[1], 2), 2) >
      r
    ) {
      //is -1 if edge does not exist, otherwise is start
      var existingeEdge = doesEdgeExist(x, y, lastHit[0], lastHit[1]);
      //if already hit, show input asking for new weights/delete possibility
      if (existingeEdge != -1) {
        getWeightInput(existingeEdge, i / 2 + 1, lastHit[2] / 2 + 1);
        //edge does not already exist
      } else {
        if (isDigraph) {
          //arrowpoints is a global variable that saves the coordinates for drawing new arrow points
          arrowPoints = [
            x,
            y,
            lastHit[0],
            lastHit[1],
            i / 2 + 1,
            lastHit[2] / 2 + 1
          ];
          //enables user to choose direction of edge
          chooseDirection(
            x,
            y,
            lastHit[0],
            lastHit[1],
            i / 2 + 1,
            lastHit[2] / 2 + 1
          );
        } else {
          var w = 1;
          if (autoWeights) {
            w = addWeightDefault();
            if (w == -1) {
              return;
            }
          }
          drawLine(x, y, lastHit[0], lastHit[1], "black");
          //false indicates it is not a dual head for graphics purposes
          edges.push(
            x,
            y,
            lastHit[0],
            lastHit[1],
            i / 2 + 1,
            lastHit[2] / 2 + 1,
            w,
            false
          );
          displayListOfEdges();
        }
      }
      drawPoint(lastHit[0], lastHit[1], "black", lastHit[2]);

      drawPoint(x, y, "red", i);

      lastHit[0] = x;
      lastHit[1] = y;
      lastHit[2] = i;
      isLastHit = true;
      //means point was double clicked so delete
    } else {
      deletePoint(x, y);
      return;
    }
    //first hit
  } else {
    drawPoint(x, y, "red", i);

    lastHit[0] = x;
    lastHit[1] = y;
    lastHit[2] = i;
    isLastHit = true;
  }
}

//remove point from display and list as well as all connected edges
function deletePoint(x, y) {
  removePointAndEdges(x, y);
  redrawEdges();
  redrawPoints();
  lastHit = [];
  isLastHit = false;
}


function closeEdgeArrowDisplay() {
  document.getElementById("edgeslist").innerHTML = "";
}


//add edge in edges list display along with button to change weight
function makeEdgeButton(start, end, w, toAnd) {
  var index = start - 4;
  var list = edges[start] + toAnd + edges[end] + " w: " + edges[w];

  var spaces = " ";
  list += spaces;

  list +=
    "<button onclick='getWeightInput(" +
    index +
    "," +
    edges[start] +
    "," +
    edges[end] +
    ")'>Change w</button>" +
    "<br>";
  return list;
}

//is V2Search is true when we are searching for the second entry
//in a search. if it is blank, it is not wrong, but instead
//just not being used
function interpretVerticeSearch(v,isV2Search){
 if (isNaN(v)) {
    if(isV2Search){
      return "No entry"
    }else{
      alert("Not valid entry.");
      return false;
    }
  }else if(v <= 0 ||
      v > vertices.length / 2 ||
      v <= 0 ||
      v > vertices.length / 2){
    alert("Needed entry out of range");
    return false;
  }else{
    return true;
  }
}

//interpret search before sending it to Dijkstra
function findShortestPath() {
  if (animationInProgress) {
  } else {
    if (edges.length == 0) {
      alert("No edges exist yet.");
      return;
    }
    var v1Entry = document.getElementById("v1").value;
    var v2Entry = document.getElementById("v2").value;
    v1Entry = v1Entry.replace(/^\s+/, "").replace(/\s+$/, "");
    v2Entry = v2Entry.replace(/^\s+/, "").replace(/\s+$/, "");
    var v1Num = parseInt(v1Entry, 10);
    var v2Num = parseInt(v2Entry, 10);
    var v1Status = interpretVerticeSearch(v1Num,false);
    //don't display other message because it already failed
    if(!v1Status){
      return;
    }
    var v2Status = interpretVerticeSearch(v2Num,false);
    if(v1Status && v2Status){
      dijkstra(v1Num, v2Num);
    }
      
  }
}

//interpreting search for specific edges
function interpretSearch() {
  if (edges.length == 0) {
    alert("No edges exist yet.");
    return;
  }
  var v1Entry = document.getElementById("v1In").value;
  var v2Entry = document.getElementById("v2In").value;
  v1Entry = v1Entry.replace(/^\s+/, "").replace(/\s+$/, "");
  v2Entry = v2Entry.replace(/^\s+/, "").replace(/\s+$/, "");
  var v1Num = parseInt(v1Entry, 10);
  var v2Num = parseInt(v2Entry, 10);
  var v1Status = interpretVerticeSearch(v1Num,false);
  //don't display other message because it already failed
  if(!v1Status){
    return;
  }
  var v2Status = interpretVerticeSearch(v2Num,true);
  if(v2Status=="No entry"){
    displaySpecificEdges(true);
  }else if(v2Status){
    displaySpecificEdges(false);
  }
  
}



//supporting function for displaySpecificEdges, confirms whether is is relevant
function isSpecificEdge(vTest1, vTest2, v1,v2){
  //if v2 is not an entry, is a valid search if v1 is either vertice being connected
  if(v2==-1){
    if(vTest1 == v1 || vTest2 == v1){
      return true;
    }else{
      return false;
    }
  //looking specifically for an edge between v1 and v2
  }else{
    if((vTest1==v1 && vTest2==v2)|| (vTest1==v2 && vTest2==v1)){
      return true;
    }else{
      return false;
    }
  }
}
//when searching for edges connected to a specific vertex or a specific edge
//is1V represents is true if we are looking for all edges connected to 1 v,
//not 1 edge connecting two specific Vs
function displaySpecificEdges(is1V) {
  var list =
    " <button onclick='displayListOfEdges()'>Back to Display All</button>" +
    "<br>";
  var v1 = parseInt(document.getElementById("v1In").value, 10);
  if(!is1V){
    var v2 = parseInt(document.getElementById("v2In").value, 10);
  }else{
    var v2 = -1;
  }
  var cntEdges = 0;
  for (var i = 0; i < edges.length; i = i + 8) {
    if (isSpecificEdge(edges[i + 4],edges[i+5],v1,v2)) {
      if (edges[i + 7] || isDigraph == false) {
        cntEdges++;
        list = list.concat(makeEdgeButton(i + 4, i + 5, i + 6, " and "));
      } else {
        cntEdges++;
        list = list.concat(makeEdgeButton(i + 4, i + 5, i + 6, " to "));
      }
    }
  }
  if (cntEdges == 0) {
    document.getElementById("edgeslist").innerHTML = list + "No edges found";
  } else {
    document.getElementById("edgeslist").innerHTML = list;
  }
}

//displays list of all edges
function displayListOfEdges() {
  document.getElementById("searchtool").innerHTML =
    "<label for='fname'>Search:</label><br /><label for='fname'>V1:</label><input type='text' id='v1In' name='city' list='v1' size='1' /><label for=fname'>(Optional) V2:</label><input type='text' id='v2In' name='city' list='v2' size='1' /><button onclick='interpretSearch()'>Enter</button>";
  var list = "";
  var i = 0;
  list.concat();
  if (isDigraph) {
    for (i = 0; i < edges.length; i = i + 8) {
      //bdual variable
      if (edges[i + 7]) {
        list = list.concat(makeEdgeButton(i + 4, i + 5, i + 6, " and "));
      } else {
        list = list.concat(makeEdgeButton(i + 4, i + 5, i + 6, " to "));
      }
    }
  } else {
    for (i = 0; i < edges.length; i = i + 8) {
      list = list.concat(makeEdgeButton(i + 4, i + 5, i + 6, " and "));
    }
  }

  document.getElementById("edgeslist").innerHTML = list;
}

//default entry system asked everytime a new edge is appended
function addWeightDefault() {
  var newWeight = prompt("Please enter the weight as a positive number");
  var userText = newWeight.replace(/^\s+/, "").replace(/\s+$/, "");
  if (interpretWeightEntry(userText)) {
    return userText;
  } else {
    return -1;
  }
}

//interpret user text to determine if entry is a valid weight
function interpretWeightEntry(userText) {
  if (isNaN(userText) == false) {
    if (userText == "") {
      alert("Not a number.");
      return false;
    } else if (userText.charAt(0) == "-") {
      alert("Negative weights not permitted.");
      return false;
    } else {
      return true;
    }
  } else {
    alert("Not a number!");
    return false;
  }
}
var changeWeighti = -1;

//change weight interface
function getWeightInput(i, v1, v2) {
  buttonsOpen = true;
  changeWeighti = i;
  buttonsOpen = true;
  document.getElementById("searchtool").innerHTML = "";
  document.getElementById("edges").innerHTML = "Update Weight or Delete";
  var list =
    "The current weight of the edge between <br>" +
    v1 +
    " and " +
    v2 +
    " is: " +
    edges[i + 6] +
    "<br>" +
    "New Weight: " +
    "<input type='text' id='newWeight' list='v1' size='5' /><button onclick='changeWeight()'>Enter</button>" +
    "<br>" +
    "<br>" +
    "Delete Edge" +
    "<input type='image' width='30' height='30' src='https://cdn.glitch.com/b3264a77-88be-454a-b1e9-ce5ac5fa31fc%2Ftrashcan.png?v=1628632492609'  onclick= 'removeEdge(" +
    i +
    ")'/>";
  document.getElementById("edgeslist").innerHTML = list;
}

//changing weight
function changeWeight() {
  var newWeight = document.getElementById("newWeight").value;
  var userText = newWeight.replace(/^\s+/, "").replace(/\s+$/, "");
  closeButtons();
  buttonsOpen = false;
  if (interpretWeightEntry(newWeight)) {
    edges[changeWeighti + 6] = newWeight;
    displayListOfEdges();
  }
}

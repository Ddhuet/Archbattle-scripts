// ==UserScript==
// @name       Archbattle Building Helper
// @version    1.0
// @description  Adds a "max" button, and estimates on resource costs to the building page in Archbattle.
// @match      http://archbattle.com/play/build.php
// @copyright  2012+, David Dhuet
// ==/UserScript==
(function() {
    var tableList = document.getElementsByTagName("table");
    var i = 0;
    var key;
    
    if (tableList.length < 5) {
        console.log("No error, just construction page"); //Script goes off on building submit page, so don't throw an error when it does.
        return;
    }
    
    if (tableList.length != 51) {
        alert("Problem with # of tables");
        throw("Problem with # of tables");
    }
    
    var buildings = {farms: {}, ranches: {}, huts: {}, outposts: {}, forts: {}, strongholds: {}, castles: {}};
    
    buildings.farms.table = tableList[4];
    buildings.ranches.table = tableList[10];
    buildings.huts.table = tableList[16];
    buildings.outposts.table = tableList[22];
    buildings.forts.table = tableList[29];
    buildings.strongholds.table = tableList[36];
    buildings.castles.table = tableList[43];
    
    
    var construction = tableList[50];
    
    var constructionRows;
    
    var tempButton;
    
    var setup = 1;
    
    function findInConstruction() {
    
        constructionRows = construction.getElementsByTagName("tr");
            
        if (constructionRows.length === 3) {
            for (i in buildings) {
                buildings[i].constructing = 0;
            } 
            
            return;
        }
        
        else {
            for (i = 2; i<constructionRows.length - 1; i++) {
                var buildingType = constructionRows[i].childNodes[1].innerHTML.toLowerCase();
                if (!buildings[buildingType]) {
                    alert("Problem with building type name");
                    throw("Bad building type name");
                }
                
                else {
                    buildings[buildingType].constructing += parseInt(constructionRows[i].childNodes[2].innerHTML);
                }
                    
            }
        }
    }
    
    
    
    
    function setToMax(e) {
        
        if (setup) {
            console.log("setup");
            return;
        }
            
        if (typeof buildings[e.building].max === "undefined") {
            alert("You can build infinite of that, silly =P");
            return;
        }
        var amountLeft = buildings[e.building].max - buildings[e.building].amount;
        
        if (amountLeft <= 0) {
            return;
        }
        buildings[e.building].input.value = amountLeft;
        changePrice(buildings[e.building]);
    }
    
    function changePrice(building) {
        
        if (!building.rowsChanged) {
            building.rowsChanged = true;
            
            for (i = 1; i<5; i++) {
                building.costRows[i].childNodes[1].innerHTML = building.costRows[i].childNodes[1].innerHTML.replace(/,/g, "");
            }
            
            
            building.goldBase = parseInt(building.costRows[1].childNodes[1].innerHTML);
            building.lumberBase = parseInt(building.costRows[2].childNodes[1].innerHTML);
            building.stoneBase = parseInt(building.costRows[3].childNodes[1].innerHTML);
            building.ironBase = parseInt(building.costRows[4].childNodes[1].innerHTML);
        }
        
        else {
        
            for (i = 1; i<5; i++) {
                building.costRows[i].childNodes[1].innerHTML = building.costRows[i].childNodes[1].innerHTML.replace(/,/g, "");
            }
            
        }
            
        if (!building.input.value) {
            building.costRows[1].childNodes[1].innerHTML = building[goldBase];
            building.costRows[2].childNodes[1].innerHTML = building[lumberBase];
            building.costRows[3].childNodes[1].innerHTML = building[stoneBase];
            building.costRows[4].childNodes[1].innerHTML = building[ironBase];
            return;
        }
            
        var amount = parseInt(building.input.value);    
        
        var gold = building.costRows[1].childNodes[1];
        var lumber = building.costRows[2].childNodes[1];
        var stone = building.costRows[3].childNodes[1];
        var iron = building.costRows[4].childNodes[1];
        
        gold.innerHTML = Math.ceil(amount * building.goldBase);
        lumber.innerHTML = Math.ceil(amount * building.lumberBase);
        stone.innerHTML = Math.ceil(amount * building.stoneBase);
        iron.innerHTML = Math.ceil(amount * building.ironBase);
        
    }
    
    
    
    for (key in buildings) {
        buildings[key].amount = parseInt(buildings[key].table.getElementsByTagName("td")[0].innerHTML.replace(/,/g, ""));
        buildings[key].input = buildings[key].table.getElementsByTagName("input")[0];
        if (buildings[key].input.getAttribute("type") != "text") {
            alert("Problem with input box type");
            throw("Problem with input box type");
        }
        
        buildings[key].build = buildings[key].table.getElementsByTagName("input")[1];
        if (buildings[key].build.getAttribute("value") != "Build") {
            alert("Problem with build attribute");
            throw("Problem with build attribute");
        }
        
        tempButton = document.createElement("td");
        tempButton.setAttribute("width", "33%");
        tempButton.setAttribute("align", "center");
        tempButton.innerHTML = "<input type=\"button\" value=\"Max\">";
        tempButton.building = key;
        
        buildings[key].build.parentNode.parentNode.appendChild(tempButton);
        
        tempButton.addEventListener("click", function() {setToMax(this);}, false);
        
    }
    
    
    for (key in buildings) {
        buildings[key].constructing = 0;
    } 
    
    
    findInConstruction();
    
    buildings.outposts.max = Math.floor( (buildings.huts.amount / 10) - (buildings.outposts.constructing) );
    buildings.forts.max = Math.floor( (buildings.outposts.amount / 8) - (buildings.forts.constructing) );
    buildings.strongholds.max = Math.floor( (buildings.forts.amount / 6) - (buildings.strongholds.constructing) );
    buildings.castles.max = Math.floor( (buildings.strongholds.amount / 4) - (buildings.castles.constructing) );
    
    setup = 0; //Mark that we're done with the "Max" setup, so the Max button can be pressed.
    
    //Getting the price rows so we can do the bulk calculation with price later
    
    for (key in buildings) {
        var costTable = buildings[key].table.getElementsByTagName("table")[1];
        var costRows = costTable.getElementsByTagName("tr");
        buildings[key].costRows = costRows;
        var rezTypes = ["blank", "gold", "lumber", "stone", "iron"];
        for (i=1; i < costRows.length - 1; i++) {
            buildings[key].costRows[rezTypes[i]] = costRows[i];
        }
        buildings[key].input.setAttribute("building", key);
        buildings[key].input.addEventListener("change", function(event){changePrice(buildings[event.target.getAttribute("building")])}, false);
    }
    
    
}());

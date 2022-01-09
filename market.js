// ==UserScript==
// @name       Archbattle Market Enhancer
// @version    0.1
// @description  Adds a much needed table to the market page
// @match      http://archbattle.com/play/market.php
// @copyright  2012+, David Dhuet
// ==/UserScript==
(function() {
    "use strict";
    var i = 0;
    var tables = document.getElementsByTagName("table");
    var marketTable;
    for (i=0; i<tables.length; i++) { //find the table that holds all the resources using some "duck" like methods.
        if ( !(tables[i]) || !(tables[i].getAttribute("width")) || !(tables[i].getAttribute("width") === "100%") || !(tables[i].getAttribute("border")) || !(tables[i].getAttribute("border") === "0")) {
            continue;
        }
        else {
            marketTable = tables[i];
            break;
        }
    }
    var trList = marketTable.getElementsByTagName("tr");
    var resourceRows = [];
    var resources = {Gold: {amount: 0, rows: []}, Lumber:{amount: 0, rows: []}, Stone: {amount: 0, rows: []}, Iron: {amount: 0, rows: []}, Hex: {amount: 0, rows: []}, Food: {amount: 0, rows: []}, Horses: {amount:0, rows: []}};
    for (i=3; i<trList.length - 2; i++) { //Make a list of the resource rows. We don't want the first 3 or the last 1. They don't matter.
        resourceRows.push(trList[i]);
    }
    
    for (i=0; i<resourceRows.length;i++) { //Just a little error checking to make sure the rows are legit.
        if (!(resourceRows[i].childNodes[2]) || !(resourceRows[i].childNodes[2].innerHTML)) {
            console.log("Error #1");
            alert("Error #1");
        }
        
        else { 
            var quantity = resourceRows[i].childNodes[3].innerHTML;
            quantity = quantity.replace(/,/g, ""); //Remove those pesky commas
            quantity = quantity | 0; //The fast, hacky version of parseInt
            
            if (resourceRows[i].childNodes[2].innerHTML === "Buy") {
                resources.Gold.amount += quantity;
                resources.Gold.rows.push(resourceRows[i]);
            }
            else if (resourceRows[i].childNodes[2].innerHTML === "Sell") {
                var resourceName = resourceRows[i].childNodes[1].childNodes[0].getAttribute("title");
                resources[resourceName].amount += quantity;
                resources[resourceName].rows.push(resourceRows[i]);
            }
            
            else {
                console.log("Error #2");
                alert("Error #2");
                return;
            }
        }
    }
    var resultsBox = document.createElement("table"); //Here is the custom "Hidden Market" box creation
    resultsBox.setAttribute("width", "70%");
    resultsBox.innerHTML = "<tr><td class=\"bodycell3\" colspan=\"5\">Hidden Market</td></tr>    <tr> <td class=\"bc4c\"> <b> Resource </b> </td> <td class=\"bc4c\"><b> Amount in market </b></td> <td class=\"bc4c\"><b> Amount after 10% fee </b></td> <td class=\"bc4c\"><b> Withdrawal amount </b> </td> <td class=\"bc4c\"><b> Withdraw </b> </td> </tr>";
    //<td class=\"bc4c\"> <input type=\"button\" value=\"Withdraw\"> </td>
    marketTable.parentNode.insertBefore(resultsBox, marketTable);
    var resourceList = ["Gold", "Lumber", "Stone", "Iron", "Hex", "Food", "Horses"];
    var imageList = ["/images/gold.gif", "/images/wood.gif", "/images/stone1.gif", "/images/iron.gif", "/images/hex.gif", "/images/food1.gif", "/images/horse.gif"];
    var myRow;
    var myName;
    var myAmount;
    var myTaxedAmount;
    var myWithdrawAmount;
    var myWithdrawButton;
    for (i=0; i<7; i++) { //Make a row for each resource type
        myRow = document.createElement("tr");
        myRow.setAttribute("resource", resourceList[i]);
        myName = document.createElement("td"); 
        myAmount = document.createElement("td");
        myTaxedAmount = document.createElement("td");
        myWithdrawAmount = document.createElement("td");
        myWithdrawButton = document.createElement("td");
        myName.setAttribute("class", "bc4c");
        myAmount.setAttribute("class", "bc4c");
        myTaxedAmount.setAttribute("class", "bc4c");
        myWithdrawAmount.setAttribute("class", "bc4c");
        myWithdrawButton.setAttribute("class", "bc4c");
        myName.innerHTML = "<img src=\"" + imageList[i] + "\" border=\"0\"> ";
        myAmount.innerHTML = resources[resourceList[i]].amount;
        myTaxedAmount.innerHTML = Math.floor(resources[resourceList[i]].amount * .9);
        console.log(resourceList[i] + ": " + Math.floor(resources[resourceList[i]].amount * .9));
        myWithdrawAmount.innerHTML = "<input type=\"text\" size=\"6\">";
        myWithdrawButton.innerHTML = "<input type=\"button\" value=\"Withdraw\">";
        myRow.appendChild(myName);
        myRow.appendChild(myAmount);
        myRow.appendChild(myTaxedAmount);
        myRow.appendChild(myWithdrawAmount);
        myRow.appendChild(myWithdrawButton);
        resultsBox.appendChild(myRow);
    }
    
    var inputList = resultsBox.getElementsByTagName("input");
    var buttonList = [];
    for (i=0; i<inputList.length; i++) { //Add event listeners to all the new buttons. This is sort of a weird way of doing it, technically each button gets the same listener, it's just context based.
        if (inputList[i].getAttribute("type") === "button") {
            inputList[i].addEventListener("click", withdrawResource, false);
            buttonList.push(inputList[i]);
        }
    }
    
    function withdrawResource(e) { //Please excuse this hacky BS. Trying to change proof my stuff.
        var myButton = e.target;
        var theRow = myButton.parentNode.parentNode;
        var resourceType = theRow.getAttribute("resource");
        var amount = (theRow.childNodes[3].childNodes[0].value | 0);
        var resourceArray = [];
        var currentAmount = 0;
        var rowsToCancel = [];
        var confirmWaste;
        if (amount > resources[resourceType].amount) {
            alert("You don't have that much!");
            return;
        }
        
        for (i=0; i<resources[resourceType].rows.length; i++) { //Just copies the row list of that resource to the new array
            resourceArray.push(resources[resourceType].rows[i]);
        }
        
        for(i=0; i<resourceArray.length; i++) {
            resourceArray[i].childNodes[3].innerHTML = resourceArray[i].childNodes[3].innerHTML.replace(/,/g, "");
        }
        
        resourceArray.sort(compareRows); //Custom .sort function used here. Ranks them by resource amount.
        
        if (resourceArray.length <= 0) {
                alert("Problem with the while loop");
                return;
                throw("Problem with the while loop");
        }  
        var i = 0;
        var j = 0;
        while (amount > currentAmount) { //Until we have as much, or more resources as we need
            if (!(resourceArray[i])) {
                alert("Something messed up");
                console.log("res array " + resourceArray);
                console.log("current " + currentAmount);
                console.log("amount " + amount);
                return;
            }
            var rowAmount = Math.floor( (resourceArray[i].childNodes[3].innerHTML | 0) * .9);
            if ( (currentAmount + rowAmount) > amount) {
                
                if ( (Math.round(currentAmount + rowAmount) * .9) <= amount) { //If the value is 10% or less over
                    currentAmount = currentAmount + rowAmount;
                    rowsToCancel.push(resourceArray[i]);
                    break;
                }
                
                var enoughCheck = 0;
                var enoughRow;
                
                for (j=i + 1; j<resourceArray.length; j++) {
                    enoughRow = Math.floor( (resourceArray[j].childNodes[3].innerHTML | 0) * .9);
                    enoughCheck = enoughCheck + enoughRow;
                }
                    
                if (!(resourceArray[i+1])) {
                    currentAmount = currentAmount + rowAmount;
                    rowsToCancel.push(resourceArray[i]);
                    break;
                }
                
                else if ( (enoughCheck + currentAmount) < amount) {
                    currentAmount = currentAmount + rowAmount;
                    rowsToCancel.push(resourceArray[i]);
                }
                
                i++;
                continue;
            }
            
            else if ((currentAmount + rowAmount) === amount) {
                currentAmount = currentAmount + rowAmount;
                rowsToCancel.push(resourceArray[i]);
                break;
            }
            
            else if ((currentAmount + rowAmount) < amount) {
                currentAmount = currentAmount + rowAmount;
                rowsToCancel.push(resourceArray[i]);
                if (!(resourceArray[i+1])) {
                    alert("Here lies the problem");
                    throw("Here lies the problem");
                }
                
                i++;
                continue;
            }
        }
        
        if ( (amount / 10) <= (currentAmount - amount) ) { //If they will withdraw at least 10% more than they wanted
            var tempAmount = (currentAmount - amount);
            if (!(confirm("You will withdraw " + tempAmount + " more of that than you specified. Withdraw anyway?")) ) {
                return; //If they don't want to continue, cancel the withdrawal. Don't check any boxes.
            }
        }
       
        
        for (i=0; i<rowsToCancel.length; i++) {
            rowsToCancel[i].childNodes[5].childNodes[0].checked = true;
        }
        
        trList[trList.length - 1].getElementsByTagName("input")[0].click(); //cancel the rows
    }
        
        function compareRows(a, b)  { //Hacky, but it works. Ranks rows based on the number of resources in them.
            if ( Math.floor((a.childNodes[3].innerHTML | 0) * .9) > Math.floor( (b.childNodes[3].innerHTML | 0) * .9) )  {
                return -1;
            }
            
            if ( Math.floor((a.childNodes[3].innerHTML | 0) * .9) < Math.floor( (b.childNodes[3].innerHTML | 0) * .9) ) {
                return 1;
            }
            
            return 0;
            
        }
    
}());

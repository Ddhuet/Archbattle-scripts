// ==UserScript==
// @name       Skill Switcher
// @version    0.1
// @description  Switches Skills in Archbattle
// @match      http://archbattle.com/play/skills.php
// @copyright  2012+, David Dhuet
// ==/UserScript==

(function() {
    "use strict";
    var i = 0;
    var j = 0;
    var tds = document.getElementsByClassName("bc4");
    var skills = [];
    var rows = [];
    
    
    if (tds.length != 40) {
        alert("Problem with tds");
        throw("Problem with tds");
    }
    
    for (i=0; i<tds.length; i++) {
        if (tds[i].childNodes.length != 1) {
            rows.push(tds[i]);
        }
    }
    
    if (rows.length != 20) {
        alert("Problem with # of rows");
        throw("Problem with # of rows. Probably about the text being a childNode");
    }
    
    for (i=0; i<rows.length;i++) {
        skills.push(rows[i].getElementsByTagName("div"));
    }
    
    /* for (i=0; i<rows.length;i++) {
        var tempArray = [];
        var tempStorage;
        tempStorage = rows[i].getElementsByTagName("div");
        for (j=0; j<tempStorage.length;j++) {
            tempArray.push(tempStorage[j].getAttribute("id"));
        }
        skills.push(tempArray);
    }
    */
    
    console.log(skills);
    
    
}());

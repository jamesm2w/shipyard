var metals = '<option value="aluminium">Aluminium</option><option value="titanium">Titanium</option><option value="tin">Tin</option><option value="iron">Iron</option><option value="steel">Steel</option><option value="bronze">Bronze</option><option value="nickel">Nickel</option><option value="copper">Copper</option><option value="silver">Silver</option><option value="lead">Lead</option><option value="gold">Gold</option><option value="tungsten">Tungsten</option>';
var woods = '<option value="cedar">Cedar</option><option value="hemlock">Hemlock</option><option value="chestnut">Chestnut</option><option value="elm">Elm</option><option value="birch">Birch</option><option value="ash">Ash</option><option value="oak">Oak</option><option value="palm">Palm</option>';
var schemModal = document.getElementById('schematicModal'); //Modal root element
var editingSchematic = { //Modal details copied into this when editing mode selected, then when saved is passed into currentShip array
	"name": "",
	"type": "",
	"stats": [],
	"materials": []
};

var currentShip = []; //Schematic object is appended to this array on saving data

var schematics; //List of master Schematics
var materials; //List of boosts from materials to weight

function loadSchematicList(cb) { // Simple AJAX 
	var request = new XMLHttpRequest();
	request.open('GET', '../data/schematics.json', true);
	request.onload = function () {
	  if (request.status >= 200 && request.status < 400) {
		schematics = JSON.parse(request.responseText);
	  } else {
		console.log("Error when connecting to schematic data")
	  }
	  cb();
	};
	request.onerror = function() {
	  console.error()
	};
	request.send();
}

function loadMaterialBoosts(cb) {
	var request = new XMLHttpRequest();
	request.open('GET', '../data/materials.json', true);
	request.onload = function () {
	  if (request.status >= 200 && request.status < 400) {
		materials = JSON.parse(request.responseText);
	  } else {
		console.log("Error when connecting to material data")
	  }
	  cb();
	};
	request.onerror = function() {
	  console.error()
	};
	request.send();	
}

function bindAndInitialiseCollapse() {
	var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight){
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        } 
      });
    }
}

function parseHTML(str) {
	var tmp = document.implementation.createHTMLDocument();
	tmp.body.innerHTML = str;
	return tmp.body.children;
}

function denySaveWithSnackbar() {
	showSnackbar('Saving data is not yet implemented');
}

function closeModal() {
	wipeModalForClosing()
	schemModal.style.display = "none";
}

function updateModalAfterChange() { // Go through stat bars after recalculation displaying change
	var stats = editingSchematic.stats;
	for (var i = 0; i < stats.length; i++) {
		var stat = stats[i];
		var masterSchematic = schematics[editingSchematic.type];
		var boostedStat = stat.value;
		try {
			var minimumStat = masterSchematic["stats"][i].value;
		} catch (err) {
			var minimumStat = 0;
		}
		//console.log(minimumStat)
		//console.log(boostedStat)
		if (stat.bar != false) {
			document.querySelector("#stat-bar-"+i+" .right").innerHTML = minimumStat + "<span style='color: lightblue'>+" + (boostedStat - minimumStat).toFixed(2) + "</span>";
			document.querySelector("#stat-bar-"+i+" .stat-bar-meter").style.width = boostedStat + "%";
			var originalPercent = ((minimumStat / boostedStat) * 100).toFixed();
			var newPercent = (((boostedStat - minimumStat) / boostedStat) * 100).toFixed();
			document.querySelector("#stat-bar-"+i+" .stat-bar-meter").style.background = "linear-gradient(to right, #668ec3 "+originalPercent+"%, limegreen "+newPercent+"%)";
			console.log(originalPercent);
			console.log(newPercent);
		}
		if (stat.name == "weight") {
			document.getElementById("schem-weight").innerText = stat.value + " kg";
		}
	}
}

function calculateWeight() { //Re-calculate the weight of the schematic based on the materials input
	var editingSchem = editingSchematic;
	var material = editingSchem.materials;
	var totalWeight = 0;
	for (var i = 0; i < material.length; i++) {
		var unitWeight = 0;
		var boost = materials.weight[material[i]["material"]];
		//console.log(boost + " * " + material[i].amount);
		unitWeight = boost * material[i].amount;
		totalWeight += unitWeight;
	}
	var stats = editingSchem.stats;
	for (var i = 0; i < stats.length; i++) {
		if (stats[i].name === "weight") {
			stats[i].value = totalWeight.toFixed(2);
		}
	}
}

function calculateStat(stat, slot) {
	console.log("Called calc with " + stat.name)
	if (stat.name === "weight") {
		calculateWeight()
	} else {
		var name = stat.name, material = editingSchematic.materials[slot].material ,relatedBoosts = materials[name.toLowerCase()][slot][material], editingStat, masterSchematic = schematics[editingSchematic.type];
		for (var i = 0; i < editingSchematic.stats.length; i++) {
			if (editingSchematic.stats[i].name == name) {
				editingStat = editingSchematic.stats[i];
			}
		}
		for (var i = 0; i < masterSchematic.stats.length; i++) {
			if (masterSchematic.stats[i].name == name) {
				masterStat = masterSchematic.stats[i];
			}
		}
		var quality = editingSchematic.materials[slot].quality - 1;
		console.log(quality)
		console.log(masterStat.value)
		console.log(relatedBoosts[quality])
		console.log(masterStat.value * relatedBoosts[quality])
		editingStat.value = masterStat.value * relatedBoosts[quality];
	}
}

function dropdownChangeHandler(e) { //Handles changing the materials values after a change in a dropdown. [[WIP: Mirror for quality inputs!!]]
	var material = this.value;
	var type = this.parentNode.id.charAt(9);
	var quality = document.getElementById("material-"+type+"-quality").value || 1;
	var field = document.getElementById("material-"+type+"-name").innerText.split(" × ");
	var fieldAmount = field[1];
	var fieldText = field[0];
	var schematicMaterialField = editingSchematic.materials[type];
	schematicMaterialField.name = fieldText;
	schematicMaterialField.amount = fieldAmount;
	schematicMaterialField.material = material;
	schematicMaterialField.quality = quality;
	for (var i = 0; i < editingSchematic.stats.length; i++) {
		for (var x= 0; x < editingSchematic.stats[i].listeners.length; x++) {
			//console.log("Calling calc on " + editingSchematic.stats[i].name + " with " + editingSchematic.stats[i].listeners[x])
			if (type == editingSchematic.stats[i].listeners[x]) {
				calculateStat(editingSchematic.stats[i], editingSchematic.stats[i].listeners[x])
			}
		}
	}
	updateModalAfterChange();
}

function qualityChangeHandler(e) {
	var quality = this.value;
	var type = this.parentNode.id.charAt(9);
	var material = document.querySelector("#material-"+type+"-dropdown select").value;
	var field = document.getElementById("material-"+type+"-name").innerText.split(" × ");
	var fieldAmount = field[1];
	var fieldText = field[0];
	var schematicMaterialField = editingSchematic.materials[type];
	schematicMaterialField.name = fieldText;
	schematicMaterialField.amount = fieldAmount;
	schematicMaterialField.material = material;
	schematicMaterialField.quality = quality;
	for (var i = 0; i < editingSchematic.stats.length; i++) {
		for (var x= 0; x < editingSchematic.stats[i].listeners.length; x++) {
			//console.log("Calling calc on " + editingSchematic.stats[i].name + " with " + editingSchematic.stats[i].listeners[x])
			if (type == editingSchematic.stats[i].listeners[x]) {
				calculateStat(editingSchematic.stats[i], editingSchematic.stats[i].listeners[x])
			}
		}
	}
	updateModalAfterChange();
}

function bindListenersToInput() { //Simply bind the handler to the material slots required by this schematic.
	var dropdownElements = document.getElementsByClassName("schematic-material-dropdown");
	for (var i = 0; i < dropdownElements.length; i++){
		var el = dropdownElements[i];
		el.removeEventListener("change", dropdownChangeHandler); //Wipe off any previous listeners from other schematics first
		if (el.value != ""){
			el.addEventListener("change", dropdownChangeHandler);
		}
	}
	for (var i = 0; i < 6; i++) {
		var el = document.getElementById("material-"+i+"-quality");
		el.removeEventListener("change", qualityChangeHandler); // Remove other listener in case slot is hidden
		el.addEventListener("change", qualityChangeHandler); // Add listener for when quality object is changed
	}
}

function loadEditingSchematic(schematic) {
	editingSchematic.materials = JSON.parse(JSON.stringify(schematic.materials));
	for (var i = 0; i < editingSchematic.materials.length; i++) {
		editingSchematic.materials[i].material = document.querySelector("#material-"+i+"-dropdown select").value;
	}
	var stats = JSON.stringify(schematic.stats);
	editingSchematic.stats = JSON.parse(stats);
	editingSchematic.stats.push({"name": "weight", "value": 0, "bar": false, "listeners": [0,1,2,3,4,5]});
	editingSchematic.name = schematic.name;
	editingSchematic.type = document.querySelector("#schematicModal .schematic-mockup").getAttribute("data-type");
	calculateWeight();
}

function switchModalFromDefaultToEdit() {
	var schematicType = document.querySelector("#schematicModal .schematic-mockup").getAttribute("data-type");
	var editBtn = document.getElementById("modal-edit-btn");
	editBtn.innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i>';
	editBtn.removeEventListener("click", switchModalFromDefaultToEdit);
	editBtn.addEventListener("click", denySaveWithSnackbar);	
	var schematic = schematics[schematicType];
	var materials = schematic.materials;
	for (var i = 0; i < materials.length; i++){
		var materialDropdown = document.querySelector("#material-"+i+"-dropdown select");
		if (materials[i].type === "woodmetal") {
			materialDropdown.innerHTML = metals + "<option disabled>──────────</option>" + woods;
		} else if (materials[i].type === "wood") {
			materialDropdown.innerHTML = woods;
		} else if (materials[i].type === "metal") {
			materialDropdown.innerHTML = metals;
		}
		document.getElementById("material-"+i+"-name").innerHTML = materials[i].name + ' <span class="wa-header" id="material-'+i+'-amount">&times; '+materials[i].amount+'</span>';
		document.getElementById("material-"+i+"-quality").type = "number";
		document.getElementById("material-"+i+"-dropdown").classList.remove("hidden");
		document.getElementById("material-"+i+"-dropdown").value = document.getElementById("material-"+i+"-dropdown").firstElementChild.getAttribute("value");
	}
	loadEditingSchematic(schematics[schematicType]);
	bindListenersToInput();
}

function loadModalWithSchem(schem, mode, options) {
	mode = mode || "default";
	var schematic = schematics[schem];
	document.querySelector("#schematicModal .schematic-mockup").setAttribute("data-type", schem);
	if (mode === "edit"){
		document.getElementById("modal-edit-btn").innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i>';
		document.getElementById("modal-edit-btn").removeEventListener("click", switchModalFromDefaultToEdit);
		document.getElementById("modal-edit-btn").addEventListener("click", denySaveWithSnackbar);
	} else if (mode === "default") {
		document.getElementById("modal-edit-btn").innerHTML = '<i class="fa fa-plus-circle" aria-hidden="true"></i>';
		document.getElementById("modal-edit-btn").removeEventListener("click", denySaveWithSnackbar);
		document.getElementById("modal-edit-btn").addEventListener("click", switchModalFromDefaultToEdit);
	}
	document.querySelector("#schematic-name").value = schematic.name;
	document.querySelector("#schem-detail").innerText = schematic.description;
	document.getElementById("schem-pic").setAttribute("src", "https://res.cloudinary.com/shipyard/image/upload/v1517251942/" + schem + ".png");
	var materials = schematic.materials;
	var iconurl;
	for (var i = 0; i < materials.length; i++){
		var materialDropdown = document.querySelector("#material-" + i + "-dropdown select");
		if (materials[i].type === "woodmetal") {
			iconurl = "https://res.cloudinary.com/shipyard/image/upload/v1517251942/WoodMetalResource.png"; 
			materialDropdown.innerHTML = (mode === "edit") ? metals + "<option disabled>──────────</option>" + woods : "";
		} else if (materials[i].type === "metal") {
			iconurl = "https://res.cloudinary.com/shipyard/image/upload/v1517251942/MetalResource.png";
			materialDropdown.innerHTML = (mode === "edit") ? metals : "";
		} else if (materials[i].type === "wood") {
			iconurl = "https://res.cloudinary.com/shipyard/image/upload/v1517251942/WoodResource.png";
			materialDropdown.innerHTML = (mode === "edit") ? woods : "";
		}
		document.querySelector("#material-"+i+" img").setAttribute("src", iconurl);
		if (mode === "edit") {
			document.getElementById("material-"+i+"-name").innerHTML = materials[i].name + ' <span class="wa-header" id="material-'+i+'-amount">&times; '+materials[i].amount+'</span>';
			document.getElementById("material-"+i+"-dropdown").classList.remove("hidden");
			document.getElementById("material-"+i+"-quality").type = "number";
			try {
				materialDropdown.value = options.materials[i].material
			} catch (err) {
				console.log("BIG ERROR! loadModalWithSchem was called into edit without a reference schematic")
				showSnackbar("Error launching modal into edit mode");
			}
		} else if (mode === "default"){
			document.getElementById("material-"+i+"-name").innerHTML = materials[i].name + '<span class="wa-header material-detail" id="material-'+i+'-amount">&times; '+materials[i].amount+'</span>';
			document.getElementById("material-"+i+"-dropdown").classList.add("hidden");
		}
		document.getElementById("material-"+i).classList.remove("hidden");
	}  
	var stats = schematic.stats;
	for (var i = 0; i < stats.length; i++){
		if (stats[i].bar !== false) {
			document.querySelector("#stat-bar-"+i+" .left").innerText = stats[i].name;
			document.querySelector("#stat-bar-"+i+" .right").innerText = stats[i].value;
			document.querySelector("#stat-bar-"+i+" .stat-bar-meter").classList.remove("width0");
			document.querySelector("#stat-bar-"+i+" .stat-bar-meter").style.width = stats[i].value+"%";
		}
	}
	schemModal.style.display = "block";
}

function wipeModalForClosing() {
	document.getElementById("schem-weight").innerText = "0 kg";
	for (var i = 0; i < 6; i++) {
		document.querySelector("#material-" + i + "-dropdown select").innerHTML = "";
		document.querySelector("#material-" + i + "-dropdown select").value = "";
		document.querySelector("#material-"+i).classList.add("hidden");
		document.getElementById("material-"+i+"-quality").type = "hidden";
		document.getElementById("material-"+i+"-quality").removeAttribute("value");
	}
	for (var i = 0; i < 5; i++) {
		document.querySelector("#stat-bar-"+i+" .left").innerText = "";
		document.querySelector("#stat-bar-"+i+" .right").innerText = "";
		document.querySelector("#stat-bar-"+i+" .stat-bar-meter").style.width = "0%";
		document.querySelector("#stat-bar-"+i+" .stat-bar-meter").style.background = "#668ec3";		
	}
}

loadSchematicList(function () {
	console.log("Loaded Schematic List");
	loadMaterialBoosts(function () {
		console.log("Loaded Material Boosts");
		window.addEventListener("click", function(event) {
			if (event.target == schemModal) {closeModal()}
		});
		bindAndInitialiseCollapse();
		var acc = document.getElementsByClassName("toggleable");
		var i;

		for (i = 0; i < acc.length; i++) {
		  acc[i].addEventListener("click", function() {
			this.classList.toggle("active");
			var panel = this.nextElementSibling;
			if (panel.style.maxHeight){
			  panel.style.maxHeight = null;
			  this.innerHTML = "+";
			} else {
			  panel.style.maxHeight = panel.scrollHeight + "px";
			  this.innerHTML = "-";
			} 
		  });
		}
	});
});
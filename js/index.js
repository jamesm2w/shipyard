var modalMode = "default";
var metals = '<option value="aluminium">Aluminium</option><option value="titanium">Titanium</option><option value="tin">Tin</option><option value="iron">Iron</option><option value="steel">Steel</option><option value="bronze">Bronze</option><option value="nickel">Nickel</option><option value="copper">Copper</option><option value="silver">Silver</option><option value="lead">Lead</option><option value="gold">Gold</option><option value="tungsten">Tungsten</option>';
var woods = '<option value="cedar">Cedar</option><option value="hemlock">Hemlock</option><option value="chestnut">Chestnut</option><option value="elm">Elm</option><option value="birch">Birch</option><option value="ash">Ash</option><option value="oak">Oak</option><option value="palm">Palm</option>';
var schematicdata;
var boosts;
var currentship = [
{"id": "0","type": "helm","name": "Helm","materials": [{"name": "Casing","amount": 80,"type": "woodmetal","mat": "aluminium"},{"name": "Mechanical Internals","amount": 40,"type": "metal","mat": "aluminium"},{"name": "Flight Stick","amount": 20,"type": "metal","mat": "aluminium"}],"stats": [{"name": "Resilience","value": 25},{"name": "Weight","value": 36.4,"bar": false}]},
{"id": "1","type": "helm_of_the_claw","name": "Helm of the Claw","materials": [{"name": "Casing","amount": 80,"type": "metal","mat": "aluminium"},{"name": "Mechanical Internals","amount": 40,"type": "metal","mat": "aluminium"},{"name": "Flight Stick","amount": 20,"type": "metal","mat": "aluminium"}],"stats": [{"name": "Resilience","value": 25},{"name": "Weight","value": 36.4,"bar": false}]}];
$.getJSON("../util/data/materials.json", function (materialdata) {
  boosts = materialdata

  $.getJSON("../util/data/schematics.json", function(schdata) {
    schematicdata = schdata;

    // Load up the saved ship parts
    for (var i = 0; i < currentship.length; i++){
      createSchematicView(currentship[i]);
    }

    var calc = function() {
      let power = $("#power").val();
      let weight = $("#weight").val();

      let result = Math.sqrt(((power*2)/weight)) * 50;
      $("#speed").text(Math.round(result * 100) / 100);
    }

    $("#power").on("change", calc);
    $("#weight").on("change", calc);

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

    var mats = document.getElementsByClassName(".material-select");
    for (var i = 0; i < mats.length; i++) {
      mats[i].addEventListener("change", function () {
        if (modalMode === "edit") {
          let type = document.getElementById('schematicModal').getAttribute("data-type");
          let schematic = schematicdata[type];
          let newVal = mats[i].value;
          
          let materials = schematic.materials;
          for (var i = 0; i < materials.length; i++) {
            if ("material-"+i+"-dropdown" === mats.parentElement.id){
              
            }
          }
        }
      });
    }

  });
});

var schemModal = document.getElementById('schematicModal');

window.onclick = function(event) {
    if (event.target == schemModal) {closeModal()}
}

function openModal(schematic) {
  $("#modal-edit-btn").html('<i class="fa fa-plus-circle" aria-hidden="true"></i>').unbind("click");
  defaultModalMode(schematic);
  schemModal.style.display = "block"; // Finally show the modal
}

function closeModal() {
  schemModal.style.display = "none";
}

function modalEditMode(id) {
  let schematic = currentship[id];
  $("#modal-edit-btn").html('<i class="fa fa-floppy-o" aria-hidden="true"></i>').click((event) => {showSnackbar('Saving data is not yet implemented')});
  $("#schematic-name").val(schematic.name);
  schemModal.setAttribute("data-type", schematic.type);
  $("#schem-detail").text(schematic.description);
  let materials = schematic.materials
  let iconurl;
  for (var i = 0; i < materials.length; i++){
    $("#material-"+i+"-name").text(materials[i].name);
    $("#material-"+i+"-name").append(' <span class="wa-header" id="material-'+i+'-amount">&times; '+materials[i].amount+'</span>');
    if (materials[i].type === "woodmetal") { // Switch between different icons, "clas" is for the dropdown classes
      let iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodMetalResource.png?1515827616899";
      $("#material-"+i+"-dropdown select").html(metals+"<option disabled>──────────</option>"+woods).val(materials[i].mat);
    } else if (materials[i].type === "metal") {
      let iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FMetalResource.png?1515826820099";
      $("#material-"+i+"-dropdown select").html(metals).val(materials[i].mat);
    } else if (materials[i].type === "wood") {
      let iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodResource.PNG?1515827628028";
      $("#material-"+i+"-dropdown select").html(woods).val(materials[i].mat);
    }
    $("#material-"+i+" img").attr("src", iconurl);
    $("#material-"+i).removeClass("hidden");

    $("#material-"+i+"-dropdown").removeClass("hidden").css("width", "70%");
  }
  let stats = schematic.stats;
  for (var i = 0; i < stats.length; i++){
    if (stats[i].bar !== false){
      $("#stat-bar-"+i+" .left").text(stats[i].name);
      $("#stat-bar-"+i+" .right").text(stats[i].value);
      $("#stat-bar-"+i+" .stat-bar-meter").removeClass("width0").css("width", stats[i].value+"%");
    } else if (stats[i].name === "Weight") {
      $("#schem-weight").text(stats[i].value + " kg").attr("id", id+"schem-weight");
    }
  }

  modalMode = "edit";
}

function defaultModalMode(schematic) {
  schematic = schematicdata[schematic];
  $("#schematic-name").val(schematic.name);
  $("#schem-detail").text(schematic.description);
  let materials = schematic.materials
  for (var i = 0; i < materials.length; i++){
    $("#material-"+i+"-dropdown").addClass("hidden");
    $("#material-"+i+"-name").text(materials[i].name);
    $("#material-"+i+"-name").append('<span class="wa-header material-detail" id="material-2-amount">&times; '+materials[i].amount+'</span>');
    if (materials[i].type === "woodmetal") { // Switch between different icons, "clas" is for the dropdown classes
      iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodMetalResource.png?1515827616899";
    } else if (materials[i].type === "metal") {
      iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FMetalResource.png?1515826820099";
    } else if (materials[i].type === "wood") {
      iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodResource.PNG?1515827628028";
    }
    $("#material-"+i+" img").attr("src", iconurl);
    $("#material-"+i).removeClass("hidden");
  }  
  let stats = schematic.stats;
  for (var i = 0; i < stats.length; i++){
    $("#stat-bar-"+i+" .left").text(stats[i].name);
    $("#stat-bar-"+i+" .right").text(stats[i].value);
    $("#stat-bar-"+i+" .stat-bar-meter").removeClass("width0").css("width", stats[i].value+"%");
  }

  modalMode = "default";
}

function modalViewMode (id) {

  modalMode = "view";
}

function createSchematicView(schematic) {
  let id = schematic.id
  let master_schematic = schematicdata[schematic.type];
  let html = $.parseHTML('<div class="wa-panel schematic-mockup" style="margin-bottom: 10px;"> <input placeholder="Schematic Name" value="" id="generic-schematic-name" style="width: 80%;" class="wa-input schem-name" disabled> <button style="display:inline-block; font-size: 24px; text-align: center; width: 9%; vertical-align: top;" class="wa-header add-btn" onclick="openModal(\''+schematic["type"]+'\',\''+schematic["id"]+'\');"><i class="fa fa-pencil" aria-hidden="true"></i></button> <button style="display:inline-block; font-size: 24px; text-align: center; width: 9%; vertical-align: top;" class="wa-header add-btn toggleable">&#43;</button> <div class="toggle-panel"> <div class="row schem-upper"> <div class="col-4"> <div class="material-section hidden" id="generic-material-0"> <img src="https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodMetalResource.png?1515827616899" class="material-img"> <span class="material-detail" id="generic-material-0-name">Casing</span> <span class="wa-header material-detail" id="generic-material-0-amount">80<span id="generic-material-0-type" style="font-size: 10px">&times; Aluminium</span></span> </div><div class="material-section hidden" id="generic-material-2"> <img src="https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FMetalResource.png?1515826820099" class="material-img"> <span class="material-detail" id="generic-material-2-name">Flight Stick</span> <span class="wa-header material-detail" id="generic-material-2-amount">20<span id="generic-material-2-type" style="font-size: 10px">&times; Aluminium</span></span> </div><div class="material-section hidden" id="generic-material-4"> <img src="https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodMetalResource.png?1515827616899" class="material-img"> <span class="material-detail" id="generic-material-4-name">Material Section 5</span> <span class="wa-header material-detail" id="generic-material-4-amount">100<span id="generic-material-4-type" style="font-size: 10px">&times; Aluminium</span></span> </div></div><div class="col-4"> <img height="150px" id="generic-schem-pic" src="https://res.cloudinary.com/shipyard/image/upload/v1515844301/MountedBox.png"> <div style="display:block; text-align: center; background-color: rgba(0,0,0,0.3); width: 100%; height: 100%;" id="generic-schem-weight">0 kg</div></div><div class="col-4"> <div class="material-section" id="generic-material-1"> <img src="https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FMetalResource.png?1515826820099" class="material-img"> <span class="material-detail" id="generic-material-1-name" style="font-size:12px;">Mechanical Internals</span> <span class="wa-header material-detail" id="generic-material-1-amount">40<span id="generic-material-1-type" style="font-size: 10px">&times; Aluminium</span></span> </div><div class="material-section hidden" id="generic-material-3"> <img src="https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodMetalResource.png?1515827616899" class="material-img"> <span class="material-detail" id="generic-material-3-name">Material Section 4</span> <span class="wa-header material-detail" id="generic-material-3-amount">100<span id="generic-material-3-type" style="font-size: 10px">&times; Aluminium</span></span> </div><div class="material-section hidden" id="generic-material-5"> <img src="https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodMetalResource.png?1515827616899" class="material-img"> <span class="material-detail" id="generic-material-5-name">Material Section 6</span> <span class="wa-header material-detail" id="generic-material-5-amount">100<span id="generic-material-5-type" style="font-size: 10px">&times; Aluminium</span></span> </div></div><div class="col-12 schem-detail" id="generic-schem-detail"> Helm component for attaching to ships: this is needed to pilot a ship. </div></div><div class="schem-lower"> <div class="stat-bar-wrapper" id="generic-stat-bar-0"> <div class="stat-bar-meter width0"></div><span class="stat-bar-label left">Resilience</span> <span class="stat-bar-label right">25</span> </div><div class="stat-bar-wrapper" id="generic-stat-bar-1"> <div class="stat-bar-meter width0"></div><span class="stat-bar-label left"></span> <span class="stat-bar-label right"></span> </div><div class="stat-bar-wrapper" id="generic-stat-bar-2"> <div class="stat-bar-meter width0"></div><span class="stat-bar-label left"></span> <span class="stat-bar-label right"></span> </div><div class="stat-bar-wrapper" id="generic-stat-bar-3"> <div class="stat-bar-meter width0"></div><span class="stat-bar-label left"></span> <span class="stat-bar-label right"></span> </div><div class="stat-bar-wrapper" id="generic-stat-bar-4"> <div class="stat-bar-meter width0"></div><span class="stat-bar-label left"></span> <span class="stat-bar-label right"></span> </div></div></div></div>');        $("#schematic-name").val(schematic.name);
  $("#ship-part-list").append(html);
  $("#generic-schem-detail").text(schematic.description).attr("id",id+"-schem-detail");
  $("#generic-schematic-name").val(schematic.name).attr("id", id+"-schematic-detail");
  let materials = master_schematic.materials;
  let mats = schematic.materials;
  for (var i = 0; i < materials.length; i++){
    $("#generic-material-"+i+"-name").text(materials[i].name).attr("id", id+"-material-"+i+"-name");
    $("#generic-material-"+i+"-amount").text(materials[i].amount + "× " + mats[i].mat).attr("id", id+"-material-"+i+"-amount");
    if (materials[i].type === "woodmetal") { 
      iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodMetalResource.png?1515827616899";
    } else if (materials[i].type === "metal") {
      iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FMetalResource.png?1515826820099";
    } else if (materials[i].type === "wood") {
      iconurl = "https://cdn.glitch.com/207b7d3e-84f3-40e3-b2ba-fb11865124a8%2FWoodResource.PNG?1515827628028";
    }
    $("#generic-material-"+i+" img").attr("src", iconurl);
    $("#generic-material-"+i).removeClass("hidden").attr("id", id+"-material-"+i);;
  }        
  let stats = schematic.stats;
  for (var i = 0; i < stats.length; i++){
    if (stats[i].bar !== false) {
      $("#generic-stat-bar-"+i+" .left").text(stats[i].name);
      $("#generic-stat-bar-"+i+" .right").text(stats[i].value);
      $("#generic-stat-bar-"+i+" .stat-bar-meter").removeClass("width0").css("width", stats[i].value+"%");
      $("#generic-stat-bar-"+i).attr("id", id+"-stat-bar-"+i);
    } else if (stats[i].name === "Weight") {
      $("#generic-schem-weight").text(stats[i].value + " kg").attr("id", id+"schem-weight");
    }
  }       
}

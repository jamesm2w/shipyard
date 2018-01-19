function getQueryVariable (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function cFs(status){
  if(status == "up"){
    return "#76ff03"; // Server is ONLINE
  } else if (status == "maintenance") {
    return "#d50000";
  } else if (status == "low") {
    return "#fff176"; //Low Population
  } else if (status == "medium") {
    return "#ffc107"; // Medium Population
  } else if (status == "high") {
    return "#e65100";
  } else {
    return "#ff5722"; // Some other value (deep orange)
  }
}

function showSnackbar(message) {
    var x = document.getElementById("snackbar");
    x.innerText = message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function switchPage(next) {
  let nextPage = document.getElementById(next), prevPage = document.querySelector(".activePage");
  if (nextPage.id == prevPage.id) {
    return false;
  }
  
  document.getElementById("mobile-nav-" + next).className += " active";
  document.getElementById("mobile-nav-" + prevPage.id).className = "mobile-nav-link";
  document.getElementById("nav-" + next).className += " active";
  document.getElementById("nav-" + prevPage.id).className = "nav-link";
  
  nextPage.className += " activePage";
  prevPage.className = "section";

  closeNav();
}

function proccessData(data){
  $("#servers").empty();
  $.each(data, function (serverID, status){
    $("#servers").append("\
  <div class='col-3 wa-panel' id='"+serverID+"'>\
    <h3 class='wa-header'>"+status["name"]+"</h3>\
    <p>STATUS: <span style='color: "+cFs(status["status"])+"; text-transform: uppercase; font-weight: 700;'>"+status["status"]+"</span><br> POPULATION: <span style='color: "+cFs(status["population"])+"; text-transform: uppercase; font-weight: 700;'>"+status["population"]+"</span></p>\
  </div>\
  ");
  });
  let datetime = new Date().toLocaleString();
  $("#last-checked").text(datetime);
}

function openNav() {
  document.getElementById("mobileSidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mobileSidenav").style.width = "0";
}

function checkAPI(){
  $.ajax({
    "url":"https://wa.glitch.me/api",
    "success": function (data) {
      console.log(data);
      $.each(data, function (server, status) {
        $("#"+server+"-pop").text(status[1]);
        $("#"+server+"-status").removeClass("maintenance up").addClass(status[0]);

        $("#mobile-"+server+"-pop").text(status[1]);
        $("#mobile-"+server+"-status").removeClass("maintenance up").addClass(status[0]);
      });
    },
    "error": function (err) {
      throw err;
    }
  });
}

getdata();
checkAPI();
setInterval(checkAPI(), 30000);

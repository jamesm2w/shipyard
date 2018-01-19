function getQueryVariable (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function showSnackbar(message) {
    var x = document.getElementById("snackbar");
    x.innerText = message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function openNav() {
  document.getElementById("mobileSidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mobileSidenav").style.width = "0";
}

function checkAPI(){
  var request = new XMLHttpRequest();
  request.open('GET', 'https://wa.glitch.me/api', true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      Object.keys(data).forEach(function (server) {
        let status = data[server];
        document.querySelector("#"+server+"-pop").innerText = status[1];
        let statusEl = document.querySelector("#"+server+"-status");
        statusEl.classList.remove("maintenance", "up")
        statusEl.classList.add(status[0]);
      });
    } else {
      console.log(request.responseText);
    }
  };
  request.onerror = function () {
    console.log("Error with API request");
  };
  request.send();
}

checkAPI();
setInterval(checkAPI(), 30000);

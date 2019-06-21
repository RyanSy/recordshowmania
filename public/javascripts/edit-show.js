var state = document.getElementById('selectedState').value;

setSelectedState(state);

function setSelectedState(value) {
  var options = document.getElementsByTagName("option");
  for (var i = 0; i < options.length; i++) {
    if (options[i].value == value) {
      options[i].selected = true;
    }
  }
}

var earlyAdmissionYes = document.getElementById('earlyAdmissionYes');
var earlyAdmissionNo = document.getElementById('earlyAdmissionNo');
var earlyAdmissionFields = document.getElementById('earlyAdmissionFields');

function displayEarlyAdmissionFields() {
  if (earlyAdmissionYes.checked) {
    earlyAdmissionFields.className = 'd-block';
    earlyAdmissionNo.removeAttribute('checked');
  }
  if (earlyAdmissionNo.checked) {
    earlyAdmissionFields.className = 'd-none';
    earlyAdmissionYes.removeAttribute('checked');
  }
}

function addFeaturedDealer() {
  var div = document.createElement("div");
  var text = document.createElement("input");
  var deleteButton = document.createElement("input");
  var featuedDealersArray = document.getElementsByClassName("featured-dealer");

  for (var i = 0; i <= featuedDealersArray.length; i++) {
    div.setAttribute("id", "featuredDealer" + i);
    deleteButton.setAttribute("id", "featuredDealerDeleteButton" + i);
  }

  div.setAttribute("class", "featured-dealer form-inline");
  text.setAttribute("type", "text");
  text.setAttribute("name", "featured_dealers");
  text.setAttribute("class", "form-control col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3");
  deleteButton.setAttribute("type", "button");
  deleteButton.setAttribute("class", "btn btn-danger ml-2 mb-3");
  deleteButton.setAttribute("onclick", "deleteFeaturedDealer()");
  deleteButton.setAttribute("value", "Delete");

  div.appendChild(text);
  div.appendChild(deleteButton);

  document.getElementById("featuedDealersContainer").appendChild(div);
}

function deleteFeaturedDealer() {
  var deleteButtonID = document.getElementById(event.target.id);
  var featuredDealerDiv = document.getElementById(deleteButtonID.closest("div").id);
  console.log(deleteButtonID);
  console.log(featuredDealerDiv);
  featuredDealerDiv.parentNode.removeChild(featuredDealerDiv);
}

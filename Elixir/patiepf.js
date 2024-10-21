const fileUpload = document.getElementById('file-upload');
const profileImg = document.getElementById('profile-img');
fileUpload.addEventListener('change', function() {
const file = this.files[0];
if (file) {
const reader = new FileReader();
reader.onload = function(event) {
profileImg.setAttribute('src', event.target.result);
}
reader.readAsDataURL(file);
}
});

function saveDetails() {
const age = document.getElementById("age").value;
const bloodGroup = document.getElementById("blood-group").value;
const chronicIssues = document.getElementById("chronic-issues").value;
const allergies = document.getElementById("allergies").value;
const recentSurgeries =
document.getElementById("recent-surgeries").value;
// You can store these details locally in the browser
localStorage.setItem("patientAge", age);
localStorage.setItem("bloodGroup", bloodGroup);
localStorage.setItem("chronicIssues", chronicIssues);
localStorage.setItem("allergies", allergies);
localStorage.setItem("recentSurgeries", recentSurgeries);
// Optionally alert the user
alert("Details Saved!");
}
let idGenerated = false; // Flag to ensure ID is only generated once
document.getElementById("generateId").addEventListener("click", function
() {
if (!idGenerated) {
const uniqueId = "ID" + Math.floor(Math.random() * 1000000);
document.getElementById("id").value = uniqueId;
idGenerated = true; // Set flag to true after first generation
} else {
alert("ID has already been generated.");
}
});
document.getElementById("signupForm").addEventListener("submit", function
(event) {
event.preventDefault(); // Prevents default form submission
const fullname = document.getElementById("fullname").value;
const username = document.getElementById("username").value;
const password = document.getElementById("password").value;
const mobile = document.getElementById("mobile").value;
const id = document.getElementById("id").value;
if (fullname && username && password && mobile && id) {
alert("Sign-up successful!");
} else {
alert("Please fill all fields.");
}
});
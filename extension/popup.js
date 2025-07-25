document.getElementById("enableBtn").addEventListener("click", () => {
  const uid = document.getElementById("userId").value.trim();
  if (uid) {
    localStorage.setItem("jobAgentUserId", uid);
    alert("✅ Autofill Enabled for user: " + uid);
  } else {
    alert("❌ Please enter a valid user ID");
  }
});

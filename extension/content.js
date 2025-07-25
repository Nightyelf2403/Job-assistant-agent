function createAutofillButton() {
  const button = document.createElement("button");
  button.innerText = "🧠 Autofill with JobAssistantAgent";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = 10000;
  button.style.padding = "10px 16px";
  button.style.backgroundColor = "#6366f1";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  button.onclick = handleAutofill;

  document.body.appendChild(button);
}

async function handleAutofill() {
  const inputs = document.querySelectorAll("input, textarea");
  const questions = [];

  inputs.forEach((el) => {
    const label = document.querySelector(`label[for="${el.id}"]`);
    const questionText = label ? label.innerText : el.placeholder || "Unnamed field";
    questions.push(questionText);
  });

  const response = await fetch("http://localhost:5050/api/generate/autofill-answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: localStorage.getItem("jobAgentUserId") || "demo",
      questions
    })
  });

  const data = await response.json();

  if (data.answers) {
    inputs.forEach((el, i) => {
      if (data.answers[i]) {
        el.value = data.answers[i];
      }
    });
    alert("✅ Fields autofilled by JobAssistantAgent!");
  } else {
    alert("❌ AI response failed.");
  }
}

createAutofillButton();
function createAutofillButton() {
  const button = document.createElement("button");
  button.innerText = "🧠 Autofill with JobAssistantAgent";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = 10000;
  button.style.padding = "10px 16px";
  button.style.backgroundColor = "#6366f1";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  button.onclick = handleAutofill;

  document.body.appendChild(button);
}

async function handleAutofill() {
  const inputs = document.querySelectorAll("input, textarea");
  const questions = [];

  inputs.forEach((el) => {
    const label = document.querySelector(`label[for="${el.id}"]`);
    const questionText = label ? label.innerText : el.placeholder || "Unnamed field";
    questions.push(questionText);
  });

  const response = await fetch("http://localhost:5050/api/generate/autofill-answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: localStorage.getItem("jobAgentUserId") || "demo",
      questions
    })
  });

  const data = await response.json();

  if (data.answers) {
    inputs.forEach((el, i) => {
      if (data.answers[i]) {
        el.value = data.answers[i];
      }
    });
    alert("✅ Fields autofilled by JobAssistantAgent!");
  } else {
    alert("❌ AI response failed.");
  }
}

createAutofillButton();

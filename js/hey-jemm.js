(function () {
  var scenarios = [
    {
      chip: "Arrive home",
      prompt: "I'm home",
      response: ["Welcome home, Elena.", "Everything's ready for you."]
    },
    {
      chip: "Prepare meeting",
      prompt: "Set up a meeting room",
      response: ["Room 3 is ready.", "Display connected and lights adjusted."]
    },
    {
      chip: "Focus & study",
      prompt: "Help me focus",
      response: ["Focus mode on.", "Notifications paused and lighting set."]
    }
  ];

  var panel = document.getElementById("heyJemmPanel");
  if (!panel) return;

  var promptEl = document.getElementById("heyJemmPrompt");
  var responseEl = document.getElementById("heyJemmResponse");
  var chips = panel.querySelectorAll(".chip-btn");

  function setScenario(index) {
    var s = scenarios[index];
    if (!s) return;
    promptEl.textContent = s.prompt;
    responseEl.innerHTML = s.response.map(function (line) {
      return "<span>" + line + "</span>";
    }).join("<br>");
    chips.forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === index);
    });
  }

  chips.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      setScenario(index);
    });
  });

  setScenario(0);
})();

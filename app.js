let data = JSON.parse(localStorage.getItem("goals4life")) || [];
let theme = localStorage.getItem("theme") || "light";

let currentYear = null;
let currentGoal = null;
let screen = "years";
let currentFilter = "Todas";

const main = document.getElementById("main");
const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");
const addBtn = document.getElementById("addBtn");
const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const filterSelect = document.getElementById("filterSelect");

document.body.classList.toggle("dark", theme === "dark");

/* UTIL */
function save() {
  localStorage.setItem("goals4life", JSON.stringify(data));
}
function openModal(id){ document.getElementById(id).classList.remove("hidden"); }
function closeModal(id){ document.getElementById(id).classList.add("hidden"); }

/* THEME */
themeBtn.onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", theme);
  document.body.classList.toggle("dark", theme === "dark");
};

/* YEARS SELECT */
const yearSelect = document.getElementById("yearSelect");
for (let y = 1991; y <= 2191; y++) {
  const o = document.createElement("option");
  o.value = y;
  o.text = y;
  yearSelect.appendChild(o);
}

/* FILTRO */
filterSelect.onchange = () => {
  currentFilter = filterSelect.value;
  openYear(currentYear);
};

/* RENDER ANOS */
function renderYears() {
  screen = "years";
  headerTitle.innerText = "Anos";
  headerSubtitle.innerText = "";
  backBtn.classList.add("hidden");
  filterSelect.classList.add("hidden");
  addBtn.classList.remove("hidden");

  main.innerHTML = "";
  data.forEach(y => {
    const c = document.createElement("div");
    c.className = "card";
    c.innerText = y.year;
    c.onclick = () => openYear(y);
    main.appendChild(c);
  });
}

/* RENDER METAS */
function openYear(y) {
  screen = "goals";
  currentYear = y;

  headerTitle.innerText = `Ano ${y.year}`;
  headerSubtitle.innerText = "Metas";
  backBtn.classList.remove("hidden");
  addBtn.classList.remove("hidden");
  filterSelect.classList.remove("hidden");

  main.innerHTML = "";

  y.goals
  .filter(g => currentFilter === "Todas" || g.category === currentFilter)
  .forEach(g => {
    const c = document.createElement("div");
    c.className = "card";

    const done = g.steps.filter(s => s.done).length;
    const total = g.steps.length || 1;
    const percent = Math.round((done / total) * 100);

    // dias restantes
    let daysText = "Sem data definida";
    if (g.date) {
      const days = Math.ceil((new Date(g.date) - new Date()) / 86400000);
      daysText = days > 0 ? `${days} dias restantes` : "Prazo encerrado";
    }

    c.innerHTML = `
      <div class="goal-title">${g.title}</div>
      <div class="goal-sub">${daysText}</div>
      <div class="goal-sub">${done}/${total} passos concluídos</div>
      <div class="progress">
        <div style="width:${percent}%"></div>
      </div>
    `;

    c.onclick = () => openGoal(g);
    main.appendChild(c);
  });
}

/* RENDER PASSOS */
function openGoal(g) {
  screen = "steps";
  currentGoal = g;

  headerTitle.innerText = g.title;
  headerSubtitle.innerText = g.category;
  addBtn.classList.add("hidden");
  filterSelect.classList.add("hidden");
  backBtn.classList.remove("hidden");

  main.innerHTML = "";

  if (g.image) {
    const img = document.createElement("img");
    img.src = g.image;
    img.style.width = "100%";
    img.style.borderRadius = "12px";
    main.appendChild(img);
  }

  g.steps.forEach(s => {
    const c = document.createElement("div");
    c.className = "card";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = s.done;
    chk.onchange = () => {
      s.done = chk.checked;
      save();
      openGoal(g);
    };

    c.appendChild(chk);
    c.append(" " + s.text);
    main.appendChild(c);
  });

  const edit = document.createElement("button");
edit.innerText = "✏️ Editar Meta";
edit.onclick = () => editGoal(g);
main.appendChild(edit);

const b = document.createElement("button");
b.innerText = "+ Novo Passo";
b.onclick = () => openModal("stepModal");
main.appendChild(b);
}

/* BOTÕES */
addBtn.onclick = () => {
  if (screen === "years") openModal("yearModal");
  else if (screen === "goals") openModal("goalModal");
};

backBtn.onclick = () => {
  if (screen === "steps") openYear(currentYear);
  else renderYears();
};

/* SALVAR */
saveYear.onclick = () => {
  data.push({ year: yearSelect.value, goals: [] });
  save();
  closeModal("yearModal");
  renderYears();
};

saveGoal.onclick = () => {
  const goal = {
    title: goalTitle.value,
    date: goalDate.value,
    category: goalCategory.value,
    steps: [],
    image: null
  };

  const img = goalImage.files[0];
  if (img) {
    const r = new FileReader();
    r.onload = () => {
      goal.image = r.result;
      currentYear.goals.push(goal);
      save();
      openYear(currentYear);
    };
    r.readAsDataURL(img);
  } else {
    currentYear.goals.push(goal);
    save();
    openYear(currentYear);
  }

  closeModal("goalModal");
};

saveStep.onclick = () => {
  currentGoal.steps.push({ text: stepText.value, done: false });
  save();
  closeModal("stepModal");
  openGoal(currentGoal);
};
function editGoal(g) {
  // preencher campos do modal com dados existentes
  goalTitle.value = g.title;
  goalDate.value = g.date;
  goalCategory.value = g.category;

  // limpar input de imagem
  goalImage.value = "";

  // abrir modal
  openModal("goalModal");

  // sobrescrever comportamento do salvar
  saveGoal.onclick = () => {
    g.title = goalTitle.value;
    g.date = goalDate.value;
    g.category = goalCategory.value;

    const img = goalImage.files[0];
    if (img) {
      const r = new FileReader();
      r.onload = () => {
        g.image = r.result;
        save();
        closeModal("goalModal");
        openGoal(g);
      };
      r.readAsDataURL(img);
    } else {
      save();
      closeModal("goalModal");
      openGoal(g);
    }
  };
}
renderYears();
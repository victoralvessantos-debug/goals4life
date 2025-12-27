let data = JSON.parse(localStorage.getItem("goals4life")) || [];
let theme = localStorage.getItem("theme") || "light";

let currentYear = null;
let currentGoal = null;
let screen = "years";
let currentFilter = "Todas";
const saveGoal = document.getElementById("saveGoal");
const saveStep = document.getElementById("saveStep");

const main = document.getElementById("main");
const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");
const addBtn = document.getElementById("addBtn");
const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const bottomActionBtn = document.getElementById("bottomActionBtn");

// Filtro (ponto 5)
const filterSelect = document.getElementById("filterSelect");
const filterLabel = document.getElementById("filterLabel");

filterSelect.onchange = () => {
  currentFilter = filterSelect.value;
  openYear(currentYear);
};

/* UTIL */
function save() { localStorage.setItem("goals4life", JSON.stringify(data)); }
function openModal(id){ document.getElementById(id).classList.remove("hidden"); }
function closeModal(id){ document.getElementById(id).classList.add("hidden"); }

/* THEME */
document.body.classList.toggle("dark", theme === "dark");
themeBtn.onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", theme);
  document.body.classList.toggle("dark", theme === "dark");
};

backBtn.onclick = () => {
  if (screen === "steps") {
    openYear(currentYear);   // volta para metas do ano atual
  } else if (screen === "goals") {
    renderYears();           // volta para lista de anos
  }
};


/* YEARS SELECT */
const yearSelect = document.getElementById("yearSelect");
for (let y = 1991; y <= 2191; y++) {
  const o = document.createElement("option");
  o.value = y; o.text = y;
  yearSelect.appendChild(o);
}
yearSelect.value = new Date().getFullYear();
saveYear.onclick = () => {
  const yearVal = parseInt(yearSelect.value, 10);
  if (!data.some(d => d.year === yearVal)) {
    data.push({ year: yearVal, goals: [] });
    save();
  }
  closeModal("yearModal");
  renderYears();
};

/* RENDER ANOS */
function renderYears() {
  screen = "years";
  headerTitle.innerText = "Anos";
  headerSubtitle.innerText = "";
  backBtn.classList.add("hidden");
  addBtn.classList.remove("hidden");
  bottomActionBtn.classList.remove("hidden");
  bottomActionBtn.innerText = "Determine o ano da meta";
  bottomActionBtn.onclick = () => openModal("yearModal");

  // esconder filtro
  filterSelect.classList.add("hidden");
  filterLabel.classList.add("hidden");

  main.innerHTML = "";

  if (data.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "card";
    emptyMsg.innerText = "Nenhum ano definido ainda.";
    main.appendChild(emptyMsg);
  }

  data.forEach((y, index) => {
    const c = document.createElement("div");
    c.className = "card";

    const yearText = document.createElement("span");
    yearText.innerText = y.year;
    yearText.style.cursor = "pointer";

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.innerText = "🗑️ Excluir";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      data.splice(index, 1);
      save();
      renderYears();
    };

    yearText.onclick = () => openYear(y);

    c.appendChild(yearText);
    c.appendChild(delBtn);
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

  // mostrar filtro
  filterSelect.classList.remove("hidden");
  filterLabel.classList.remove("hidden");

  main.innerHTML = "";

  y.goals
    .filter(g => currentFilter === "Todas" || g.category === currentFilter)
    .forEach((g, index) => {
      const c = document.createElement("div");
      c.className = "card";
      c.classList.add(`category-${g.category}`);

      const done = g.steps.filter(s => s.done).length;
      const total = g.steps.length || 1;
      const percent = Math.round((done / total) * 100);

      let daysText = "Sem data definida";
      if (g.date) {
        const days = Math.ceil((new Date(g.date) - new Date()) / 86400000);
        daysText = days > 0 ? `${days} dias restantes` : "Prazo encerrado";
      }

      let thumbHtml = "";
      if (g.image) {
        thumbHtml = `<img src="${g.image}" class="goal-thumb" alt="thumb">`;
      }

      c.innerHTML = `
  <div class="goal-item">
    ${thumbHtml}
    <span class="goal-title">${g.title}</span>
  </div>
  <div class="goal-sub">Área: ${g.category}</div>
  <div class="goal-sub">${daysText}</div>
  <div class="goal-sub">${done}/${total} passos concluídos</div>
  <div class="progress-container">
    <span class="progress-text">${percent}%</span>
    <div class="progress"><div style="width:${percent}%"></div></div>
  </div>
`;


      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.innerText = "🗑️ Excluir";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        y.goals.splice(index, 1);
        save();
        openYear(y);
      };

      c.appendChild(delBtn);
      c.onclick = () => openGoal(g);
      main.appendChild(c);
    });

  bottomActionBtn.classList.remove("hidden");
  bottomActionBtn.innerText = "Criar meta";
  bottomActionBtn.onclick = () => {
    saveGoal.onclick = createGoal; // reset para criação
    openModal("goalModal");
  };
}

/* RENDER PASSOS */
function openGoal(g) {
  screen = "steps";   // ← garante que estamos na tela de passos
  currentGoal = g;



  headerTitle.innerText = g.title;
  headerSubtitle.innerText = g.category;
  addBtn.classList.add("hidden");
  backBtn.classList.remove("hidden");

  main.innerHTML = "";

  if (g.image) {
    const img = document.createElement("img");
    img.src = g.image;
    img.alt = "Imagem da meta";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "240px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "12px";
    img.style.marginBottom = "12px";
    main.appendChild(img);
  }

  g.steps.forEach((s, index) => {
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

  const span = document.createElement("span");
  span.innerText = " " + s.text;

  const delBtn = document.createElement("button");
  delBtn.className = "delete-btn";
  delBtn.innerText = "🗑️";
  delBtn.style.float = "right";
  delBtn.onclick = () => {
    g.steps.splice(index, 1);
    save();
    openGoal(g);
  };

  c.appendChild(chk);
  c.appendChild(span);
  c.appendChild(delBtn);
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

  bottomActionBtn.classList.add("hidden");
}

/* CRIAR META (ponto 6) */
function createGoal() {
  const goal = {
    title: goalTitle.value.trim(),
    date: goalDate.value,
    category: goalCategory.value,
    steps: [],
    image: null
  };

  if (!goal.title) {
    alert("Informe o título da meta.");
    return;
  }

  const img = goalImage.files[0];
  if (img) {
    const r = new FileReader();
    r.onload = () => {
      goal.image = r.result;
      currentYear.goals.push(goal);
      save();
      closeModal("goalModal");
      openYear(currentYear);
    };
    r.readAsDataURL(img);
  } else {
    currentYear.goals.push(goal);
    save();
    closeModal("goalModal");
    openYear(currentYear);
  }
}

/* EDITAR META (ponto 6) */
function updateGoal(g) {
  const newTitle = goalTitle.value.trim();
  if (!newTitle) {
    alert("Informe o título da meta.");
    return;
  }
  g.title = newTitle;
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
}

function editGoal(g) {
  goalTitle.value = g.title || "";
  goalDate.value = g.date || "";
  goalCategory.value = g.category || "Emocional";
  goalImage.value = "";

  openModal("goalModal");

  // aqui usamos updateGoal em vez de sobrescrever permanentemente
  saveGoal.onclick = () => updateGoal(g);
}
function gerarRelatorio() {
  const agora = new Date();
  let relatorio = `=== Goals4Life - Relatório de Progresso ===\n`;
  relatorio += `Data da impressão: ${agora.toLocaleDateString()} ${agora.toLocaleTimeString()}\n\n`;

  if (data.length === 0) {
    relatorio += "Nenhum ano cadastrado.\n";
  } else {
    // Resumo geral
    const totalMetas = data.reduce((acc, y) => acc + y.goals.length, 0);
    const concluidas = data.reduce((acc, y) => acc + y.goals.filter(g => g.steps.length > 0 && g.steps.every(s => s.done)).length, 0);
    const percentGeral = totalMetas > 0 ? Math.round((concluidas / totalMetas) * 100) : 0;

    relatorio += `Resumo geral:\n`;
    relatorio += `- Anos cadastrados: ${data.length}\n`;
    relatorio += `- Metas totais: ${totalMetas}\n`;
    relatorio += `- Metas concluídas: ${concluidas}\n`;
    relatorio += `- Percentual geral de conclusão: ${percentGeral}%\n\n`;

    // Detalhamento por ano
    data.forEach(y => {
      const total = y.goals.length;
      const concl = y.goals.filter(g => g.steps.length > 0 && g.steps.every(s => s.done)).length;
      const perc = total > 0 ? Math.round((concl / total) * 100) : 0;

      relatorio += `Ano ${y.year}:\n`;
      relatorio += `- Metas: ${total}\n`;
      relatorio += `- Concluídas: ${concl}\n`;
      relatorio += `- Percentual: ${perc}%\n`;

      // Detalhamento das metas
      y.goals.forEach(g => {
        const done = g.steps.filter(s => s.done).length;
        const totalSteps = g.steps.length;
        const percSteps = totalSteps > 0 ? Math.round((done / totalSteps) * 100) : 0;

        // cálculo dos dias restantes
        let diasRestantes = "Prazo não definido";
        if (g.date) {
          const diff = Math.ceil((new Date(g.date) - agora) / 86400000);
          diasRestantes = diff > 0 ? `${diff} dias restantes` : "Prazo encerrado";
        }

        relatorio += `   • Meta: ${g.title}\n`;
        relatorio += `     Área: ${g.category}\n`;
        relatorio += `     Prazo: ${g.date || "não definido"}\n`;
        relatorio += `     ${diasRestantes}\n`;
        relatorio += `     Progresso: ${done}/${totalSteps} passos (${percSteps}%)\n`;

        g.steps.forEach(s => {
          relatorio += `       - ${s.done ? "✔️" : "❌"} ${s.text}\n`;
        });
      });

      relatorio += `\n`;
    });
  }

  // Exporta como arquivo TXT
  const blob = new Blob([relatorio], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_goals4life_${agora.toISOString().slice(0,19)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
function gerarRelatorioPDF() {
  

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const agora = new Date();
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(16);
  doc.text("Goals4Life - Relatório de Progresso", 20, yPos);
  yPos += 10;
  doc.setFontSize(10);
  doc.text(`Data da impressão: ${agora.toLocaleDateString()} ${agora.toLocaleTimeString()}`, 20, yPos);
  yPos += 15;

  if (data.length === 0) {
    doc.text("Nenhum ano cadastrado.", 20, yPos);
  } else {
    // Resumo geral
    const totalMetas = data.reduce((acc, y) => acc + y.goals.length, 0);
    const concluidas = data.reduce((acc, y) => acc + y.goals.filter(g => g.steps.length > 0 && g.steps.every(s => s.done)).length, 0);
    const percentGeral = totalMetas > 0 ? Math.round((concluidas / totalMetas) * 100) : 0;

    doc.setFontSize(12);
    doc.text("Resumo Geral:", 20, yPos); yPos += 8;
    doc.setFontSize(10);
    doc.text(`- Anos cadastrados: ${data.length}`, 20, yPos); yPos += 6;
    doc.text(`- Metas totais: ${totalMetas}`, 20, yPos); yPos += 6;
    doc.text(`- Metas concluídas: ${concluidas}`, 20, yPos); yPos += 6;
    doc.text(`- Percentual geral de conclusão: ${percentGeral}%`, 20, yPos); yPos += 12;

    // Detalhamento por ano
    data.forEach(y => {
      doc.setFontSize(12);
      doc.text(`Ano ${y.year}:`, 20, yPos); yPos += 8;
      doc.setFontSize(10);

      const total = y.goals.length;
      const concl = y.goals.filter(g => g.steps.length > 0 && g.steps.every(s => s.done)).length;
      const perc = total > 0 ? Math.round((concl / total) * 100) : 0;

      doc.text(`- Metas: ${total}`, 25, yPos); yPos += 6;
      doc.text(`- Concluídas: ${concl}`, 25, yPos); yPos += 6;
      doc.text(`- Percentual: ${perc}%`, 25, yPos); yPos += 8;

      y.goals.forEach(g => {
        const done = g.steps.filter(s => s.done).length;
        const totalSteps = g.steps.length;
        const percSteps = totalSteps > 0 ? Math.round((done / totalSteps) * 100) : 0;

        // cálculo dos dias restantes
        let diasRestantes = "Prazo não definido";
        if (g.date) {
          const diff = Math.ceil((new Date(g.date) - agora) / 86400000);
          diasRestantes = diff > 0 ? `${diff} dias restantes` : "Prazo encerrado";
        }

        doc.setFontSize(11);
        doc.text(`• Meta: ${g.title}`, 30, yPos); yPos += 6;
        doc.setFontSize(10);
        doc.text(`Área: ${g.category}`, 35, yPos); yPos += 5;
        doc.text(`Prazo: ${g.date || "não definido"}`, 35, yPos); yPos += 5;
        doc.text(`${diasRestantes}`, 35, yPos); yPos += 5;
        doc.text(`Progresso: ${done}/${totalSteps} passos (${percSteps}%)`, 35, yPos); yPos += 6;

        g.steps.forEach(s => {
  // Limpa o texto para evitar caracteres estranhos
  

  // Define cor e estilo conforme status
  if (s.done) {
    doc.setTextColor(0, 128, 0); // verde
    doc.setFont("helvetica", "bold");
  } else {
    doc.setTextColor(200, 0, 0); // vermelho
    doc.setFont("helvetica", "normal");
  }

  // Imprime passo
  doc.setFontSize(10);
  const textoLimpo = s.text.replace(/[^a-zA-Z0-9À-ÿ\s.,!?()-]/g, "");
doc.text(`${s.done ? "[OK]" : "[ ]"} ${textoLimpo}`, 40, yPos);

 


  // Restaura cor e fonte padrão
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  yPos += 6;
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
});



        yPos += 8;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    });
  }

  // Exporta PDF
  doc.save(`relatorio_goals4life_${agora.toISOString().slice(0,19)}.pdf`);
}

/* SALVAR: STEP */
saveStep.onclick = () => {
  const text = stepText.value.trim().replace(/[^a-zA-Z0-9À-ÿ\s.,!?()-]/g, "");

  if (!text) {
    alert("Descreva o passo.");
    return;
  }
  currentGoal.steps.push({ text, done: false });
  save();
  closeModal("stepModal");
  openGoal(currentGoal);
};

/* INIT */
renderYears();


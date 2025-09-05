const STORAGE_KEY = 'jogadoras';

// JSON
const initialData = [
  {
    nome: 'Andressa Alves',
    posicao: 'Meio-campo',
    clube: 'Corinthians',
    foto: 'assets/andressa.jpg',
    gols: 15,
    assistencias: 10,
    jogos: 28,
    favorita: false,
  },
  {
    nome: 'Dayana Rodríguez',
    posicao: 'Meio-campo',
    clube: 'Corinthians',
    foto: 'assets/dayana.jpg',
    gols: 5,
    assistencias: 12,
    jogos: 30,
    favorita: false,
  },
  {
    nome: 'Mariza',
    posicao: 'Zagueira',
    clube: 'Corinthians',
    foto: 'assets/mariza.jpg',
    gols: 2,
    assistencias: 1,
    jogos: 32,
    favorita: false,
  },
  {
    nome: 'Thaís Regina',
    posicao: 'Zagueira',
    clube: 'Corinthians',
    foto: 'assets/thais.jpg',
    gols: 1,
    assistencias: 2,
    jogos: 25,
    favorita: false,
  },
  {
    nome: 'Letícia Teles',
    posicao: 'Zagueira',
    clube: 'Corinthians',
    foto: 'assets/leticia.jpg',
    gols: 0,
    assistencias: 0,
    jogos: 18,
    favorita: false,
  },
];

//Utilidades de armazenamento 
function generateId() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function initDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = initialData.map((j) => ({ id: generateId(), ...j }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  }
}

function getJogadoras() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler LocalStorage:', e);
    return [];
  }
}

function setJogadoras(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function findIndexById(id) {
  return getJogadoras().findIndex((j) => j.id === id);
}
const uiState = {
  busca: '',
  clube: '',
  ordenacao: '',
  modoEdicao: false,
  idEmEdicao: null,
};


const listaEl = document.getElementById('listaJogadoras');
const buscaEl = document.getElementById('busca');
const filtroClubeEl = document.getElementById('filtroClube');
const ordenarNomeBtn = document.getElementById('ordenarNome');
const ordenarPosicaoBtn = document.getElementById('ordenarPosicao');
const novaJogadoraBtn = document.getElementById('novaJogadora');
const formSectionEl = document.getElementById('formSection');
const formEl = document.getElementById('formJogadora');
const tituloFormEl = document.getElementById('tituloForm');
const cancelarBtn = document.getElementById('cancelar');
// inputs do form
const nomeEl = document.getElementById('nome');
const posicaoEl = document.getElementById('posicao');
const clubeEl = document.getElementById('clube');
const fotoEl = document.getElementById('foto');
const golsEl = document.getElementById('gols');
const assistenciasEl = document.getElementById('assistencias');
const jogosEl = document.getElementById('jogos');

function aplicarBuscaFiltroOrdenacao(arr) {
  let lista = [...arr];

  if (uiState.busca.trim() !== '') {
    const q = uiState.busca.toLowerCase();
    lista = lista.filter(
      (j) => j.nome.toLowerCase().includes(q) || j.posicao.toLowerCase().includes(q)
    );
  }

  if (uiState.clube) {
    lista = lista.filter((j) => j.clube === uiState.clube);
  }

  if (uiState.ordenacao === 'nome') {
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
  } else if (uiState.ordenacao === 'posicao') {
    lista.sort((a, b) => a.posicao.localeCompare(b.posicao) || a.nome.localeCompare(b.nome));
  }
  return lista;
}

function criarCard(j) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${j.foto}" alt="${j.nome}">
    <div class="card-content">
      <h3>${j.nome}</h3>
      <p><strong>Posição:</strong> ${j.posicao}</p>
      <p><strong>Clube:</strong> ${j.clube}</p>
      <div class="stats">
        <span class="stat-pill">⚽ Gols: ${j.gols}</span>
        <span class="stat-pill">🎯 Assist.: ${j.assistencias}</span>
        <span class="stat-pill">📊 Jogos: ${j.jogos}</span>
      </div>
    </div>
    <div class="card-acoes">
      <button class="btn-favorita" data-action="favoritar" data-id="${j.id}" aria-pressed="${j.favorita}">${
        j.favorita ? '★ Favorita' : '☆ Favoritar'
      }</button>
      <button class="btn-editar" data-action="editar" data-id="${j.id}">Editar</button>
      <button class="btn-excluir" data-action="excluir" data-id="${j.id}">Excluir</button>
    </div>
  `;
  return card;
}

function renderLista() {
  const todas = getJogadoras();
  const lista = aplicarBuscaFiltroOrdenacao(todas);
  listaEl.innerHTML = '';
  if (lista.length === 0) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Nenhuma jogadora encontrada.';
    vazio.style.color = '#6b7280';
    listaEl.appendChild(vazio);
    return;
  }
  lista.forEach((j) => listaEl.appendChild(criarCard(j)));
}

function popularFiltroClubes() {
  const clubes = Array.from(new Set(getJogadoras().map((j) => j.clube))).sort();
  filtroClubeEl.innerHTML = '<option value="">Todos os clubes</option>' +
    clubes.map((c) => `<option value="${c}">${c}</option>`).join('');
}

function toggleFavorita(id) {
  const arr = getJogadoras();
  const idx = arr.findIndex((j) => j.id === id);
  if (idx >= 0) {
    arr[idx].favorita = !arr[idx].favorita;
    setJogadoras(arr);
    renderLista();
  }
}

function abrirModalCriar() {
  uiState.modoEdicao = false;
  uiState.idEmEdicao = null;
  tituloFormEl.textContent = 'Cadastrar Jogadora';
  limparFormulario();
  formSectionEl.classList.remove('oculto');
}

function validarFormulario() {
  const nome = nomeEl.value.trim();
  const posicao = posicaoEl.value.trim();
  const clube = clubeEl.value.trim();
  const foto = fotoEl.value.trim();
  const gols = Number(golsEl.value);
  const assist = Number(assistenciasEl.value);
  const jogos = Number(jogosEl.value);

  if (!nome || !posicao || !clube || !foto) return { ok: false, msg: 'Preencha todos os campos de texto.' };
  if ([gols, assist, jogos].some((n) => Number.isNaN(n) || n < 0)) return { ok: false, msg: 'Gols, assistências e jogos devem ser números >= 0.' };
  return { ok: true };
}

function handleCreate(e) {
  e.preventDefault();
  const val = validarFormulario();
  if (!val.ok) { alert(val.msg); return; }

  const nova = {
    id: generateId(),
    nome: nomeEl.value.trim(),
    posicao: posicaoEl.value.trim(),
    clube: clubeEl.value.trim(),
    foto: fotoEl.value.trim(),
    gols: Number(golsEl.value),
    assistencias: Number(assistenciasEl.value),
    jogos: Number(jogosEl.value),
    favorita: false,
  };
  const arr = getJogadoras();
  arr.push(nova);
  setJogadoras(arr);
  alert('Jogadora adicionada com sucesso!');
  formSectionEl.classList.add('oculto');
  popularFiltroClubes();
  renderLista();
}

function prepararEdicao(id) {
  const arr = getJogadoras();
  const item = arr.find((j) => j.id === id);
  if (!item) return;
  uiState.modoEdicao = true;
  uiState.idEmEdicao = id;
  tituloFormEl.textContent = 'Editar Jogadora';
  nomeEl.value = item.nome;
  posicaoEl.value = item.posicao;
  clubeEl.value = item.clube;
  fotoEl.value = item.foto;
  golsEl.value = item.gols;
  assistenciasEl.value = item.assistencias;
  jogosEl.value = item.jogos;
  formSectionEl.classList.remove('oculto');
}

function handleUpdate(e) {
  e.preventDefault();
  const val = validarFormulario();
  if (!val.ok) { alert(val.msg); return; }

  const arr = getJogadoras();
  const idx = arr.findIndex((j) => j.id === uiState.idEmEdicao);
  if (idx < 0) return;
  arr[idx] = {
    ...arr[idx],
    nome: nomeEl.value.trim(),
    posicao: posicaoEl.value.trim(),
    clube: clubeEl.value.trim(),
    foto: fotoEl.value.trim(),
    gols: Number(golsEl.value),
    assistencias: Number(assistenciasEl.value),
    jogos: Number(jogosEl.value),
  };
  setJogadoras(arr);
  alert('Jogadora editada com sucesso!');
  formSectionEl.classList.add('oculto');
  popularFiltroClubes();
  renderLista();
}
function handleDelete(id) {
  const arr = getJogadoras();
  const idx = arr.findIndex((j) => j.id === id);
  if (idx < 0) return;
  arr.splice(idx, 1);
  setJogadoras(arr);
  alert('Jogadora removida com sucesso!');
  popularFiltroClubes();
  renderLista();
}

listaEl.addEventListener('click', function(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  if (action === 'favoritar') toggleFavorita(id);
  if (action === 'editar') prepararEdicao(id);
  if (action === 'excluir') handleDelete(id);
});

buscaEl.addEventListener('input', function() {
  uiState.busca = this.value;
  renderLista();
});

filtroClubeEl.addEventListener('change', function() {
  uiState.clube = this.value;
  renderLista();
});

ordenarNomeBtn.addEventListener('click', function() {
  uiState.ordenacao = 'nome';
  renderLista();
});
ordenarPosicaoBtn.addEventListener('click', function() {
  uiState.ordenacao = 'posicao';
  renderLista();
});

novaJogadoraBtn.addEventListener('click', abrirModalCriar);
cancelarBtn.addEventListener('click', function() {
  formSectionEl.classList.add('oculto');
  limparFormulario();
});

formEl.addEventListener('submit', function(e) {
  if (uiState.modoEdicao) return handleUpdate(e);
  return handleCreate(e);
});

function limparFormulario() {
  formEl.reset();
}

document.addEventListener('DOMContentLoaded', function() {
  initDB();
  popularFiltroClubes();
  renderLista();
});

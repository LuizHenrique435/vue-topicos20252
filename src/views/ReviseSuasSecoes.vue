<template>
  <div class="revise-page">
    <h1>Revise suas Seções</h1>

    <!-- Cadastro -->
    <section class="cadastro">
      <h2>Cadastrar Revisão</h2>
      <form @submit.prevent="handleSubmit">
        <div>
          <label>Título do Trabalho *</label>
          <input v-model="form.tituloTrabalho" required />
        </div>

        <div>
          <label>Título da Seção *</label>
          <!-- Select mostrando combinação Seção — Trabalho -->
          <select v-model="form.secaoId" required>
            <option value="" disabled>Selecione uma seção</option>
            <option
              v-for="s in secoes"
              :key="s.id"
              :value="s.id"
            >
              {{ s.titulo }} — {{ s.trabalho?.titulo || "Sem título de trabalho" }}
            </option>
          </select>
        </div>

        <div>
          <label>Feedback *</label>
          <textarea v-model="form.feedback" required></textarea>
        </div>

        <div>
          <label>Data/Hora Criação *</label>
          <input type="datetime-local" v-model="form.revDataHoraCriacao" required />
        </div>

        <div>
          <label>Data/Hora Correção (opcional)</label>
          <input type="datetime-local" v-model="form.revDataHoraCorrecao" />
        </div>

        <button type="submit">Cadastrar</button>
        <button type="button" @click="limparForm">Limpar</button>
      </form>

      <div v-if="mensagemForm" class="mensagem">{{ mensagemForm }}</div>
    </section>

    <!-- Busca -->
    <section class="busca">
      <h2>Buscar Revisão</h2>
      <div>
        <label>Título da Seção</label>
        <input v-model="buscaSecao" placeholder="Digite parte do título da seção" />
      </div>
      <div>
        <label>Data/Hora de Criação</label>
        <input type="datetime-local" v-model="buscaDataHoraCriacao" />
      </div>
      <button @click="buscarRevisoes">Buscar</button>
      <button @click="carregarTodas">Listar Todas</button>
      <p v-if="mensagemBusca">{{ mensagemBusca }}</p>
    </section>

    <!-- Lista -->
    <section class="tabela">
      <h2>Revisões</h2>
      <table v-if="revisoes.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título do Trabalho</th>
            <th>Título da Seção</th>
            <th>Feedback</th>
            <th>Data Criação</th>
            <th>Data Correção</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in revisoes" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.secao?.trabalho?.tema || r.secao?.trabalho?.titulo || '-' }}</td>
            <td>{{ r.secao?.tema || r.secao?.titulo || '-' }}</td>
            <td>{{ r.feedback }}</td>
            <td>{{ formatDate(r.dataHoraCriacao) }}</td>
            <td>{{ r.dataHoraCorrecao ? formatDate(r.dataHoraCorrecao) : '-' }}</td>
            <td>{{ getSituacao(r) }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else>Nenhuma revisão encontrada.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import revisaoService from "@/services/revisaoService";
import secaoService from "@/services/secaoService"; // serviço de seções

// Estado
const revisoes = ref([]);
const secoes = ref([]);
const mensagemForm = ref("");
const mensagemBusca = ref("");
const buscaSecao = ref("");
const buscaDataHoraCriacao = ref("");

// Formulário
const form = reactive({
  tituloTrabalho: "",
  secaoId: "",
  feedback: "",
  revDataHoraCriacao: "",
  revDataHoraCorrecao: ""
});

// Funções -------------------------------------

onMounted(() => {
  carregarTodas();
  carregarSecoes();
});

async function carregarTodas() {
  try {
    const resp = await revisaoService.listarTodos();
    revisoes.value = resp.data;
    mensagemBusca.value = revisoes.value.length
      ? ""
      : "Nenhuma revisão cadastrada.";
  } catch (e) {
    mensagemBusca.value = "Erro ao carregar revisões.";
  }
}

async function carregarSecoes() {
  try {
    const resp = await secaoService.listarTodos();
    secoes.value = resp.data;
  } catch (e) {
    console.error("Erro ao carregar seções:", e);
  }
}

async function handleSubmit() {
  mensagemForm.value = "";

  if (!form.tituloTrabalho || !form.secaoId || !form.feedback || !form.revDataHoraCriacao) {
    mensagemForm.value = "Preencha todos os campos obrigatórios.";
    return;
  }

  try {
    const dataCriacao = new Date(form.revDataHoraCriacao).toISOString().slice(0, 19);
    const dataCorrecao = form.revDataHoraCorrecao
      ? new Date(form.revDataHoraCorrecao).toISOString().slice(0, 19)
      : null;

    const payload = {
      feedback: form.feedback,
      dataHoraCriacao: dataCriacao,
      dataHoraCorrecao: dataCorrecao,
      secao: { id: form.secaoId } // agora envia o ID diretamente
    };

    console.log("Enviando revisão:", payload);
    await revisaoService.criar(payload);

    mensagemForm.value = "Revisão cadastrada com sucesso!";
    limparForm();
    carregarTodas();
  } catch (e) {
    console.error("Erro ao cadastrar revisão:", e.response?.data || e);
    mensagemForm.value = "Erro ao cadastrar revisão.";
  }
}

function limparForm() {
  form.tituloTrabalho = "";
  form.secaoId = "";
  form.feedback = "";
  form.revDataHoraCriacao = "";
  form.revDataHoraCorrecao = "";
}

async function buscarRevisoes() {
  if (!buscaSecao.value || !buscaDataHoraCriacao.value) {
    mensagemBusca.value = "Informe seção e data/hora para buscar.";
    return;
  }

  try {
    const resp = await revisaoService.buscar(buscaSecao.value, buscaDataHoraCriacao.value);
    revisoes.value = resp.data;
    mensagemBusca.value = revisoes.value.length
      ? ""
      : "Nenhum registro encontrado para os critérios fornecidos.";
  } catch (e) {
    mensagemBusca.value = "Erro ao buscar revisões.";
  }
}

// Utilitários -------------------------------------

function formatDate(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString();
}

function getSituacao(r) {
  if (!r.dataHoraCorrecao) return "pendente";
  const d1 = new Date(r.dataHoraCriacao);
  const d2 = new Date(r.dataHoraCorrecao);
  const diff = (d2 - d1) / (1000 * 60 * 60);
  return `revisada em ${Math.floor(diff)} horas`;
}
</script>

<style scoped>
.revise-page {
  padding: 20px;
  font-family: Arial, sans-serif;
}
h1, h2 {
  color: #333;
}
section {
  border: 1px solid #ccc;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 8px;
}
input, textarea, select {
  width: 100%;
  margin-bottom: 8px;
  padding: 6px;
}
button {
  margin-right: 8px;
  padding: 6px 10px;
  cursor: pointer;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 6px;
}
.mensagem {
  color: green;
  font-weight: bold;
}
</style>

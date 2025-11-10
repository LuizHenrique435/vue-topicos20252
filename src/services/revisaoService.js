// src/services/revisaoService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // URL do seu backend Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  listarTodos() {
    return api.get("/revisao");
  },

  criar(revisao) {
    return api.post("/revisao", revisao);
  },

  buscar(secao, dataHoraCriacao) {
    return api.get("/revisao/busca", {
      params: { secao, dataHoraCriacao },
    });
  },
};

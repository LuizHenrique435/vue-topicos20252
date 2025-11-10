// src/services/secaoService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // URL do backend Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  listarTodos() {
    return api.get("/secao");
  },

  buscarPorId(id) {
    return api.get(`/secao/${id}`);
  },

  criar(secao) {
    return api.post("/secao", secao);
  },

  atualizar(id, secao) {
    return api.put(`/secao/${id}`, secao);
  },

  excluir(id) {
    return api.delete(`/secao/${id}`);
  },
};

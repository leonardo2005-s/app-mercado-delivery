import { describe, it, expect } from "vitest";
import { finalizarPedido, validarEndereco, marcarItemEmFalta } from "./pedido";
import { adicionarItem } from "./carrinho";

const leite = { id: "leite1", nome: "Leite 1 L", precoCentavos: 600 };
const endereco = { nome: "Cliente Teste", rua: "Rua Exemplo", numero: "100", bairro: "Bairro Teste" };

describe("pedido", () => {
  it("aponta campos de endereço faltando", () => {
    expect(validarEndereco({ ...endereco, rua: "" })).toContain("Informe a rua");
  });

  it("não finaliza com carrinho vazio", () => {
    expect(() => finalizarPedido([], endereco)).toThrow("O carrinho está vazio");
  });

  it("não finaliza com endereço incompleto", () => {
    const c = adicionarItem([], leite);
    expect(() => finalizarPedido(c, { ...endereco, numero: "" })).toThrow();
  });

  it("registra item em falta apenas se ele pertence ao pedido", () => {
    const p = finalizarPedido(adicionarItem([], leite), endereco);
    expect(marcarItemEmFalta(p, "leite1").itensEmFalta).toEqual(["leite1"]);
    expect(() => marcarItemEmFalta(p, "inexistente")).toThrow();
  });
});
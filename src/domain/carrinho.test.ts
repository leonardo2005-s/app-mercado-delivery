import { describe, it, expect } from "vitest";
import { adicionarItem, alterarQuantidade, calcularTotal } from "./carrinho";

const arroz = { id: "arroz5", nome: "Arroz 5 kg", precoCentavos: 2500 };

describe("carrinho", () => {
  it("soma a quantidade ao adicionar o mesmo produto duas vezes", () => {
    const c = adicionarItem(adicionarItem([], arroz), arroz);
    expect(c).toHaveLength(1);
    expect(c[0].quantidade).toBe(2);
  });

  it("recalcula o total ao alterar a quantidade", () => {
    const c = alterarQuantidade(adicionarItem([], arroz), "arroz5", 3);
    expect(calcularTotal(c)).toBe(7500);
  });

  it("remove o item quando a quantidade é zero", () => {
    const c = alterarQuantidade(adicionarItem([], arroz), "arroz5", 0);
    expect(c).toHaveLength(0);
  });

  it("rejeita quantidade fracionada", () => {
    expect(() => alterarQuantidade(adicionarItem([], arroz), "arroz5", 1.5)).toThrow();
  });
});
import { describe, it, expect } from "vitest";
import type { Carrinho } from "../domain/tipos";
import { adicionarItem, alterarQuantidade } from "../domain/carrinho";
import { finalizarPedido } from "../domain/pedido";

const arroz = { id: "arroz5", nome: "Arroz 5 kg", precoCentavos: 2500 };
const leite = { id: "leite1", nome: "Leite 1 L", precoCentavos: 600 };
const sabao = { id: "sabao", nome: "Sabão em pó", precoCentavos: 900 };
const endereco = { nome: "Cliente Teste", rua: "Rua Exemplo", numero: "100", bairro: "Bairro Teste" };

describe("fluxo central: ajustar quantidade e finalizar pedido", () => {
  it("fecha o pedido com total de R$ 65,00 e status em separação", () => {
    let carrinho = [arroz, leite, sabao].reduce<Carrinho>(adicionarItem, []);
    carrinho = alterarQuantidade(carrinho, "arroz5", 2);

    const pedido = finalizarPedido(carrinho, endereco);

    expect(pedido.totalCentavos).toBe(6500);
    expect(pedido.status).toBe("em separação");
    expect(pedido.pagamento).toBe("na entrega");
  });
});
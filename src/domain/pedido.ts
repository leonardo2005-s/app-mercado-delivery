import type { Carrinho, Endereco, Pedido } from "./tipos";
import { calcularTotal } from "./carrinho";

export function validarEndereco(e: Endereco): string[] {
  const erros: string[] = [];
  if (!e.nome.trim()) erros.push("Informe o nome");
  if (!e.rua.trim()) erros.push("Informe a rua");
  if (!e.numero.trim()) erros.push("Informe o número");
  if (!e.bairro.trim()) erros.push("Informe o bairro");
  return erros;
}

export function finalizarPedido(carrinho: Carrinho, endereco: Endereco): Pedido {
  if (carrinho.length === 0) throw new Error("O carrinho está vazio");
  const erros = validarEndereco(endereco);
  if (erros.length > 0) throw new Error(erros.join("; "));

  return {
    id: `PED-${Date.now()}`,
    itens: carrinho,
    totalCentavos: calcularTotal(carrinho),
    endereco,
    pagamento: "na entrega",
    status: "em separação",
    itensEmFalta: [],
  };
}

export function marcarItemEmFalta(pedido: Pedido, produtoId: string): Pedido {
  if (!pedido.itens.some((i) => i.produto.id === produtoId)) {
    throw new Error("Item não pertence ao pedido");
  }
  return { ...pedido, itensEmFalta: [...pedido.itensEmFalta, produtoId] };
}
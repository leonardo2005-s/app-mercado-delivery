import type { Carrinho, Produto } from "./tipos";

export function adicionarItem(carrinho: Carrinho, produto: Produto): Carrinho {
  const existente = carrinho.find((i) => i.produto.id === produto.id);
  if (existente) {
    return carrinho.map((i) =>
      i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
    );
  }
  return [...carrinho, { produto, quantidade: 1 }];
}

export function alterarQuantidade(
  carrinho: Carrinho,
  produtoId: string,
  quantidade: number
): Carrinho {
  if (!Number.isInteger(quantidade)) {
    throw new Error("A quantidade deve ser um número inteiro");
  }
  if (quantidade <= 0) {
    return carrinho.filter((i) => i.produto.id !== produtoId);
  }
  return carrinho.map((i) => (i.produto.id === produtoId ? { ...i, quantidade } : i));
}

export function calcularTotal(carrinho: Carrinho): number {
  return carrinho.reduce((soma, i) => soma + i.produto.precoCentavos * i.quantidade, 0);
}
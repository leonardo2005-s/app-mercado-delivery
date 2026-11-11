export type Produto = { id: string; nome: string; precoCentavos: number };
export type ItemCarrinho = { produto: Produto; quantidade: number };
export type Carrinho = ItemCarrinho[];

export type Endereco = { nome: string; rua: string; numero: string; bairro: string };

export type Pedido = {
  id: string;
  itens: ItemCarrinho[];
  totalCentavos: number;
  endereco: Endereco;
  pagamento: "na entrega";
  status: "em separação";
  itensEmFalta: string[];
};
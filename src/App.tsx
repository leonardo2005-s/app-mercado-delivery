import { useState } from "react";
import "./App.css";
import { catalogo } from "./data/catalogo";
import type { Carrinho, Endereco, Pedido, Produto } from "./domain/tipos";
import { adicionarItem, alterarQuantidade, calcularTotal } from "./domain/carrinho";
import { finalizarPedido, marcarItemEmFalta, validarEndereco } from "./domain/pedido";

type Tela = "inicio" | "carrinho" | "status";

const reais = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const enderecoVazio: Endereco = { nome: "", rua: "", numero: "", bairro: "" };

function produtoPorId(id: string): Produto {
  const produto = catalogo.find((p) => p.id === id);
  if (!produto) throw new Error(`Produto não encontrado: ${id}`);
  return produto;
}

// Simula o aviso de item em falta para o teste de usabilidade (Tarefa 3).
function criarPedidoSimulado(carrinho: Carrinho, endereco: Endereco): Pedido {
  const pedido = finalizarPedido(carrinho, endereco);
  return pedido.itens.some((i) => i.produto.id === "leite1")
    ? marcarItemEmFalta(pedido, "leite1")
    : pedido;
}

// Permite abrir o app já no estado inicial de cada tarefa: ?cenario=2 ou ?cenario=3
function estadoInicial(): { tela: Tela; carrinho: Carrinho; pedido: Pedido | null } {
  const cenario = new URLSearchParams(window.location.search).get("cenario");
  const itensTeste = ["arroz5", "leite1", "sabao"]
    .map(produtoPorId)
    .reduce<Carrinho>(adicionarItem, []);

  if (cenario === "2") return { tela: "carrinho", carrinho: itensTeste, pedido: null };
  if (cenario === "3") {
    const pedido = criarPedidoSimulado(alterarQuantidade(itensTeste, "arroz5", 2), {
      nome: "Cliente Teste",
      rua: "Rua Exemplo",
      numero: "100",
      bairro: "Bairro Teste",
    });
    return { tela: "status", carrinho: [], pedido };
  }
  return { tela: "inicio", carrinho: [], pedido: null };
}

export default function App() {
  const [inicial] = useState(estadoInicial);
  const [tela, setTela] = useState<Tela>(inicial.tela);
  const [carrinho, setCarrinho] = useState<Carrinho>(inicial.carrinho);
  const [pedido, setPedido] = useState<Pedido | null>(inicial.pedido);
  const [busca, setBusca] = useState("");
  const [endereco, setEndereco] = useState<Endereco>(enderecoVazio);
  const [erros, setErros] = useState<string[]>([]);

  const totalItens = carrinho.reduce((soma, i) => soma + i.quantidade, 0);
  const filtrados = catalogo.filter((p) =>
    p.nome.toLowerCase().includes(busca.trim().toLowerCase())
  );
  const quantidadeNoPedido = (id: string) =>
    carrinho.find((i) => i.produto.id === id)?.quantidade ?? 0;

  function finalizar() {
    const problemas = validarEndereco(endereco);
    if (carrinho.length === 0) problemas.unshift("Seu pedido está vazio");
    if (problemas.length > 0) {
      setErros(problemas);
      return;
    }
    setPedido(criarPedidoSimulado(carrinho, endereco));
    setCarrinho([]);
    setErros([]);
    setTela("status");
  }

  function novoPedido() {
    setPedido(null);
    setEndereco(enderecoVazio);
    setBusca("");
    setTela("inicio");
  }

  const campo = (rotulo: string, chave: keyof Endereco) => (
    <label key={chave}>
      {rotulo}
      <input
        value={endereco[chave]}
        onChange={(e) => setEndereco({ ...endereco, [chave]: e.target.value })}
      />
    </label>
  );

  return (
    <>
      <header>
        <h1>Mercado do Bairro</h1>
      </header>

      {tela === "inicio" && (
        <main>
          <label htmlFor="busca">Buscar produto</label>
          <input
            id="busca"
            type="search"
            placeholder="Ex.: arroz"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <ul className="lista">
            {filtrados.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.nome}</strong>
                  <span>{reais(p.precoCentavos)}</span>
                  {quantidadeNoPedido(p.id) > 0 && (
                    <small>No pedido: {quantidadeNoPedido(p.id)}</small>
                  )}
                </div>
                <button
                  aria-label={`Adicionar ${p.nome} ao pedido`}
                  onClick={() => setCarrinho(adicionarItem(carrinho, p))}
                >
                  Adicionar
                </button>
              </li>
            ))}
          </ul>
          {filtrados.length === 0 && <p>Nenhum produto encontrado.</p>}
          <button className="principal" onClick={() => setTela("carrinho")}>
            Ver pedido ({totalItens})
          </button>
        </main>
      )}

      {tela === "carrinho" && (
        <main>
          <h2>Seu pedido</h2>
          {carrinho.length === 0 && <p>Nenhum item no pedido ainda.</p>}
          <ul className="lista">
            {carrinho.map((i) => (
              <li key={i.produto.id}>
                <div>
                  <strong>{i.produto.nome}</strong>
                  <span>{reais(i.produto.precoCentavos)}</span>
                </div>
                <div className="qtd">
                  <button
                    aria-label={`Diminuir quantidade de ${i.produto.nome}`}
                    onClick={() =>
                      setCarrinho(alterarQuantidade(carrinho, i.produto.id, i.quantidade - 1))
                    }
                  >
                    -
                  </button>
                  <span aria-label={`Quantidade: ${i.quantidade}`}>{i.quantidade}</span>
                  <button
                    aria-label={`Aumentar quantidade de ${i.produto.nome}`}
                    onClick={() =>
                      setCarrinho(alterarQuantidade(carrinho, i.produto.id, i.quantidade + 1))
                    }
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="total">Total: {reais(calcularTotal(carrinho))}</p>

          <h2>Entrega</h2>
          {campo("Nome", "nome")}
          {campo("Rua", "rua")}
          {campo("Número", "numero")}
          {campo("Bairro", "bairro")}
          <p>Pagamento: na entrega</p>

          {erros.length > 0 && (
            <div className="erros" role="alert">
              <strong>Confira antes de finalizar:</strong>
              <ul>
                {erros.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <button className="principal" onClick={finalizar}>
            Finalizar pedido
          </button>
          <button onClick={() => setTela("inicio")}>Voltar aos produtos</button>
        </main>
      )}

      {tela === "status" && pedido && (
        <main>
          <h2>Pedido confirmado</h2>
          <p className="status">Status: {pedido.status}</p>
          <p className="total">Total: {reais(pedido.totalCentavos)}</p>
          <p>Previsão de entrega: hoje, entre 18h e 19h</p>
          <p>
            Entrega em: {pedido.endereco.rua}, {pedido.endereco.numero} - {pedido.endereco.bairro}
          </p>

          {pedido.itensEmFalta.length > 0 && (
            <div className="alerta" role="alert">
              <span className="icone" aria-hidden="true">!</span>
              <div>
                <strong>Atenção: item em falta</strong>
                <p>
                  {pedido.itens
                    .filter((i) => pedido.itensEmFalta.includes(i.produto.id))
                    .map((i) => i.produto.nome)
                    .join(", ")}{" "}
                  não está disponível no momento.
                </p>
                <p>Sugestão de troca: Leite 1 L de outra marca (R$ 6,50).</p>
              </div>
            </div>
          )}

          <button className="principal" onClick={novoPedido}>
            Fazer novo pedido
          </button>
        </main>
      )}
    </>
  );
}
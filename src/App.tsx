
import { useState } from "react";
import "./App.css";
import { catalogo } from "./data/catalogo";
import type { Carrinho, Endereco, Pedido, Produto } from "./domain/tipos";
import { adicionarItem, alterarQuantidade, calcularTotal } from "./domain/carrinho";
import { finalizarPedido, marcarItemEmFalta, validarEndereco } from "./domain/pedido";

type Tela = "inicio" | "carrinho" | "status";

const reais = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const enderecoVazio: Endereco = {
  nome: "",
  rua: "",
  numero: "",
  bairro: "",
};

// Calcula a entrega para 30 minutos após o pedido.
function calcularPrevisaoEntrega(): string {
  const agora = new Date();
  const entrega = new Date(agora.getTime() + 30 * 60 * 1000);

  return entrega.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function produtoPorId(id: string): Produto {
  const produto = catalogo.find((p) => p.id === id);

  if (!produto) {
    throw new Error(`Produto não encontrado: ${id}`);
  }

  return produto;
}

// Simula o aviso de item em falta.
function criarPedidoSimulado(
  carrinho: Carrinho,
  endereco: Endereco
): Pedido {
  const pedido = finalizarPedido(carrinho, endereco);

  return pedido.itens.some((i) => i.produto.id === "leite1")
    ? marcarItemEmFalta(pedido, "leite1")
    : pedido;
}

// Cenários utilizados nos testes do projeto.
function estadoInicial(): {
  tela: Tela;
  carrinho: Carrinho;
  pedido: Pedido | null;
} {
  const cenario = new URLSearchParams(
    window.location.search
  ).get("cenario");

  const itensTeste = ["arroz5", "leite1", "sabao"]
    .map(produtoPorId)
    .reduce<Carrinho>(adicionarItem, []);

  if (cenario === "2") {
    return {
      tela: "carrinho",
      carrinho: itensTeste,
      pedido: null,
    };
  }

  if (cenario === "3") {
    const pedido = criarPedidoSimulado(
      alterarQuantidade(itensTeste, "arroz5", 2),
      {
        nome: "Cliente Teste",
        rua: "Rua Exemplo",
        numero: "100",
        bairro: "Bairro Teste",
      }
    );

    return {
      tela: "status",
      carrinho: [],
      pedido,
    };
  }

  return {
    tela: "inicio",
    carrinho: [],
    pedido: null,
  };
}

// Exibe a imagem do produto.
function FotoProduto({ produto }: { produto: Produto }) {
  const [falhou, setFalhou] = useState(false);

  if (!produto.imagem || falhou) {
    return (
      <span className="foto foto-vazia" aria-hidden="true">
        {produto.nome.charAt(0)}
      </span>
    );
  }

  return (
    <img
      className="foto"
      src={produto.imagem}
      alt=""
      width={64}
      height={64}
      loading="lazy"
      onError={() => setFalhou(true)}
    />
  );
}

export default function App() {
  const [inicial] = useState(estadoInicial);

  const [tela, setTela] = useState<Tela>(inicial.tela);
  const [carrinho, setCarrinho] = useState<Carrinho>(
    inicial.carrinho
  );
  const [pedido, setPedido] = useState<Pedido | null>(
    inicial.pedido
  );

  const [busca, setBusca] = useState("");
  const [endereco, setEndereco] = useState<Endereco>(
    enderecoVazio
  );
  const [erros, setErros] = useState<string[]>([]);

  // Guarda o horário previsto de cada pedido.
  const [previsaoEntrega, setPrevisaoEntrega] = useState(
    () => inicial.pedido ? calcularPrevisaoEntrega() : ""
  );

  const totalItens = carrinho.reduce(
    (soma, i) => soma + i.quantidade,
    0
  );

  const filtrados = catalogo.filter((p) =>
    p.nome.toLowerCase().includes(busca.trim().toLowerCase())
  );

  const quantidadeNoPedido = (id: string) =>
    carrinho.find((i) => i.produto.id === id)?.quantidade ?? 0;

  // Finaliza o pedido e registra a previsão.
  function finalizar() {
    const problemas = validarEndereco(endereco);

    if (carrinho.length === 0) {
      problemas.unshift("Seu pedido está vazio");
    }

    if (problemas.length > 0) {
      setErros(problemas);
      return;
    }

    const novoPedido = criarPedidoSimulado(
      carrinho,
      endereco
    );

    // O horário é calculado somente na finalização.
    setPrevisaoEntrega(calcularPrevisaoEntrega());

    setPedido(novoPedido);
    setCarrinho([]);
    setErros([]);
    setTela("status");
  }

  function novoPedido() {
    setPedido(null);
    setPrevisaoEntrega("");
    setEndereco(enderecoVazio);
    setBusca("");
    setErros([]);
    setTela("inicio");
  }

  const campo = (
    rotulo: string,
    chave: keyof Endereco
  ) => (
    <label key={chave}>
      {rotulo}
      <input
        value={endereco[chave]}
        onChange={(e) =>
          setEndereco({
            ...endereco,
            [chave]: e.target.value,
          })
        }
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
          <label htmlFor="busca">
            Buscar produto
          </label>

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
                <div className="produto">
                  <FotoProduto produto={p} />

                  <div>
                    <strong>{p.nome}</strong>
                    <span>{reais(p.precoCentavos)}</span>

                    {quantidadeNoPedido(p.id) > 0 && (
                      <small>
                        No pedido: {quantidadeNoPedido(p.id)}
                      </small>
                    )}
                  </div>
                </div>

                <button
                  aria-label={`Adicionar ${p.nome} ao pedido`}
                  onClick={() =>
                    setCarrinho(adicionarItem(carrinho, p))
                  }
                >
                  Adicionar
                </button>
              </li>
            ))}
          </ul>

          {filtrados.length === 0 && (
            <p>Nenhum produto encontrado.</p>
          )}

          <button
            className="principal"
            onClick={() => setTela("carrinho")}
          >
            Ver pedido ({totalItens})
          </button>
        </main>
      )}

      {tela === "carrinho" && (
        <main>
          <h2>Seu pedido</h2>

          {carrinho.length === 0 && (
            <p>Nenhum item no pedido ainda.</p>
          )}

          <ul className="lista">
            {carrinho.map((i) => (
              <li key={i.produto.id}>
                <div>
                  <strong>{i.produto.nome}</strong>
                  <span>
                    {reais(i.produto.precoCentavos)}
                  </span>
                </div>

                <div className="qtd">
                  <button
                    aria-label={`Diminuir quantidade de ${i.produto.nome}`}
                    onClick={() =>
                      setCarrinho(
                        alterarQuantidade(
                          carrinho,
                          i.produto.id,
                          i.quantidade - 1
                        )
                      )
                    }
                  >
                    -
                  </button>

                  <span
                    aria-label={`Quantidade: ${i.quantidade}`}
                  >
                    {i.quantidade}
                  </span>

                  <button
                    aria-label={`Aumentar quantidade de ${i.produto.nome}`}
                    onClick={() =>
                      setCarrinho(
                        alterarQuantidade(
                          carrinho,
                          i.produto.id,
                          i.quantidade + 1
                        )
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="total">
            Total: {reais(calcularTotal(carrinho))}
          </p>

          <p className="previsao">
            Prazo estimado de entrega: 30 minutos
            após a confirmação do pedido.
          </p>

          <h2>Entrega</h2>

          {campo("Nome", "nome")}
          {campo("Rua", "rua")}
          {campo("Número", "numero")}
          {campo("Bairro", "bairro")}

          <p>Pagamento: na entrega</p>

          {erros.length > 0 && (
            <div className="erros" role="alert">
              <strong>
                Confira antes de finalizar:
              </strong>

              <ul>
                {erros.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="principal"
            onClick={finalizar}
          >
            Finalizar pedido
          </button>

          <button onClick={() => setTela("inicio")}>
            Voltar aos produtos
          </button>
        </main>
      )}

      {tela === "status" && pedido && (
        <main>
          <h2>Pedido confirmado</h2>

          <p className="status">
            Status: {pedido.status}
          </p>

          <p className="total">
            Total: {reais(pedido.totalCentavos)}
          </p>

          <p className="previsao">
            Previsão de entrega: {previsaoEntrega}
          </p>

          <p>
            Entrega em: {pedido.endereco.rua},{" "}
            {pedido.endereco.numero} -{" "}
            {pedido.endereco.bairro}
          </p>

          {pedido.itensEmFalta.length > 0 && (
            <div className="alerta" role="alert">
              <span
                className="icone"
                aria-hidden="true"
              >
                !
              </span>

              <div>
                <strong>
                  Atenção: item em falta
                </strong>

                <p>
                  {pedido.itens
                    .filter((i) =>
                      pedido.itensEmFalta.includes(
                        i.produto.id
                      )
                    )
                    .map((i) => i.produto.nome)
                    .join(", ")}{" "}
                  não está disponível no momento.
                </p>

                <p>
                  Sugestão de troca: Leite 1 L de
                  outra marca (R$ 6,50).
                </p>
              </div>
            </div>
          )}

          <button
            className="principal"
            onClick={novoPedido}
          >
            Fazer novo pedido
          </button>
        </main>
      )}
    </>
  );
}

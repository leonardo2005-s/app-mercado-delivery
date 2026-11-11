# Roteiro de tarefas da validação

Dados fictícios em todas as tarefas. Cada tarefa é cronometrada do fim da leitura até o resultado esperado.

## Tarefa 1: localizar um produto
Estado inicial: tela inicial, carrinho vazio.
Objetivo: encontrar arroz de 5 kg e adicioná-lo ao pedido.
Resultado esperado: o carrinho mostra o arroz com quantidade 1.

## Tarefa 2: fechar um pedido de entrega
Estado inicial: carrinho com arroz, leite e sabão em pó (use `?cenario=2`).
Objetivo: trocar a quantidade do arroz para 2 e finalizar o pedido para entrega em endereço de teste, pagando na entrega.
Resultado esperado: pedido confirmado com total de R$ 65,00.

## Tarefa 3: interpretar o status do pedido
Estado inicial: tela de confirmação (use `?cenario=3`).
Objetivo: dizer em que etapa o pedido está, quanto vai pagar e quando chega, e localizar o aviso de item em falta.
Resultado esperado: as informações são ditas corretamente, sem pedir esclarecimento.
Acessibilidade observada: leitura sem aproximar o celular, status entendido sem depender só da cor, botões acertados sem toque errado.

## Registro
Sem ajuda: sucesso. Dica neutra: sucesso com ajuda. Indicação direta, desistência ou conclusão incorreta: falha. Cada toque fora do caminho esperado é um erro, anotado com a tela.
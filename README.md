# Vending Machine - Linguagens Formais e Autômatos

Este repositório apresenta a modelagem e simulação de uma vending machine (máquina de vendas automáticas) utilizando o formalismo de um **Autômato Finito Determinístico (AFD)**. 
O objetivo principal do projeto é demonstrar a aplicação prática da Teoria dos Autômatos na resolução de problemas do mundo real. No modelo desenvolvido, a máquina gerencia o acúmulo de saldo conforme a inserção de moedas, suporta produtos divididos em duas categorias com preço fixo de **R$ 0,30**, permite a inserção livre de valores além do necessário (estabilizando o estado de controle mas preservando o montante para o troco) e realiza o cálculo e a devolução automática do troco ao cliente na finalização.
A solução foi projetada e espelhada em uma interface web interativa.

Site de simulação: https://isa-cozendey.github.io/vending_machine/

## Como funciona
A máquina aceita moedas de 5¢, 10¢ e 25¢. O autômato gerencia o progresso do crédito até atingir o limiar de 30¢ (estado $S_{30}$), ponto em que as categorias de produtos são liberadas para escolha. O usuário pode continuar inserindo moedas livremente (o estado do autômato permanece em $S_{30}$), e o excedente é devolvido como troco no momento da compra.
* Moedas Aceitas: $5¢$, $10¢$ e $25¢$.
* Estabilização de Estado ($30¢$): A partir de 30¢ inseridos, o autômato atinge o estado $S_{30}$, liberando a seleção de categorias, mas acumulando o saldo real inserido.
* Categoria A ($30¢$): Permite escolher entre o Produto P ou Produto Q.
* Categoria B ($30¢$): Permite escolher entre o Produto P ou Produto Q.
* Cálculo de Troco: O troco é calculado automaticamente ao finalizar a compra com base no valor excedente ($\text{Total Inserido} - 30¢$).
* Cancelamento / Reset: A qualquer momento, a tecla C limpa o saldo acumulado e retorna o sistema ao estado inicial ($S_0$).

<img width="1221" height="732" alt="image" src="https://github.com/user-attachments/assets/b76cae7a-29ba-48f0-af61-a12f57395c62" />

## Dicionário do Alfabeto (Entradas $\Sigma$)

<table>
  <thead>
    <tr>
      <th>Símbolo</th>
      <th>Significado Real</th>
      <th>Descrição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>c</td>
      <td>Moeda de 5¢</td>
      <td>Incrementa 5 centavos ao saldo</td>
    </tr>
    <tr>
      <td>d</td>
      <td>Moeda de 10¢</td>
      <td>Incrementa 10 centavos ao saldo</td>
    </tr>
    <tr>
      <td>v</td>
      <td>Moeda de 25¢</td>
      <td>Incrementa 25 centavos ao saldo</td>
    </tr>
    <tr>
      <td>a</td>
      <td>Categoria A</td>
      <td>Seleciona produtos da Categoria A (30¢)</td>
    </tr>
    <tr>
      <td>b</td>
      <td>Categoria B</td>
      <td>Seleciona produtos da Categoria B (30¢)</td>
    </tr>
    <tr>
      <td>p</td>
      <td>Produto P</td>
      <td>Confirma a escolha do Produto P</td>
    </tr>
    <tr>
      <td>q</td>
      <td>Produto Q</td>
      <td>Confirma a escolha do Produto Q</td>
    </tr>
    <tr>
      <td>C</td>
      <td>Cancelar / Resetar</td>
      <td>Zera o saldo acumulado e retorna ao estado inicial ($S_0$)</td>
    </tr>
  </tbody>
</table>

## Estados ($Q$)

A máquina possui os seguintes estados funcionais no AFD:
* $S_0$ a $S_{25}$ : Estados de transição por incremento de saldo (em passos de $5¢$).
* $S_{30}$ : Estado de crédito suficiente (atingido com $\ge 30¢$, aguardando seleção de categoria).
* $S_{catA}$ : Categoria A selecionada (aguardando escolha entre $p$ ou $q$).
* $S_{catB}$ : Categoria B selecionada (aguardando escolha entre $p$ ou $q$).
* $S_{final}$ : Estado de dispensação e entrega.

## Fluxo e Lógica de Funcionamento

### Lógica do Troco e Crédito Livre
Como o autômato foca na validação lógica determinística da regra de negócio (preço mínimo de 30¢ para liberação), ele estabiliza no estado $S_{30}$ para quaisquer valores iguais ou superiores a 30 centavos. O controle de interface e cálculo auxiliar gerencia o saldo total inserido e calcula o troco devolvido na gaveta no momento do desfecho:
$$\text{Troco} = \text{Total Inserido} - 30¢$$

### Ciclo de Vida do Atendimento
* Depósito: O usuário envia moedas até atingir ou ultrapassar 30¢ $\rightarrow$ O estado estabiliza em $S_{30}$.
* Seleção: O usuário digita $a$ (Cat. A) ou $b$ (Cat. B) $\rightarrow$ A máquina transita para $S_{catA}$ ou $S_{catB}$.
* Entrega: O usuário escolhe $p$ ou $q$ $\rightarrow$ A máquina transita para $S_{final}$, entrega o produto, emite o troco correspondente e reinicia o ciclo em $S_0$.

## Exemplos de Validação do Sistema

<table>
  <thead>
    <tr>
      <th>Sequência de Entradas</th>
      <th>Resultado / Comportamento</th>
      <th>Descrição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>vvap</code></td>
      <td>Estado $S_{final}$ (Troco: 20¢)</td>
      <td>Depósito de 50¢ ($25+25$), escolhe Cat. A, entrega o produto e devolve 20¢ de troco.</td>
    </tr>
    <tr>
      <td><code>vvdbq</code></td>
      <td>Estado $S_{final}$ (Troco: 30¢)</td>
      <td>Depósito de 50¢, insere mais 10¢ (total 60¢), escolhe Cat. B e devolve 30¢ de troco.</td>
    </tr>
    <tr>
      <td><code>ccccccap</code></td>
      <td>Estado $S_{final}$ (Troco: 5¢)</td>
      <td>Depósito de 35¢ ($7 \times 5¢$), compra Cat. A, e devolve 5¢ de troco.</td>
    </tr>
    <tr>
      <td><code>ddddap</code></td>
      <td>Estado $S_{final}$ (Sem Troco)</td>
      <td>Depósito exato de 4 moedas de 10¢ (40¢), compra Cat. A, devolve 10¢ de troco.</td>
    </tr>
    <tr>
      <td><code>dC</code></td>
      <td>Retorno a $S_0$ (Reset)</td>
      <td>Insere 10¢ e aperta Cancelar ($C$), zerando o sistema.</td>
    </tr>
  </tbody>
</table>
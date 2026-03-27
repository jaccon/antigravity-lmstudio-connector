# Documentação Técnica: Como funciona o Antigravity LM Studio Connect

Bem-vindo à área de desenvolvedor. Este documento visa explicar passo a passo toda a arquitetura e funcionamento por trás da extensão **Antigravity LM Studio Connect** desenvolvida por **Jaccon**. O foco é facilitar a publicação na [VSCode Extensions Marketplace](https://marketplace.visualstudio.com/) e a compatibilidade do modelo de sistema para o sistema operacional interno do **Antigravity**.

A extensão foi projetada de forma modular no TypeScript e interage com as APIs do Visual Studio Code. A seguir estão abertos os segredos por trás da extensão.

## Estrutura de Arquivos Principal: `src`

Todo o core da aplicação reside em três arquivos na pasta `src/`:

1. `extension.ts` (Entrypoint e Eventos Globais)
2. `chatWebview.ts` (Interface do Chat e Lógica de Substituição de Código)
3. `completionProvider.ts` (Máquina de Autocompletamento)

---

### 1. `extension.ts`: O Ponto de Ativação

O `extension.ts` atua como o **maestro** da orquestra, responsável por gerenciar toda a infraestrutura base quando a extensão inicializa (ativada pelo evento `onStartupFinished`).

**Principais tarefas efetuadas neste arquivo:**
- **Healthcheck Automatizado:** No momento de carregamento inicial, há uma verificação à URL local definida para testar as rotas via `/models`. Se o node constata o servidor (LM Studio, neste caso, o `status 200`), ele apresenta um popup verde indicando "Conectado ao LM Studio com sucesso!".
- **Registro do Provider UI (WebviewView):** Injeta no componente Sidebar (Activity Bar, ID: `antigravityPanel`) a tela customizada HTML desenvolvida em `chatWebview.ts`.
- **Registro do Inline Completion Provider:** Caso a chave `antigravity.lmStudio.autocompleteEnabled` esteja ativada nas opções de Settings, ele liga o módulo `completionProvider.ts` à API nativa do VS Code (`vscode.languages.registerInlineCompletionItemProvider`), habilitando escuta total sob todas as linhas de código alteradas.
- **Registro de Comandos de Ação:** Registra na paleta de comandos atalhos como o `antigravity.startChat` e o `antigravity.testConnection`.

---

### 2. `chatWebview.ts`: A Fronteira Interativa

Sua comunicação com o LM Studio durante o chat passa obrigatoriamente pelo `chatWebview.ts`. Este arquivo estende `vscode.WebviewViewProvider` e retorna um HTML/CSS minimalista injetado no ambiente do explorador do VSCode e contém a lógica de postMessages de ida e vinda da aplicação.

**Arquitetura do `handleChatMessage`:**
- **Extração do Contexto Dinâmico:** Antes de ser enviada ao LMStudio, a mensagem localiza qual aba de texto o desenvolvedor possui focada (`activeEditor`).
- **Limitação de Memória Segura (Clamp):** Ele captura todo o código que está ativo na janela (limitado a 20 mil caracteres para evitar Out of Memory e estouros de contexto) concatenando num `System Prompt`.
- **Comportamentos Autônomos Específicos (<tags>):** A IA é instruída a se comportar de forma injetora usando as XML tags. Se a IA responder com blocos delimitados, o `chatWebview` fará a leitura (via Expressão Regular).
  - Se detectado um encapsulamento em `<create_file>`, será acionado o Workspace do VS Code criando uma nova tab do zero contendo aquele código sugerido.
  - Se detectado um `<edit_file>`, o código da aba local sofrerá bypass, sofrendo sobreescrita ou *replace* em tempo real.
- **Requisição REST via Node-Fetch:** O disparo das conversas é serializado via JSON de ponta-a-ponta batendo na URI de chat do seu servidor (`/chat/completions`). Assim ocorre a animação de "Antigravity is thinking...".

**O front-end embutido (UI do Code Chat):**
A API do VS Code disponibiliza um método seguro de renderização do Markdown. Todos os code blocks (` ``` `) exibidos ganham botões integrados e de callback atômico graças a customizações HTML:
- Botão "Insert" – Escreve o snippet na linha atual do cursor no active file.
- Botão "Replace" – Extermina todo o código daquele arquivo e troca pelo snippet apresentado.
- Botão "New File" – Abre dinamicamente a aba temporária gerando os binários no cache sem salvar.

---

### 3. `completionProvider.ts`: Inteligência e "Ghost Text" Realtime

O Autocomplete obedece ao contrato da API original do Visual Studio Code para completamento (`vscode.InlineCompletionItemProvider`). Diferente de um plugin como Copilot, ele interage exclusivamente com a interface local.

**Proteção Lógica Interna:**
- **Debouncing:** Implementado um atraso via `setTimeout` em 500 ms; portanto apenas quando o desenvolvedor finaliza uma certa quantia de digitação, enviamos request à rede. Do contrário os servidores locais crashariam.
- **Fatiamento de Texto Anterior/Posterior (Prefix and Suffix):** Identificamos precisamente onde o cursor ("position") está. Cortamos as linhas acima de forma literal, simulando a técnica rudimentar de "Fill-in-the-Middle" ou Autocomplete Sequencial.
- **O Payload de Previsão:** Este endpoint aponta para a rota genérica do LLM (`/completions` invés da `/chat/completions`), exigindo completamento passivo base, com parada de token via `['\n\n', '<|endoftext|>']`.

---

## O Fluxo Macro - Do Setup ao Runtime

1. **Ativação (ActivationEvent = onStartupFinished):** A janela renderiza.
2. **Setup do Setting Configuration:** Inicialização definindo variáveis globais registradas no seu VS Code Settings para IP:Porta apontado.
3. **Escuta de Modificações (Listener):** O Code Chat Sidebar instacia-se na background thread enquanto o Provider do autocompletamento levanta com o cursor.
4. **Requisições Fetch & Promises:** Envio transitorio dos eventos na porta 1234 e parse do resultado.

A extensão está encapsulada para que futuramente possa ser versionada e indexada não apenas compatível com LM Studio, mas com OLLAMA e outras tecnologias de ponte API local, graças à adoção nativa do schema Open-AI compatible payload.

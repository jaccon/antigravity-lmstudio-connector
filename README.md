# Antigravity LM Studio Connect

O **Antigravity LM Studio Connect** (desenvolvido por Jaccon) é uma extensão poderosa para o Visual Studio Code projetada para integrar perfeitamente o seu fluxo de desenvolvimento local de IA com o **LM Studio**. A extensão oferece funcionalidades avançadas de chat, edição automática de código baseada em contexto e autocompletamento de código em tempo real (inline completion).

Tudo isso rodando localmente usando modelos de linguagem abertos, garantindo total privacidade do seu código fonte e isenção de custos com APIs.

## Funcionalidades Principais

- **Chat com IA no Sidebar do VSCode:** Uma aba dedicada ("LM Studio Connector") no seu Activity Bar para conversar com a IA.
- **Contextualização com o Arquivo Ativo:** A extensão compartilha de maneira inteligente o conteúdo do arquivo que você está editando no momento, permitindo que a IA compreenda o contexto sem você precisar copiar e colar.
- **Inserção e Edição Direta (Code Actions):** A interface de chat disponibiliza botões para `Insert`, `Replace` ou criar um `New File` diretamente com o código sugerido pela IA, acelerando seu desenvolvimento.
- **Modificação Automática (Auto-apply):** A IA entende comandos especiais (tags como `<create_file>` ou `<edit_file>`) e pode criar novos arquivos ou até aplicar alterações no documento inteiro automaticamente conforme sua solicitação.
- **Autocompletamento em Tempo Real (Inline Completion):** Conforme você digita, a extensão se comunica com o LM Studio para prever e sugerir continuações de código baseadas no contexto ao redor.

## Requisitos

1. **Visual Studio Code** (versão 1.80.0 ou superior).
2. [O LM Studio](https://lmstudio.ai) instalado e rodando em sua máquina local.
3. Servidor Local (Local Server) em execução no LM Studio:
   - Porta padrão: `1234`
   - Deve suportar as rotas OpenAI-compatíveis: `/v1/chat/completions` (para o Chat) e `/v1/completions` (para o autocompletamento).

## Como Configurar

1. Instale a extensão no VS Code.
2. Inicie o Server no LM Studio e verifique a URL base.
3. No VS Code, acesse as suas opções (Settings > `antigravity.lmStudio`):
   - **Base URL:** Confirme com o do LM Studio (padrão: `http://localhost:1234/v1`).
   - **Chat Model:** Coloque o alias/nome do modelo que está carregado no LM Studio (padrão: `local-model`).
   - **Autocomplete Enabled:** Marque (`true`) se quiser utilizar o autocompletamento inline.

Dica: Execute o comando `Antigravity: Test Connection` através da paleta de comandos (`Cmd+Shift+P` ou `Ctrl+Shift+P`) para validar se a conexão com o LM Studio está 100% funcional.

## Comandos Disponíveis

Ao abrir a paleta de comandos do VS Code, os seguintes comandos estão disponíveis:
- `Antigravity: Hello World` - Comando básico de teste da extensão.
- `Antigravity: Start Code Chat` - Abre e foca a janela webview do chat na barra lateral.
- `Antigravity: Test Connection` - Faz um healthcheck (verificação de conexão) na API em execução do LM Studio.

## Privacidade e Segurança

Seus dados não saem da sua máquina! Diferente de assistentes convencionais da nuvem, o Antigravity LM Studio interage exclusivamente com a rede local (`localhost`), processando todo o código fonte e as conversas de forma estritamente local, conferindo o mais alto grau de segurança para desenvolvimento de propriedade intelectual ou trabalhar sob regras estritas de não-vazamento de dados corporativos (NDA).

## Contribuição e Feedback

Sinta-se à vontade para reportar issues ou enviar PRs com melhorias para a integração da extensão.
Desenvolvido com ☕️ e IA por Jaccon.

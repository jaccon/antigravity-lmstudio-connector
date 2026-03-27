# Como Publicar a sua Extensão (VSCode e Antigravity)

Este documento foi elaborado para guiar você, passo a passo, no processo de empacotamento, publicação e distribuição da extensão **Antigravity LM Studio Connect** (desenvolvido por Jaccon), permitindo que outros desenvolvedores possam baixá-la tanto pelo Marketplace do Visual Studio Code quanto utilizá-la dentro do ecossistema do Antigravity.

---

## Parte 1: Publicando no Visual Studio Code Marketplace

A Microsoft fornece uma ferramenta oficial de linha de comando chamada **vsce** (Visual Studio Code Extensions), que gerencia a publicação das extensões.

### Passo 1: Pré-requisitos
1. Você precisa ter o instalador global do `vsce` na sua máquina. Abra seu terminal e rode:
   ```bash
   npm install -g @vscode/vsce
   ```
2. Crie uma [Conta de Desenvolvedor na Microsoft (Azure DevOps)](https://dev.azure.com/).
3. Obtenha um **Personal Access Token (PAT)** no Azure DevOps para validar quem é o responsável pela publicação. Crie uma organização e navegue em "Security > Personal access tokens".
   - **Escopo necessário (Scopes):** `Marketplace (Acquire, Manage, Publish)`.
4. Crie um Creador/Publisher acessando a página oficial do [Visual Studio Marketplace Management](https://marketplace.visualstudio.com/manage) e faça login. Crie um novo `Publisher` com o nome da sua escolha (por exemplo, `jaccon`).

### Passo 2: Empacotando (Testando o Build)
Antes de enviar, é uma boa ideia criar e testar o binário da extensão localmente utilizando o formato padrão da loja para extensões da Microsoft.

1. No terminal, na raiz do projeto, acione o vsce:
   ```bash
   vsce package
   ```
2. Se aparecer erros (por exemplo, exigindo um campo obrigatório como o campo `publisher` ou a URL do seu logo/repo no `package.json`), arrume-os. 
   > Não se esqueça: Seu `package.json` **deve** possuir a tag `"publisher": "seunome_de_publisher"`. 
3. Caso o comando acima seja acionado com sucesso, ele criará um arquivo chamado: `antigravity-lm-studio-0.0.1.vsix`. 
   Você já pode testá-lo no VSCode com `Cmd+Shift+P` -> `Extensions: Install from VSIX...`

### Passo 3: Publicando (Fazendo o Deploy para os outros)
Agora que sua extensão empacota e você já possui o token em mãos:

1. Faça o Login no cli do vsce informando seu nome do publisher logado na loja:
   ```bash
   vsce login seu-nome-de-publisher
   ```
   *Ele vai pedir o Personal Access Token da Microsoft e vincular os acessos no seu terminal.*

2. Publique no Marketplace! Você pode fazer isso disparando o simples comando:
   ```bash
   vsce publish
   ```
Pronto! Daqui em alguns minutos a sua extensão começará a indexar dentro da tela interna de extensões de todos os programadores que buscarem por **"Antigravity LM Studio"**.

---

## Parte 2: Disponibilizando a Extensão no Ecossistema Antigravity

Qualquer integração com o Antigravity IDE aproveita uma sinergia 100% nativa com o esqueleto do Visual Studio Code. Distribuições da família VSCode usualmente usam duas rotas para importação de Extensões pela infraestrutura do Antigravity:

### Opção A: Lojas Descentralizadas (Open VSX) e Atualização Automática
O Antigravity, por padrão, enxerga os repositórios compatíveis com Open VSX ou espelhos do Microsoft VSCode.
1. Se sua extensão já publicou na loja da Microsoft (Etapa acima), você pode sincronizá-la ou usar o sistema central CLI chamado `ovsx`:
   ```bash
   npx ovsx publish package.vsix -p <SEU_TOKEN_OPENVSX>
   ```
   Dessa forma ambos os universos estarão baixando de repos transparentes.

### Opção B: Arquivo Executável Independente (.VSIX) 
Caso o Antigravity da sua equipe trabalhe em uma infraestrutura trancada, ou para ambientes offline (onde as IAs e APIs já são executadas apenas no Localhost LM Studio):

1. Gere o arquivo executável offline da extensão descrita no passo anterior, digitando:
   ```bash
   vsce package
   ```
2. Compartilhe o arquivo gerado (exemplo: `antigravity-lm-studio-X.X.X.vsix`) gerado na raiz da pasta deste projeto via chat/e-mail, ou colocando na sua página do Github Releases.
3. Seus colegas podem abrir o Antigravity Desktop deles e instalarem nativamente, da seguinte forma:
   - Ir para o Painel de Extensões na Lateral Esquerda do Antigravity.
   - Clicar nos `...` (três pontos) listados no canto superior direito do menu.
   - Selecionar a Opção: **"Install from VSIX"**.
   - Selecionar o seu arquivo que você enciou pra eles e aguardar o `Restart Required`.

---

## Resumo dos Passos a executar
1. Adicione a chave `"publisher"` no seu `package.json` *(Ex: `"publisher": "jaccon"`)*.
2. Adicione links do seu repositório *(Ex: `"repository": {"type": "git", "url": "https://github.com/jaccon/..."}`)* para prevenir os avisos no terminal.
3. Rode `npm run lint` e veja se todos os códigos estão limpos (Typescript não avisa problemas ao empacotar).
4. Siga os comandos de `vsce package` ou `publish` para gerar a versão final para o mundo!

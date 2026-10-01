# Interlock v1 — spec

> Status: rascunho para revisão · 2026-10-01
> Fonte: sessão de decisões + exploração do Paseo (`~/Documents/personal/paseo`, commit `d7c7044`) e do protótipo (`testing-ui`).

## 1. Objetivo

Um app de desktop para macOS que orquestra **Claude Code e Codex reais** no seu computador. Cada tarefa roda numa worktree git isolada. O app só te chama quando precisa de você e entrega o trabalho como um PR. A interface é a deste protótipo; o motor é um fork do servidor do Paseo.

Usável = você consegue trabalhar nos seus projetos de verdade pelo Interlock, no dia a dia, sem abrir o terminal.

## 2. Decisões

| #   | Tema                  | Decisão                                                                                                                                                                                                                                                                                                                                                                                                    | Por quê                                                                                                                |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Motor                 | Backend próprio a partir de um **fork do servidor do Paseo** (Apache-2.0), mantido por nós daqui em diante                                                                                                                                                                                                                                                                                                 | Os adaptadores de Claude e Codex têm ~10k linhas cada, com retomada, interrupção, permissões e subagents já resolvidos |
| 2   | Shell                 | **Tauri** com o daemon TypeScript como **sidecar**                                                                                                                                                                                                                                                                                                                                                         | App leve; o Claude só tem SDK oficial em TS/Python, então o daemon continua Node                                       |
| 3   | Código                | **Monorepo novo `interlock`** em `~/Documents/personal/interlock` (o testing-ui fica congelado como protótipo)                                                                                                                                                                                                                                                                                             | Produto separado do protótipo; remote `upstream` do Paseo só para consulta                                             |
| 4   | PR e checks           | **Create PR + Checks via `gh`**                                                                                                                                                                                                                                                                                                                                                                            | O fim natural da tarefa; usa o login que você já tem                                                                   |
| 5   | Autonomia             | **Auto por padrão**: Claude `auto`, Codex `on-request` + sandbox `workspace-write`. "Full auto" opcional por projeto                                                                                                                                                                                                                                                                                       | Edita livre na worktree e só te chama para o arriscado                                                                 |
| 6   | Add project           | **Seletor de pasta nativo; qualquer pasta serve.** Pasta git roda cada tarefa numa worktree; pasta sem git roda o agente na própria pasta, sem funções de git                                                                                                                                                                                                                                              | Sem git não há worktree, diff nem PR; ver §2 #6 e o ADR 0050                                                           |
| 7   | Uso restante          | **Dois anéis (Claude, Codex) + popover** com as janelas de 5h, semanal e por modelo/code review                                                                                                                                                                                                                                                                                                            | Substitui o pill de $, que era inventado                                                                               |
| 8   | Ao fechar             | **Fica no menu bar**; o ⌘Q pergunta se para os agentes                                                                                                                                                                                                                                                                                                                                                     | Os agentes seguem sem você                                                                                             |
| 9   | Avisos                | **Notificação do macOS** só para precisa de você / falhou / pronto para review, mais o badge                                                                                                                                                                                                                                                                                                               | Sem ruído                                                                                                              |
| 10  | Setup                 | **Nas configurações do projeto** (script, env, arquivos a copiar, lendo `.worktreeinclude`), com sugestão pelo lockfile                                                                                                                                                                                                                                                                                    | A tela já existe; não suja o repo                                                                                      |
| 11  | Nomes                 | Começa na hora com o prompt; **IA rápida renomeia título e branch** antes do 1º commit                                                                                                                                                                                                                                                                                                                     | Nomes bons sem atrasar o início                                                                                        |
| 12  | Limpeza               | **Arquiva ao mergear** (toggle) + **Discard** manual com confirmação                                                                                                                                                                                                                                                                                                                                       | O disco não enche sozinho                                                                                              |
| 13  | Comentários no diff   | **Acumulam e vão num lote** ("Send 3 comments to agent")                                                                                                                                                                                                                                                                                                                                                   | Uma rodada de correção, como um review                                                                                 |
| 14  | Modelos               | **Listas reais de cada provedor** e níveis de esforço por modelo; Gemini sai                                                                                                                                                                                                                                                                                                                               | Honesto e sempre atualizado                                                                                            |
| 15  | Plataforma            | **Só macOS (Apple Silicon)**                                                                                                                                                                                                                                                                                                                                                                               | É onde você usa; um build só                                                                                           |
| 16  | Distribuição          | **Build local só para você** agora; **open source depois** (atribuição Apache-2.0 e `NOTICE` desde o dia 1)                                                                                                                                                                                                                                                                                                | Validar antes de publicar                                                                                              |
| 17  | Subagents             | **Igual ao Claude Code**: card ao vivo na conversa, árvore com status, histórico de cada um; stop individual onde o provedor permitir; mensagens ao subagent vão via agente principal                                                                                                                                                                                                                      | É a melhor experiência que existe hoje                                                                                 |
| 18  | Entrega               | **Fatia vertical com Claude e Codex juntos** (M1), depois M2 e M3                                                                                                                                                                                                                                                                                                                                          | Você começa a usar cedo                                                                                                |
| 19  | Anexos                | **Já na v1**: anexar arquivos e imagens em todo composer. **Sem ditado por voz**                                                                                                                                                                                                                                                                                                                           | Faz parte de usar no dia a dia; o Paseo já tem (`file-upload`, `prompt-attachments`)                                   |
| 20  | Login nos provedores  | **Funciona direto** com o login que você já tem nos CLIs (como o Paseo); se faltar login, **Entrar no Claude/Codex dentro do app**, sem abrir terminal                                                                                                                                                                                                                                                     | Instalar e já usar; o app e o CLI compartilham a mesma credencial                                                      |
| 21  | Ambiente estrito      | **quality-kit em modo time** (`.quality/` no repo): gate no fim do turno (inclusive dos subagentes), regras protegidas e prova em tela. **Sem plano por tarefa** (`requirePlan: false`) **e sem o fluxo `task`/`ship`**: a spec é o plano. As regras do projeto (arquitetura, componentes, composição) entram nele. Lint em **ESLint flat config + typescript-eslint** (o quality-kit exige; o oxlint sai) | Faz o agente não conseguir entregar código ruim, em vez de só pedir. Modo time porque o repo vai ser open source       |
| 22  | Design antes de regra | Mudanças de arquitetura ou de padrão são **conversadas antes** (uma pergunta por vez, com recomendação), registradas na spec ou num ADR, e só então viram regra no quality-kit                                                                                                                                                                                                                             | O quality-kit garante as regras, mas não as decide; é a parte que fizemos nesta sessão                                 |

## 3. Arquitetura

```
┌──────────── Interlock.app (Tauri) ────────────┐
│  WebView (WKWebView)  ← packages/app (esta UI)│
│        │ WebSocket JSON (127.0.0.1)           │
│  Sidecar: interlockd  ← packages/server (fork)│
└───────┬───────────────────────────────────────┘
        ├─ claude  (Claude Agent SDK, processo por sessão)
        ├─ codex app-server (JSON-RPC stdio, processo por sessão)
        ├─ git (worktrees, diff) · gh (PR, checks)
        └─ node-pty (terminais)
```

- **Monorepo** (npm workspaces):
  - `apps/desktop` (Tauri: janela, menu bar, notificações, seletor de pasta, supervisão do sidecar)
  - `packages/app` (UI React/Vite, movida do testing-ui)
  - `packages/server` e `packages/protocol` (fork do Paseo, enxugado)
  - `packages/client` (cliente WebSocket tipado, do Paseo)
- **Sidecar:** o daemon vai empacotado como **runtime Node + bundle do daemon**, com o `node-pty` pré-compilado para darwin-arm64. Binário único (Bun ou Node SEA) só se funcionar com o módulo nativo.
  - O Tauri sobe o sidecar, lê o PATH do login shell (para achar `claude`, `codex` e `gh`) e reinicia se cair.
- **Protocolo:** o do Paseo (JSON, `requestId`, pushes `agent_update` / `agent_stream` / `checkout_diff_update` / `agent_permission_request`), cortando o que não usamos.
  - Na UI, um **adaptador** traduz os eventos normalizados (`AgentTimelineItem`, `todo`, `provider_subagent`, `usage_updated`) para os tipos do nosso store.
  - O `stores/simulation.ts` sai.
- **Persistência:** como no Paseo. Registros JSON em `~/.interlock` (projetos, workspaces, agentes, configurações). As conversas são reconstruídas do histórico do próprio provedor (`~/.claude/projects`, `~/.codex/sessions`).
- **Auth:** nenhuma conta nossa. `claude`, `codex` e `gh` usam os logins que você já tem; o app só detecta e, se faltar, dispara o login do próprio provedor (fluxo 1).
  - O uso restante lê o token do Claude no Keychain (o macOS pede permissão uma vez) e o `~/.codex/auth.json` do Codex, sem nunca renovar tokens.

### O que cortar do fork

Relay/E2EE, hub, app mobile e Expo, toda a parte de voz (ditado e conversa falada), plugins, schedules (automações), labels, browser embutido, providers além de Claude e Codex, website, CLI pública (fica só o necessário para dev).

## 4. Escopo

**Entra na v1:** projetos; nova tarefa (home); anexos de arquivos e imagens em todo composer; conversa ao vivo com plano, ferramentas, aprovações, perguntas, follow-up e stop; subagents; aba Code com diff e mini-IDE; comentários em lote; Terminal; Checks; Create PR; sidebar com tarefas reais; "Waiting on you"; ⌘K; uso restante; menu bar; notificações; configurações do projeto (setup, env, arquivos, autonomia, modelo padrão).

**Sai da interface na v1 (código fica, escondido):**

- Automations: item da sidebar, atalho G A, entrada no ⌘K, view.
- Library.
- Share: no cabeçalho da thread, no TaskActions e no Toolbar; também Collaborate e Task files.
- Aba Preview e visual edit. A aba padrão do painel passa a ser **Code**, e o card de checkpoint perde a miniatura.
- Card "Connect your tracker", sino de notificações, avatar fixo "L".
- Seção Budget, Gemini, slash commands sem destino (`/handoff`, `/checkpoint`, `/btw`).

**Fora da v1:** ver a seção 5.

## 5. Fora de escopo

O que **não** entra na v1, mesmo que exista no protótipo ou no Paseo. Cortar isso é o que permite a v1 ficar usável cedo.

### Funcionalidades

| Fora                                                              | Por quê                                                                          | Volta quando                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| Automações (agendamentos e gatilhos: issue label, alerta, PR)     | Decisão sua: não agora. O `schedules` do Paseo é cortado do fork                 | Depois da v1 estabilizar, como versão própria |
| Library                                                           | Não precisamos                                                                   | Sem previsão                                  |
| Aba Preview, visual edit, dev server, run script, portas          | Complexo (processos de serviço, proxy, portas por worktree) e leva tempo         | Versão dedicada depois da v1                  |
| Share, Collaborate e "Task files" no chat e no workspace          | Produto local de uma pessoa só; não há para quem compartilhar                    | Só se virar multiusuário                      |
| Avaliação por estrelas ("How was this result?")                   | Não é produto vendido, não há para quem mandar feedback                          | Não volta                                     |
| Orçamento em dólar (Budget, pill de $)                            | O custo real não é confiável nos planos por assinatura; o uso restante substitui | Não volta (o uso restante cobre)              |
| Merge pelo app                                                    | O merge continua no GitHub; o Interlock só detecta e arquiva                     | Talvez junto com o review de PR               |
| Trazer reviews e comentários do PR do GitHub para a tarefa        | Exige sincronizar com a API do GitHub; na v1 o review acontece na aba Code       | Depois de Create PR + Checks estarem sólidos  |
| Mais de um agente principal por tarefa e `/handoff` entre agentes | Uma tarefa = um agente na v1                                                     | Quando houver um caso real de troca de agente |
| `/checkpoint`, rewind e fork da conversa                          | O Paseo suporta, mas não é essencial para usar                                   | Fácil de trazer do fork depois                |
| `/btw` e outros slash commands sem destino                        | Não mapeiam para nada nos provedores                                             | Só se ganharem função                         |
| Voz: ditado e conversa falada com o agente                        | Decisão sua: o Interlock não terá voz                                            | Sem previsão                                  |
| Mensagem direta para um subagent                                  | Os provedores não oferecem; a mensagem vai pelo agente principal                 | Se Claude ou Codex expuserem isso             |
| Importar sessões do Claude/Codex iniciadas fora do Interlock      | Não é preciso para começar                                                       | Depois da v1 (o Paseo tem `thread/list`)      |

### Integrações e provedores

| Fora                                                                 | Por quê                                            | Volta quando                               |
| -------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| Gemini, Copilot, OpenCode, Cursor e outros agentes                   | A v1 é só Claude Code e Codex                      | Um provedor por vez, pelo mesmo adaptador  |
| Conectores (Linear, Sentry, "Connect your tracker", importar issues) | Não existem no Interlock; o card e os atalhos saem | Junto com as automações                    |
| Adicionar projeto clonando do GitHub ou criando pasta nova           | A v1 só aceita uma pasta git que já existe         | Logo depois da v1 (o Paseo já tem o fluxo) |

### Plataforma e distribuição

| Fora                                              | Por quê                                   | Volta quando                   |
| ------------------------------------------------- | ----------------------------------------- | ------------------------------ |
| Linux e Windows                                   | Só macOS (Apple Silicon) na v1            | Quando for open source         |
| Assinatura, notarização, DMG e auto-update        | Build local só para você validar          | Na publicação open source      |
| Release pública e docs para terceiros             | Primeiro validar com uso real             | Depois da v1                   |
| Acesso remoto, app mobile, relay, várias máquinas | Tudo local, numa máquina                  | Sem previsão (cortado do fork) |
| Contas, times, sincronização na nuvem             | Sem servidor nosso; só os logins dos CLIs | Sem previsão                   |
| Telemetria e analytics                            | App local e pessoal                       | Sem previsão                   |

## 6. Fluxos

1. **Primeiro uso e login:** uma tela mostra, por provedor, se está instalado, logado e em qual plano.
   - Já logado no CLI → funciona na hora, sem fazer nada.
   - Sem login → botão **Entrar**:
     - **Codex:** login ChatGPT pelo próprio `codex app-server` (`account/login/start`), que abre o navegador e volta sozinho.
     - **Claude:** o daemon roda o login do CLI (`claude auth login`) e abre o navegador; o app confirma por `claude auth status`.
     - A credencial fica onde o CLI já guarda (Keychain / `~/.codex`), então o terminal também passa a funcionar.
   - CLI não instalado → mostra o comando de instalação.
   - Precisa de `git` e de pelo menos um entre Claude e Codex. O `gh` é opcional; sem ele, Create PR e Checks avisam o que falta e oferecem `gh auth login`.
   - Sair (logout) e trocar de conta ficam em Configurações → Contas.
2. **Adicionar projeto:** "+" → seletor de pasta → o daemon detecta se é git (branch padrão e remote) ou pasta simples → projeto na sidebar.
   - Pasta sem git é um projeto como os outros, sem as funções de git: a tarefa roda direto na pasta (sem worktree, branch, aba Code, Checks nem Create PR), a bandeja diz "Runs in this folder, no git. The agent edits your files in place." e Environment/Scripts saem das configurações. Se a pasta virar um repositório (`git init`), o daemon reclassifica e as funções de git aparecem.
   - Na primeira tarefa, sugere o setup pelo lockfile.
3. **Nova tarefa:** prompt, agente/modelo/esforço, branch de partida ("New worktree from") e "Plan first" (opcional). Ao enviar:
   - `git worktree add -b agent/<id>-<slug>`, cópia dos arquivos configurados, setup (a saída aparece no Terminal → setup);
   - sessão do provedor no modo de autonomia do projeto;
   - em paralelo, a IA rápida renomeia título e branch.
4. **Conversa:**
   - O texto, o raciocínio e as ferramentas entram ao vivo.
   - O plano vem do TodoWrite/TaskCreate ou do `update_plan`, com status e `activeForm` **reais**. O progresso inventado sai.
   - Aprovações e perguntas viram "Needs you" com Approve/Deny ou opções.
   - Plan mode termina num card de aprovação do plano.
   - Mensagem durante um turno entra no turno (steer).
   - **Stop interrompe de verdade** (hoje chama discard).
5. **Anexos (em todo composer: home, conversa e subagent):**
   - O "+" abre o seletor de arquivos. Também dá para arrastar e soltar e colar imagem (⌘V). Os anexos aparecem como chips acima do campo, com miniatura nas imagens e um "×" para remover.
   - **Imagens** vão como entrada nativa do modelo (bloco de imagem no Claude, `localImage` no Codex).
   - **Outros arquivos** (logs, PDFs, CSVs…) são copiados para `~/.interlock/uploads/<tarefa>/` e o prompt leva o caminho, para o agente ler, como o Paseo faz.
6. **Review:** aba Code com o diff real contra o merge-base, atualizado quando arquivos mudam. Mini-IDE. Comentários em lote viram um follow-up.
7. **PR:** Create PR faz push e `gh pr create` (título e corpo do agente) → número e link → aba Checks via `gh pr checks` a cada ~30s → mergear no GitHub → o Interlock detecta, marca "Merged" e arquiva a worktree.
8. **Discard:** para o agente e remove a worktree e a branch local, com confirmação.
9. **Fechar:** o app vai para o menu bar (ícone com contagem de rodando/esperando). O ⌘Q pergunta se para os agentes.

## 7. O que muda no protótipo (UI)

- **Tipos:**
  - `Project` ganha `rootPath`, `remoteUrl` e as configurações reais.
  - `startedMin`/`updatedMin` viram timestamps.
  - Saem `agent.progress`, `cost`, `checks` fictícios, papéis de subagent inventados, `findings` e `usedIn`.
  - `ToolName` abre para os tipos reais (`shell`, `read`, `edit`, `write`, `search`, `fetch`, `mcp`).
- **Fontes de dados:** projetos, diffs, logs e PR deixam de vir de `src/mocks` (14 arquivos importam projetos direto) e passam a vir do store alimentado pelo cliente do daemon.
- **Comportamento:**
  - `liveSteps()` deixa de sobrescrever o status dos passos.
  - `taskClock` usa tempo real.
  - O cartão de aprovação usa o comando real em vez de interpretar `hold.title`.
- **Rotas:** as telas viram URLs (`/`, `/thread/:id`, `/project/:id/settings`…). A prova em tela do quality-kit abre cada rota, e a notificação do macOS abre direto a tarefa.
- **Composer:** o "+" (Add files) ganha função em todo composer (home, conversa, subagent): seletor de arquivos, arrastar e soltar, colar imagem, chips de anexos. O botão de microfone (Dictate) sai.
- **Terminal:** passa a ser xterm.js de verdade. Painéis: **setup** (saída do setup) e **shell** (interativo na worktree). O painel "agent" sai (os comandos do agente aparecem na conversa), e "dev server" sai junto com o Preview.
- **Status bar do mini-IDE:** "Spaces/UTF-8/LF" sai ou é detectado do arquivo.

## 8. Design de engenharia

> **Ponto de partida, não dogma.** Estas escolhas são os padrões iniciais. O agente pode mudar qualquer uma quando isso claramente ajudar (simplifica, corrige um problema real, segue melhor o Paseo). Basta registrar o quê e por quê numa nota curta em `docs/decisions/` (ADR de poucas linhas).

### Estrutura de pastas

**O monorepo:**

```
interlock/
├─ apps/
│  └─ desktop/            app Tauri
│     └─ src-tauri/       Rust
├─ packages/
│  ├─ app/                a interface (React)
│  ├─ server/             o daemon (fork do Paseo)
│  ├─ protocol/           formatos compartilhados (zod)
│  └─ client/             cliente WebSocket tipado
├─ docs/
│  ├─ spec-v1.md
│  ├─ decisions/          ADRs curtos
│  └─ upstream-sync.md    divergências do Paseo
├─ AGENTS.md → CLAUDE.md
└─ NOTICE, LICENSE
```

| Pasta               | O que vai nela                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `apps/desktop`      | Janela, menu bar, notificações, seletor de pasta, supervisão do sidecar, PATH do login shell  |
| `packages/app`      | Toda a interface: telas, componentes, hooks, store                                            |
| `packages/server`   | Agentes (Claude, Codex), worktrees, git e diff, terminal, uso restante, uploads, persistência |
| `packages/protocol` | Schemas zod e tipos das mensagens entre UI e daemon                                           |
| `packages/client`   | Cliente WebSocket tipado, usado pela UI e pelos testes                                        |

**Dentro do `packages/app/src` (onde ficam os componentes):**

```
src/
├─ app/                      casca: App.tsx, troca de telas, atalhos globais
├─ features/                 uma pasta por domínio
│  └─ thread/                (exemplo de uma feature)
│     ├─ components/
│     │  ├─ ThreadPage/              uma pasta por componente
│     │  │  ├─ ThreadPage.tsx        visual
│     │  │  └─ useThreadPage.ts      lógica
│     │  ├─ Composer/
│     │  │  ├─ Composer.tsx
│     │  │  ├─ useComposer.ts
│     │  │  └─ AttachmentChip/       peça usada só pelo Composer
│     │  │     └─ AttachmentChip.tsx
│     │  ├─ ThreadHeader/
│     │  │  └─ ThreadHeader.tsx      só props → sem hook
│     │  └─ blocks/                  área da feature com várias peças
│     │     ├─ StepItem/
│     │     │  ├─ StepItem.tsx
│     │     │  └─ useStepItem.ts
│     │     └─ HoldCard/
│     │        └─ HoldCard.tsx
│     ├─ hooks/                      hooks usados por 2+ componentes da feature
│     │  └─ useThread.ts
│     └─ utils/                      funções puras da feature (+ testes)
│        ├─ planSteps.ts
│        └─ planSteps.test.ts
├─ components/               compartilhado entre features
│  ├─ ui/                    primitivas sem domínio, também uma pasta cada
│  │  ├─ Button/Button.tsx
│  │  └─ Modal/
│  │     ├─ Modal.tsx
│  │     └─ useModal.ts
│  ├─ layout/                peças de página: MainBar
│  └─ effort/                peças de domínio usadas por 2+ features
├─ hooks/                    hooks usados por 2+ features
├─ lib/                      funções puras compartilhadas (sem React)
├─ daemon/
│  ├─ connection.ts          conexão com o daemon
│  └─ adapters/              protocolo → tipos do store (+ testes)
├─ stores/                   zustand: app-store.ts e slices/
└─ types/                    tipos de domínio
```

**Onde colocar cada coisa:**

| Se é…                                              | Vai em                                          |
| -------------------------------------------------- | ----------------------------------------------- |
| Componente usado só numa feature                   | `features/<feature>/components/X/`              |
| Peça usada só por um componente                    | Dentro da pasta dele: `X/Peca/`                 |
| Componente usado por 2+ features                   | `components/<grupo>/`                           |
| Primitiva visual sem domínio (botão, modal, campo) | `components/ui/`                                |
| Hook com a lógica de um componente                 | Na pasta do componente: `X/X.tsx` + `X/useX.ts` |
| Hook reusado dentro de uma feature                 | `features/<feature>/hooks/`                     |
| Hook usado por 2+ features                         | `hooks/`                                        |
| Função pura de uma feature                         | `features/<feature>/utils/`                     |
| Função pura compartilhada                          | `lib/`                                          |
| Tradução do protocolo para o store                 | `daemon/adapters/`                              |
| Estado global                                      | `stores/slices/`                                |
| Tipo de domínio                                    | `types/`                                        |

- **Uma pasta por componente, sempre:** `Composer/` guarda tudo do Composer (`Composer.tsx`, `useComposer.ts`, teste, peças só dele). Nada de arquivos soltos em `components/`, mesmo para componentes só de props.
- **Os arquivos repetem o nome do componente** (`Composer/Composer.tsx`, não `Composer/index.tsx`), para as abas do editor e a busca mostrarem o nome certo. Sem `index.ts` de barril; o import fica `…/Composer/Composer`.
- **Peças privadas moram dentro** da pasta do componente que as usa. Se outro componente passar a usar, a peça sobe um nível (ou vai para `components/` se for de outra feature).
- **Áreas:** uma feature grande agrupa as pastas de componentes em subpastas por área (`thread/components/blocks/`, `workspace/components/diff/`).
- **Testes:** ficam ao lado do arquivo testado (`planSteps.test.ts`).

### Regras de dependência

- `app → client → protocol` e `server → protocol`. A UI **nunca** importa o server; o server nunca importa a UI.
- `protocol` só depende de `zod`: é a fonte única dos formatos que cruzam o processo.
- Dentro do `app` continuam as regras de hoje: feature não importa de feature; o compartilhado vai para `components/`, `hooks/` ou `lib/`; arquivos pequenos e coesos.

### Padrão de componentes: visual separado da lógica

Todo componente com lógica vira um par: **o `.tsx` só desenha, o `use<Nome>.ts` ao lado pensa.** Funções puras ficam em `utils/`.

```
features/home/
├─ components/
│  └─ WaitingOnYou/
│     ├─ WaitingOnYou.tsx       visual: recebe tudo do hook e devolve JSX
│     └─ useWaitingOnYou.ts     lógica: store, estado, efeitos, derivações e ações
└─ utils/
   ├─ waiting.ts                puro (sem React): filtros, ordenação, cálculos
   └─ waiting.test.ts
```

```tsx
// WaitingOnYou.tsx
export function WaitingOnYou() {
  const { waiting, working, open } = useWaitingOnYou();
  return <section>{/* só marcação, sem regra de negócio */}</section>;
}

// useWaitingOnYou.ts
export function useWaitingOnYou() {
  const agents = useStore((s) => s.agents);
  const openThread = useStore((s) => s.openThread);
  return { waiting: waitingOn(agents), working: countWorking(agents), open: openThread };
}
```

**Regras:**

1. **Três camadas, numa direção:** `Componente.tsx → useComponente.ts → utils/*.ts`. O hook nunca importa o componente, e `utils` nunca importa React.
2. **O `.tsx` não tem lógica.**
   - Ele não acessa o store, o cliente do daemon nem `useEffect`/`useLayoutEffect`/`useReducer`.
   - É permitido: props, `useId`, `ref` de DOM, estado puramente visual (aberto/fechado, hover) e chamar o hook do par.
3. **Quando criar o par:** assim que o componente precisar de store, efeito, mais de um estado, derivação que não seja trivial, ou um handler com mais de uma chamada. Componente só de props → JSX fica sozinho, sem hook vazio.
4. **Nome e lugar:**
   - O hook se chama `use` + nome do componente e fica **na pasta do componente**. É usado só por aquele componente.
   - Se outro componente precisar da mesma lógica, ela sobe para `hooks/` (da feature ou compartilhado) com um nome genérico.
   - Páginas seguem o mesmo padrão: `ThreadPage.tsx` + `useThreadPage.ts`.
5. **O hook devolve um objeto** com os dados e as ações que a view usa (o "view model"), com nomes do ponto de vista da tela (`open`, `retry`), não do store.
6. **Primitivas de `components/ui`** (Popover, Modal…) podem usar hooks de comportamento de DOM compartilhados (`useEscape`, `useClickOutside`, `useFocusTrap`), mas nunca o store nem o daemon.
7. **Testes:** a lógica difícil fica em `utils/` e ganha teste unitário. O hook só ganha teste (`renderHook`) quando orquestra algo complexo. O `.tsx` não precisa de teste de lógica, porque não tem.

**Como é garantido (no ambiente estrito):**

- O lint proíbe, nos `.tsx` de `features/**/components`:
  - importar o store e o cliente do daemon;
  - importar `useEffect`, `useLayoutEffect` e `useReducer`.
- `.ts` não aceita JSX, então o hook não consegue desenhar.
- O verificador de arquitetura e nomes do quality-kit (regras do projeto em `.quality/`) confere que:
  - `useX.ts` só é importado por `X.tsx`;
  - todo hook pareado tem o nome do componente;
  - todo componente está numa pasta com o nome dele (nada solto em `components/`);
  - `utils/` não importa React.
- O mesmo verificador garante a direção `tsx → hook → utils`.

### Composição: componentes pequenos que se encaixam

**A tela é montada juntando peças pequenas, não configurando um componente gigante com dezenas de props.**

```tsx
// Evitar: configurar
<TaskCard compact showBranch showDiff hideActions withPreview title={t} onPr={…} onDiscard={…} />

// Preferir: compor com slots (props que recebem elementos)
<TaskCard
  header={<TaskHeader title={t} badge={<BranchBadge branch={b} />} />}
  actions={<CreatePrButton task={t} />}
>
  <DiffStat additions={a} deletions={d} />
</TaskCard>
```

**Regras:**

1. **Uma responsabilidade por componente.** Se o nome precisa de "e" para descrever o que faz, são dois componentes. O orquestrador de uma tela fica enxuto (~120–170 linhas) e só junta peças.
2. **Conteúdo entra por slots:** props que recebem elementos (`header={<TaskHeader />}`, `actions={…}`, `footer={…}`, tipadas como `ReactNode`) e `children` para o conteúdo principal, não como uma fileira de flags booleanas. Variações visuais usam **uma** prop `variant`, não `isCompact + isGhost + hasBorder`.
3. **Sem componentes com ponto** (`TaskCard.Header`, `Modal.Footer`): cada parte é um componente próprio, importado normalmente, e entra no pai por slot. O pai só define onde cada slot aparece.
4. **Nada de prop drilling além de 2 níveis:** passe o elemento já montado pelo slot (quem tem os dados monta a peça), ou use o hook do par lá embaixo.
5. **Contrato de props:** dados entram, eventos saem (`onOpen`, `onDiscard`). Nunca passe `setState` ou o store como prop. Folhas são apresentacionais; a lógica fica no topo de cada subárvore (padrão view + hook).
6. **Listas = item + lista:** `TaskList` renderiza `TaskRow`; o item recebe só o que precisa (id ou dados), não a lista inteira.
7. **Um estado visual, um componente:** em vez de um componente cheio de `if` para pendente/concluído/erro, um componente por estado e um pai que escolhe qual mostrar.
8. **Reuso antes de criar:** antes de um novo botão, card ou campo, usar ou estender as primitivas de `components/ui` e as receitas de `styles.ts`.

**Como é garantido (no ambiente estrito):**

- O lint limita:
  - a profundidade de JSX (`react/jsx-max-depth`);
  - as linhas por arquivo e por função;
  - a complexidade por função.
- Uma regra do projeto no quality-kit acusa:
  - componente com mais de 3 props booleanas ou mais de 10 props, apontando para slots ou `variant`;
  - componentes com ponto (atribuir uma parte ao componente, como `TaskCard.Header = …`).
- O knip e o jscpd pegam componentes mortos e marcação duplicada (sinal de que faltou extrair uma peça).
- Prop drilling e responsabilidade única não dão para medir com segurança: entram no checklist de review do `AGENTS.md`.

### Como os dados fluem

- **O daemon é a fonte da verdade.** Todo efeito colateral (processos, arquivos, git, rede, Keychain) acontece nele. A UI não toca em disco nem em processo.
- **A UI é uma réplica.** O store zustand é atualizado pelos pushes do daemon (`agent_update`, `agent_stream`, `checkout_diff_update`…). Ações viram requisições tipadas pelo `client`. Atualização otimista só em coisas triviais (por exemplo, renomear).
- **Um único lugar traduz o protocolo:** `packages/app/src/daemon/adapters/`. São funções puras que transformam `AgentTimelineItem`, `todo` e `provider_subagent` nos blocos da conversa. Se o provedor mudar, só os adaptadores mudam.
- **Provedores atrás de uma interface:** `AgentClient` / `AgentSession` (do Paseo). Claude e Codex são implementações; a UI não sabe qual está rodando, a não ser pelo nome e ícone.
- **Eventos em rajada:** deltas de texto e ferramentas são agrupados por frame antes de ir para o store, para a conversa não travar.

### Técnicas

- **TypeScript estrito.** Validação com zod **nas fronteiras de confiança** (mensagens WebSocket, arquivos em disco, saída dos CLIs), não entre funções internas.
- **Erros:**
  - O daemon responde com erros tipados e um código (`rpc_error`).
  - A UI mostra uma mensagem acionável (o que aconteceu e o que fazer). Nada é engolido em silêncio.
  - Logs em `~/.interlock/daemon.log`, nunca com tokens.
- **Testes (pirâmide):**
  - unitários (vitest) para adaptadores, parsers e regras puras;
  - testes de contrato para os schemas do protocolo;
  - testes de provedor com o provedor mock e fixtures gravadas do Paseo, sem chamar APIs reais na CI;
  - poucos smoke e2e (daemon + repo git temporário);
  - na UI, QA manual com screenshots.
- **Fork saudável:**
  - Remote `upstream` apontando para o Paseo.
  - Mexer o mínimo nos arquivos herdados; preferir módulos novos ao lado.
  - Registrar divergências em `docs/upstream-sync.md`.
  - Cortar código morto sem dó (knip, como o Paseo usa).
- **Persistência:** JSON com escrita atômica (do Paseo), com campo `version` para migrações simples quando precisar.
- **Segurança:**
  - O daemon só escuta em `127.0.0.1`, com um token aleatório por execução que só a janela do app conhece.
  - Credenciais dos provedores apenas lidas, nunca renovadas nem copiadas.
- **Fluxo de trabalho:**
  - Um item de marco por branch, em commits pequenos (conventional commits).
  - O gate do quality-kit roda no fim de cada turno do agente, no commit, no push e na CI (typecheck, ESLint, arquitetura, testes, knip, jscpd, dívida, integridade das regras), mais build e as checagens de Rust.
- **Estilo:** nos pacotes herdados, seguir o estilo do Paseo; no `app`, as regras atuais (CLAUDE.md global, README, DESIGN.md).
- **Comentários só quando muito necessários:** o padrão é não comentar. Só fica o comentário que evita um erro de leitura (um porquê não óbvio, workaround, limitação externa, pegadinha). Nada de doc comment em todo componente ou função.

## 9. Como o agente trabalha

- **Na dúvida de como resolver algo, olhe primeiro como o Paseo resolve.** O código está em `~/Documents/personal/paseo`. Antes de inventar uma solução para qualquer problema não trivial, procure a dele e prefira reaproveitar; divergir é permitido, com motivo registrado. Exemplos: subir processos, PATH no app, casos de borda de worktree, peculiaridades dos protocolos do Claude/Codex, terminal, diff, login, uso restante.
  - Comece por: `CLAUDE.md`, `docs/architecture.md`, `docs/agent-lifecycle.md`, `docs/data-model.md`, `docs/timeline-sync.md`, `docs/providers.md`.
  - Depois: `packages/server/src/server/agent/providers/{claude,codex}`, `packages/server/src/utils/worktree.ts`, `packages/desktop/src`, `packages/server/src/services/quota-fetcher`.
- **Execução direta pela spec:** sem plano curto nem aprovação por tarefa, e sem o fluxo `task`/`ship` do quality-kit, porque a spec já é o plano. O gate continua obrigatório. O trabalho fica numa branch `v1`, em ordem de marco, com commits verdes, e o PR no final é aberto com `gh`, levando as evidências e a lista de decisões tomadas no caminho.
- **Trabalho em paralelo:** itens independentes vão para subagentes em paralelo, com arquivos separados; a integração e a verificação final ficam na thread principal.
- **Decisões:** técnicas o agente toma e registra (seção 8); decisões de produto (o que o usuário vê ou sente) voltam para você.
- **Verificação antes de dar como feito:** typecheck, testes e build passando; rodar no app Tauri; screenshots das telas mexidas.
- **Spec viva:** marcar os checkboxes da seção 10 conforme os itens fecham e atualizar este documento quando algo mudar.

## 10. Marcos

**M0 — Fundação ()**

- [ ] Monorepo `interlock` com git, workspaces, `NOTICE` e atribuição ao Paseo
- [ ] Fork de `server`/`protocol`/`client` enxugado, compilando e com testes do fork passando
- [ ] Tauri sobe o sidecar com o PATH do login shell; a UI conecta no WebSocket
- [ ] UI movida para `packages/app`, ainda com mocks, rodando dentro do Tauri (validada no WebKit)
- [ ] quality-kit em modo time: regras do projeto (arquitetura, nomes, componentes, composição) e a dívida do código herdado congelada
- [x] Rotas na UI (uma URL por tela) para a prova em tela e para abrir a tarefa pela notificação
- [ ] Limpeza de comentários na UI migrada: sair tudo que só repete o nome ou narra o código, e ficar só o que for de fato necessário (regra do `CLAUDE.md`)

**M1 — Usável no dia a dia ()**

- [ ] Primeiro uso: detectar Claude/Codex/gh instalados e logados, e **Entrar** no Claude e no Codex dentro do app
- [ ] Adicionar projeto pelo seletor de pasta; projetos persistem
- [ ] Nova tarefa com Claude **e** Codex numa worktree nova
- [ ] Conversa ao vivo: texto, raciocínio, ferramentas, plano real, aprovações/perguntas, plan mode, follow-up, stop
- [ ] Sidebar, "Waiting on you" e ⌘K com dados reais; as tarefas sobrevivem a reiniciar o app
- [ ] Aba Code com o diff real e mini-IDE
- [ ] Modelos e esforço reais por provedor
- [ ] Pill de uso restante (Claude + Codex)
- [ ] Anexos (arquivos e imagens) em todo composer
- [ ] Itens fora de escopo escondidos

**M2 — Autonomia ()**

- [ ] Subagents no padrão do Claude Code (Claude e Codex)
- [ ] Terminal real (setup + shell)
- [ ] Comentários em lote para o agente
- [ ] Configurações do projeto valendo (setup, env, arquivos, autonomia, modelo padrão)
- [ ] Menu bar, notificações do macOS e badge

**M3 — Fechamento do ciclo ()**

- [ ] Create PR + Checks via `gh`
- [ ] Detectar merge → arquivar a worktree; Discard com limpeza
- [ ] Títulos e branches por IA

## 11. Riscos

| Risco                                                                                  | Mitigação                                                                                                                                         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node-pty` (módulo nativo) dentro do sidecar                                           | Empacotar runtime Node + `.node` pré-compilado; validar no M0 antes de tudo                                                                       |
| WebKit renderiza diferente do Chromium (blur, container queries, motion)               | Validar a UI no Tauri no M0; corrigir com prefixos e fallbacks                                                                                    |
| APIs de uso (`/api/oauth/usage`, `wham/usage`) não são oficiais e podem mudar          | Falha silenciosa: o anel some e o popover diz "indisponível"; nunca bloqueia o app                                                                |
| Protocolo do CLI do Claude e do `codex app-server` mudam por versão                    | Fixar versões mínimas, checar `--version` no primeiro uso, trazer correções do upstream do Paseo                                                  |
| O fork é grande (~170k linhas no servidor)                                             | Cortar agressivamente no M0; manter só o que a v1 usa                                                                                             |
| Comandos de login dos CLIs mudam (`claude auth login`, `account/login/start` do Codex) | Confirmar no M0 contra as versões instaladas; sem suporte, cair para "rode `claude` / `codex login` no terminal" com o comando pronto para copiar |
| Ler o Keychain do Claude                                                               | Explicar antes do prompt do macOS; sem permissão, só o anel do Claude fica indisponível                                                           |

## 12. Padrões assumidos (dá para vetar)

- Worktrees em `~/.interlock/worktrees/<projeto>/<slug>`, prefixo de branch `agent/`, ID da tarefa `<CHAVE>-<n>` (como hoje).
- Uma tarefa = um agente principal (os subagents ficam dentro dele).
- "Ready for review" = o agente terminou o turno com mudanças na worktree; sem mudanças = "Idle".
- As conversas não são duplicadas: a fonte é o histórico do provedor (como no Paseo).
- As skills sugeridas na home vêm das listas reais do Claude/Codex para aquele projeto.
- Atualização do uso restante a cada 5 min; da aba Checks a cada 30s.

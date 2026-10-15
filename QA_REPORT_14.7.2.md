# LIFE OS 14.7.2 — Segunda auditoria de estabilidade

## Base
Auditoria independente realizada diretamente sobre o ZIP completo da versão **14.7.1**, extraído em uma pasta nova. Não foi alterada a estrutura do aplicativo, as folhas CSS, imagens, funcionalidades FREE/PRO, contratos Supabase, SQL ou pagamento. A atualização modifica somente o Cérebro, a montagem de seu contexto pela interface, versões/caches e testes/documentação.

## Falhas concretas encontradas e corrigidas
1. **Prioridades “Alta” e “Baixa” ignoradas.** O Cognitive Engine verificava a palavra inglesa `high`, enquanto o app grava `Alta`, `Normal` e `Baixa`. Agora reconhece os nomes efetivamente usados e importações legadas em inglês.
2. **Prazos com fuso horário interpretados pelo dia errado.** A análise cortava os dez primeiros caracteres da data ISO e usava a data UTC como dia local. Agora datas completas são convertidas ao calendário do dispositivo; datas simples continuam sendo datas civis, sem conversão indevida. Dias são comparados por calendário, não por tempo de 24 horas entre fusos.
3. **Memória personalizada desconectada da conta no uso real.** A integração chamava o novo motor sem `userId`, impedindo acesso ao armazenamento separado por conta. Agora o ID só é passado quando o PRO está autorizado, a memória está habilitada e o escopo corresponde à conta ativa.
4. **LIFE AI reutilizava a análise da Home mesmo com a memória da conversa desabilitada.** Agora o chat recalcula sua análise conforme as permissões atuais, sem usar o perfil privado fora da opção correspondente.
5. **Grafo de contexto compartilhava referências de áreas desativadas.** Contagens e links do grafo podiam incluir tarefas, metas ou projetos além das categorias autorizadas. Agora são filtrados, inclusive vínculos entre duas áreas, que exigem ambas permitidas.
6. **Simulação considerava tarefas já concluídas.** Agora a soma considera somente tarefas abertas e apresenta a quantidade de tarefas sem duração.
7. **Feedback negativo podia esconder sugestões urgentes.** Agora o feedback reduz a prioridade, mas não suprime inteiramente um alerta de prazo iminente.
8. **Identificadores e cache da versão anterior.** Manifest, HTML, config e Service Worker agora referem o build 14.7.2, com motor renomeado e arquivo físico correspondente. Testes anteriores com versões literais foram atualizados.

## Validação local concluída
- **8 suítes de testes**, incluindo 31 casos adicionais de regressão e privacidade, executadas com status 0.
- **20 arquivos JavaScript do app/Service Worker** aprovados por `node --check` (além dos testes CJS).
- **19 CSS** analisados sem erros de parsing.
- **3 arquivos TypeScript** das Edge Functions transpilados para verificação de sintaxe (não substitui deploy nem testes operacionais).
- Referências locais do HTML e caminhos do cache verificados; ZIP testado contra corrupção com `testzip`, `index.html` na raiz e menos de 100 arquivos.
- Comparação byte a byte com o ZIP 14.7.1: nenhuma folha de estilo, imagem, arquivo SQL, função Supabase ou módulo de pagamento foi alterado.

## Limitações e checklist de homologação
Os testes de código e lógica local **não** representam teste ponta a ponta do aplicativo com sessão real. Ainda falta validar no domínio publicado:
- Login, troca de contas, permissões FREE/PRO/OWNER e exclusão de dados em navegador real.
- Suporte a diferentes fusos, sincronização entre dispositivos, restauração de dados e regras RLS.
- Chamadas efetivas à LIFE AI remota e à plataforma de clima.
- Checkout Mercado Pago, webhooks e ativação/revogação de assinaturas.
- Navegação e layout completos autenticados em desktop/mobile, inclusive rolagem e acessibilidade.

Antes de publicar em produção, implante em um ambiente de testes e faça backup da versão atualmente funcional. **Não há garantia de zero defeitos em produção.**

# LIFE OS 12.5 — Portão de lançamento comercial

## O que foi corrigido localmente
- **Cache de implantação:** JS/CSS precisam revalidar em Vercel; SW 12.5 só ativa quando todos os arquivos essenciais foram obtidos; páginas de retorno de cobrança não são armazenadas.
- **Backups e nuvem:** importação/restauração só prossegue depois de validar dados e guardar uma cópia local da conta; escrita com falha tenta reverter os valores anteriores. Há botão **Desfazer restauração** em Perfil.
- **Planos:** acesso FREE/PRO/OWNER é derivado somente do perfil autenticado; status vencido, reembolsado, estornado ou suspenso não concede PRO. O retorno do checkout não ativa a assinatura.
- **Checkout:** retorno inválido não marca compra pendente; erros exibidos não mostram mensagens técnicas do backend.
- **Diagnóstico OWNER:** painel local com estado de rede, sincronização, IA, plano, PWA e número de erros; exportação sem conteúdo pessoal.
- **Qualidade:** novas verificações de regressão executáveis por Node e workflow CI do GitHub.

## Bloqueadores externos reais para liberar vendas
1. [ ] **Supabase em homologação:** verificar RLS e privilégios com `database/READONLY_AUDIT_12.5.sql`. Confirmar implementação de `save_life_data_cas` e revogação efetiva do escritor antigo. Não rodar scripts históricos sem revisão.
2. [ ] **Pagamentos Mercado Pago:** função `mercadopago-create-subscription` publicada, preço correto definido **no servidor**, idempotência em criação de assinatura, validação da assinatura de webhook, consulta ao provedor antes de ativar PRO, antifraude e logs sem tokens. O pacote NÃO contém um webhook de cobrança certificado.
3. [ ] **Pagamentos em ambiente teste:** aprovado, pendente, recusado, reembolsado, chargeback, renovado, cancelado, vencido, webhook repetido/fora de ordem, redirecionamento manipulado. Confirmar PRO via perfil no banco.
4. [ ] **Supabase LIFE AI:** Secrets somente no servidor, autenticação, autorização de planos e limites de consumo; testar não exposição de dados privados.
5. [ ] **Contas:** teste real com duas contas FREE/PRO e OWNER; isolamento de dados e eventos, RLS, backup/restore; duas sessões competindo pela mesma revisão; testar falha de quota no dispositivo.
6. [ ] **Browsers:** executar com login em Chrome, Safari e Firefox (desktop/mobile), tamanhos 360/390/768/1280/1440, off/on-line, simular atualização PWA, verificar barra de voltar, foco e teclado.
7. [ ] **Privacidade:** revisar política de dados, procedimento de exclusão/exportação e retenção de relatórios; atenção a usuários menores de idade.
8. [ ] **Operação:** criar deploy preview na Vercel, guardar versão 12.4 para rollback, acompanhar erros sem conteúdo pessoal; ativar rollout controlado com plano de recuperação.

## Publicação segura
Não instalar sobre produção antes de validar os bloqueadores. A atualização do frontend **não configura a conta de cobrança ou as funções Supabase**.

## Comandos locais
```
node tests-generators-12.2.cjs
node tests-integrity-12.3.cjs
node tests-checkout-mock-12.3.cjs
node tests-quality-12.4.cjs
node tests-ui-12.4.cjs
node tests-release-12.5.cjs
```

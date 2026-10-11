# Checklist de publicação — LIFE OS 12.3

## Antes do deploy

- [ ] Backup do projeto e do banco
- [ ] Banco: `database/security.sql` instalado anteriormente e `database/sync-cas-12.3.sql` executado em seguida
- [ ] Supabase: RPC `save_life_data_cas` concedida a authenticated e writer legado revogado
- [ ] Chaves da LIFE AI apenas nos secrets de Edge Functions
- [ ] Não atualizar `profiles.plan` a partir do navegador
- [ ] `mercadopago-create-subscription` e webhook validados no projeto Supabase correto

## Testes na versão publicada

- [ ] Login/logout com duas contas: confirmar que os dados locais não se misturam
- [ ] Trocar de conta no mesmo navegador: baixar backup, confirmar download e separar dados
- [ ] Conta FREE: criar tarefa simples, confirmar que IA não contorna limites PRO
- [ ] Conta PRO: criar tarefa pela LIFE AI; confirmar/cancelar; verificar ação e histórico
- [ ] LIFE AI: comandos ambíguos e comandos maliciosos não alteram dados
- [ ] Treino, série, tarefa, nota, finanças e estudo atualizam Evolução corretamente
- [ ] Dois dispositivos alteram a mesma conta: CAS detecta conflito; nenhum dado novo é perdido
- [ ] Restaurar nuvem e conferir dados depois de reiniciar app
- [ ] Testar checkout válido com conta FREE de TESTE e backend de TESTE
- [ ] Verificar webhook autenticado antes de trocar FREE para PRO
- [ ] Recusado, estornado, cancelado, expirado e renovado: estados corretos
- [ ] OWNER não abre cobrança
- [ ] Celular 390 px e desktop 1440 px; formulário de treino, alimentação, estudos
- [ ] Offline, reconexão, atualização PWA e ativação do novo Service Worker

**Não conclua a etapa de pagamentos reais sem acesso ao backend e testes em ambiente apropriado.**

# LIFE OS 15.6.1 — Revisão funcional e proteção de dados

Projeto completo para publicar no GitHub/Vercel. O arquivo `index.html` fica na raiz. Mantidas todas as abas, o sistema de treinos 15.5, o visual preto e laranja, as pastas semanais e FREE/PRO.

## Correções desta versão

- Planejador: respeita a duração real de uma tarefa já cadastrada como prioridade e avisa quando ela não cabe no tempo informado. Duração de nova prioridade fica identificada como estimativa de 15 minutos.
- Finanças: um lançamento inválido não reserva um identificador duplicado nem esconde outro lançamento válido.
- Alimentação / Minha Cozinha: uma restrição desconhecida informada junto de restrições reconhecidas não é ignorada; receitas não são classificadas como compatíveis sem revisão.
- Estudos: relatórios aceitam IDs de etapas antigos tanto numéricos como texto e ignoram índices duplicados.
- Minha Cozinha: despensa, preferências, compras e favoritos só mudam na tela depois da confirmação de salvamento; falha mostra alerta e preserva os registros anteriores.
- Despensa: itens cuja validade informada passou não são sugeridos no bloco “Use primeiro”; são destacados separadamente.
- Catálogo de receitas: a quantidade de ingredientes na despensa agora é nomeada corretamente, sem insinuar que isso certifica segurança para alergias.

## Publicação

Teste primeiro em uma Vercel separada antes de trocar o domínio. Confira o número **15.6.1** na interface. Os novos arquivos de aplicativo, estilo, configuração e cache possuem versionamento próprio. Os testes locais não equivalem a validar login, assinatura, IA remota e sincronização Supabase na instalação publicada.

Consulte `QA_REPORT_15.6.1.md` para o relatório detalhado.

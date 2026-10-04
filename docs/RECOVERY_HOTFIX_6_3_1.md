# LIFE OS 6.3.1 — Recovery Hotfix

Correções desta revisão:

- validação de formato para dados salvos por versões anteriores antes de o React usar esses valores;
- listas antigas/incompatíveis deixam de causar erro de `.filter`, `.map`, `.slice` ou `.length`;
- objetos de configuração preservam valores válidos e recuperam somente campos incompatíveis;
- tarefas, perfil, preferências e loaders compartilhados foram endurecidos contra dados locais malformados;
- Error Boundary registra o erro de renderização na sessão sem apagar dados;
- build e cache do PWA atualizados para 6.3.1 para evitar servir JavaScript antigo após o deploy.

Nenhuma regra de Supabase, assinatura, preço, login ou banco foi alterada.

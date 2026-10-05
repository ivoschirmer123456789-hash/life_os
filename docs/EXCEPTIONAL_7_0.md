# LIFE OS 7.0.0 — Exceptional

## Direção
A 7.0 não tenta ganhar qualidade adicionando mais telas. Ela melhora a qualidade percebida e funcional das telas existentes: identidade própria por app, interação previsível, acessibilidade, estados de rede e uma apresentação mais premium do produto.

## Produto
Cada app mantém a sua cor e gramática visual, mas usa os mesmos princípios de interação: hierarquia clara, cards com profundidade moderada, estados vazios intencionais, foco visível por teclado e CTAs com feedback imediato.

## FREE / PRO
A camada FREE permanece deliberadamente pequena. As prévias PRO foram mantidas como explicação de profundidade, não como bloqueios cegos. A etiqueta anterior “≈ 80% A MAIS” foi substituída por “PRO · EXPERIÊNCIA COMPLETA” para evitar uma leitura matemática ambígua.

## Acessibilidade e interação
- link “Pular para o LIFE” para teclado;
- foco visível apenas quando a navegação é por teclado;
- nomes acessíveis adicionados a botões de ícone conhecidos;
- foco inicial/restauração e loop de Tab em modais detectados;
- Escape fecha o modal superior quando existe um botão de fechamento;
- inputs de autenticação possuem nomes acessíveis;
- senha pode ser exibida/ocultada;
- Enter envia login/cadastro/recuperação/nova senha nos campos finais.

## PWA e performance
O Service Worker 7.0 usa cache-first para assets locais versionados e atualização em segundo plano. Navegações continuam network-first. Recursos estáticos externos conhecidos (React/CDN/fontes) podem ser reutilizados offline depois de terem sido baixados uma vez. Requisições de dados/API do Supabase não entram nesse cache externo.

## Limites
A validação local não substitui teste real do Supabase, RLS, Mercado Pago, push e LIFE AI remoto no deploy.

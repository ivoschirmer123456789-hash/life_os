# LIFE OS 6.3.4 — Hybrid workout fix

## Corrigido
- O objetivo "Treino híbrido" não pode mais cair silenciosamente em um plano apenas de musculação quando a experiência de corrida é "Não faço atualmente".
- Adicionados planos base híbridos de 2 e 3 dias.
- O híbrido base de 4 dias aceita iniciantes sem experiência atual de corrida, usando sessões confortáveis de entrada.
- Sessões de corrida/cardio usam prescrição própria (`sets: 1`, ritmo confortável/controlado, sem descanso de musculação).
- O player identifica a sessão como Corrida/Cardio, Musculação ou Mobilidade.
- A visão semanal mostra explicitamente quais dias são corrida/cardio e apresenta a contagem da semana híbrida.
- As 1080 variações automáticas foram blindadas: toda variação com tipo Híbrido contém corrida.

## Preservado
- Login, Supabase, assinatura, Owner, pagamentos e demais módulos não foram alterados.

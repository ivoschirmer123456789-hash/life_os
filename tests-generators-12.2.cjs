const assert=require('node:assert/strict');
const rules=require('./assets/js/generator-rules-12.2.js');
let n=0;
function t(desc,fn){try{fn();n++;}catch(e){throw new Error(desc+': '+e.message);}}
const days={2:[1,4],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,5,6],6:[1,2,3,4,5,6]};
const names=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const groups=['Peito','Costas','Pernas','Ombros','Bíceps','Tríceps','Panturrilha','Abdômen','Posterior','Glúteos','Antebraço'];
const library=groups.flatMap((g,i)=>Array.from({length:6},(_,j)=>({id:`${g}_${j}`,name:`${g} exercício ${j}`,muscle_group:g})));
for(let day=2;day<=6;day++)for(const split of ['Full Body','Upper / Lower','Push / Pull / Legs','Upper / Lower + braços e core'])for(const hybrid of [true,false]){
 t(`week ${day}/${split}/${hybrid}`,()=>{
  const plan=rules.makeWeeklyPlan(day,'Saúde e performance','Iniciante',split,hybrid,library,days,names,e=>e.muscle_group);
  assert.equal(plan.length,7);const active=plan.filter(x=>x.active);assert.equal(active.length,day);
  assert.equal(new Set(plan.map(x=>x.dayName)).size,7);
  const mapped=active.flatMap(s=>s.exercises).filter(e=>e.exercise_id).map(e=>library.find(x=>x.id===e.exercise_id)?.muscle_group);
  assert(mapped.includes('Pernas'));assert(mapped.includes('Peito'));assert(mapped.includes('Costas'));
  for(const s of active)assert(s.exercises.length>0);
 });
}
t('daily study frequency',()=>assert.equal(rules.studyFrequency('Todos os dias, com sessões curtas'),7));
for(let i=2;i<=6;i++)t('frequency '+i,()=>assert.equal(rules.studyFrequency(i+' dias'),i));
t('study deadline overcapacity',()=>{const x=rules.studyTimeline(['A','B','C'],[4,4,4],2,2,true);assert(x.warning.includes('não comporta'));assert.equal(x.recommendedWeeks,6);assert(x.timeline[2].when.includes('6'));});
t('study fits',()=>{const x=rules.studyTimeline(['A','B','C'],[2,2,2],3,2,true);assert.equal(x.warning,'');assert.equal(x.recommendedWeeks,2);});
t('study no forced deadline',()=>{const x=rules.studyTimeline(['A','B'],[2,2],3,2,false);assert(!x.warning);assert(x.timeline[0].when.includes('ETAPA'));});
const styles=['Vegana','Vegetariana','Pescetariana','Comida brasileira simples'];
const restrictions=[[],['Lactose'],['Ovo'],['Glúten por diagnóstico/orientação'],['Amendoim / castanhas'],['Ovo','Lactose','Glúten por diagnóstico/orientação']];
const avoids=['','ovo','frango','peixe','arroz','tapioca','lentilha','feijão','pão, queijo'];
for(const style of styles)for(const ints of restrictions)for(const avoid of avoids){
 t(`nutrition/${style}/${ints.join(',')}/${avoid}`,()=>{
  const a={style,intolerances:ints,avoid,meals:'3 refeições + 2 lanches',cook:'Até 10 min',medical:'Não',hunger:'Pouca fome de manhã'};
  const r=rules.buildNutrition(a);assert.equal(r.items.length,5);assert(!r.blocked);
  const forbid=rules.forbidden(a);const found=rules.mealEntries.filter(e=>r.items.some(row=>row.d.startsWith(e.text))).flatMap(e=>e.ingredients);
  for(const ingredient of found){
   const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   for(const w of avoid.split(',').map(norm).filter(Boolean))assert(!norm(ingredient).includes(w) && !(w.includes(norm(ingredient)) && norm(ingredient).length>3),ingredient+': '+avoid);
   if(style==='Vegana')assert(!['ovo','iogurte','queijo','frango','atum'].includes(ingredient));
   if(ints.includes('Ovo'))assert(!['ovo'].includes(ingredient));
   if(ints.includes('Lactose'))assert(!['iogurte','queijo'].includes(ingredient));
   if(ints.includes('Glúten por diagnóstico/orientação'))assert(!['pão','massa','aveia'].includes(ingredient));
  }
  for(const name of r.shopping)assert(!avoids.includes(name)||!avoid.includes(name));
 });
}
t('medical returns neutral',()=>{const x=rules.buildNutrition({medical:'Sim — preciso revisar isso com profissional'});assert(x.blocked);assert.equal(x.shopping.length,0);assert(x.items.every(i=>!i.d.includes('Omelete')));});
t('unknown food restriction returns neutral',()=>{const x=rules.buildNutrition({intolerances:['Outra'],intoleranceOther:'soja',medical:'Não'});assert(x.blocked);assert.equal(x.shopping.length,0);});
t('meal count 3 vs 4',()=>{assert.equal(rules.buildNutrition({meals:'3 refeições'}).items.length,3);assert.equal(rules.buildNutrition({meals:'4 refeições'}).items.length,4);});
console.log(`PASS: ${n} generator assertions across weekly workout balance, study feasibility, food restrictions and personalization.`);

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Q=require('./assets/js/life-quality-12.4.js');
const code=fs.readFileSync('./assets/js/life-app-9.4.2.js','utf8');
const start=code.indexOf('function LifeWeeklyPlannerV124(');
const end=code.indexOf('function LifeWeeklyReviewV4(',start);
assert.ok(start>0&&end>start,'UI weekly planner not found');
let values=[],idx=0;
const React={
 useState(initial){const position=idx++;if(!(position in values))values[position]=initial;return [values[position],next=>{values[position]=typeof next==='function'?next(values[position]):next;}]},
 createElement(type,props,...children){return {type,props:props||{},children};}
};
const component=new Function('React','window',code.slice(start,end)+';return LifeWeeklyPlannerV124;')(React,{LifeQuality124:Q});
const traverse=(node,fn)=>{if(!node||typeof node!=='object')return null;if(fn(node))return node;for(const child of node.children||[]){if(Array.isArray(child)){for(const i of child){const found=traverse(i,fn);if(found)return found;}}else{const found=traverse(child,fn);if(found)return found;}}return null};
const hasText=(node,text)=>{if(typeof node==='string')return node.includes(text);if(!node||typeof node!=='object')return false;return (node.children||[]).some(x=>Array.isArray(x)?x.some(i=>hasText(i,text)):hasText(x,text));};
const locateButton=(tree,label)=>traverse(tree,n=>n.type==='button'&&hasText(n,label));
let applied=null,closed=false;
const tasks=[{id:'1',text:'Estudar física',duration:30,category:'Estudos',priority:'Alta'},{id:'2',text:'Organizar notas',duration:30,category:'Organização',priority:'Normal'}];
const props={tasks,events:[],onClose:()=>closed=true,onApply:items=>{applied=items}};
const render=()=>{idx=0;return component(props)};
let tree=render();
assert.ok(traverse(tree,n=>n.props?.role==='dialog'));
assert.ok(locateButton(tree,'GERAR PROPOSTA'));
assert.equal(applied,null,'should not apply without approval');
const startDate=new Date(),nextMonday=new Date(startDate);nextMonday.setDate(startDate.getDate()+((8-startDate.getDay())%7 || 7));
// The UI exposes a date selector, use a future date guaranteed to have weekdays.
const input=traverse(tree,n=>n.type==='input'&&n.props.type==='date');
input.props.onChange({target:{value:Q.localKey(nextMonday)}});
tree=render();
locateButton(tree,'GERAR PROPOSTA').props.onClick();
tree=render();
assert.ok(hasText(tree,'blocos sugeridos'));
assert.equal(applied,null,'Generating a proposal must not save data');
locateButton(tree,'CONFIRMAR E ADICIONAR').props.onClick();
assert.ok(Array.isArray(applied)&&applied.length>0,'Approval callback should receive suggested blocks');
assert.ok(applied.every(x=>typeof x.taskId==='string'));
assert.equal(closed,false,'No automatic close until app confirms');
console.log('PASS: React weekly dialog rendered, generated proposal, required confirmation, and invoked callback.');

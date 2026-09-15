import{evaluateExpression,formatNumber}from'./engine.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const expressionEl=$('#expression'),resultEl=$('#result'),historyPanel=$('#historyPanel'),historyList=$('#historyList');
let expression='',result=0,angle='DEG',memory=Number(localStorage.getItem('procalc-memory')||0),justSolved=false;
let history=JSON.parse(localStorage.getItem('procalc-history')||'[]');

function preview(){expressionEl.textContent=expression||'0';if(!expression){result=0;showResult('0');return}try{result=evaluateExpression(expression,angle);showResult(formatNumber(result))}catch{showResult('…')}}
function showResult(value,error=false){resultEl.textContent=value;resultEl.classList.toggle('error',error)}
function append(value){if(justSolved&&/[0-9πe(]|sin|cos|tan|ln|log|sqrt/.test(value))expression='';justSolved=false;const operators='÷×−+^';if(operators.includes(value)&&operators.includes(expression.at(-1)))expression=expression.slice(0,-1);expression+=value;preview();expressionEl.scrollLeft=expressionEl.scrollWidth}
function solve(){if(!expression)return;try{result=evaluateExpression(expression,angle);const formatted=formatNumber(result);history.unshift({expression,result:formatted});history=history.slice(0,30);localStorage.setItem('procalc-history',JSON.stringify(history));showResult(formatted);justSolved=true;renderHistory()}catch(e){showResult(e.message||'Fehler',true)}}
function renderHistory(){historyList.innerHTML=history.length?history.map((x,i)=>`<button class="history-item" data-history="${i}"><small>${escapeHtml(x.expression)}</small><strong>${escapeHtml(x.result)}</strong></button>`).join(''):'<p class="empty">Noch keine Berechnungen.</p>'}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function saveMemory(){localStorage.setItem('procalc-memory',String(memory));$('#memoryStatus').textContent=memory?'M aktiv':''}

$$('[data-value]').forEach(b=>b.addEventListener('click',()=>append(b.dataset.value)));
$$('[data-action]').forEach(b=>b.addEventListener('click',()=>{switch(b.dataset.action){case'clear':expression='';justSolved=false;preview();break;case'delete':expression=expression.slice(0,-1);preview();break;case'equals':solve();break;case'sign':expression=expression?`-(${expression})`:'-';preview();break;case'percent':expression=expression?`(${expression})÷100`:'';preview();break;case'memory-clear':memory=0;saveMemory();break;case'memory-recall':append(String(memory).replace('.',','));break;case'memory-add':memory+=result;saveMemory();break;case'memory-subtract':memory-=result;saveMemory();break}}));
$$('[data-angle]').forEach(b=>b.addEventListener('click',()=>{angle=b.dataset.angle;$$('[data-angle]').forEach(x=>x.classList.toggle('active',x===b));preview()}));
$('#historyButton').onclick=()=>{historyPanel.classList.add('open');historyPanel.setAttribute('aria-hidden','false')};$('#closeHistory').onclick=()=>{historyPanel.classList.remove('open');historyPanel.setAttribute('aria-hidden','true')};
$('#clearHistory').onclick=()=>{history=[];localStorage.removeItem('procalc-history');renderHistory()};historyList.onclick=e=>{const item=e.target.closest('[data-history]');if(!item)return;expression=history[Number(item.dataset.history)].expression;preview();$('#closeHistory').click()};
$('#themeButton').onclick=()=>{document.documentElement.classList.toggle('light');localStorage.setItem('procalc-theme',document.documentElement.classList.contains('light')?'light':'dark')};
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key==='='){e.preventDefault();solve()}else if(e.key==='Escape'){expression='';preview()}else if(e.key==='Backspace'){expression=expression.slice(0,-1);preview()}else{const map={'*':'×','/':'÷','-':'−','.':','};if(/[0-9()+^]/.test(e.key)||map[e.key])append(map[e.key]||e.key)}});
if(localStorage.getItem('procalc-theme')==='light')document.documentElement.classList.add('light');if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');saveMemory();renderHistory();preview();

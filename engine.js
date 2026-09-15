const FUNCTIONS = {sin:Math.sin,cos:Math.cos,tan:Math.tan,ln:Math.log,log:Math.log10,sqrt:Math.sqrt};

function tokenize(input){
  const normalized=input.replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/').replaceAll(',','.');
  const tokens=[]; let i=0;
  while(i<normalized.length){
    const rest=normalized.slice(i); const number=rest.match(/^(?:\d+\.?\d*|\.\d+)/); const word=rest.match(/^[a-z]+/);
    if(/\s/.test(normalized[i])){i++;continue}
    if(number){tokens.push({type:'number',value:Number(number[0])});i+=number[0].length;continue}
    if(normalized[i]==='e'&&!/[a-z]/.test(normalized[i+1]||'')){tokens.push({type:'number',value:Math.E});i++;continue}
    if(word){tokens.push({type:'function',value:word[0]});i+=word[0].length;continue}
    if('+-*/^()'.includes(normalized[i])){tokens.push({type:normalized[i],value:normalized[i]});i++;continue}
    if(normalized[i]==='π'){tokens.push({type:'number',value:Math.PI});i++;continue}
    throw new Error('Ungültige Eingabe');
  }
  return addImplicitMultiplication(tokens);
}

function addImplicitMultiplication(tokens){
  const out=[];
  for(const token of tokens){const prev=out.at(-1);if(prev&&['number',')'].includes(prev.type)&&['number','function','('].includes(token.type))out.push({type:'*',value:'*'});out.push(token)}
  return out;
}

export function evaluateExpression(input,angle='DEG'){
  const tokens=tokenize(input);let pos=0;
  const peek=()=>tokens[pos];const take=type=>{if(peek()?.type!==type)throw new Error('Unvollständige Eingabe');return tokens[pos++]};
  function primary(){const t=peek();if(!t)throw new Error('Unvollständige Eingabe');if(t.type==='number'){pos++;return t.value}if(t.type==='('){pos++;const v=expression();take(')');return v}if(t.type==='function'){pos++;const fn=FUNCTIONS[t.value];if(!fn)throw new Error('Unbekannte Funktion');take('(');let v=expression();take(')');if(['sin','cos','tan'].includes(t.value)&&angle==='DEG')v=v*Math.PI/180;return fn(v)}throw new Error('Ungültige Eingabe')}
  function unary(){if(peek()?.type==='+'){pos++;return unary()}if(peek()?.type==='-'){pos++;return-unary()}return primary()}
  function power(){let v=unary();if(peek()?.type==='^'){pos++;v=Math.pow(v,power())}return v}
  function term(){let v=power();while(peek()&&['*','/'].includes(peek().type)){const op=tokens[pos++].type;const r=power();v=op==='*'?v*r:v/r}return v}
  function expression(){let v=term();while(peek()&&['+','-'].includes(peek().type)){const op=tokens[pos++].type;const r=term();v=op==='+'?v+r:v-r}return v}
  const result=expression();if(pos!==tokens.length||!Number.isFinite(result))throw new Error('Nicht definiert');return Math.abs(result)<1e-12?0:result;
}

export function formatNumber(value){if(!Number.isFinite(value))return'Fehler';const a=Math.abs(value);if((a>=1e12)||(a>0&&a<1e-9))return value.toExponential(8).replace('.',',');return Number(value.toPrecision(12)).toLocaleString('de-DE',{maximumFractionDigits:10,useGrouping:false})}

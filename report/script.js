(()=>{const st=document.getElementById('stage'),sl=[...document.querySelectorAll('.slide')],N=sl.length,cnt=document.getElementById('cnt'),prog=document.getElementById('prog'),ov=document.getElementById('ov'),nt=document.getElementById('notes');let c=0,t0=Date.now();
const pad=n=>String(n).padStart(2,'0');
function fit(){const s=Math.min(innerWidth/1280,innerHeight/720);st.style.setProperty('--s',s)}
function go(n,hash=true){n=Math.max(0,Math.min(N-1,n));c=n;sl.forEach((s,i)=>{s.classList.toggle('active',i===n);s.classList.toggle('past',i<n)});cnt.textContent=pad(n+1)+' / '+pad(N);prog.style.width=((n+1)/N*100)+'%';nt.innerHTML='<small>NOTES</small>'+(sl[n].dataset.notes||'');ov.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('cur',i===n));if(hash)history.replaceState(null,'','#'+(n+1))}
const next=()=>go(c+1),prev=()=>go(c-1);
function fs(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}
const ovt=()=>ov.classList.toggle('on');
sl.forEach((s,i)=>{const b=document.createElement('button');b.innerHTML='<b>'+pad(i+1)+'</b><span>'+(s.dataset.title||'')+'</span>';b.onclick=()=>{ov.classList.remove('on');go(i)};ov.appendChild(b)});
document.getElementById('nx').onclick=next;document.getElementById('pv').onclick=prev;document.getElementById('fs').onclick=fs;document.getElementById('ovb').onclick=ovt;document.getElementById('pm').onclick=()=>nt.classList.toggle('on');
addEventListener('keydown',e=>{const k=e.key;if(k==='ArrowRight'||k==='ArrowDown'||k==='PageDown'||k===' '||k==='Enter'){e.preventDefault();next()}else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'){e.preventDefault();prev()}else if(k==='Home')go(0);else if(k==='End')go(N-1);else if(k==='f'||k==='F')fs();else if(k==='o'||k==='O')ovt();else if(k==='p'||k==='P')nt.classList.toggle('on');else if(k==='Escape')ov.classList.remove('on')});
let x0=null;addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});addEventListener('touchend',e=>{if(x0===null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)d<0?next():prev();x0=null});
addEventListener('resize',fit);addEventListener('hashchange',()=>go((parseInt(location.hash.slice(1))||1)-1,false));
fit();go((parseInt(location.hash.slice(1))||1)-1,false)})();

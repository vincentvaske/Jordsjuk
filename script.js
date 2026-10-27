const formatter=new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
const formatDate=date=>formatter.format(new Date(String(date).slice(0,10)+'T12:00:00Z'));
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localLink=(type,id)=>`content.html?type=${type}${id?'&id='+encodeURIComponent(id):''}`;
const safeURL=value=>{try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'#'}catch{return '#'}};
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo'}).format(new Date());
const imageHTML=e=>e.image?`<img class="entry-image" src="${escapeHTML(safeURL(e.image))}" alt="${escapeHTML(e.image_alt||e.title)}" loading="lazy">`:'';
const concertHTML=e=>`<a class="concert" href="${localLink('concerts',e.id)}"><span>${escapeHTML(e.city)}${e.status!=='On sale'?' · '+escapeHTML(e.status):''}</span><i aria-hidden="true"></i><time datetime="${escapeHTML(e.date)}">${formatDate(e.date)}</time></a>`;
const newsHTML=e=>`<a class="news-item" href="${localLink('news',e.id)}"><span>${escapeHTML(e.title)}</span><time datetime="${escapeHTML(e.date)}">${formatDate(e.date)}</time></a>`;
const recordHTML=e=>`<a class="record" href="${localLink('releases',e.id)}"><div><h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.year)}</p></div>${e.image?`<img src="${escapeHTML(safeURL(e.image))}" alt="${escapeHTML(e.image_alt||e.title+' cover')}">`:''}</a>`;
async function loadContent(){
 try{
  const response=await fetch('data/content.json');if(!response.ok)throw Error('Content unavailable');
  const data=await response.json();
  const concerts=data.concerts.sort((a,b)=>a.date.localeCompare(b.date));
  const upcoming=concerts.filter(e=>e.date.slice(0,10)>=today());
  const news=data.news.filter(e=>e.date.slice(0,10)<=today()).sort((a,b)=>b.date.localeCompare(a.date));
  const releases=data.releases.sort((a,b)=>(a.order??10)-(b.order??10)||String(b.date).localeCompare(String(a.date)));
  const home=document.querySelector('#concerts');
  if(home){
   home.innerHTML=upcoming.slice(0,5).map(concertHTML).join('')||'<p>New concert dates coming soon.</p>';
   document.querySelectorAll('.news-item').forEach(e=>e.remove());
   document.querySelector('.news').insertAdjacentHTML('beforeend',news.slice(0,2).map(newsHTML).join('')||'<p>More news coming soon.</p>');
   document.querySelector('.records').innerHTML=releases.slice(0,3).map(recordHTML).join('');
  }
  const entries=document.querySelector('#entries');
  if(entries){
   const params=new URLSearchParams(location.search),type=params.get('type'),id=params.get('id');
   const groups={concerts:{title:'concerts',items:concerts,render:concertHTML},news:{title:'news',items:news,render:newsHTML},releases:{title:'releases',items:releases,render:recordHTML}};
   const group=groups[type];if(!group){entries.innerHTML='<h1>Page not found</h1><a href="./">Back home</a>';return}
   if(id){
    const item=group.items.find(e=>e.id===id);if(!item){entries.innerHTML='<h1>Entry not found</h1>';return}
    document.title=item.title+' — Jordsjuk';
    const url=item.ticket_url||item.listening_url||item.external_url;
    entries.innerHTML=`<a class="more" href="${localLink(type)}">← All ${group.title}</a><article><h1>${escapeHTML(item.title)}</h1><p>${type==='releases'?escapeHTML(item.year):formatDate(item.date)}</p>${item.city?`<p>${escapeHTML([item.venue,item.city].filter(Boolean).join(', '))}</p><p>${escapeHTML(item.status)}</p>`:''}${imageHTML(item)}${String(item.body||'').split(/\n\s*\n/).filter(Boolean).map(p=>'<p class="article-copy">'+escapeHTML(p).replace(/\n/g,'<br>')+'</p>').join('')}${item.tracklist?'<h2>Tracklist</h2><ol>'+item.tracklist.split('\n').filter(Boolean).map(t=>'<li>'+escapeHTML(t)+'</li>').join('')+'</ol>':''}${url?`<a class="more" href="${escapeHTML(safeURL(url))}">${type==='concerts'?'Tickets':type==='releases'?'Listen / buy':'Read original article'} →</a>`:''}</article>`;
   }else{
    document.title=group.title+' — Jordsjuk';
    const items=type==='concerts'?upcoming:group.items;
    entries.innerHTML=`<h1>${group.title}</h1>${items.map(group.render).join('')||'<p>More coming soon.</p>'}${type==='concerts'&&concerts.length>upcoming.length?'<h2>Past concerts</h2>'+concerts.filter(e=>e.date.slice(0,10)<today()).reverse().map(concertHTML).join(''):''}`;
   }
  }
 }catch(error){const entries=document.querySelector('#entries');if(entries)entries.innerHTML='<p>Content could not be loaded. Please try again shortly.</p>';console.error(error)}
}
loadContent();
const toggle=document.querySelector('.menu-toggle'),menu=document.querySelector('#menu');
if(toggle&&menu){
 function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu')}
 toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu')});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){closeMenu();toggle.focus()}});
 menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
}
if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('video')?.pause();

const formatter=new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
const formatDate=date=>formatter.format(new Date(String(date).slice(0,10)+'T12:00:00Z'));
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localLink=(type,id)=>type==='concerts'?`concerts.html${id?'?id='+encodeURIComponent(id):''}`:type==='releases'?`discography.html${id?'#'+encodeURIComponent(id):''}`:`content.html?type=${type}${id?'&id='+encodeURIComponent(id):''}`;
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
  const releaseList=document.querySelector('#release-list');
  if(releaseList){
   const shortDate=value=>{const d=new Date(value.slice(0,10)+'T12:00:00Z');return `${d.getUTCDate()}-${d.toLocaleString('en-GB',{month:'short',timeZone:'UTC'}).slice(0,3).toUpperCase()} ${d.getUTCFullYear()}`};
   const spotifyIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24M17.5 17.3c-.2.4-.7.5-1 .3-2.8-1.7-6.4-2.1-10.6-1.1-.9.2-1.2-1.2-.3-1.4 4.6-1 8.6-.6 11.7 1.3.4.2.5.6.2.9m1.5-3.2c-.3.4-.8.5-1.3.2-3.2-2-8.1-2.5-11.9-1.3-1.1.3-1.6-1.4-.5-1.8 4.4-1.3 9.8-.7 13.4 1.6.5.3.6.8.3 1.3m.1-3.4C15.3 8.4 8.8 8.2 5.2 9.3c-1.4.4-2-1.7-.7-2.1 4.3-1.3 11.3-1 15.7 1.6 1.2.7.1 2.6-1.1 1.9"/></svg>';
   releaseList.innerHTML=releases.map(e=>`<article class="release-row" id="${escapeHTML(e.id)}"><img class="release-cover" src="${escapeHTML(safeURL(e.image))}" alt="${escapeHTML(e.image_alt||e.title)}" loading="lazy"><div class="release-info"><h2>${escapeHTML(e.title.toLowerCase())}</h2>${e.label?`<p class="record-label">${escapeHTML(e.label)}</p>`:''}<dl class="release-dates">${[['digital_date','Digital release'],['vinyl_date','Vinyl release'],['cd_date','CD release']].filter(([key])=>e[key]).map(([key,label])=>`<div><dt>${label}</dt><dd><time datetime="${escapeHTML(e[key])}">${shortDate(e[key])}</time></dd></div>`).join('')}</dl>${e.spotify_url?`<a class="release-listen" href="${escapeHTML(safeURL(e.spotify_url))}" aria-label="Listen to ${escapeHTML(e.title)} on Spotify">${spotifyIcon}</a>`:e.listening_url?`<a class="release-listen text-link" href="${escapeHTML(safeURL(e.listening_url))}">Listen →</a>`:''}</div></article>`).join('')||'<p>New releases coming soon.</p>';
   if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));target?.scrollIntoView()}
  }
  const concertList=document.querySelector('#concert-list');
  if(concertList){
   const filter=document.querySelector('#after-date'),params=new URLSearchParams(location.search);
   const requested=params.get('after-date');
   filter.value=/^\d{4}-\d{2}-\d{2}$/.test(requested||'')?requested:today();
   const card=e=>`<article class="gig" id="gig-${escapeHTML(e.id)}"><h2>${escapeHTML(e.title)}</h2><dl class="gig-facts"><div><dt>Venue</dt><dd>${escapeHTML(e.venue||'To be announced')}</dd></div><div><dt>Date</dt><dd><time datetime="${escapeHTML(e.date)}">${formatDate(e.date)}</time></dd></div><div><dt>Location</dt><dd>${escapeHTML([e.city,e.country].filter(Boolean).join(', '))}</dd></div></dl><div class="gig-lineup"><span>Others playing</span><p>${e.lineup?escapeHTML(e.lineup).replace(/\n/g,'<br>'):'To be announced'}</p></div>${e.status&&e.status!=='On sale'?`<p class="gig-status">${escapeHTML(e.status)}</p>`:''}${e.body?`<p class="gig-description">${escapeHTML(e.body).replace(/\n/g,'<br>')}</p>`:''}${imageHTML(e)}${e.ticket_url&&e.status!=='Cancelled'?`<a class="gig-tickets" href="${escapeHTML(safeURL(e.ticket_url))}">${e.status==='Sold out'?'Ticket information':'Tickets'} →</a>`:''}</article>`;
   function renderConcerts(){
    const id=params.get('id');
    const visible=concerts.filter(e=>id?e.id===id:!filter.value||e.date.slice(0,10)>=filter.value);
    concertList.innerHTML=(id?'<a class="more" href="concerts.html">← All concerts</a>':'')+(visible.map(card).join('')||'<p class="concert-empty">No concerts listed for this period. Check back for new dates.</p>');
   }
   filter.addEventListener('change',()=>{params.delete('id');if(filter.value)params.set('after-date',filter.value);else params.delete('after-date');history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():''));renderConcerts()});
   document.querySelector('.concert-filter').addEventListener('submit',e=>{e.preventDefault();renderConcerts()});
   renderConcerts();
  }
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
 }catch(error){const entries=document.querySelector('#entries')||document.querySelector('#concert-list')||document.querySelector('#release-list');if(entries)entries.innerHTML='<p>Content could not be loaded. Please try again shortly.</p>';console.error(error)}
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

(function(){
"use strict";
var CFG=window.SITE_CONFIG||{},$=function(id){return document.getElementById(id)};
var DATA={categories:[],regions:[],professionals:[]},sel=new Set(),LS="pool-sel";
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var fmt=function(n){return Number(n).toLocaleString("he-IL")};
function norm(s){return String(s||"").toLowerCase().replace(/[\u0591-\u05C7]/g,"").replace(/["'״׳`]/g,"").trim()}
function stem(w){if(w.length>3&&w[0]==="ה")w=w.slice(1);if(w.length>4)w=w.replace(/(ים|ות)$/,"");if(w.length>3)w=w.replace(/[הי]$/,"");return w}
function waLink(phone,text){var d=String(phone).replace(/\D/g,"");if(d[0]==="0")d="972"+d.slice(1);return"https://wa.me/"+d+(text?"?text="+encodeURIComponent(text):"")}
function minPrice(p){var a=(p.priceList||[]).map(function(x){return x.price});return a.length?Math.min.apply(null,a):Infinity}
function hay(p){var cn=p.categories.map(function(id){var c=DATA.categories.find(function(x){return x.id===id});return c?c.label:""});
 return norm([p.name,p.business,p.city,p.description,p.keywords,cn.join(" "),(p.services||[]).join(" "),(p.priceList||[]).map(function(x){return x.item}).join(" ")].join(" "))}
function state(){return{q:$("q").value,cat:$("cat").value,region:$("region").value,max:+$("max").value,install:$("install").checked,national:$("national").checked,years:+$("years").value,sort:$("sort").value}}
function toURL(s){var u=new URLSearchParams();Object.keys(s).forEach(function(k){var v=s[k];if(v&&v!==0&&v!=="rel")u.set(k,v===true?"1":v)});var q=u.toString();history.replaceState(null,"",q?"?"+q:location.pathname)}
function fromURL(){var u=new URLSearchParams(location.search);$("q").value=u.get("q")||"";$("cat").value=u.get("cat")||"";$("region").value=u.get("region")||"";$("max").value=u.get("max")||0;$("install").checked=u.get("install")==="1";$("national").checked=u.get("national")==="1";$("years").value=u.get("years")||"0";$("sort").value=u.get("sort")||"rel"}
function filter(s){
 var toks=norm(s.q).split(/\s+/).filter(Boolean).map(stem);
 var out=DATA.professionals.filter(function(p){
  if(s.cat&&p.categories.indexOf(s.cat)<0)return false;
  if(s.region&&!(p.nationwide||p.serviceAreas.indexOf(s.region)>=0||p.region===s.region))return false;
  if(s.national&&!p.nationwide)return false;
  if(s.years&&p.years<s.years)return false;
  if(s.install&&!(p.priceList||[]).some(function(x){return x.withInstall}))return false;
  if(s.max&&!(minPrice(p)<=s.max))return false;
  var h=hay(p);return toks.every(function(t){return h.indexOf(t)>=0})});
 var by={years:function(a,b){return b.years-a.years},price:function(a,b){return minPrice(a)-minPrice(b)},name:function(a,b){return a.name.localeCompare(b.name,"he")}}[s.sort];
 if(by)out.sort(by);return out}
function card(p){
 var cats=p.categories.map(function(id){var c=DATA.categories.find(function(x){return x.id===id});return c?'<span class="tag">'+esc(c.label)+"</span>":""}).join("");
 var rows=(p.priceList||[]).map(function(x){return"<tr><td>"+esc(x.item)+"</td><td><b>"+fmt(x.price)+" "+esc(x.unit||"₪")+"</b></td><td>"+(x.withInstall?"כולל התקנה":"ללא התקנה")+"</td></tr>"}).join("");
 var areas=p.nationwide?"כל הארץ":p.serviceAreas.map(function(id){var r=DATA.regions.find(function(x){return x.id===id});return r?r.label:""}).join(", ");
 var maps="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.address||p.city);
 var waze="https://waze.com/ul?q="+encodeURIComponent(p.address||p.city)+"&navigate=yes";
 return'<article class="card'+(sel.has(p.id)?" sel":"")+'" data-id="'+esc(p.id)+'">'+
 '<input class="pick" type="checkbox" aria-label="בחירת '+esc(p.name)+'"'+(sel.has(p.id)?" checked":"")+'>'+
 '<div><h3>'+esc(p.name)+'</h3><div class="sub">'+esc(p.business)+" · "+esc(p.city)+'</div></div>'+
 '<div class="body"><div class="tags">'+cats+(p.demo?'<span class="tag demo">נתוני דוגמה</span>':"")+"</div>"+
 "<p>"+esc(p.description)+"</p>"+
 '<div class="facts"><span>ותק: <b>'+esc(p.years)+' שנים</b></span><span>אזורי שירות: <b>'+esc(areas)+"</b></span><span>כתובת: <b>"+esc(p.address)+"</b></span></div>"+
 '<div class="tags">'+(p.services||[]).map(function(x){return'<span class="tag">'+esc(x)+"</span>"}).join("")+"</div>"+
 (rows?'<table class="pl"><thead><tr><th>מוצר או שירות</th><th>מחיר</th><th>התקנה</th></tr></thead><tbody>'+rows+"</tbody></table>":"")+
 '<div class="acts"><a class="btn-wa" target="_blank" rel="noopener" href="'+esc(waLink(p.whatsapp||p.phone,CFG.QUOTE_MESSAGE))+'">וואטסאפ</a>'+
 '<a class="btn-l" href="tel:'+esc(String(p.phone).replace(/[^\d+]/g,""))+'">'+esc(p.phone)+"</a>"+
 (p.email?'<a class="btn-l" href="mailto:'+esc(p.email)+'">אימייל</a>':"")+
 (p.website?'<a class="btn-l" target="_blank" rel="noopener" href="'+esc(p.website)+'">אתר</a>':"")+
 '<a class="btn-l" target="_blank" rel="noopener" href="'+esc(maps)+'">מפה</a><a class="btn-l" target="_blank" rel="noopener" href="'+esc(waze)+'">Waze</a></div></div></article>'}
function render(){
 var s=state();toURL(s);
 $("maxOut").textContent=s.max?"עד "+fmt(s.max)+" ₪":"ללא הגבלה";
 var r=filter(s);$("count").textContent=r.length===1?"נמצא בעל מקצוע אחד":r.length?"נמצאו "+r.length+" אנשי מקצוע":"לא נמצאו תוצאות";
 $("list").innerHTML=r.length?r.map(card).join(""):'<div class="empty">לא נמצאו אנשי מקצוע לפי הסינון הנוכחי. נסו להרחיב את האזור, להעלות את המחיר המקסימלי או לנקות את הסינונים.</div>';
 document.querySelectorAll(".chip").forEach(function(c){c.setAttribute("aria-pressed",String(c.dataset.cat===s.cat))});
 syncBar()}
function syncBar(){try{localStorage.setItem(LS,JSON.stringify([...sel]))}catch(e){}
 $("selBar").hidden=!sel.size;$("selCount").textContent=sel.size}
function chosen(){return DATA.professionals.filter(function(p){return sel.has(p.id)})}
function openDlg(){var l=chosen();$("msg").value=CFG.QUOTE_MESSAGE||"";
 $("dlgList").innerHTML=l.map(function(p){return"<li><span>"+esc(p.name)+" · "+esc(p.city)+'</span><a class="btn-wa" target="_blank" rel="noopener" data-wa="'+esc(p.whatsapp||p.phone)+'" href="#">שליחה</a></li>'}).join("");
 var d=$("dlg");if(d.showModal)d.showModal();else d.setAttribute("open","")}
function fill(sel,items,all){sel.innerHTML='<option value="">'+all+"</option>"+items.map(function(i){return'<option value="'+esc(i.id)+'">'+esc(i.label)+"</option>"}).join("")}
function bind(){
 ["cat","region","max","install","national","years","sort"].forEach(function(id){$(id).addEventListener("input",render)});
 $("q").addEventListener("input",render);
 $("searchForm").addEventListener("submit",function(e){e.preventDefault();render();$("results").scrollIntoView({behavior:"smooth"})});
 $("reset").addEventListener("click",function(){$("q").value="";$("cat").value="";$("region").value="";$("max").value=0;$("install").checked=false;$("national").checked=false;$("years").value="0";$("sort").value="rel";render()});
 $("list").addEventListener("change",function(e){if(!e.target.classList.contains("pick"))return;var c=e.target.closest(".card"),id=c.dataset.id;e.target.checked?sel.add(id):sel.delete(id);c.classList.toggle("sel",e.target.checked);syncBar()});
 $("chips").addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;$("cat").value=$("cat").value===b.dataset.cat?"":b.dataset.cat;render()});
 $("selOpen").addEventListener("click",openDlg);
 $("selClear").addEventListener("click",function(){sel.clear();render()});
 $("dlgList").addEventListener("click",function(e){var a=e.target.closest("[data-wa]");if(a)a.href=waLink(a.dataset.wa,$("msg").value)});
 $("copyNums").addEventListener("click",function(){var t=chosen().map(function(p){return p.name+": "+p.phone}).join("\n");
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){$("copyNums").textContent="הועתק"},function(){});});
 $("joinForm").addEventListener("submit",function(e){e.preventDefault();var f=new FormData(e.target);
  var t="בקשת הצטרפות למאגר הבריכות\nשם: "+f.get("name")+"\nטלפון: "+f.get("phone")+"\nעיר: "+f.get("city")+"\nשירותים: "+f.get("what");
  window.open(waLink(CFG.ADMIN_WHATSAPP,t),"_blank","noopener")})}
function init(){
 fill($("cat"),DATA.categories,"כל סוגי בעלי המקצוע");fill($("region"),DATA.regions,"כל הארץ");
 $("chips").innerHTML=DATA.categories.map(function(c){return'<button type="button" class="chip" data-cat="'+esc(c.id)+'" aria-pressed="false">'+esc(c.label)+"</button>"}).join("");
 try{JSON.parse(localStorage.getItem(LS)||"[]").forEach(function(id){sel.add(id)})}catch(e){}
 if(window.matchMedia("(max-width:900px)").matches)$("filtersBox").open=false;
 fromURL();bind();render()}
fetch("data/professionals.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){DATA=d;init()})
.catch(function(){$("count").textContent="שגיאה בטעינת המאגר";$("list").innerHTML='<div class="empty">לא ניתן לטעון את קובץ הנתונים. אם פתחתם את הקובץ ישירות מהמחשב, הריצו שרת מקומי (ראו README).</div>'});
})();

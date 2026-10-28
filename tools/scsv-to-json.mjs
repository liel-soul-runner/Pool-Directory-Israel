// שימוש: node tools/csv-to-json.mjs pros.csv
// ממיר CSV (למשל מ-Google Sheets) לקובץ data/professionals.json. אין צורך בהתקנת חבילות.
// עמודות: id,name,business,categories,city,region,address,phone,whatsapp,email,website,years,description,services,serviceAreas,nationwide,keywords,prices
// categories/services/serviceAreas מופרדים ב-| ; prices בפורמט: פריט~מחיר~כן/לא~יחידה | פריט~מחיר~כן/לא
import fs from "node:fs";
const [,, file] = process.argv;
if (!file) { console.error("חסר שם קובץ CSV"); process.exit(1); }
function parse(t){const rows=[];let r=[],c="",q=false;for(let i=0;i<t.length;i++){const ch=t[i];
 if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}
 else if(ch==='"')q=true;else if(ch===","){r.push(c);c=""}else if(ch==="\n"){r.push(c.replace(/\r$/,""));rows.push(r);r=[];c=""}else c+=ch}
 if(c||r.length){r.push(c);rows.push(r)}return rows}
const rows=parse(fs.readFileSync(file,"utf8").replace(/^\uFEFF/,"")),head=rows.shift().map(h=>h.trim());
const list=s=>(s||"").split("|").map(x=>x.trim()).filter(Boolean);
const pros=rows.filter(r=>r.some(Boolean)).map(r=>{const o=Object.fromEntries(head.map((h,i)=>[h,(r[i]||"").trim()]));
 return {id:o.id||"p-"+Math.random().toString(36).slice(2,8),demo:false,name:o.name,business:o.business,categories:list(o.categories),city:o.city,region:o.region,
 address:o.address,phone:o.phone,whatsapp:o.whatsapp||o.phone,email:o.email,website:o.website,years:Number(o.years)||0,description:o.description,
 services:list(o.services),serviceAreas:list(o.serviceAreas).length?list(o.serviceAreas):[o.region],nationwide:/^(1|true|כן)$/i.test(o.nationwide),keywords:o.keywords,
 priceList:list(o.prices).map(p=>{const [item,price,inst,unit]=p.split("~");return{item,price:Number(price)||0,withInstall:/^(1|true|כן)$/i.test((inst||"").trim()),unit:unit||"₪"}})}});
const out=JSON.parse(fs.readFileSync("data/professionals.json","utf8"));out.professionals=pros;
fs.writeFileSync("data/professionals.json",JSON.stringify(out,null,1));console.log(`נכתבו ${pros.length} אנשי מקצוע`);

const SUBJECTS=[
{id:"bm",file:"bahasa-melayu.json",name:"Bahasa Melayu",icon:"📖",desc:"Membaca, menulis, bertutur dan memahami bahasa.",cls:"pink"},
{id:"english",file:"english-superminds.json",name:"English Year 1",icon:"🇬🇧",desc:"Learn English through simple, fun activities.",cls:"blue"},
{id:"math",file:"matematik.json",name:"Matematik",icon:"🔢",desc:"Nombor, operasi, bentuk dan penyelesaian masalah.",cls:"green"},
{id:"science",file:"sains.json",name:"Sains",icon:"🔬",desc:"Meneroka dunia dengan kemahiran saintifik.",cls:"orange"}];

const key="belajarCeriaV2";
function state(){return JSON.parse(localStorage.getItem(key)||'{"xp":0,"stars":0,"badges":[],"completed":[],"quizzes":0,"best":0}')}
function save(s){localStorage.setItem(key,JSON.stringify(s))}
async function getSubject(id){let x=SUBJECTS.find(a=>a.id===id);return await (await fetch(x.file)).json()}
function renderSubjects(id){
 let el=document.getElementById(id); el.innerHTML=SUBJECTS.map(s=>`<article class="card"><div class="subject-icon">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p><a class="btn primary" href="lesson.html?subject=${s.id}">Buka subjek →</a></article>`).join("")
}
function updateHomeStats(){let s=state(); for(let k of ["stars","xp","badges"])document.getElementById(k).textContent=k==="badges"?s.badges.length:s[k]}
async function renderLesson(){
 let p=new URLSearchParams(location.search), id=p.get("subject")||"bm", data=await getSubject(id);
 document.title=data.name+" - Belajar Ceria";
 document.getElementById("lesson").innerHTML=`<p class="eyebrow">${data.icon} ${data.name}</p><h1>Pilih unit</h1><p>${data.desc}</p><div class="grid">${data.units.map((u,i)=>`<article class="card unit"><div class="num">${i+1}</div><div><h3>${u.title}</h3><p>${u.learn}</p></div><a class="btn" href="quiz.html?subject=${id}&unit=${i}">Kuiz</a></article>`).join("")}</div>`
}
async function renderQuiz(){
 let p=new URLSearchParams(location.search), id=p.get("subject")||"bm", ui=Number(p.get("unit")||0), data=await getSubject(id), u=data.units[ui];
 if(!u){location.href="subjects.html";return}
 let root=document.getElementById("quiz"), score=0, answered=0;
 root.innerHTML=`<p class="eyebrow">${data.icon} ${data.name}</p><h1>${u.title}</h1><div class="lesson-box"><h3>💡 Apa kita belajar?</h3><p>${u.learn}</p><p><b>🎯 Aktiviti:</b> ${u.activity}</p></div><div id="questions"></div><div id="result"></div>`;
 let qbox=document.getElementById("questions");
 u.quiz.forEach((q,qi)=>{let [text,opts,ans]=q; let d=document.createElement("div");d.className="quiz-q";d.innerHTML=`<h3>${qi+1}. ${text}</h3>`+opts.map((o,i)=>`<button class="option" data-i="${i}">${o}</button>`).join("");qbox.appendChild(d);
 d.querySelectorAll(".option").forEach(b=>b.onclick=()=>{if(d.dataset.done)return;d.dataset.done=1;answered++;let i=Number(b.dataset.i);if(i===ans){score++;b.classList.add("correct")}else{b.classList.add("wrong");d.querySelectorAll(".option")[ans].classList.add("correct")}if(answered===u.quiz.length)finish()})});
 function finish(){let st=state(), gained=score*10, stars=score===u.quiz.length?3:score>=Math.ceil(u.quiz.length/2)?2:1;st.xp+=gained;st.stars+=stars;st.quizzes++;st.best=Math.max(st.best,Math.round(score/u.quiz.length*100));if(!st.completed.includes(u.id))st.completed.push(u.id);if(st.completed.length>=3&&!st.badges.includes("Penjelajah"))st.badges.push("Penjelajah");if(st.quizzes>=5&&!st.badges.includes("Rajin"))st.badges.push("Rajin");save(st);document.getElementById("result").innerHTML=`<div class="result"><h2>🎉 Tahniah!</h2><p>Skor: <b>${score}/${u.quiz.length}</b></p><p>+${gained} XP &nbsp; ${"⭐".repeat(stars)}</p><a class="btn primary" href="lesson.html?subject=${id}">Unit seterusnya</a> <a class="btn" href="progress.html">Lihat kemajuan</a></div>`}
}
function renderProgress(){let s=state(), total=12, pct=Math.min(100,Math.round(s.completed.length/total*100));document.getElementById("progress").innerHTML=`<div class="statgrid"><div class="stat"><b>⭐ ${s.stars}</b>Bintang</div><div class="stat"><b>⚡ ${s.xp}</b>XP</div><div class="stat"><b>🏅 ${s.badges.length}</b>Badge</div><div class="stat"><b>📝 ${s.quizzes}</b>Kuiz</div></div><div class="card" style="margin-top:18px"><h2>📈 Kemajuan unit</h2><div class="bar"><i style="width:${pct}%"></i></div><p>${s.completed.length} daripada ${total} unit contoh diselesaikan (${pct}%).</p><h2>🏆 Badge</h2><p>${s.badges.length?s.badges.map(x=>"🏅 "+x).join(" &nbsp; "):"Belum ada badge. Jawab kuiz untuk mendapatkannya!"}</p><button class="btn" onclick="resetProgress()">Reset kemajuan</button></div>`}
function resetProgress(){if(confirm("Reset semua kemajuan?")){localStorage.removeItem(key);location.reload()}}

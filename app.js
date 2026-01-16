const firebaseConfig = {
  apiKey: "AIzaSyCt3On8r1FkPRbrpwKg2Llco-7tlURWG5s",
  authDomain: "mrmohamed-platform.firebaseapp.com",
  databaseURL: "https://mrmohamed-platform-default-rtdb.firebaseio.com",
  projectId: "mrmohamed-platform",
  storageBucket: "mrmohamed-platform.firebasestorage.app",
  messagingSenderId: "222403252654",
  appId: "1:222403252654:web:6950e99b1b03ed22a8783f"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function getEmbedUrl(url) {
    let id = "";
    if (!url) return "";
    if (url.includes("v=")) id = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1].split("?")[0];
    return id ? "https://www.youtube.com/embed/" + id : url;
}

document.addEventListener('DOMContentLoaded', () => {

    // 1. حل مشكلة الاسم المختفي
    // نتحقق إذا كنا داخل لوحة التحكم أو الدروس أو الامتحان
    if (document.getElementById('welcomeTitle') || document.getElementById('studentLessonsList') || document.getElementById('dynamicQuestionsContainer')) {
        const storedName = localStorage.getItem('studentName');
        if (!storedName) {
            // لو مفيش اسم محفوظ، نرجعه يسجل دخول
            alert("يرجى تسجيل الدخول أولاً!");
            window.location.href = 'index.html';
        } else {
            // لو الاسم موجود، نعرضه
            const welcomeMsg = document.getElementById('welcomeTitle');
            if(welcomeMsg) welcomeMsg.innerText = `👋 أهلاً يا بطل: ${storedName}`;
        }
    }

    // 2. حل مشكلة صفحة الدروس (التعامل مع المخزن الفاضي)
    const lList = document.getElementById('studentLessonsList');
    if (lList) {
        lList.innerHTML = '<p style="color:yellow;">جاري البحث عن دروس...</p>';
        database.ref('lessons/').on('value', snap => {
            lList.innerHTML = ""; // مسح رسالة التحميل
            if (snap.exists()) {
                snap.forEach(c => {
                    const d = c.val();
                    let pdfBtn = d.pdfUrl ? `<button class="btn-primary" onclick="window.open('${d.pdfUrl}')">📄 فتح PDF</button>` : '';
                    lList.innerHTML += `
                        <div class="admin-section">
                            <h3>${d.title}</h3>
                            ${d.videoUrl ? `<div class="video-container"><iframe src="${getEmbedUrl(d.videoUrl)}" frameborder="0" allowfullscreen></iframe></div>` : ''}
                            ${pdfBtn}
                        </div>`;
                });
            } else {
                lList.innerHTML = '<p style="font-size:1.2rem; color:#ccc;">📭 لا توجد دروس مضافة حتى الآن.</p>';
            }
        });
    }

    // 3. حل مشكلة صفحة الامتحان (التعامل مع المخزن الفاضي)
    const qContainer = document.getElementById('dynamicQuestionsContainer');
    const correctMap = {};
    if (qContainer) {
        qContainer.innerHTML = '<p style="color:yellow;">جاري تجهيز الامتحان...</p>';
        database.ref('exams/').once('value', snap => {
            qContainer.innerHTML = "";
            if (snap.exists()) {
                let i = 1;
                snap.forEach(c => {
                    const d = c.val();
                    correctMap[c.key] = d.a;
                    qContainer.innerHTML += `
                    <div class="admin-section" style="text-align:left; direction:ltr;">
                        <p><b>${i++}. ${d.q}</b></p>
                        <label><input type="radio" name="${c.key}" value="${d.a}"> ${d.a}</label><br>
                        <label><input type="radio" name="${c.key}" value="${d.b}"> ${d.b}</label><br>
                        <label><input type="radio" name="${c.key}" value="${d.c}"> ${d.c}</label>
                    </div>`;
                });
                document.getElementById('submitExamBtn').style.display = "block";
                // تشغيل التايمر فقط لو فيه امتحان
                startTimer(60); 
            } else {
                qContainer.innerHTML = '<p style="font-size:1.2rem; color:#ccc;">📭 لا يوجد امتحان متاح حالياً.</p>';
            }
        });
    }

    // التايمر
    function startTimer(m) {
        let t = m * 60;
        const disp = document.getElementById('timerDisplay');
        if(!disp) return;
        const interval = setInterval(() => {
            let min = Math.floor(t / 60), sec = t % 60;
            disp.innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
            if (t-- <= 0) { clearInterval(interval); submitFinal(); }
        }, 1000);
    }

    // تسليم الامتحان
    function submitFinal() {
        let score = 0, total = 0;
        const form = new FormData(document.getElementById('examForm'));
        for(let k in correctMap) { if(form.get(k) === correctMap[k]) score++; total++; }
        database.ref('grades/' + localStorage.getItem('studentPhone')).push({
            studentName: localStorage.getItem('studentName'), score, total, examDate: new Date().toLocaleString()
        }).then(() => {
            document.getElementById('examForm').style.display = "none";
            document.getElementById('resultArea').style.display = "block";
            document.getElementById('scoreText').innerText = `النتيجة: ${score} من ${total}`;
        });
    }
    const subBtn = document.getElementById('submitExamBtn');
    if(subBtn) subBtn.onclick = () => { if(confirm("تسليم الإجابات؟")) submitFinal(); };


    // 4. باقي الأكواد (تسجيل الدخول، الأدمن، الإشعارات)
    // كود الدخول
    const logForm = document.getElementById('loginForm');
    if (logForm) {
        logForm.onsubmit = (e) => {
            e.preventDefault();
            const p = document.getElementById('phone').value;
            const pass = document.getElementById('password').value;
            database.ref('students/' + p).once('value').then(s => {
                if (s.exists() && s.val().password === pass) {
                    localStorage.setItem('studentName', s.val().fullName);
                    localStorage.setItem('studentPhone', p);
                    window.location.href = 'dashboard.html';
                } else alert("بيانات خاطئة!");
            });
        };
    }

    // كود التسجيل المباشر (المعدل)
    window.registerStudent = function() {
        const n = document.getElementById('newName').value;
        const p = document.getElementById('newPhone').value;
        const pw = document.getElementById('newPassword').value;
        if(!n || !p || !pw) { alert("املأ البيانات!"); return; }
        
        database.ref('students/'+p).set({ fullName: n, password: pw })
        .then(() => { alert("تم التسجيل! سجل دخول الآن."); window.location.href='index.html'; });
    };

    // حماية الأدمن
    if (window.location.pathname.includes("admin.html")) {
        const u = prompt("Admin User:");
        const p = prompt("Password:");
        if (u === "Muhammad Al-Sayed" && p === "Muhammad##2026") {
            document.getElementById('adminContent').style.display = "block";
        } else { window.location.href = "index.html"; }
    }

    // أدوات الأدمن
    const btnClick = (id, fn) => { const b = document.getElementById(id); if(b) b.onclick = fn; };
    btnClick('addLessonBtn', () => database.ref('lessons/').push({
        title: document.getElementById('lessonTitle').value,
        videoUrl: document.getElementById('videoUrl').value,
        pdfUrl: document.getElementById('pdfUrl').value
    }).then(()=> alert("تم النشر!")));
    
    // زر الرفع الجماعي للامتحان
    window.uploadExamQuestions = function() {
        const qs = [
            {q:"Go past?", a:"went", b:"go", c:"gone"},
            {q:"Eat past?", a:"ate", b:"eaten", c:"eat"}
        ];
        qs.forEach((q,i) => setTimeout(()=> database.ref('exams/').push(q), i*100));
        alert("تم رفع أسئلة تجريبية!");
    };
});

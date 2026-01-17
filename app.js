// 1. إعدادات فايربيس (تأكد إنها مظبوطة)
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

// دالة تحويل روابط اليوتيوب
function getEmbedUrl(url) {
    let id = "";
    if (!url) return "";
    if (url.includes("v=")) id = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1].split("?")[0];
    return id ? "https://www.youtube.com/embed/" + id : url;
}

// دالة التسجيل المباشر (للصفحة Register)
window.registerStudent = function() {
    const n = document.getElementById('newName').value;
    const p = document.getElementById('newPhone').value;
    const pw = document.getElementById('newPassword').value;
    if(!n || !p || !pw) { alert("املأ البيانات!"); return; }
    
    alert("جاري التسجيل...");
    database.ref('students/'+p).set({ fullName: n, password: pw })
    .then(() => { alert("تم التسجيل بنجاح! سجل دخولك الآن."); window.location.href='index.html'; })
    .catch(e => alert("خطأ: " + e.message));
};

document.addEventListener('DOMContentLoaded', () => {

    // 1. كود حماية الأدمن (User: Muhammad Al-Sayed)
    if (window.location.pathname.includes("admin.html")) {
        const u = prompt("اسم المستخدم (Admin):");
        const p = prompt("كلمة السر:");
        if (u === "Muhammad Al-Sayed" && p === "Muhammad##2026") {
            document.getElementById('adminContent').style.display = "block";
        } else {
            window.location.href = "index.html";
        }
    }

    // 2. كود الرفع الجماعي للامتحان (الميزة الجديدة)
    const bulkBtn = document.getElementById('bulkUploadBtn');
    if(bulkBtn) {
        bulkBtn.onclick = () => {
            const text = document.getElementById('bulkText').value;
            if(!text.trim()) { alert("الصندوق فارغ!"); return; }
            const lines = text.split('\n');
            let count = 0;
            if(confirm(`رفع ${lines.length} سؤال؟`)) {
                lines.forEach((line, index) => {
                    const parts = line.split('|');
                    if(parts.length >= 4) {
                        setTimeout(() => {
                            database.ref('exams/').push({
                                q: parts[0].trim(), a: parts[1].trim(), b: parts[2].trim(), c: parts[3].trim()
                            });
                        }, index * 50);
                        count++;
                    }
                });
                alert(`تم بدء رفع ${count} سؤال!`);
                document.getElementById('bulkText').value = "";
            }
        };
    }

    // 3. إصلاح حذف الدروس (التعديل الجديد)
    const delLessonBtn = document.getElementById('clearLessons');
    if(delLessonBtn) {
        delLessonBtn.onclick = () => {
            if(confirm("هل أنت متأكد من حذف جميع الدروس؟ لا يمكن التراجع!")) {
                database.ref('lessons/').remove()
                .then(() => { alert("تم الحذف!"); window.location.reload(); }) // Reload is key here
                .catch(e => alert("فشل الحذف: " + e.message));
            }
        };
    }

    // 4. عرض الدروس (مع رسالة لو فاضية)
    const lList = document.getElementById('studentLessonsList');
    if (lList) {
        lList.innerHTML = '<p style="color:yellow;">جاري التحميل...</p>';
        database.ref('lessons/').on('value', snap => {
            lList.innerHTML = "";
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
                lList.innerHTML = '<p style="color:#ccc;">لا توجد دروس حالياً.</p>';
            }
        });
    }

    // 5. عرض الامتحان والتايمر
    const qContainer = document.getElementById('dynamicQuestionsContainer');
    const correctMap = {};
    if (qContainer) {
        qContainer.innerHTML = '<p style="color:yellow;">جاري التحميل...</p>';
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
                startTimer(60);
            } else {
                qContainer.innerHTML = '<p style="color:#ccc;">لا يوجد امتحان حالياً.</p>';
            }
        });
    }

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

    // 6. باقي أدوات الأدمن
    const btnClick = (id, fn) => { const b = document.getElementById(id); if(b) b.onclick = fn; };
    
    // إشعارات
    btnClick('sendNotifBtn', () => database.ref('notifications/msg').set(document.getElementById('notifText').value).then(()=>alert("تم الإرسال!")));
    btnClick('clearNotifBtn', () => database.ref('notifications/msg').set(null));

    // إضافة درس
    btnClick('addLessonBtn', () => {
        database.ref('lessons/').push({
            title: document.getElementById('lessonTitle').value,
            videoUrl: document.getElementById('videoUrl').value,
            pdfUrl: document.getElementById('pdfUrl').value
        }).then(()=> { alert("تم النشر!"); window.location.reload(); });
    });

    // إضافة سؤال يدوي
    btnClick('addQuestionBtn', () => {
        database.ref('exams/').push({
            q: document.getElementById('qText').value,
            a: document.getElementById('op1').value,
            b: document.getElementById('op2').value,
            c: document.getElementById('op3').value
        }).then(()=> alert("تم إضافة السؤال!"));
    });

    // أزرار الحذف الأخرى
    btnClick('clearExams', () => { if(confirm("حذف الامتحان؟")) database.ref('exams/').remove().then(()=>window.location.reload()); });
    btnClick('clearGrades', () => { if(confirm("تصفير الدرجات؟")) database.ref('grades/').remove().then(()=>window.location.reload()); });

    // عرض الدرجات للأدمن
    const gList = document.getElementById('gradesList');
    if(gList) {
        database.ref('grades/').on('value', snap => {
            gList.innerHTML = "";
            snap.forEach(s => { s.forEach(e => {
                const d = e.val();
                gList.innerHTML += `<div style="border-bottom:1px solid #555;">${d.studentName}: ${d.score}/${d.total}</div>`;
            });});
        });
    }

    // استقبال الإشعارات
    const notifArea = document.getElementById('notificationArea');
    if (notifArea) {
        database.ref('notifications/msg').on('value', snap => {
            if (snap.exists() && snap.val()) {
                notifArea.style.display = "block";
                document.getElementById('notifContent').innerText = snap.val();
            } else { notifArea.style.display = "none"; }
        });
    }

    // تسجيل الدخول
    const logForm = document.getElementById('loginForm');
    if (logForm) {
        logForm.onsubmit = (e) => {
            e.preventDefault();
            const p = document.getElementById('phone').value;
            database.ref('students/' + p).once('value').then(s => {
                if (s.exists() && s.val().password === document.getElementById('password').value) {
                    localStorage.setItem('studentName', s.val().fullName);
                    localStorage.setItem('studentPhone', p);
                    window.location.href = 'dashboard.html';
                } else alert("بيانات خاطئة!");
            });
        };
    }

    // الترحيب
    const w = document.getElementById('welcomeTitle');
    if(w) w.innerText = `👋 أهلاً ${localStorage.getItem('studentName') || ""}`;
    btnClick('logoutBtn', () => { localStorage.clear(); window.location.href='index.html'; });
});

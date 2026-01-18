// ==========================================
// 1. إعدادات فايربيس
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCt3On8r1FkPRbrpwKg2Llco-7tlURWG5s",
  authDomain: "mrmohamed-platform.firebaseapp.com",
  databaseURL: "https://mrmohamed-platform-default-rtdb.firebaseio.com",
  projectId: "mrmohamed-platform",
  storageBucket: "mrmohamed-platform.firebasestorage.app",
  messagingSenderId: "222403252654",
  appId: "1:222403252654:web:6950e99b1b03ed22a8783f"
};

// تهيئة فايربيس
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ==========================================
// 2. دوال مساعدة عامة
// ==========================================

// تحويل روابط اليوتيوب
function getEmbedUrl(url) {
    let id = "";
    if (!url) return "";
    if (url.includes("v=")) id = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1].split("?")[0];
    return id ? "https://www.youtube.com/embed/" + id : url;
}

// دالة تسجيل طالب جديد (Register)
window.registerStudent = function() {
    const n = document.getElementById('newName').value;
    const p = document.getElementById('newPhone').value;
    const pw = document.getElementById('newPassword').value;
    const g = document.getElementById('studentGrade') ? document.getElementById('studentGrade').value : "غير محدد";

    if(!n || !p || !pw) { alert("من فضلك املأ جميع البيانات!"); return; }
    
    database.ref('students/' + p).once('value').then(snapshot => {
        if (snapshot.exists()) {
            alert("عذراً، هذا الرقم مسجل بالفعل!");
        } else {
            database.ref('students/'+p).set({ 
                fullName: n, 
                password: pw,
                grade: g,
                joinDate: new Date().toLocaleDateString()
            })
            .then(() => { 
                alert("تم إنشاء الحساب بنجاح! \nسجل دخولك الآن."); 
                window.location.href='index.html'; 
            })
            .catch(e => alert("حدث خطأ: " + e.message));
        }
    });
};

// ==========================================
// 3. كود التشغيل الرئيسي عند تحميل الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------
    // A. منطق صفحة الأدمن (Admin Panel)
    // --------------------------------------
    // ملاحظة: تم إزالة طلب الباسورد من هنا لأنه أصبح في واجهة HTML
    if (window.location.pathname.includes("admin.html")) {
        
        // 1. رفع الأسئلة بالجملة
        const bulkBtn = document.getElementById('bulkUploadBtn');
        if(bulkBtn) {
            bulkBtn.onclick = () => {
                const text = document.getElementById('bulkText').value;
                if(!text.trim()) { alert("الصندوق فارغ!"); return; }
                const lines = text.split('\n');
                let count = 0;
                if(confirm(`هل أنت متأكد من رفع ${lines.length} سؤال؟`)) {
                    lines.forEach((line, index) => {
                        const parts = line.split('|');
                        if(parts.length >= 2) { 
                             const q = parts[0].trim();
                             const a = parts[1] ? parts[1].trim() : "";
                             const b = parts[2] ? parts[2].trim() : "";
                             const c = parts[3] ? parts[3].trim() : "";
                             
                             if(q && a) {
                                setTimeout(() => {
                                    database.ref('exams/').push({ q, a, b, c });
                                }, index * 50);
                                count++;
                             }
                        }
                    });
                    setTimeout(() => {
                        alert(`تم رفع ${count} سؤال بنجاح!`);
                        document.getElementById('bulkText').value = "";
                    }, 1000);
                }
            };
        }

        // 2. حذف جميع الدروس
        const delLessonBtn = document.getElementById('clearLessons');
        if(delLessonBtn) {
            delLessonBtn.onclick = () => {
                if(confirm("⚠️ تحذير: سيتم حذف جميع الدروس!\nهل أنت متأكد؟")) {
                    database.ref('lessons/').remove()
                    .then(() => { alert("تم الحذف!"); window.location.reload(); });
                }
            };
        }

        // 3. إضافة درس فردي
        const addLBtn = document.getElementById('addLessonBtn');
        if (addLBtn) {
            addLBtn.onclick = () => {
                const t = document.getElementById('lessonTitle').value;
                const v = document.getElementById('videoUrl').value;
                const pdf = document.getElementById('pdfUrl').value;
                if(t) {
                    database.ref('lessons/').push({ title: t, videoUrl: v, pdfUrl: pdf })
                    .then(()=> { alert("تم نشر الدرس!"); window.location.reload(); });
                } else { alert("اكتب عنوان الدرس!"); }
            };
        }

        // 4. إرسال الإشعارات
        const sendNBtn = document.getElementById('sendNotifBtn');
        if(sendNBtn) {
            sendNBtn.onclick = () => {
                const msg = document.getElementById('notifText').value;
                if(msg) database.ref('notifications/msg').set(msg).then(()=>alert("تم الإرسال!"));
            };
        }
        const clrNBtn = document.getElementById('clearNotifBtn');
        if(clrNBtn) clrNBtn.onclick = () => database.ref('notifications/msg').set(null).then(()=>alert("تم المسح"));

        // 5. إضافة سؤال يدوي
        const addQBtn = document.getElementById('addQuestionBtn');
        if(addQBtn) {
            addQBtn.onclick = () => {
                database.ref('exams/').push({
                    q: document.getElementById('qText').value,
                    a: document.getElementById('op1').value,
                    b: document.getElementById('op2').value,
                    c: document.getElementById('op3').value
                }).then(()=> alert("تم إضافة السؤال!"));
            };
        }
        
        // 6. أزرار الحذف الأخرى
        const clrExams = document.getElementById('clearExams');
        if(clrExams) clrExams.onclick = () => { if(confirm("حذف الامتحان؟")) database.ref('exams/').remove().then(()=>window.location.reload()); };
        
        const clrGrades = document.getElementById('clearGrades');
        if(clrGrades) clrGrades.onclick = () => { if(confirm("تصفير الدرجات؟")) database.ref('grades/').remove().then(()=>window.location.reload()); };

        // 7. عرض درجات الطلاب للأدمن
        const gList = document.getElementById('gradesList');
        if(gList) {
            database.ref('grades/').on('value', snap => {
                gList.innerHTML = "";
                if(snap.exists()) {
                    snap.forEach(studentSnap => {
                        studentSnap.forEach(examSnap => {
                            const d = examSnap.val();
                            gList.innerHTML += `<div style="border-bottom:1px solid #ccc; padding:5px;">
                                <b>${d.studentName}</b>: ${d.score}/${d.total}
                            </div>`;
                        });
                    });
                }
            });
        }
    }

    // --------------------------------------
    // B. منطق صفحة الطالب (Dashboard)
    // --------------------------------------
    
    // 1. الترحيب (الصفحة والقائمة الجانبية)
    const wTitle = document.getElementById('welcomeTitle');
    const sideName = document.getElementById('sideMenuName');

    if(wTitle) { 
        const sName = localStorage.getItem('studentName');
        if(!sName) {
            window.location.href = 'index.html';
        } else {
            wTitle.innerText = `منور يا ${sName.split(' ')[0]} يا عالمي 👋`;
            if(sideName) sideName.innerText = sName;
        }
    }

    // 2. استقبال الإشعارات
    const notifArea = document.getElementById('notificationArea');
    if (notifArea) {
        database.ref('notifications/msg').on('value', snap => {
            if (snap.exists() && snap.val()) {
                notifArea.style.display = "block";
                document.getElementById('notifContent').innerText = snap.val();
            } else { notifArea.style.display = "none"; }
        });
    }

    // 3. عرض الدروس (بنظام الكروت)
    const lList = document.getElementById('studentLessonsList');
    if (lList) {
        lList.innerHTML = '<p style="text-align:center;">جاري تحميل المحاضرات...</p>';
        database.ref('lessons/').on('value', snap => {
            lList.innerHTML = "";
            if (snap.exists()) {
                snap.forEach(c => {
                    const d = c.val();
                    let pdfBtn = d.pdfUrl ? 
                        `<button class="btn-pdf" onclick="window.open('${d.pdfUrl}')"><i class="fas fa-file-pdf"></i> ملزمة الحصة</button>` : '';
                    
                    lList.innerHTML += `
                        <div class="lesson-card">
                            <div class="lesson-header">
                                <i class="fas fa-play-circle" style="color:var(--main-color);"></i> ${d.title}
                            </div>
                            ${d.videoUrl ? `<div class="video-wrapper"><iframe src="${getEmbedUrl(d.videoUrl)}" frameborder="0" allowfullscreen></iframe></div>` : ''}
                            <div class="lesson-footer">
                                ${pdfBtn}
                            </div>
                        </div>`;
                });
            } else {
                lList.innerHTML = '<div style="text-align:center; padding:20px; color:#777;">لا توجد محاضرات حالياً.</div>';
            }
        });
    }

    // 4. نظام الامتحانات
    const qContainer = document.getElementById('dynamicQuestionsContainer');
    const correctMap = {}; 
    
    if (qContainer) {
        qContainer.innerHTML = '<p style="text-align:center;">جاري البحث عن امتحانات...</p>';
        database.ref('exams/').once('value', snap => {
            qContainer.innerHTML = "";
            if (snap.exists()) {
                let i = 1;
                snap.forEach(c => {
                    const d = c.val();
                    correctMap[c.key] = d.a; 
                    
                    let options = [
                        { val: d.a, label: d.a },
                        { val: d.b, label: d.b },
                        { val: d.c, label: d.c }
                    ];
                    options.sort(() => Math.random() - 0.5);

                    qContainer.innerHTML += `
                    <div class="lesson-card" style="padding:20px; text-align:left; direction:ltr;">
                        <p style="font-weight:bold; font-size:1.1rem; margin-bottom:15px;">${i++}. ${d.q}</p>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label style="cursor:pointer;"><input type="radio" name="${c.key}" value="${options[0].val}"> ${options[0].label}</label>
                            <label style="cursor:pointer;"><input type="radio" name="${c.key}" value="${options[1].val}"> ${options[1].label}</label>
                            <label style="cursor:pointer;"><input type="radio" name="${c.key}" value="${options[2].val}"> ${options[2].label}</label>
                        </div>
                    </div>`;
                });
                
                const subBtn = document.getElementById('submitExamBtn');
                if(subBtn) subBtn.style.display = "block";
                startTimer(60); 
            } else {
                qContainer.innerHTML = '<div style="text-align:center; padding:20px;">لا يوجد امتحان نشط الآن.</div>';
            }
        });
    }

    function startTimer(m) {
        let t = m * 60;
        const disp = document.getElementById('timerDisplay');
        if(!disp) return;
        const interval = setInterval(() => {
            let min = Math.floor(t / 60);
            let sec = t % 60;
            disp.innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
            if (t-- <= 0) { clearInterval(interval); submitFinal(); }
        }, 1000);
    }

    function submitFinal() {
        let score = 0, total = 0;
        const form = document.getElementById('examForm');
        if(!form) return;
        const formData = new FormData(form);
        for(let key in correctMap) {
            if(formData.get(key) === correctMap[key]) score++;
            total++;
        }
        
        // حفظ النتيجة
        const sPhone = localStorage.getItem('studentPhone');
        if(sPhone) {
            database.ref('grades/' + sPhone).push({
                studentName: localStorage.getItem('studentName'),
                score, total, examDate: new Date().toLocaleString()
            }).then(() => {
                document.getElementById('examsSection').querySelector('.exam-container-box').style.display = 'none';
                document.getElementById('resultArea').style.display = "block";
                let msg = score >= total/2 ? "ناجح! عاش يا بطل 👏" : "محتاج تشد حيلك شوية! ⚠️";
                document.getElementById('scoreText').innerHTML = `النتيجة: ${score} / ${total}<br><span style="font-size:1rem; color:#777">${msg}</span>`;
            });
        }
    }

    const subBtn = document.getElementById('submitExamBtn');
    if(subBtn) subBtn.onclick = () => { if(confirm("تسليم الإجابة؟")) submitFinal(); };

    // 5. عرض سجل درجاتي
    const myGradesList = document.getElementById('myGradesList');
    if(myGradesList) {
        const ph = localStorage.getItem('studentPhone');
        if(ph) {
            database.ref('grades/' + ph).on('value', snap => {
                myGradesList.innerHTML = "";
                if(snap.exists()) {
                    let reversed = [];
                    snap.forEach(c => reversed.unshift(c.val()));
                    reversed.forEach(d => {
                        let color = d.score >= d.total/2 ? '#2ecc71' : '#e74c3c';
                        myGradesList.innerHTML += `
                        <div style="background:white; padding:15px; border-radius:10px; margin-bottom:10px; border-right:5px solid ${color}; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                            <div style="display:flex; justify-content:space-between;">
                                <strong>📅 ${d.examDate}</strong>
                                <span style="font-weight:bold; color:${color};">${d.score}/${d.total}</span>
                            </div>
                        </div>`;
                    });
                } else {
                    myGradesList.innerHTML = "<p style='text-align:center; color:#777;'>لا توجد درجات مسجلة.</p>";
                }
            });
        }
    }

    // --------------------------------------
    // C. تسجيل الدخول للطالب
    // --------------------------------------
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
                    localStorage.setItem('studentGrade', s.val().grade || "عام");
                    window.location.href = 'dashboard.html';
                } else alert("بيانات خاطئة!");
            });
        };
    }
});

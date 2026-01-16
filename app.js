// --- 1. إعدادات Firebase الخاصة بمشروعك (Mr Mohamed Platform) ---
const firebaseConfig = {
  apiKey: "AIzaSyCt3On8r1FkPRbrpwKg2Llco-7tlURWG5s", //
  authDomain: "mrmohamed-platform.firebaseapp.com", //
  databaseURL: "https://mrmohamed-platform-default-rtdb.firebaseio.com", //
  projectId: "mrmohamed-platform", //
  storageBucket: "mrmohamed-platform.firebasestorage.app", //
  messagingSenderId: "222403252654", //
  appId: "1:222403252654:web:6950e99b1b03ed22a8783f" //
};

// تهيئة Firebase وربط قاعدة البيانات
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {

    // --- 2. نظام إنشاء حساب طالب جديد (Register) ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('newName').value;
            const phone = document.getElementById('newPhone').value;
            const pass = document.getElementById('newPassword').value;

            database.ref('students/' + phone).set({
                fullName: name,
                password: pass
            }).then(() => {
                alert("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
                window.location.href = 'index.html';
            }).catch(err => alert("خطأ: " + err.message));
        });
    }

    // --- 3. نظام تسجيل الدخول (Login) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone').value;
            const pass = document.getElementById('password').value;

            database.ref('students/' + phone).once('value').then((snap) => {
                if (snap.exists() && snap.val().password === pass) {
                    localStorage.setItem('studentName', snap.val().fullName);
                    localStorage.setItem('studentPhone', phone);
                    window.location.href = 'dashboard.html';
                } else {
                    alert("رقم الهاتف أو كلمة المرور غير صحيحة!");
                }
            });
        });
    }

    // --- 4. لوحة التحكم وعرض اسم الطالب ---
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) {
        welcomeTitle.innerText = `Welcome ${localStorage.getItem('studentName') || "Student"} 👋`;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.clear();
            window.location.href = 'index.html';
        };
    }

    // --- 5. نظام الأدمن (إضافة الدروس) ---
    const addLessonBtn = document.getElementById('addLessonBtn');
    if (addLessonBtn) {
        addLessonBtn.onclick = () => {
            const title = document.getElementById('lessonTitle').value;
            const video = document.getElementById('videoUrl').value;
            const pdf = document.getElementById('pdfUrl').value;

            if (title && video) {
                database.ref('lessons/').push({
                    title: title, videoUrl: video, pdfUrl: pdf
                }).then(() => {
                    alert("تم نشر الدرس بنجاح!");
                    location.reload();
                });
            } else { alert("يرجى إكمال بيانات الدرس!"); }
        };
    }

    // --- 6. عرض الدروس للطلاب (ديناميكياً) ---
    const studentLessonsList = document.getElementById('studentLessonsList');
    if (studentLessonsList) {
        database.ref('lessons/').on('value', (snapshot) => {
            studentLessonsList.innerHTML = "";
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const data = child.val();
                    studentLessonsList.innerHTML += `
                        <div class="story-section">
                            <h2 class="story-title">${data.title}</h2>
                            <button class="menu-item" onclick="window.open('${data.videoUrl}', '_blank')">🎬 مشاهدة الفيديو</button>
                            ${data.pdfUrl ? `<button class="menu-item" onclick="window.open('${data.pdfUrl}', '_blank')">📥 تحميل المذكرة</button>` : ''}
                        </div>`;
                });
            } else { studentLessonsList.innerHTML = "<p>لا توجد دروس حالياً.</p>"; }
        });
    }

    // --- 7. نظام المؤقت الزمني للامتحان ---
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        let timeLeft = 30 * 60; // 30 دقيقة للامتحان
        const timerInterval = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.innerText = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("انتهى الوقت!");
                calculateAndSubmit();
            }
            timeLeft--;
        }, 1000);
    }

    // --- 8. تصحيح الـ 20 سؤالاً وحفظ الدرجة ---
    function calculateAndSubmit() {
        const answers = {
            q1: "sensational", q2: "was waiting", q3: "pirate", q4: "broadsheet", q5: "cause",
            q6: "for", q7: "had left", q8: "hasn't finished", q9: "witness", q10: "will have finished",
            q11: "ambitious", q12: "both", q13: "moving", q14: "mustn't", q15: "highlight",
            q16: "enjoy", q17: "where", q18: "was repaired", q19: "were", q20: "would become"
        };

        let score = 0;
        const form = new FormData(document.getElementById('examForm'));
        for (let key in answers) {
            if (form.get(key) === answers[key]) score++;
        }

        const phone = localStorage.getItem('studentPhone');
        if (phone) {
            database.ref('grades/' + phone).push({
                examName: "Comprehensive Exam 2026",
                score: score, total: 20,
                examDate: new Date().toLocaleString()
            }).then(() => {
                document.getElementById('examForm').style.display = "none";
                document.getElementById('resultArea').style.display = "block";
                document.getElementById('scoreText').innerText = `انتهى الامتحان! درجتك: ${score} من 20`;
            });
        }
    }

    const submitBtn = document.getElementById('submitExam');
    if (submitBtn) {
        submitBtn.onclick = () => { if(confirm("إنهاء الامتحان؟")) calculateAndSubmit(); };
    }

    // --- 9. عرض سجل الدرجات ---
    const gradesList = document.getElementById('gradesList');
    if (gradesList) {
        const phone = localStorage.getItem('studentPhone');
        database.ref('grades/' + phone).on('value', (snap) => {
            gradesList.innerHTML = "";
            if (snap.exists()) {
                snap.forEach((child) => {
                    const data = child.val();
                    gradesList.innerHTML += `
                        <div style="border-bottom: 1px solid #444; padding: 10px; text-align: right;">
                            <p style="color:#34b7f1; font-weight:bold;">${data.examName}</p>
                            <p>الدرجة: ${data.score} من ${data.total}</p>
                            <small>${data.examDate}</small>
                        </div>`;
                });
            } else { gradesList.innerHTML = "<p>لا توجد نتائج مسجلة.</p>"; }
        });
    }
});

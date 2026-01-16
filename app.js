// --- 1. إعدادات Firebase ---
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

document.addEventListener('DOMContentLoaded', () => {

    // --- 2. نظام الحسابات (نفس الكود السابق) ---
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
                } else { alert("بيانات خاطئة!"); }
            });
        });
    }

    // --- 3. لوحة التحكم ---
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) {
        welcomeTitle.innerText = `Welcome ${localStorage.getItem('studentName') || "Student"} 👋`;
    }

    // --- 4. نظام المؤقت الزمني (Timer) ---
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        let timeLeft = 30 * 60; // 30 دقيقة بالثواني

        const timerInterval = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;

            // تنسيق الوقت ليظهر 00:00
            timerDisplay.innerText = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("انتهى الوقت! سيتم إرسال إجاباتك تلقائياً.");
                calculateAndSubmit(); // إنهاء تلقائي
            }
            timeLeft--;
        }, 1000);
    }

    // --- 5. تصحيح الامتحان وحفظ الدرجة ---
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
                examName: "Final Exam 2026",
                score: score,
                total: 20,
                examDate: new Date().toLocaleString()
            }).then(() => {
                document.getElementById('examForm').style.display = "none"; // إخفاء الأسئلة
                document.getElementById('resultArea').style.display = "block";
                document.getElementById('scoreText').innerText = `انتهى الامتحان! درجتك: ${score} من 20`;
            });
        }
    }

    // ربط زر الإرسال اليدوي بالوظيفة البرمجية
    const submitBtn = document.getElementById('submitExam');
    if (submitBtn) {
        submitBtn.onclick = () => {
            if(confirm("هل أنت متأكد من إنهاء الامتحان؟")) {
                calculateAndSubmit();
            }
        };
    }
});

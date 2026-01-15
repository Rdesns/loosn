let students = JSON.parse(localStorage.getItem("students")) || [];

function showRegister(){
  document.getElementById("registerForm").style.display="block";
}

function register(){
  let name = document.getElementById("newName").value;
  let phone = document.getElementById("newPhone").value;
  let pass = document.getElementById("newPass").value;

  if(!name || !phone || !pass){ alert("All fields required!"); return; }

  if(students.find(s=>s.phone===phone)){
    alert("Phone already registered!"); return;
  }

  students.push({name, phone, password:pass, grades:[], lessonsCompleted:[], storyCompleted:false});
  localStorage.setItem("students", JSON.stringify(students));
  alert("Student registered ✅");
  document.getElementById("registerForm").style.display="none";
}

function login(){
  let phone = document.getElementById("phone").value;
  let pass = document.getElementById("password").value;
  let student = students.find(s=>s.phone===phone && s.password===pass);
  if(student){
    localStorage.setItem("currentStudent", JSON.stringify(student));
    window.location="dashboard.html";
  }else{
    document.getElementById("msg").innerText="Wrong phone or password!";
  }
}

function logout(){
  localStorage.removeItem("currentStudent");
  window.location="index.html";
}

// الدروس + الملخصات للصف الثالث الثانوي 2026
const lessons = [
  {title:"Lesson 1 – Present Simple", summary:"I play, You play, He plays…"},
  {title:"Lesson 2 – Past Simple", summary:"I played, I went, I saw…"},
  {title:"Lesson 3 – Future Simple", summary:"I will go, She will see…"}
];

function showLessons(){
  let content = document.getElementById("content");
  content.innerHTML = lessons.map((l,i)=>`
    <h2>${l.title}</h2>
    <p>${l.summary}</p>
    <button onclick="markLesson(${i})">Mark as Completed ✅</button>
    <hr>
  `).join("");
}

function markLesson(i){
  let student = JSON.parse(localStorage.getItem("currentStudent"));
  if(!student.lessonsCompleted.includes(i)) student.lessonsCompleted.push(i);
  updateStudent(student);
  alert("Lesson marked as completed!");
}

function showExam(){
  let content = document.getElementById("content");
  content.innerHTML = `
    <h2>Mini Exam – الصف الثالث الثانوي 2026</h2>
    <p>1) He ___ to school every day.</p>
    <button onclick="submitAnswer(true)">goes</button>
    <button onclick="submitAnswer(false)">go</button>
    <p>2) I ___ yesterday.</p>
    <button onclick="submitAnswer(true)">played</button>
    <button onclick="submitAnswer(false)">play</button>
  `;
}

function submitAnswer(correct){
  let student = JSON.parse(localStorage.getItem("currentStudent"));
  if(correct){ alert("Correct!"); student.grades.push(1); } 
  else { alert("Wrong!"); student.grades.push(0); }
  updateStudent(student);
}

function showStory(){
  let content = document.getElementById("content");
  content.innerHTML = `
    <h2>The Count of Monte Cristo – قصة الصف الثالث 2026</h2>
    <p>ملخص القصة: Edmond Dantès is falsely imprisoned and seeks revenge. He discovers treasure and returns to take justice...</p>
    <h3>أسئلة القصة:</h3>
    <p>1) Who betrayed Edmond Dantès?</p>
    <p>2) What did he discover in prison?</p>
    <p>3) How did he take revenge?</p>
    <button onclick="markStory()">Mark Story as Read ✅</button>
  `;
}

function markStory(){
  let student = JSON.parse(localStorage.getItem("currentStudent"));
  student.storyCompleted = true;
  updateStudent(student);
  alert("Story marked as completed!");
}

function showGrades(){
  let student = JSON.parse(localStorage.getItem("currentStudent"));
  let total = student.grades.reduce((a,b)=>a+b,0);
  let content = document.getElementById("content");
  content.innerHTML = `
    <h2>Your Grades</h2>
    <p>Score: ${total} / ${student.grades.length}</p>
    <p>Lessons Completed: ${student.lessonsCompleted.length} / ${lessons.length}</p>
    <p>Story Completed: ${student.storyCompleted ? "✅ Yes" : "❌ No"}</p>
  `;
}

function updateStudent(student){
  let all = JSON.parse(localStorage.getItem("students"));
  let idx = all.findIndex(s=>s.phone===student.phone);
  all[idx]=student;
  localStorage.setItem("students", JSON.stringify(all));
  localStorage.setItem("currentStudent", JSON.stringify(student));
}

// تحميل اسم الطالب عند فتح dashboard
window.onload = function(){
  let student = JSON.parse(localStorage.getItem("currentStudent"));
  if(student) document.getElementById("studentName").innerText = student.name;
}
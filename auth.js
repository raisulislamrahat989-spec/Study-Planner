document.addEventListener("DOMContentLoaded",()=>{
  Store.seedDB();

  const select=document.querySelector("#studentSelect");
  if(select){
    Store.getDB().students.forEach(s=>{
      select.insertAdjacentHTML("beforeend",`<option value="${s.id}">${s.name} - Roll ${s.roll}</option>`);
    });

    document.querySelector("#studentLoginForm").addEventListener("submit",e=>{
      e.preventDefault();
      localStorage.setItem("currentUser",JSON.stringify({role:"student",studentId:select.value}));
      location.href="pages/dashboard.html";
    });
  }

  const adminForm=document.querySelector("#adminLoginForm");
  if(adminForm){
    adminForm.addEventListener("submit",e=>{
      e.preventDefault();

      const email=document.querySelector("#adminEmail").value.trim();
      const pass=document.querySelector("#adminPassword").value.trim();

      if(email==="admin@school.com"&&pass==="admin123"){
        localStorage.setItem("currentUser",JSON.stringify({role:"admin",name:"Teacher Admin"}));
        location.href="admin-dashboard.html";
      }else{
        document.querySelector("#loginError").textContent="Wrong email or password.";
      }
    });
  }
});

function currentUser(){
  try{
    return JSON.parse(localStorage.getItem("currentUser"));
  }catch{
    return null;
  }
}

function logout(){
  localStorage.removeItem("currentUser");
  location.href=location.pathname.includes("/admin/")?"admin-login.html":"../index.html";
}

function requireStudent(){
  const u=currentUser();
  if(!u||u.role!=="student") location.href="../index.html";
}

function requireAdmin(){
  const u=currentUser();
  if(!u||u.role!=="admin") location.href="admin-login.html";
}

function currentStudent(){
  const u=currentUser();
  return u?.studentId?Store.getStudent(u.studentId):null;
}

window.Auth={currentUser,logout,requireStudent,requireAdmin,currentStudent};
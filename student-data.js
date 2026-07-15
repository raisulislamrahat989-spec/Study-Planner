const DB_KEY="studyTrackDB_v1";
const today=()=>new Date().toISOString().slice(0,10);

const defaultData={
  subjects:["Mathematics","English","Physics","ICT"],
  students:[
    {
      id:"s1",
      name:"Abid Hasan",
      class:"CSE 1st Year",
      roll:"101",
      email:"abid@student.com",
      attendance:[
        {date:"2026-07-12",status:"Present"},
        {date:"2026-07-13",status:"Late"},
        {date:"2026-07-14",status:"Present"}
      ],
      subjects:[
        {name:"Mathematics",progress:78},
        {name:"English",progress:68},
        {name:"Physics",progress:55},
        {name:"ICT",progress:88}
      ],
      planner:[
        {date:"2026-07-15",subject:"ICT",topic:"JavaScript DOM",time:"8:00 PM"},
        {date:"2026-07-16",subject:"Physics",topic:"Numerical problems",time:"9:00 PM"}
      ],
      tasks:[
        {title:"Finish ICT assignment",subject:"ICT",done:false,reviewed:false,comment:""},
        {title:"Read English chapter 4",subject:"English",done:true,reviewed:true,comment:"Good."}
      ]
    },
    {
      id:"s2",
      name:"Nusrat Jahan",
      class:"CSE 1st Year",
      roll:"102",
      email:"nusrat@student.com",
      attendance:[
        {date:"2026-07-12",status:"Present"},
        {date:"2026-07-13",status:"Present"},
        {date:"2026-07-14",status:"Absent"}
      ],
      subjects:[
        {name:"Mathematics",progress:62},
        {name:"English",progress:74},
        {name:"Physics",progress:49},
        {name:"ICT",progress:80}
      ],
      planner:[
        {date:"2026-07-15",subject:"Mathematics",topic:"Matrix",time:"7:30 PM"}
      ],
      tasks:[
        {title:"Submit lab report",subject:"Physics",done:false,reviewed:false,comment:""}
      ]
    },
    {
      id:"s3",
      name:"Rakib Ahmed",
      class:"CSE 1st Year",
      roll:"103",
      email:"rakib@student.com",
      attendance:[
        {date:"2026-07-12",status:"Absent"},
        {date:"2026-07-13",status:"Present"},
        {date:"2026-07-14",status:"Present"}
      ],
      subjects:[
        {name:"Mathematics",progress:84},
        {name:"English",progress:59},
        {name:"Physics",progress:70},
        {name:"ICT",progress:65}
      ],
      planner:[
        {date:"2026-07-17",subject:"English",topic:"Presentation practice",time:"6:00 PM"}
      ],
      tasks:[
        {title:"Practice matrix math",subject:"Mathematics",done:true,reviewed:false,comment:""}
      ]
    }
  ]
};

function seedDB(){
  if(!localStorage.getItem(DB_KEY)){
    localStorage.setItem(DB_KEY,JSON.stringify(defaultData));
  }
}

function getDB(){
  seedDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(db){
  localStorage.setItem(DB_KEY,JSON.stringify(db));
}

function resetDB(){
  localStorage.setItem(DB_KEY,JSON.stringify(defaultData));
  location.reload();
}

function getStudent(id){
  return getDB().students.find(s=>s.id===id);
}

function saveStudent(student){
  const db=getDB();
  const i=db.students.findIndex(s=>s.id===student.id);
  db.students[i]=student;
  saveDB(db);
}

function average(arr){
  return arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length):0;
}

function attendancePercent(student){
  const total=student.attendance.length;
  const present=student.attendance.filter(a=>a.status==="Present"||a.status==="Late").length;
  return total?Math.round((present/total)*100):0;
}

function subjectAverage(student){
  return average(student.subjects.map(s=>s.progress));
}

window.Store={seedDB,getDB,saveDB,resetDB,getStudent,saveStudent,average,attendancePercent,subjectAverage,today};
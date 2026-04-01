import { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function FontLoader() {
  useEffect(() => {
    if (document.getElementById("trainos-fonts")) return;
    const l = document.createElement("link");
    l.id = "trainos-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Epilogue:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
}

const F = {
  display: "'Syne', system-ui, sans-serif",
  body:    "'Epilogue', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
};

const C = {
  canvas:"#0B0B0F", surface:"#111116", surf2:"#18181F", surf3:"#202028",
  border:"#1E1E28", border2:"#2A2A38",
  text:"#ECEAF2", text2:"#8E8EA8", text3:"#525268",
  brand:"#F97316", brandLo:"rgba(249,115,22,.14)", brandXlo:"rgba(249,115,22,.06)",
  green:"#34D399", greenLo:"rgba(52,211,153,.12)",
  red:"#F87171",   redLo:"rgba(248,113,113,.12)",
  amber:"#FBBF24", amberLo:"rgba(251,191,36,.12)",
  blue:"#60A5FA",  blueLo:"rgba(96,165,250,.12)",
  purple:"#A78BFA",purpleLo:"rgba(167,139,250,.12)",
};

const card  = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:10 };
const field = { padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border2}`, fontSize:12,
                color:C.text, background:C.surf2, width:"100%", boxSizing:"border-box",
                fontFamily:F.body, outline:"none" };
const pill  = (active, color=C.text2) => ({
  padding:"5px 13px", borderRadius:5, fontSize:11, fontWeight:600, fontFamily:F.mono,
  letterSpacing:".04em", border:`1px solid ${active?color+"55":C.border2}`,
  background:active?color+"18":"transparent", color:active?color:C.text3,
  cursor:"pointer", transition:"all .13s"
});
const mkBtn = (variant="secondary", r=7) => {
  const base = { borderRadius:r, fontSize:12, fontWeight:600, border:"none", cursor:"pointer",
                 fontFamily:F.body, display:"inline-flex", alignItems:"center", gap:6,
                 letterSpacing:".02em", transition:"opacity .12s", padding:"7px 16px" };
  if (variant==="primary")   return { ...base, background:C.brand, color:"#000" };
  if (variant==="secondary") return { ...base, background:C.surf3, color:C.text2, border:`1px solid ${C.border2}` };
  if (variant==="ghost")     return { ...base, background:"transparent", color:C.text3, border:"none" };
  if (variant==="danger")    return { ...base, background:C.redLo, color:C.red, border:`1px solid ${C.red}44` };
  if (variant==="warn")      return { ...base, background:C.amberLo, color:C.amber, border:`1px solid ${C.amber}44` };
  return base;
};

const CATEGORIES = {
  coding:  { label:"Coding",        color:C.blue,   lo:C.blueLo   },
  maths:   { label:"Maths",         color:C.brand,  lo:C.brandLo  },
  finlit:  { label:"Fin. Literacy", color:C.green,  lo:C.greenLo  },
  robotics:{ label:"Robotics",      color:C.purple, lo:C.purpleLo },
};
const COURSES = [
  {id:"c1", cat:"coding",  icon:"🐍",name:"Intro to Python",           modules:13,status:"active",enrolled:2498,completed:0,  avg:25.2,desc:"Variables · loops · functions · first programs"},
  {id:"c2", cat:"coding",  icon:"🌐",name:"Web Dev Basics",            modules:10,status:"active",enrolled:1842,completed:156,avg:42.1,desc:"HTML · CSS · JavaScript · responsive layouts"},
  {id:"c3", cat:"coding",  icon:"🎮",name:"App Building with Scratch", modules:8, status:"active",enrolled:1205,completed:312,avg:58.4,desc:"Visual programming · game design · logic blocks"},
  {id:"c4", cat:"coding",  icon:"⚙️",name:"Advanced Algorithms",       modules:12,status:"active",enrolled:634, completed:89, avg:31.0,desc:"Sorting · recursion · time complexity · DSA"},
  {id:"c5", cat:"maths",   icon:"📐",name:"Foundation Math Teaching",  modules:9, status:"active",enrolled:2105,completed:284,avg:47.8,desc:"Number sense · operations · pedagogy framework"},
  {id:"c6", cat:"maths",   icon:"🎯",name:"Demo Class Math Mastery",   modules:8, status:"active",enrolled:1456,completed:392,avg:61.4,desc:"Live class tactics · concept delivery · Q&A flow"},
  {id:"c7", cat:"maths",   icon:"🧮",name:"Math Problem Solving",      modules:6, status:"active",enrolled:987, completed:445,avg:74.2,desc:"Problem framing · heuristics · worked examples"},
  {id:"c8", cat:"finlit",  icon:"💰",name:"Money Basics for Kids",     modules:5, status:"active",enrolled:743, completed:521,avg:82.4,desc:"Saving · budgeting · needs vs wants · allowances"},
  {id:"c9", cat:"finlit",  icon:"📈",name:"Investing & Entrepreneurship",modules:7,status:"active",enrolled:412,completed:78, avg:35.2,desc:"Compound interest · business models · pitch skills"},
  {id:"c10",cat:"robotics",icon:"🤖",name:"Intro to Robotics",         modules:8, status:"active",enrolled:891, completed:203,avg:54.7,desc:"Sensors · actuators · build-a-bot · basic control"},
  {id:"c11",cat:"robotics",icon:"🔌",name:"Arduino & Sensors",         modules:11,status:"active",enrolled:445, completed:67, avg:28.9,desc:"Circuit design · breadboarding · sensor programming"},
  {id:"c12",cat:"robotics",icon:"🏆",name:"Robotics Competition Prep", modules:6, status:"active",enrolled:234, completed:112,avg:67.5,desc:"Strategy · autonomous routines · scoring systems"},
  {id:"c13",cat:"coding",  icon:"🧠",name:"AI & Machine Learning",     modules:10,status:"draft", enrolled:0,   completed:0,  avg:0,   desc:"Neural nets · training data · model evaluation"},
];
const BATCHES = [{id:"b1",name:"Jan 2026"},{id:"b2",name:"Feb 2026"},{id:"b3",name:"Mar 2026"}];
const INIT_TEACHERS = [
  {id:1, name:"Ardhendu Mahatha", email:"ardhendu@gmail.com",    phone:"+91 98765 00001",batchId:"b1",joinDate:"2026-01-10",pct:84.62,status:"In Progress"},
  {id:2, name:"Chahat Gupta",     email:"chahatgupta@gmail.com", phone:"+91 98765 00002",batchId:"b1",joinDate:"2026-01-12",pct:84.62,status:"In Progress"},
  {id:3, name:"Mumal Rathore",    email:"mumalrathore@gmail.com",phone:"+91 98765 00003",batchId:"b2",joinDate:"2026-02-03",pct:76.92,status:"In Progress"},
  {id:4, name:"Shruthi S",        email:"shruthi@gmail.com",     phone:"+91 98765 00004",batchId:"b2",joinDate:"2026-02-04",pct:76.92,status:"In Progress"},
  {id:5, name:"Devesh Bhagwani",  email:"devesh@gmail.com",      phone:"+91 98765 00005",batchId:"b1",joinDate:"2026-01-15",pct:0,    status:"Not Started"},
  {id:6, name:"Shreya Yadav",     email:"shreya@gmail.com",      phone:"+91 98765 00006",batchId:"b3",joinDate:"2026-03-02",pct:69.23,status:"In Progress"},
  {id:7, name:"Shipra Gupta",     email:"shipra@gmail.com",      phone:"+91 98765 00007",batchId:"b1",joinDate:"2026-01-18",pct:0,    status:"Not Started"},
  {id:8, name:"Yakshi Chauhan",   email:"yakshi@gmail.com",      phone:"+91 98765 00008",batchId:"b2",joinDate:"2026-02-07",pct:61.54,status:"In Progress"},
  {id:9, name:"Manushree U",      email:"manushree@gmail.com",   phone:"+91 98765 00009",batchId:"b3",joinDate:"2026-03-05",pct:53.85,status:"In Progress"},
  {id:10,name:"Ayushi Podda",     email:"ayushi@gmail.com",      phone:"+91 98765 00010",batchId:"b1",joinDate:"2026-01-20",pct:46.15,status:"In Progress"},
  {id:11,name:"Meera Kulkarni",   email:"meera@gmail.com",       phone:"+91 98765 00011",batchId:"b2",joinDate:"2026-02-10",pct:0,    status:"Not Started"},
  {id:12,name:"Diksha Garg",      email:"diksha@gmail.com",      phone:"+91 98765 00012",batchId:"b1",joinDate:"2026-01-22",pct:38.46,status:"In Progress"},
  {id:13,name:"Pallavy Rai",      email:"pallavy@gmail.com",     phone:"+91 98765 00013",batchId:"b3",joinDate:"2026-03-08",pct:30.77,status:"In Progress"},
  {id:14,name:"Tannu Gupta",      email:"tannu@gmail.com",       phone:"+91 98765 00014",batchId:"b2",joinDate:"2026-02-12",pct:0,    status:"Not Started"},
  {id:15,name:"Shivangi Singh",   email:"shivangi@gmail.com",    phone:"+91 98765 00015",batchId:"b1",joinDate:"2026-01-25",pct:23.08,status:"In Progress"},
  {id:16,name:"Amjada KTP",       email:"amjada@gmail.com",      phone:"+91 98765 00016",batchId:"b3",joinDate:"2026-03-10",pct:0,    status:"Not Started"},
  {id:17,name:"Fida Kabir",       email:"fida@gmail.com",        phone:"+91 98765 00017",batchId:"b2",joinDate:"2026-02-14",pct:15.38,status:"In Progress"},
  {id:18,name:"Tisha Soni",       email:"tisha@gmail.com",       phone:"+91 98765 00018",batchId:"b1",joinDate:"2026-01-28",pct:7.69, status:"In Progress"},
  {id:19,name:"Nadia Showkat",    email:"nadia@gmail.com",       phone:"+91 98765 00019",batchId:"b3",joinDate:"2026-03-12",pct:0,    status:"Not Started"},
  {id:20,name:"Nikunj Rawat",     email:"nikunj@gmail.com",      phone:"+91 98765 00020",batchId:"b2",joinDate:"2026-02-16",pct:84.62,status:"In Progress"},
];
const INIT_ASSIGNMENTS = () => [
  {id:101,teacherId:1, courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:84.62,status:"In Progress"},
  {id:102,teacherId:1, courseId:"c5", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:65.0, status:"In Progress"},
  {id:103,teacherId:2, courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:84.62,status:"In Progress"},
  {id:104,teacherId:2, courseId:"c6", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:72.0, status:"In Progress"},
  {id:105,teacherId:3, courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:76.92,status:"In Progress"},
  {id:106,teacherId:3, courseId:"c5", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:58.0, status:"In Progress"},
  {id:107,teacherId:4, courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:76.92,status:"In Progress"},
  {id:108,teacherId:4, courseId:"c7", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:80.0, status:"In Progress"},
  {id:109,teacherId:5, courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-02-28",pct:0,    status:"Not Started"},
  {id:110,teacherId:5, courseId:"c10",assignedDate:"2026-03-01",deadline:"2026-05-31",pct:0,    status:"Not Started"},
  {id:111,teacherId:6, courseId:"c2", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:69.0, status:"In Progress"},
  {id:112,teacherId:6, courseId:"c8", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:90.0, status:"In Progress"},
  {id:113,teacherId:7, courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-02-28",pct:0,    status:"Not Started"},
  {id:114,teacherId:7, courseId:"c11",assignedDate:"2026-03-01",deadline:"2026-05-31",pct:0,    status:"Not Started"},
  {id:115,teacherId:8, courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:61.54,status:"In Progress"},
  {id:116,teacherId:8, courseId:"c6", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:55.0, status:"In Progress"},
  {id:117,teacherId:9, courseId:"c3", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:53.85,status:"In Progress"},
  {id:118,teacherId:9, courseId:"c10",assignedDate:"2026-02-01",deadline:"2026-04-30",pct:45.0, status:"In Progress"},
  {id:119,teacherId:10,courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:46.15,status:"In Progress"},
  {id:120,teacherId:10,courseId:"c5", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:40.0, status:"In Progress"},
  {id:121,teacherId:11,courseId:"c2", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:0,    status:"Not Started"},
  {id:122,teacherId:11,courseId:"c8", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:0,    status:"Not Started"},
  {id:123,teacherId:12,courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:38.46,status:"In Progress"},
  {id:124,teacherId:12,courseId:"c7", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:50.0, status:"In Progress"},
  {id:125,teacherId:13,courseId:"c3", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:30.77,status:"In Progress"},
  {id:126,teacherId:13,courseId:"c9", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:25.0, status:"In Progress"},
  {id:127,teacherId:14,courseId:"c4", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:0,    status:"Not Started"},
  {id:128,teacherId:14,courseId:"c11",assignedDate:"2026-03-01",deadline:"2026-05-31",pct:0,    status:"Not Started"},
  {id:129,teacherId:15,courseId:"c2", assignedDate:"2026-01-15",deadline:"2026-02-28",pct:23.08,status:"In Progress"},
  {id:130,teacherId:15,courseId:"c6", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:30.0, status:"In Progress"},
  {id:131,teacherId:16,courseId:"c10",assignedDate:"2026-03-01",deadline:"2026-05-31",pct:0,    status:"Not Started"},
  {id:132,teacherId:16,courseId:"c8", assignedDate:"2026-03-01",deadline:"2026-05-31",pct:0,    status:"Not Started"},
  {id:133,teacherId:17,courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-02-28",pct:15.38,status:"In Progress"},
  {id:134,teacherId:17,courseId:"c5", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:12.0, status:"In Progress"},
  {id:135,teacherId:18,courseId:"c2", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:7.69, status:"In Progress"},
  {id:136,teacherId:18,courseId:"c12",assignedDate:"2026-03-01",deadline:"2026-05-31",pct:15.0, status:"In Progress"},
  {id:137,teacherId:19,courseId:"c3", assignedDate:"2026-03-01",deadline:"2026-05-31",pct:0,    status:"Not Started"},
  {id:138,teacherId:19,courseId:"c9", assignedDate:"2026-03-01",deadline:"2026-05-31",pct:0,    status:"Not Started"},
  {id:139,teacherId:20,courseId:"c1", assignedDate:"2026-01-15",deadline:"2026-03-31",pct:84.62,status:"In Progress"},
  {id:140,teacherId:20,courseId:"c6", assignedDate:"2026-02-01",deadline:"2026-04-30",pct:78.0, status:"In Progress"},
];
const MODULES = {
  c1:[["Python Environment Setup",60.13,51.08,8.33,false],["Variables & Data Types",53.0,47.48,12.75,false],["Control Flow & Loops",50.8,47.0,5.41,false],["Quiz 1 — Python Basics",7.53,7.49,2.08,true],["Functions & Scope",45.6,42.27,11.02,false],["Lists & Dictionaries",42.39,37.79,24.45,false],["File Handling & Errors",39.59,34.35,19.48,false],["Quiz 2 — Core Python",4.08,4.04,2.17,true],["Object-Oriented Python",15.17,14.37,5.0,false],["Libraries & APIs",23.7,20.94,12.25,false],["Quiz 3 — Advanced",0,0,0,true],["Mini Project",0,0,0,false],["Final Project & Review",23.62,20.86,3.13,false]],
  c2:[["HTML Structure & Semantics",78.2,74.5,4.7,false],["CSS Styling Fundamentals",71.3,67.8,5.0,false],["Responsive Layouts",64.5,60.2,6.7,false],["JavaScript Intro",58.8,54.1,8.0,false],["Quiz — HTML/CSS/JS",52.3,51.9,0.8,true],["DOM Manipulation",46.7,42.3,9.4,false],["Fetch & APIs",38.4,35.1,8.6,false],["Forms & Validation",31.2,28.8,7.7,false],["Mini Project Build",24.5,21.3,13.1,false],["Deploy & Review",14.2,8.5,18.4,false]],
  c3:[["Intro to Scratch Interface",86.5,83.2,3.8,false],["Motion & Sprites",79.8,76.4,4.3,false],["Events & Broadcast",73.2,69.5,5.1,false],["Conditionals & Loops",67.4,63.8,5.3,false],["Quiz — Logic Blocks",61.2,60.8,0.7,true],["Variables & Lists",55.6,51.3,7.7,false],["Building a Game",48.9,44.2,9.6,false],["Final App Project",34.2,25.9,22.3,false]],
  c4:[["Big-O Notation",68.5,63.4,7.4,false],["Arrays & Strings",62.1,57.8,6.9,false],["Linked Lists",55.4,50.2,9.4,false],["Stacks & Queues",49.8,45.1,8.3,false],["Quiz — Linear Structures",45.3,44.8,1.1,true],["Trees & BST",40.2,36.7,11.5,false],["Graphs & BFS/DFS",34.6,30.8,14.8,false],["Dynamic Programming",28.4,24.9,16.2,false],["Quiz — Non-linear",22.5,22.1,1.8,true],["Greedy Algorithms",18.3,15.6,12.3,false],["Sorting Deep Dive",14.1,11.8,13.6,false],["Final: System Design",10.2,8.4,24.5,false]],
  c5:[["Math Pedagogy Basics",77.2,73.8,4.4,false],["Number Sense & Operations",70.5,66.2,6.1,false],["Place Value Teaching",63.8,59.4,6.9,false],["Fractions & Decimals",57.4,52.8,8.0,false],["Quiz — Core Concepts",52.1,51.6,1.0,true],["Word Problems Strategy",45.6,41.2,9.6,false],["Mental Math Techniques",38.3,34.7,9.4,false],["Assessment Design",31.1,27.4,11.9,false],["Capstone: Lesson Plan",22.4,13.5,32.0,false]],
  c6:[["Demo Class Structure",87.3,82.8,5.2,false],["Opening Hook & Warmup",80.1,75.4,5.9,false],["Concept Delivery Flow",72.6,68.2,6.1,false],["Student Engagement Tactics",65.4,61.7,7.3,false],["Quiz — Class Techniques",58.9,58.4,0.8,true],["Handling Confusion",51.2,46.8,8.6,false],["Demo Close & Recap",44.7,40.3,9.8,false],["Full Mock Demo Class",36.2,26.9,28.5,false]],
  c7:[["Problem Reading Techniques",91.2,88.4,3.1,false],["Breaking Down Word Problems",85.6,82.1,4.1,false],["Drawing & Visualization",79.8,76.3,4.4,false],["Multiple Solution Paths",73.4,69.8,4.9,false],["Quiz — Problem Strategies",68.9,68.4,0.7,true],["Practice & Review Set",61.2,45.1,9.8,false]],
  c8:[["What is Money?",94.1,91.8,2.4,false],["Needs vs Wants",89.5,86.2,3.7,false],["Saving & Goal Setting",83.7,80.4,3.9,false],["Budgeting Basics",78.2,74.6,4.6,false],["Quiz & Reflection",72.4,70.1,2.8,true]],
  c9:[["Why Invest?",67.2,63.8,5.1,false],["How Banks Work",59.4,55.2,7.1,false],["Stocks & Mutual Funds",51.8,47.3,8.7,false],["Compound Interest",44.2,40.6,8.1,false],["Business Idea Canvas",36.7,32.4,11.7,false],["Pitching Your Idea",28.4,24.8,14.2,false],["Final Project",18.9,18.9,6.0,false]],
  c10:[["What is a Robot?",81.5,77.8,4.5,false],["Sensors & Actuators",74.2,70.1,5.5,false],["Basic Control Systems",66.8,62.4,6.6,false],["Build Session 1",59.5,55.2,18.4,false],["Quiz — Robotics Basics",53.4,52.8,1.1,true],["Autonomous Motion",45.8,41.3,9.8,false],["Line Following & Sensing",38.2,34.6,11.2,false],["Final Build Challenge",28.7,22.8,32.0,false]],
  c11:[["Arduino IDE Setup",67.2,62.8,6.5,false],["Digital I/O Basics",60.4,56.1,7.1,false],["Analog Signals",53.7,49.4,8.0,false],["LED & Button Control",47.8,43.6,8.8,false],["Quiz — Electronics Basics",42.2,41.8,0.9,true],["Temperature & Light Sensors",36.4,32.7,10.2,false],["Serial Communication",30.8,27.4,11.0,false],["Motor Control",25.1,21.8,14.4,false],["Ultrasonic Distance",19.6,16.4,12.3,false],["Multi-sensor Project",14.2,11.8,18.6,false],["Final Circuit Build",8.7,8.7,6.0,false]],
  c12:[["Competition Rules & Scoring",90.6,87.4,3.5,false],["Robot Design Strategy",83.2,79.5,4.4,false],["Autonomous Programming",76.4,72.8,14.2,false],["Driver Control Optimization",68.9,65.3,8.5,false],["Practice Runs & Timing",61.5,57.8,22.0,false],["Mock Competition Day",52.3,47.9,38.0,false]],
  c13:[],
};
const SHEETS = [{tab:"Teachers",writable:true},{tab:"Module_Progress",writable:false},{tab:"Assignments",writable:true}];
const SHEET_FILE = "TrainOS_Data";
const LAST_PULL  = "Today, 10:42 AM";
const NAV = [{id:"dashboard",label:"Dashboard",g:"◆"},{id:"courses",label:"Courses",g:"▣"},{id:"analytics",label:"Analytics",g:"▲"},{id:"teachers",label:"Teachers",g:"●"}];

const initials = n => n.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const AV_PAL = ["#F97316","#60A5FA","#34D399","#F472B6","#A78BFA","#FBBF24"];
const avC = n => AV_PAL[n.charCodeAt(0)%AV_PAL.length];
const fmtD = d => { try{return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});}catch{return d;}};
const fmtS = d => { try{return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"});}catch{return d;}};
const bLbl = id => BATCHES.find(b=>b.id===id)?.name??id;
const dLeft = d => Math.ceil((new Date(d)-new Date())/86400000);
const hColor = (pct,status,deadline) => {
  if (status==="Completed")          return C.green;
  if (new Date(deadline)<new Date()) return C.red;
  if (pct===0)                       return C.text3;
  if (pct<30)                        return C.amber;
  return C.brand;
};

function Av({name,size=30}) {
  const c=avC(name);
  return <div style={{width:size,height:size,borderRadius:6,background:c+"20",border:`1px solid ${c}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.33,fontWeight:700,color:c,flexShrink:0,fontFamily:F.mono}}>{initials(name)}</div>;
}
function Tag({label,color=C.text3,dot=false}) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 7px 2px 6px",borderRadius:4,border:`1px solid ${color}40`,background:color+"12",fontSize:9,fontFamily:F.mono,fontWeight:700,color,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{dot&&<span style={{width:4,height:4,borderRadius:"50%",background:color,flexShrink:0}}/>}{label}</span>;
}
function StatusTag({status}) {
  const color=status==="In Progress"?C.brand:status==="Completed"?C.green:C.text3;
  return <Tag label={status} color={color} dot/>;
}
function PBar({pct,h=3,color}) {
  const c=color||(pct>0?C.brand:C.border2);
  return <div style={{flex:1,height:h,borderRadius:h,background:C.border2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:c,borderRadius:h,transition:"width .4s"}}/></div>;
}
function Kpi({label,value,sub,accent=C.text2,onClick}) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...card,padding:"18px 20px",cursor:onClick?"pointer":"default",borderTop:`2px solid ${accent}`,background:hov&&onClick?C.surf2:C.surface,transition:"background .15s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:9,fontFamily:F.mono,letterSpacing:".1em",textTransform:"uppercase",color:C.text3,fontWeight:700}}>{label}</span>
        {onClick&&<span style={{fontSize:9,fontFamily:F.mono,color:hov?accent:C.text3,transition:"color .15s",letterSpacing:".08em"}}>VIEW →</span>}
      </div>
      <div style={{fontSize:30,fontFamily:F.mono,fontWeight:700,color:accent,lineHeight:1,letterSpacing:"-.04em"}}>{value}</div>
      {sub&&<div style={{fontSize:10,fontFamily:F.body,color:C.text3,marginTop:6}}>{sub}</div>}
    </div>
  );
}
function SectionHeader({title,sub,action}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div>
        <h2 style={{margin:0,fontSize:20,fontFamily:F.display,fontWeight:800,color:C.text,letterSpacing:".02em",textTransform:"uppercase"}}>{title}</h2>
        {sub&&<p style={{margin:"4px 0 0",fontSize:10,fontFamily:F.mono,color:C.text3,letterSpacing:".04em"}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function EmptyState({icon,title,sub}) {
  return (
    <div style={{padding:"48px 24px",textAlign:"center",borderTop:`1px solid ${C.border}`}}>
      <div style={{fontSize:28,marginBottom:10,opacity:.4}}>{icon}</div>
      <div style={{fontSize:11,fontFamily:F.display,fontWeight:800,color:C.text2,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>{title}</div>
      <div style={{fontSize:11,fontFamily:F.body,color:C.text3}}>{sub}</div>
    </div>
  );
}
function Toast({toast}) {
  if(!toast) return null;
  const color=toast.type==="error"?C.red:toast.type==="warn"?C.amber:C.green;
  return <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,background:C.surf3,border:`1px solid ${color}44`,borderRadius:8,padding:"9px 18px",fontSize:11,fontFamily:F.mono,fontWeight:600,color,whiteSpace:"nowrap",pointerEvents:"none",letterSpacing:".04em"}}>{toast.msg}</div>;
}

function SyncBar({syncStatus,lastSynced,pendingT,pendingA,onPull,onPush}) {
  const pending=pendingT+pendingA, busy=syncStatus==="pulling"||syncStatus==="pushing", done=syncStatus==="done";
  const parts=[...(pendingT>0?[`${pendingT} teacher${pendingT>1?"s":""}`]:[]),...(pendingA>0?[`${pendingA} assignment${pendingA>1?"s":""}`]:[])];
  return (
    <div style={{...card,display:"flex",alignItems:"center",gap:12,padding:"9px 14px",marginBottom:22,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:done?C.green:pending>0?C.brand:C.text3,flexShrink:0}}/>
        <span style={{fontFamily:F.mono,fontSize:11,fontWeight:600,color:C.text2}}>{SHEET_FILE}.xlsx</span>
        <span style={{fontFamily:F.mono,fontSize:10,color:C.text3}}>
          {busy?<span style={{color:C.brand}}>{syncStatus==="pulling"?"syncing…":"pushing…"}</span>:done?<span style={{color:C.green}}>synced just now</span>:`last pull ${lastSynced}`}
        </span>
        <div style={{display:"flex",gap:5,marginLeft:6}}>
          {SHEETS.map((s,i)=><span key={i} style={{fontFamily:F.mono,fontSize:9,color:C.text3,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.border2}`,background:C.surf2,letterSpacing:".04em"}}>{s.tab}{!s.writable?" ·R":""}</span>)}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {pending>0&&<div style={{fontFamily:F.mono,fontSize:9,color:C.brand,padding:"3px 9px",letterSpacing:".04em",borderRadius:4,border:`1px solid ${C.brand}44`,background:C.brandLo,display:"flex",flexDirection:"column",gap:1}}><span style={{fontWeight:700}}>{pending} pending</span>{parts.length>0&&<span style={{opacity:.7}}>{parts.join(" · ")}</span>}</div>}
        <button onClick={onPull} disabled={busy} style={{...mkBtn("secondary"),fontSize:11,padding:"5px 11px",opacity:busy?.45:1,cursor:busy?"not-allowed":"pointer"}}>↓ Pull</button>
        <button onClick={onPush} disabled={busy||pending===0} style={{...(pending>0&&!busy?mkBtn("primary"):mkBtn("secondary")),fontSize:11,padding:"5px 11px",opacity:(busy||pending===0)?.45:1,cursor:(busy||pending===0)?"not-allowed":"pointer"}}>↑ Push {pending>0?`(${pending})`:""}</button>
      </div>
    </div>
  );
}

function Modal({title,sub,onClose,children,footer,width=520}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}}>
      <div style={{...card,width,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",border:`1px solid ${C.border2}`}}>
        <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"sticky",top:0,background:C.surface,zIndex:1}}>
          <div>
            <div style={{fontSize:13,fontFamily:F.display,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:".05em"}}>{title}</div>
            {sub&&<div style={{fontSize:10,fontFamily:F.mono,color:C.text3,marginTop:3}}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{...mkBtn("ghost"),padding:"4px 8px",fontSize:16,lineHeight:1,marginLeft:12}}>×</button>
        </div>
        <div style={{padding:"18px 20px"}}>{children}</div>
        {footer&&<div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,justifyContent:"flex-end",position:"sticky",bottom:0,background:C.surface}}>{footer}</div>}
      </div>
    </div>
  );
}

function AddTeacherModal({onClose,onAdd}) {
  const [form,setForm]=useState({name:"",email:"",phone:"",batchId:"b1",joinDate:new Date().toISOString().split("T")[0]});
  const [err,setErr]=useState({});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const validate=()=>{const e={};if(!form.name.trim())e.name="Required";if(!form.email.trim())e.email="Required";else if(!/\S+@\S+\.\S+/.test(form.email))e.email="Invalid email";setErr(e);return!Object.keys(e).length;};
  const Lbl=({k,label,type="text",ph=""})=>(
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:5}}>{label}</label>
      <input type={type} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{...field,borderColor:err[k]?C.red:C.border2}}/>
      {err[k]&&<div style={{fontSize:10,color:C.red,marginTop:3,fontFamily:F.mono}}>{err[k]}</div>}
    </div>
  );
  return (
    <Modal title="Add Teacher" sub="Added immediately to roster" onClose={onClose}
      footer={<><button onClick={onClose} style={mkBtn("secondary")}>Cancel</button><button onClick={()=>{if(validate())onAdd(form);}} style={mkBtn("primary")}>Add Teacher</button></>}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
        <div style={{gridColumn:"span 2"}}><Lbl k="name" label="Full Name *" ph="Priya Sharma"/></div>
        <Lbl k="email" label="Email *" type="email" ph="priya@gmail.com"/>
        <Lbl k="phone" label="Phone" ph="+91 98765 43210"/>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:5}}>Batch</label>
          <select value={form.batchId} onChange={e=>set("batchId",e.target.value)} style={{...field,cursor:"pointer"}}>
            {BATCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:5}}>Join Date</label>
          <input type="date" value={form.joinDate} onChange={e=>set("joinDate",e.target.value)} style={field}/>
        </div>
      </div>
    </Modal>
  );
}

function AssignModal({teachers,preCourseId,preTeacherId,onClose,onAssign}) {
  const [step,setStep]=useState(preCourseId?2:1);
  const [cid,setCid]=useState(preCourseId||"c1");
  const [tids,setTids]=useState(preTeacherId?[preTeacherId]:[]);
  const [dl,setDl]=useState("2026-04-30");
  const [ts,setTs]=useState("");
  const toggleT=id=>setTids(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const filt=teachers.filter(t=>!ts||t.name.toLowerCase().includes(ts.toLowerCase())||t.email.toLowerCase().includes(ts.toLowerCase()));
  const allIn=filt.length>0&&filt.every(t=>tids.includes(t.id));
  const selC=COURSES.find(c=>c.id===cid);
  const steps=["Select Course","Select Teachers","Confirm"];
  return (
    <Modal title="Assign Course" sub={`Step ${step}/3 — ${steps[step-1]}`} onClose={onClose} width={560}
      footer={<>{step>1&&<button onClick={()=>setStep(s=>s-1)} style={mkBtn("secondary")}>← Back</button>}{step<3&&<button onClick={()=>setStep(s=>s+1)} disabled={step===2&&tids.length===0} style={{...mkBtn("primary"),opacity:step===2&&tids.length===0?.4:1}}>Continue →</button>}{step===3&&<button onClick={()=>{onAssign(cid,tids,dl);onClose();}} style={mkBtn("primary")}>Confirm Assignment</button>}</>}>
      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:400,overflowY:"auto"}}>
          {Object.entries(CATEGORIES).map(([catId,cat])=>{
            const courses=COURSES.filter(c=>c.cat===catId&&c.status==="active");
            return (<div key={catId}>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:9,fontFamily:F.mono,fontWeight:700,color:cat.color,letterSpacing:".1em",textTransform:"uppercase",padding:"8px 4px 4px"}}><span style={{width:3,height:8,borderRadius:1,background:cat.color,display:"block"}}/>{cat.label}</div>
              {courses.map(c=>(
                <div key={c.id} onClick={()=>setCid(c.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:7,cursor:"pointer",background:cid===c.id?cat.color+"12":"transparent",border:`1px solid ${cid===c.id?cat.color+"44":C.border}`,marginBottom:3,transition:"all .1s",borderLeft:cid===c.id?`3px solid ${cat.color}`:"3px solid transparent"}}>
                  <span style={{fontSize:15,flexShrink:0}}>{c.icon}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontFamily:F.body,fontWeight:600,color:C.text}}>{c.name}</div><div style={{fontSize:9,fontFamily:F.mono,color:C.text3,marginTop:2}}>{c.modules} modules · {c.enrolled.toLocaleString()} enrolled</div></div>
                  {cid===c.id&&<span style={{color:cat.color,fontSize:12,fontFamily:F.mono}}>✓</span>}
                </div>
              ))}
            </div>);
          })}
        </div>
      )}
      {step===2&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={ts} onChange={e=>setTs(e.target.value)} placeholder="Search teachers…" style={{...field,flex:1}}/>
            <button onClick={()=>setTids(allIn?tids.filter(x=>!filt.map(t=>t.id).includes(x)):[...new Set([...tids,...filt.map(t=>t.id)])])} style={{...mkBtn("secondary"),flexShrink:0,padding:"7px 13px",fontSize:11}}>{allIn?"Deselect all":"Select all"}</button>
          </div>
          <div style={{border:`1px solid ${C.border}`,borderRadius:8,maxHeight:320,overflowY:"auto"}}>
            {filt.length===0&&<div style={{padding:24,textAlign:"center",fontSize:11,color:C.text3,fontFamily:F.mono}}>No teachers found</div>}
            {filt.map((t,i)=>{const sel=tids.includes(t.id);return(
              <div key={t.id} onClick={()=>toggleT(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",cursor:"pointer",background:sel?C.brandLo:"transparent",borderBottom:i<filt.length-1?`1px solid ${C.border}`:"none",borderLeft:`3px solid ${sel?C.brand:"transparent"}`,transition:"all .1s"}}>
                <div style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${sel?C.brand:C.border2}`,background:sel?C.brand:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel&&<span style={{color:"#000",fontSize:9,fontWeight:800}}>✓</span>}</div>
                <Av name={t.name} size={26}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontFamily:F.body,fontWeight:600,color:C.text}}>{t.name}</div><div style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{bLbl(t.batchId)}</div></div>
                <StatusTag status={t.status}/>
              </div>
            );})}
          </div>
          {tids.length>0&&<div style={{marginTop:8,fontSize:10,fontFamily:F.mono,color:C.brand,fontWeight:700}}>{tids.length} selected</div>}
        </div>
      )}
      {step===3&&(
        <div>
          <div style={{background:C.surf2,borderRadius:8,padding:"14px 16px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:18}}>{selC?.icon}</span><div><div style={{fontSize:12,fontFamily:F.body,fontWeight:600,color:C.text}}>{selC?.name}</div><div style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{selC?.modules} modules</div></div></div>
            <div style={{fontSize:9,fontFamily:F.mono,color:C.text3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Assigned to</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
              {tids.slice(0,6).map(tid=>{const t=teachers.find(x=>x.id===tid);return t?<div key={tid} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:5,border:`1px solid ${C.border2}`,background:C.surf3}}><Av name={t.name} size={14}/><span style={{fontSize:10,fontFamily:F.body,color:C.text2}}>{t.name}</span></div>:null;})}
              {tids.length>6&&<div style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${C.border2}`,fontSize:10,color:C.text3,fontFamily:F.mono}}>+{tids.length-6} more</div>}
            </div>
            <div><label style={{display:"block",fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:5}}>Deadline</label><input type="date" value={dl} onChange={e=>setDl(e.target.value)} style={field}/></div>
          </div>
          <div style={{padding:"10px 12px",background:C.brandLo,borderRadius:7,borderLeft:`3px solid ${C.brand}`,fontSize:10,fontFamily:F.mono,color:C.brand}}>{tids.length} teacher{tids.length!==1?"s":""} will receive an email notification.</div>
        </div>
      )}
    </Modal>
  );
}

function Dashboard({teachers,assignments,onFilterTeachers}) {
  const inTraining=new Set(assignments.filter(a=>a.status==="In Progress").map(a=>a.teacherId)).size;
  const notStarted=assignments.filter(a=>a.status==="Not Started").length;
  const overdue=assignments.filter(a=>a.status!=="Completed"&&new Date(a.deadline)<new Date()).length;
  const activeCourses=COURSES.filter(c=>c.status==="active").length;
  const draftCourses=COURSES.filter(c=>c.status==="draft").length;
  const totalEnrolled=COURSES.filter(c=>c.status==="active").reduce((s,c)=>s+c.enrolled,0);
  const catSummary=Object.entries(CATEGORIES).map(([catId,cat])=>{
    const courses=COURSES.filter(c=>c.cat===catId&&c.status==="active");
    const enrolled=courses.reduce((s,c)=>s+c.enrolled,0);
    const avgComp=courses.length?+(courses.reduce((s,c)=>s+c.avg,0)/courses.length).toFixed(1):0;
    return{...cat,catId,count:courses.length,enrolled,avgComp};
  });
  return (
    <div>
      <SectionHeader title="Dashboard" sub={new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <Kpi label="Active Courses" value={activeCourses} sub={`${draftCourses} draft · 4 subjects`} accent={C.text2}/>
        <Kpi label="In Training" value={inTraining} sub="at least 1 module started" accent={C.brand} onClick={()=>onFilterTeachers({status:"In Progress",course:"all"})}/>
        <Kpi label="Not Started" value={notStarted} sub="need a nudge" accent={C.text3} onClick={()=>onFilterTeachers({status:"Not Started",course:"all"})}/>
        <Kpi label="Overdue" value={overdue} sub="past their deadline" accent={C.red} onClick={()=>onFilterTeachers({status:"overdue",course:"all"})}/>
      </div>
      <div style={{...card,padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:10,fontFamily:F.display,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:".08em"}}>By Subject</span>
          <span style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{totalEnrolled.toLocaleString()} total enrolled</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {catSummary.map(cat=>(
            <div key={cat.catId} style={{padding:"14px 15px",borderRadius:8,background:`${cat.color}08`,border:`1px solid ${cat.color}20`,borderLeft:`3px solid ${cat.color}`}}>
              <div style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:cat.color,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{cat.label} · {cat.count}</div>
              <div style={{fontSize:26,fontFamily:F.mono,fontWeight:700,color:cat.color,lineHeight:1,marginBottom:3}}>{cat.avgComp}%</div>
              <div style={{fontSize:9,fontFamily:F.mono,color:C.text3,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em"}}>avg completion</div>
              <div style={{height:2,borderRadius:2,background:C.border2,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:`${cat.avgComp}%`,background:cat.color,borderRadius:2}}/></div>
              <div style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{cat.enrolled.toLocaleString()} enrolled</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Courses({setTab,setAssignOpen}) {
  const [catFilter,setCat]=useState("all");
  const activeCats=[...new Set(COURSES.filter(c=>c.status==="active").map(c=>c.cat))];
  const visibleCats=catFilter==="all"?activeCats:[catFilter];
  return (
    <div>
      <SectionHeader title="Courses" sub="12 active · 4 subjects · 13,452 enrolled" action={<button style={mkBtn("primary")}>+ New Course</button>}/>
      <div style={{display:"flex",gap:5,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setCat("all")} style={pill(catFilter==="all",C.text2)}>All</button>
        {Object.entries(CATEGORIES).map(([id,cat])=>(
          <button key={id} onClick={()=>setCat(id)} style={pill(catFilter===id,cat.color)}>{cat.label} · {COURSES.filter(c=>c.cat===id&&c.status==="active").length}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:24}}>
        {visibleCats.map(catId=>{
          const cat=CATEGORIES[catId],courses=COURSES.filter(c=>c.cat===catId);
          return (
            <div key={catId}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{width:3,height:14,borderRadius:1,background:cat.color,display:"block",flexShrink:0}}/>
                <span style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:cat.color,letterSpacing:".1em",textTransform:"uppercase"}}>{cat.label}</span>
                <div style={{height:1,flex:1,background:C.border}}/>
                <span style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{courses.filter(c=>c.status==="active").length} courses · {courses.filter(c=>c.status==="active").reduce((s,c)=>s+c.enrolled,0).toLocaleString()} enrolled</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {courses.map(c=>(
                  <div key={c.id} style={{...card,borderLeft:`3px solid ${c.status==="draft"?C.text3:cat.color}`,opacity:c.status==="draft"?.55:1,display:"flex",flexDirection:"column"}}>
                    {c.status==="draft"&&<div style={{padding:"4px 12px",borderBottom:`1px solid ${C.border}`,background:C.surf2}}><Tag label="Draft" color={C.text3}/></div>}
                    <div style={{padding:"14px 16px",flex:1}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:12}}>
                        <div style={{width:36,height:36,borderRadius:7,background:cat.color+"18",border:`1px solid ${cat.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{c.icon}</div>
                        <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontFamily:F.body,fontWeight:600,color:C.text,lineHeight:1.3}}>{c.name}</div><div style={{fontSize:10,fontFamily:F.body,color:C.text3,marginTop:3}}>{c.desc}</div></div>
                      </div>
                      <div style={{display:"flex",gap:7,marginBottom:12}}>
                        {[["Modules",c.modules],["Enrolled",c.enrolled.toLocaleString()]].map(([l,v])=>(
                          <div key={l} style={{flex:1,padding:"7px 9px",background:C.surf2,borderRadius:6,border:`1px solid ${C.border}`}}>
                            <div style={{fontSize:8,fontFamily:F.mono,color:C.text3,letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>{l}</div>
                            <div style={{fontSize:15,fontFamily:F.mono,fontWeight:700,color:C.text}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {c.status==="active"&&(
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                            <span style={{fontSize:8,fontFamily:F.mono,color:C.text3,letterSpacing:".08em",textTransform:"uppercase"}}>Avg Completion</span>
                            <span style={{fontSize:10,fontFamily:F.mono,fontWeight:700,color:cat.color}}>{c.avg}%</span>
                          </div>
                          <div style={{height:2,borderRadius:2,background:C.border2}}><div style={{height:"100%",width:`${c.avg}%`,background:cat.color,borderRadius:2}}/></div>
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:7,padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:C.surf2}}>
                      <button onClick={()=>setAssignOpen(c.id)} style={{...(c.status==="draft"?mkBtn("secondary"):mkBtn("primary")),flex:1,justifyContent:"center",padding:"6px 12px",fontSize:11}}>{c.status==="draft"?"Publish & Assign":"Assign Teachers"}</button>
                      <button onClick={()=>setTab("analytics")} style={{...mkBtn("secondary"),padding:"6px 12px",fontSize:11}}>Analytics</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Teachers({teachers,assignments,setAssignOpen,onAddTeacher,onUpdateDeadline,initialFilter}) {
  const [view,setView]=useState("assignments");
  const [search,setSearch]=useState("");
  const [cFilter,setCFilter]=useState(initialFilter?.course||"all");
  const [sFilter,setSFilter]=useState(initialFilter?.status||"all");
  const [sort,setSort]=useState({col:"deadline",dir:"asc"});
  const [profile,setProfile]=useState(null);
  const [sel,setSel]=useState(new Set());
  const [editDL,setEditDL]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [toast,setToast]=useState(null);
  const toastRef=useRef(null);

  useEffect(()=>{if(initialFilter){setCFilter(initialFilter.course||"all");setSFilter(initialFilter.status||"all");setView("assignments");}},[initialFilter]);

  const showToast=(msg,type="success")=>{clearTimeout(toastRef.current);setToast({msg,type});toastRef.current=setTimeout(()=>setToast(null),2600);};

  const allRows=useMemo(()=>assignments.map(a=>{const t=teachers.find(x=>x.id===a.teacherId),c=COURSES.find(x=>x.id===a.courseId);return(t&&c)?{...a,teacher:t,course:c}:null;}).filter(Boolean),[assignments,teachers]);

  const filteredRows=useMemo(()=>allRows.filter(r=>{
    if(cFilter!=="all"&&r.courseId!==cFilter) return false;
    const late=new Date(r.deadline)<new Date()&&r.status!=="Completed";
    if(sFilter==="overdue"&&!late) return false;
    if(sFilter!=="all"&&sFilter!=="overdue"&&r.status!==sFilter) return false;
    if(search&&!r.teacher.name.toLowerCase().includes(search.toLowerCase())&&!r.teacher.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }),[allRows,cFilter,sFilter,search]);

  const rows=useMemo(()=>{
    const s=[...filteredRows];const{col,dir}=sort;
    s.sort((a,b)=>{let va,vb;if(col==="teacher"){va=a.teacher.name;vb=b.teacher.name;}if(col==="deadline"){va=new Date(a.deadline);vb=new Date(b.deadline);}if(col==="progress"){va=a.pct;vb=b.pct;}if(col==="status"){va=a.status;vb=b.status;}return va<vb?(dir==="asc"?-1:1):va>vb?(dir==="asc"?1:-1):0;});
    return s;
  },[filteredRows,sort]);

  const tSort=col=>setSort(s=>s.col===col?{col,dir:s.dir==="asc"?"desc":"asc"}:{col,dir:"asc"});
  const SortH=({col:c,label})=>{const active=sort.col===c;return(<div onClick={()=>tSort(c)} style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:active?C.brand:C.text3,textTransform:"uppercase",letterSpacing:".08em",cursor:"pointer",display:"flex",alignItems:"center",gap:3,userSelect:"none"}}>{label}<span style={{opacity:active?1:.2}}>{active&&sort.dir==="desc"?"↓":"↑"}</span></div>);};

  const overdueN=allRows.filter(r=>r.status!=="Completed"&&new Date(r.deadline)<new Date()).length;
  const notStartN=allRows.filter(r=>r.status==="Not Started").length;
  const allIds=rows.map(r=>r.id);
  const allSel=allIds.length>0&&allIds.every(id=>sel.has(id));
  const toggleAll=()=>setSel(s=>allSel?new Set():new Set(allIds));
  const toggleOne=id=>setSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const selRows=rows.filter(r=>sel.has(r.id));

  const doRemind=rs=>{const names=rs.slice(0,2).map(r=>r.teacher.name.split(" ")[0]).join(", ");showToast(`✉ Reminder sent to ${names}${rs.length>2?` +${rs.length-2} more`:""}`);setSel(new Set());};
  const saveDL=id=>{if(editVal){onUpdateDeadline(id,editVal);showToast("Deadline updated");}setEditDL(null);setEditVal("");};

  if(profile!==null){
    const t=teachers.find(x=>x.id===profile);
    if(!t){setProfile(null);return null;}
    const ta=assignments.filter(a=>a.teacherId===t.id);
    return (
      <div>
        <button onClick={()=>setProfile(null)} style={{...mkBtn("ghost"),fontSize:11,marginBottom:18,color:C.brand,fontFamily:F.mono,padding:0}}>← Back</button>
        <div style={{...card,padding:"18px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:14,borderLeft:`3px solid ${avC(t.name)}`}}>
          <Av name={t.name} size={48}/>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontFamily:F.display,fontWeight:800,color:C.text,textTransform:"uppercase"}}>{t.name}</div>
            <div style={{fontSize:10,fontFamily:F.mono,color:C.text3,marginTop:3}}>{t.email} · {t.phone}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:7}}><StatusTag status={t.status}/><span style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>Joined {fmtD(t.joinDate)} · {bLbl(t.batchId)}</span></div>
          </div>
          <button onClick={()=>setAssignOpen(null,t.id)} style={mkBtn("primary")}>+ Assign Course</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
          <Kpi label="Assigned" value={ta.length} accent={C.text2}/>
          <Kpi label="Avg Compl." value={ta.length>0?`${Math.round(ta.reduce((s,a)=>s+a.pct,0)/ta.length)}%`:"—"} accent={C.brand}/>
          <Kpi label="Completed" value={ta.filter(a=>a.status==="Completed").length} accent={C.green}/>
        </div>
        <div style={{...card,overflow:"hidden"}}>
          <div style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,fontSize:9,fontFamily:F.display,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:".08em"}}>Assigned Courses ({ta.length})</div>
          {ta.length===0&&<EmptyState icon="📚" title="No Courses Assigned" sub="Use Assign Course to get started."/>}
          {ta.map(a=>{
            const c=COURSES.find(x=>x.id===a.courseId),cat=c?CATEGORIES[c.cat]:null;if(!c||!cat)return null;
            const late=new Date(a.deadline)<new Date()&&a.status!=="Completed",hc=hColor(a.pct,a.status,a.deadline);
            return(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${hc}`}}>
                <div style={{width:34,height:34,borderRadius:7,background:cat.lo,border:`1px solid ${cat.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontFamily:F.body,fontWeight:600,color:C.text}}>{c.name}</div>
                  <div style={{fontSize:9,fontFamily:F.mono,color:C.text3,marginTop:2}}>Due {fmtD(a.deadline)}{late?" · ⚠ overdue":""}</div>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginTop:7}}><div style={{width:130}}><PBar pct={a.pct} color={hc}/></div><span style={{fontSize:10,fontFamily:F.mono,fontWeight:700,color:hc}}>{a.pct}%</span><span style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{Math.round(a.pct/100*c.modules)}/{c.modules} mods</span></div>
                </div>
                <StatusTag status={a.status}/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const RosterView=()=>{
    const assignedIds=new Set(assignments.map(a=>a.teacherId));
    const COLS="2fr 1fr 1fr 1fr 90px";
    return(
      <div style={{...card,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:COLS,padding:"9px 16px",borderBottom:`1px solid ${C.border}`,background:C.surf2}}>
          {["Teacher","Batch","Joined","Assignments","Status"].map(h=><div key={h} style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:".08em"}}>{h}</div>)}
        </div>
        {teachers.filter(t=>!search||t.name.toLowerCase().includes(search.toLowerCase())||t.email.toLowerCase().includes(search.toLowerCase())).map((t,i,arr)=>{
          const assigned=assignments.filter(a=>a.teacherId===t.id).length,unassigned=!assignedIds.has(t.id);
          return(
            <div key={t.id} onClick={()=>setProfile(t.id)} style={{display:"grid",gridTemplateColumns:COLS,padding:"10px 16px",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",alignItems:"center",cursor:"pointer",borderLeft:`3px solid ${unassigned?C.amber:"transparent"}`,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.surf2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}><Av name={t.name} size={26}/><div style={{minWidth:0}}><div style={{fontSize:11,fontFamily:F.body,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div><div style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{t.email}</div></div></div>
              <div style={{fontSize:10,fontFamily:F.mono,color:C.text2}}>{bLbl(t.batchId)}</div>
              <div style={{fontSize:10,fontFamily:F.mono,color:C.text3}}>{fmtS(t.joinDate)}</div>
              <div style={{fontSize:10,fontFamily:F.mono,color:assigned>0?C.text2:C.amber,fontWeight:unassigned?700:400}}>{assigned>0?`${assigned} course${assigned>1?"s":""}`:unassigned?"Unassigned":"—"}</div>
              <StatusTag status={t.status}/>
            </div>
          );
        })}
      </div>
    );
  };

  const COLS="26px 2fr 1.5fr 0.9fr 0.9fr 1.1fr 100px 75px";
  return(
    <div>
      <Toast toast={toast}/>
      <SectionHeader title="Teachers" sub={`${teachers.length} teachers · ${allRows.length} assignments · ${notStartN} not started · ${overdueN} overdue`}
        action={<div style={{display:"flex",gap:7}}><button onClick={()=>setAssignOpen(null)} style={mkBtn("secondary")}>Assign Course</button><button onClick={onAddTeacher} style={mkBtn("primary")}>+ Add Teacher</button></div>}/>
      <div style={{display:"flex",gap:0,marginBottom:14,borderBottom:`1px solid ${C.border}`}}>
        {[["assignments","Assignments",allRows.length],["roster","All Teachers",teachers.length]].map(([id,label,count])=>(
          <button key={id} onClick={()=>setView(id)} style={{padding:"7px 14px",background:"transparent",border:"none",cursor:"pointer",fontFamily:F.mono,fontSize:11,fontWeight:600,letterSpacing:".04em",color:view===id?C.text:C.text3,borderBottom:`2px solid ${view===id?C.brand:"transparent"}`,marginBottom:-1,transition:"color .12s"}}>{label} <span style={{opacity:.5}}>{count}</span></button>
        ))}
      </div>
      <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email…" style={{...field,width:190,flexShrink:0}}/>
        {view==="assignments"&&<>
          <select value={cFilter} onChange={e=>setCFilter(e.target.value)} style={{...field,width:"auto",cursor:"pointer",flexShrink:0}}>
            <option value="all">All Courses</option>
            {COURSES.filter(c=>c.status==="active").map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <div style={{display:"flex",gap:4}}>
            {[["all","All"],["In Progress","In Progress"],["Not Started","Not Started"],["overdue","Overdue"],["Completed","Completed"]].map(([val,label])=>{
              const dc=val==="In Progress"?C.brand:val==="Completed"?C.green:val==="overdue"?C.red:val==="Not Started"?C.text3:"transparent";
              return<button key={val} onClick={()=>setSFilter(val)} style={pill(sFilter===val,dc)}>{label}</button>;
            })}
          </div>
        </>}
        <span style={{fontSize:9,fontFamily:F.mono,color:C.text3,marginLeft:"auto"}}>{view==="assignments"?`${rows.length} result${rows.length!==1?"s":""}`:""}</span>
        {sel.size>0&&<div style={{width:"100%",display:"flex",alignItems:"center",gap:7,paddingTop:10,marginTop:2,borderTop:`1px solid ${C.border}`}}><span style={{fontSize:10,fontFamily:F.mono,color:C.text2,fontWeight:700}}>{sel.size} selected</span><button onClick={()=>doRemind(selRows)} style={{...mkBtn("warn"),fontSize:10,padding:"4px 12px"}}>✉ Send Reminder ({sel.size})</button><button onClick={()=>setSel(new Set())} style={{...mkBtn("ghost"),fontSize:10,padding:"4px 9px"}}>Clear</button></div>}
      </div>
      {view==="roster"&&<RosterView/>}
      {view==="assignments"&&(
        <div style={{...card,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:COLS,padding:"9px 16px",background:C.surf2,borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
            <div onClick={toggleAll} style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${allSel?C.brand:C.border2}`,background:allSel?C.brand:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{allSel&&<span style={{color:"#000",fontSize:8,fontWeight:900}}>✓</span>}</div>
            <SortH col="teacher" label="Teacher"/>
            <div style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:".08em"}}>Course</div>
            <SortH col="deadline" label="Days Left"/>
            <SortH col="progress" label="Progress"/>
            <div style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:".08em"}}>Deadline</div>
            <SortH col="status" label="Status"/>
            <div style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:".08em"}}>Action</div>
          </div>
          {rows.length===0&&<EmptyState icon="◈" title="No Results" sub="Adjust the course or status filter."/>}
          {rows.map(r=>{
            const late=new Date(r.deadline)<new Date()&&r.status!=="Completed",dl=dLeft(r.deadline),hc=hColor(r.pct,r.status,r.deadline),isSel=sel.has(r.id),editingThis=editDL===r.id;
            const rowBorder=late?C.red:r.status==="Completed"?C.green:r.status==="Not Started"?C.text3:C.brand;
            return(
              <div key={r.id} style={{display:"grid",gridTemplateColumns:COLS,padding:"10px 16px",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${rowBorder}`,background:isSel?C.brandLo:r._pending?C.surf2:"transparent",alignItems:"center",transition:"background .1s"}} onMouseEnter={e=>{if(!isSel&&!r._pending)e.currentTarget.style.background=C.surf2;}} onMouseLeave={e=>{e.currentTarget.style.background=isSel?C.brandLo:r._pending?C.surf2:"transparent";}}>
                <div onClick={e=>{e.stopPropagation();toggleOne(r.id);}} style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${isSel?C.brand:C.border2}`,background:isSel?C.brand:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<span style={{color:"#000",fontSize:8,fontWeight:900}}>✓</span>}</div>
                <div onClick={()=>setProfile(r.teacher.id)} style={{display:"flex",alignItems:"center",gap:7,minWidth:0,cursor:"pointer"}}>
                  {r._pending&&<div style={{width:4,height:4,borderRadius:"50%",background:C.brand,flexShrink:0}}/>}
                  <Av name={r.teacher.name} size={24}/><div style={{minWidth:0}}><div style={{fontSize:11,fontFamily:F.body,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.teacher.name}</div><div style={{fontSize:9,fontFamily:F.mono,color:C.text3}}>{bLbl(r.teacher.batchId)}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}><span style={{fontSize:12,flexShrink:0}}>{r.course.icon}</span><span style={{fontSize:10,fontFamily:F.body,color:C.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.course.name}</span></div>
                <div style={{fontFamily:F.mono,fontSize:11,fontWeight:700,color:r.status==="Completed"?C.green:late?C.red:dl<=7?C.amber:C.text3}}>{r.status==="Completed"?"Done":late?`${Math.abs(dl)}d over`:`${dl}d`}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{flex:1}}><PBar pct={r.pct} color={hc}/></div><span style={{fontSize:10,fontFamily:F.mono,fontWeight:700,color:hc,minWidth:30,flexShrink:0}}>{r.pct}%</span></div>
                {editingThis?(
                  <div style={{display:"flex",alignItems:"center",gap:3}} onClick={e=>e.stopPropagation()}><input type="date" value={editVal} onChange={e=>setEditVal(e.target.value)} style={{...field,padding:"3px 6px",fontSize:10,width:105}} autoFocus/><button onClick={()=>saveDL(r.id)} style={{...mkBtn("primary"),padding:"3px 6px",fontSize:10,borderRadius:4}}>✓</button><button onClick={()=>{setEditDL(null);setEditVal("");}} style={{...mkBtn("secondary"),padding:"3px 5px",fontSize:10,borderRadius:4}}>×</button></div>
                ):(
                  <span onClick={e=>{e.stopPropagation();setEditDL(r.id);setEditVal(r.deadline);}} title="Click to edit" style={{fontSize:9,fontFamily:F.mono,color:late?C.red:C.text3,cursor:"pointer",textDecoration:"underline dotted",textUnderlineOffset:3}}>{fmtS(r.deadline)}</span>
                )}
                <StatusTag status={r.status}/>
                <div onClick={e=>e.stopPropagation()}>{(late||r.status==="Not Started")?<button onClick={()=>doRemind([r])} style={{...(late?mkBtn("danger"):mkBtn("warn")),padding:"3px 9px",fontSize:10}}>✉ Remind</button>:<span style={{fontSize:9,color:C.text3,fontFamily:F.mono}}>—</span>}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Analytics({teachers,assignments}) {
  const [cid,setCid]=useState("c1");
  const c=COURSES.find(x=>x.id===cid),mods=MODULES[cid]||[];
  const completed=c.completed,compPct=c.enrolled>0?((completed/c.enrolled)*100).toFixed(1):0;
  const onTrack=assignments.filter(a=>a.courseId===cid&&a.status==="In Progress"&&dLeft(a.deadline)>0).length;
  const atRisk=assignments.filter(a=>a.courseId===cid&&a.status!=="Completed"&&dLeft(a.deadline)<=0).length;
  const moduleRows=mods.map(([name,sp,cp,med,isQuiz],i)=>{
    const drop=sp>0?+(sp-cp).toFixed(1):0,dropPct=sp>0?+((drop/sp)*100).toFixed(1):0;
    const health=sp===0?"inactive":dropPct>15?"critical":dropPct>7?"warn":"good";
    return{i,name,sp,cp,med,isQuiz,drop,dropPct,health};
  });
  const critN=moduleRows.filter(m=>m.health==="critical").length;
  const avgDrop=moduleRows.filter(m=>m.sp>0).reduce((s,m)=>s+m.dropPct,0)/(moduleRows.filter(m=>m.sp>0).length||1);
  const funnelData=moduleRows.map(m=>({name:m.name.length>22?m.name.slice(0,20)+"…":m.name,reached:m.sp,completed:m.cp}));
  const hs=h=>h==="critical"?{color:C.red,label:"Critical"}:h==="warn"?{color:C.amber,label:"Watch"}:h==="good"?{color:C.green,label:"Good"}:{color:C.text3,label:"Inactive"};
  const inProgress=Math.max(0,c.enrolled-completed-(mods[0]?Math.round((1-mods[0][1]/100)*c.enrolled):0));
  return(
    <div>
      <SectionHeader title="Analytics" sub="Module-level insight by course"/>
      <div style={{...card,padding:"11px 14px",marginBottom:16,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:9,fontFamily:F.mono,color:C.text3,letterSpacing:".1em",textTransform:"uppercase",marginRight:4,flexShrink:0}}>Course</span>
        {COURSES.filter(c=>c.status==="active").map(course=>{
          const cat=CATEGORIES[course.cat],active=cid===course.id;
          return<button key={course.id} onClick={()=>setCid(course.id)} style={{display:"flex",alignItems:"center",gap:4,...pill(active,cat.color)}}><span style={{fontSize:11}}>{course.icon}</span>{course.name}</button>;
        })}
      </div>
      {c.status==="draft"?<EmptyState icon="🧠" title="Draft Course" sub="Publish to see analytics."/>:<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          <Kpi label="Enrolled" value={c.enrolled.toLocaleString()} sub={`${inProgress.toLocaleString()} in progress`} accent={C.blue}/>
          <Kpi label="Completion Rate" value={`${compPct}%`} sub={`${completed.toLocaleString()} of ${c.enrolled.toLocaleString()} completed`} accent={C.green}/>
          <Kpi label="At Risk" value={atRisk} sub={`overdue · ${onTrack} on track`} accent={atRisk>0?C.red:C.text3}/>
        </div>
        <div style={{...card,padding:"16px 18px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:10,fontFamily:F.display,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:".08em"}}>Module Funnel</span>
            <div style={{display:"flex",gap:10}}>
              {[[C.blue+"44","Reached"],[C.green+"44","Completed"]].map(([bg,label])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:9,fontFamily:F.mono,color:C.text3}}><div style={{width:10,height:10,borderRadius:2,background:bg,border:`1px solid ${C.border2}`}}/>{label}</div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(160,mods.length*25)}>
            <BarChart data={funnelData} layout="vertical" margin={{left:8,right:16,top:0,bottom:0}} barCategoryGap="30%">
              <XAxis type="number" domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{fontSize:9,fill:C.text3,fontFamily:"monospace"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" width={155} tick={{fontSize:9,fill:C.text2,fontFamily:"sans-serif"}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,n)=>[`${v}%`,n==="reached"?"Reached":"Completed"]} contentStyle={{fontSize:10,borderRadius:8,border:`1px solid ${C.border2}`,background:C.surf3,color:C.text,fontFamily:"monospace"}}/>
              <Bar dataKey="reached" fill={C.blue+"38"} radius={[0,3,3,0]}/>
              <Bar dataKey="completed" fill={C.green+"38"} radius={[0,3,3,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{...card,overflow:"hidden"}}>
          <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:10,fontFamily:F.display,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:".08em"}}>Module Health</span>
            <div style={{display:"flex",gap:10,fontSize:9,fontFamily:F.mono,color:C.text3}}>{critN>0&&<span style={{color:C.red,fontWeight:700}}>{critN} critical</span>}<span>avg drop-off {avgDrop.toFixed(1)}%</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"22px 1.8fr 1fr 1fr 75px 65px 65px",padding:"9px 16px",background:C.surf2,borderBottom:`1px solid ${C.border}`}}>
            {["#","Module","Reached","Completed","Drop-off","Med.","Health"].map(h=><div key={h} style={{fontSize:9,fontFamily:F.mono,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:".08em"}}>{h}</div>)}
          </div>
          {moduleRows.map((m,i)=>{
            const h=hs(m.health);
            return(
              <div key={i} style={{display:"grid",gridTemplateColumns:"22px 1.8fr 1fr 1fr 75px 65px 65px",padding:"10px 16px",borderBottom:`1px solid ${C.border}`,alignItems:"center",background:m.health==="inactive"?C.surf2:"transparent",borderLeft:`3px solid ${h.color}`}}>
                <div style={{width:17,height:17,borderRadius:4,background:m.isQuiz?C.blueLo:C.brandLo,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontFamily:F.mono,fontWeight:700,color:m.isQuiz?C.blue:C.brand}}>{m.isQuiz?"Q":m.i+1}</div>
                <div style={{paddingRight:8}}><div style={{fontSize:11,fontFamily:F.body,fontWeight:600,color:m.health==="inactive"?C.text3:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div><div style={{fontSize:8,fontFamily:F.mono,color:C.text3,marginTop:1}}>{m.isQuiz?"Assessment":"Content"}</div></div>
                <div>{m.sp>0?<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:44}}><PBar pct={m.sp} h={3} color={C.blue}/></div><span style={{fontSize:10,fontFamily:F.mono,fontWeight:700,color:C.blue}}>{m.sp}%</span></div>:<span style={{fontSize:10,color:C.text3}}>—</span>}</div>
                <div>{m.cp>0?<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:44}}><PBar pct={m.cp} h={3} color={C.green}/></div><span style={{fontSize:10,fontFamily:F.mono,fontWeight:700,color:C.green}}>{m.cp}%</span></div>:<span style={{fontSize:10,color:C.text3}}>—</span>}</div>
                <div>{m.sp>0?<span style={{fontSize:10,fontFamily:F.mono,fontWeight:700,color:m.dropPct>15?C.red:m.dropPct>7?C.amber:C.text3}}>{m.dropPct>0?`−${m.dropPct}%`:"—"}</span>:<span style={{fontSize:10,color:C.text3}}>—</span>}</div>
                <div style={{fontSize:10,fontFamily:F.mono,color:m.med>0?C.text2:C.text3}}>{m.med>0?`${m.med}m`:"—"}</div>
                <Tag label={h.label} color={h.color}/>
              </div>
            );
          })}
        </div>
      </>}
    </div>
  );
}

export default function App() {
  const [tab,setTab]=useState("dashboard");
  const [teachers,setTeachers]=useState(INIT_TEACHERS);
  const [assignments,setAssigns]=useState(INIT_ASSIGNMENTS);
  const [assignModal,setAssignModal]=useState(null);
  const [addTeacher,setAddTeacher]=useState(false);
  const [syncStatus,setSyncStatus]=useState("idle");
  const [lastSynced,setLastSynced]=useState(LAST_PULL);
  const [tFilter,setTFilter]=useState(null);

  const pendingT=useMemo(()=>teachers.filter(t=>t._pending).length,[teachers]);
  const pendingA=useMemo(()=>assignments.filter(a=>a._pending).length,[assignments]);

  const openAssign=(cid=null,tid=null)=>setAssignModal({courseId:cid,teacherId:tid});
  const handleFilterTeachers=f=>{setTFilter({...f,_ts:Date.now()});setTab("teachers");};

  const handleAssign=(cid,tids,deadline)=>{
    const today=new Date().toISOString().split("T")[0];
    setAssigns(prev=>[...tids.map(tid=>({id:Date.now()+tid,teacherId:tid,courseId:cid,assignedDate:today,deadline,pct:0,status:"Not Started",_pending:true})),...prev]);
    setTab("teachers");
  };
  const handleAddTeacher=form=>{
    setTeachers(prev=>[...prev,{id:Date.now(),name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim()||"—",batchId:form.batchId,joinDate:form.joinDate,pct:0,status:"Not Started",_pending:true}]);
    setAddTeacher(false);
  };
  const handleUpdateDeadline=(id,date)=>setAssigns(prev=>prev.map(a=>a.id===id?{...a,deadline:date,_pending:true}:a));
  const handlePull=()=>{setSyncStatus("pulling");setTimeout(()=>{setTeachers(p=>p.map(t=>({...t,_pending:false})));setAssigns(p=>p.map(a=>({...a,_pending:false})));setLastSynced("Just now");setSyncStatus("done");setTimeout(()=>setSyncStatus("idle"),2500);},1400);};
  const handlePush=()=>{if(pendingT+pendingA===0)return;setSyncStatus("pushing");setTimeout(()=>{setTeachers(p=>p.map(t=>({...t,_pending:false})));setAssigns(p=>p.map(a=>({...a,_pending:false})));setLastSynced("Just now");setSyncStatus("done");setTimeout(()=>setSyncStatus("idle"),2500);},1600);};

  return(
    <div style={{display:"flex",background:C.canvas,fontFamily:F.body,minHeight:600}}>
      <FontLoader/>
      <div style={{width:192,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"16px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:28,height:28,borderRadius:6,background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🎓</div>
            <div>
              <div style={{fontFamily:F.display,fontSize:12,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:".14em"}}>TrainOS</div>
              <div style={{fontFamily:F.mono,fontSize:8,color:C.text3,letterSpacing:".06em",textTransform:"uppercase",marginTop:1}}>Admin Console</div>
            </div>
          </div>
        </div>
        <nav style={{padding:"10px 8px",flex:1}}>
          {NAV.map(n=>{
            const active=tab===n.id;
            return<button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",cursor:"pointer",marginBottom:2,borderRadius:7,borderLeft:`3px solid ${active?C.brand:"transparent"}`,background:active?C.brandXlo:"transparent",color:active?C.brand:C.text3,fontWeight:active?700:500,fontSize:12,textAlign:"left",fontFamily:F.body,transition:"all .12s",letterSpacing:".01em"}}><span style={{fontFamily:F.mono,fontSize:10,opacity:active?1:.5}}>{n.g}</span>{n.label}</button>;
          })}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Av name="Suneet Jagdev" size={26}/>
            <div><div style={{fontSize:11,fontFamily:F.body,fontWeight:600,color:C.text}}>Suneet J.</div><div style={{fontSize:9,fontFamily:F.mono,color:C.text3,letterSpacing:".04em"}}>Admin</div></div>
          </div>
        </div>
      </div>
      <div style={{flex:1,padding:"24px 28px",overflowY:"auto",minHeight:"100vh"}}>
        <SyncBar syncStatus={syncStatus} lastSynced={lastSynced} pendingT={pendingT} pendingA={pendingA} onPull={handlePull} onPush={handlePush}/>
        {tab==="dashboard"&&<Dashboard teachers={teachers} assignments={assignments} onFilterTeachers={handleFilterTeachers}/>}
        {tab==="courses"&&<Courses setTab={setTab} setAssignOpen={openAssign}/>}
        {tab==="analytics"&&<Analytics teachers={teachers} assignments={assignments}/>}
        {tab==="teachers"&&<Teachers teachers={teachers} assignments={assignments} setAssignOpen={openAssign} onAddTeacher={()=>setAddTeacher(true)} onUpdateDeadline={handleUpdateDeadline} initialFilter={tFilter}/>}
      </div>
      {assignModal!==null&&<AssignModal teachers={teachers} preCourseId={assignModal.courseId} preTeacherId={assignModal.teacherId} onClose={()=>setAssignModal(null)} onAssign={handleAssign}/>}
      {addTeacher&&<AddTeacherModal onClose={()=>setAddTeacher(false)} onAdd={handleAddTeacher}/>}
    </div>
  );
}

import { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
const C = {
  brand: "#f97316", brand2: "#fff7ed", brand3: "#ffedd5",
  blue: "#3b82f6",  blue2: "#eff6ff",
  green: "#16a34a", green2: "#f0fdf4",
  red: "#dc2626",   red2: "#fef2f2",
  amber: "#d97706", amber2: "#fffbeb",
  ink: "#0f172a", ink2: "#1e293b", ink3: "#475569",
  muted: "#94a3b8", line: "#e2e8f0", bg: "#f8fafc", surface: "#ffffff",
};
const sh = { boxShadow:"0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" };
const card = { background:C.surface, borderRadius:16, border:`1px solid ${C.line}`, ...sh };
const input = { padding:"9px 13px", borderRadius:10, border:`1.5px solid ${C.line}`, fontSize:13, color:C.ink2, outline:"none", background:C.surface, width:"100%", boxSizing:"border-box", fontFamily:"inherit" };
const btn = (bg, color, radius=20) => ({ padding:"8px 18px", borderRadius:radius, background:bg, color, fontWeight:700, fontSize:13, border:"none", cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6 });

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const CATEGORIES = {
  coding:  { label:"Coding",             color:"#3b82f6", bg:"#eff6ff" },
  maths:   { label:"Maths",             color:"#f97316", bg:"#fff7ed" },
  finlit:  { label:"Financial Literacy", color:"#16a34a", bg:"#f0fdf4" },
  robotics:{ label:"Robotics",           color:"#7c3aed", bg:"#f5f3ff" },
};

const COURSES = [
  { id:"c1",  cat:"coding",   icon:"🐍", name:"Intro to Python",            modules:13, status:"active", enrolled:2498, completed:0,   avg:25.2, desc:"Variables · loops · functions · first programs" },
  { id:"c2",  cat:"coding",   icon:"🌐", name:"Web Dev Basics",             modules:10, status:"active", enrolled:1842, completed:156, avg:42.1, desc:"HTML · CSS · JavaScript · responsive layouts" },
  { id:"c3",  cat:"coding",   icon:"🎮", name:"App Building with Scratch",  modules:8,  status:"active", enrolled:1205, completed:312, avg:58.4, desc:"Visual programming · game design · logic blocks" },
  { id:"c4",  cat:"coding",   icon:"⚙️", name:"Advanced Algorithms",        modules:12, status:"active", enrolled:634,  completed:89,  avg:31.0, desc:"Sorting · recursion · time complexity · DSA" },
  { id:"c5",  cat:"maths",    icon:"📐", name:"Foundation Math Teaching",   modules:9,  status:"active", enrolled:2105, completed:284, avg:47.8, desc:"Number sense · operations · pedagogy framework" },
  { id:"c6",  cat:"maths",    icon:"🎯", name:"Demo Class Math Mastery",    modules:8,  status:"active", enrolled:1456, completed:392, avg:61.4, desc:"Live class tactics · concept delivery · Q&A flow" },
  { id:"c7",  cat:"maths",    icon:"🧮", name:"Math Problem Solving",       modules:6,  status:"active", enrolled:987,  completed:445, avg:74.2, desc:"Problem framing · heuristics · worked examples" },
  { id:"c8",  cat:"finlit",   icon:"💰", name:"Money Basics for Kids",      modules:5,  status:"active", enrolled:743,  completed:521, avg:82.4, desc:"Saving · budgeting · needs vs wants · allowances" },
  { id:"c9",  cat:"finlit",   icon:"📈", name:"Investing & Entrepreneurship",modules:7, status:"active", enrolled:412,  completed:78,  avg:35.2, desc:"Compound interest · business models · pitch skills" },
  { id:"c10", cat:"robotics", icon:"🤖", name:"Intro to Robotics",          modules:8,  status:"active", enrolled:891,  completed:203, avg:54.7, desc:"Sensors · actuators · build-a-bot · basic control" },
  { id:"c11", cat:"robotics", icon:"🔌", name:"Arduino & Sensors",          modules:11, status:"active", enrolled:445,  completed:67,  avg:28.9, desc:"Circuit design · breadboarding · sensor programming" },
  { id:"c12", cat:"robotics", icon:"🏆", name:"Robotics Competition Prep",  modules:6,  status:"active", enrolled:234,  completed:112, avg:67.5, desc:"Strategy · autonomous routines · scoring systems" },
  { id:"c13", cat:"coding",   icon:"🧠", name:"AI & Machine Learning",      modules:10, status:"draft",  enrolled:0,    completed:0,   avg:0,    desc:"Neural nets · training data · model evaluation" },
];

const BATCHES = [
  { id:"b1", name:"Jan 2026" },
  { id:"b2", name:"Feb 2026" },
  { id:"b3", name:"Mar 2026" },
];

const INIT_TEACHERS = [
  { id:1,  name:"Ardhendu Mahatha", email:"ardhendu@gmail.com",    phone:"+91 98765 00001", batchId:"b1", joinDate:"2026-01-10", pct:84.62, status:"In Progress" },
  { id:2,  name:"Chahat Gupta",     email:"chahatgupta@gmail.com", phone:"+91 98765 00002", batchId:"b1", joinDate:"2026-01-12", pct:84.62, status:"In Progress" },
  { id:3,  name:"Mumal Rathore",    email:"mumalrathore@gmail.com",phone:"+91 98765 00003", batchId:"b2", joinDate:"2026-02-03", pct:76.92, status:"In Progress" },
  { id:4,  name:"Shruthi S",        email:"shruthi@gmail.com",     phone:"+91 98765 00004", batchId:"b2", joinDate:"2026-02-04", pct:76.92, status:"In Progress" },
  { id:5,  name:"Devesh Bhagwani",  email:"devesh@gmail.com",      phone:"+91 98765 00005", batchId:"b1", joinDate:"2026-01-15", pct:0,     status:"Not Started" },
  { id:6,  name:"Shreya Yadav",     email:"shreya@gmail.com",      phone:"+91 98765 00006", batchId:"b3", joinDate:"2026-03-02", pct:69.23, status:"In Progress" },
  { id:7,  name:"Shipra Gupta",     email:"shipra@gmail.com",      phone:"+91 98765 00007", batchId:"b1", joinDate:"2026-01-18", pct:0,     status:"Not Started" },
  { id:8,  name:"Yakshi Chauhan",   email:"yakshi@gmail.com",      phone:"+91 98765 00008", batchId:"b2", joinDate:"2026-02-07", pct:61.54, status:"In Progress" },
  { id:9,  name:"Manushree U",      email:"manushree@gmail.com",   phone:"+91 98765 00009", batchId:"b3", joinDate:"2026-03-05", pct:53.85, status:"In Progress" },
  { id:10, name:"Ayushi Podda",     email:"ayushi@gmail.com",      phone:"+91 98765 00010", batchId:"b1", joinDate:"2026-01-20", pct:46.15, status:"In Progress" },
  { id:11, name:"Meera Kulkarni",   email:"meera@gmail.com",       phone:"+91 98765 00011", batchId:"b2", joinDate:"2026-02-10", pct:0,     status:"Not Started" },
  { id:12, name:"Diksha Garg",      email:"diksha@gmail.com",      phone:"+91 98765 00012", batchId:"b1", joinDate:"2026-01-22", pct:38.46, status:"In Progress" },
  { id:13, name:"Pallavy Rai",      email:"pallavy@gmail.com",     phone:"+91 98765 00013", batchId:"b3", joinDate:"2026-03-08", pct:30.77, status:"In Progress" },
  { id:14, name:"Tannu Gupta",      email:"tannu@gmail.com",       phone:"+91 98765 00014", batchId:"b2", joinDate:"2026-02-12", pct:0,     status:"Not Started" },
  { id:15, name:"Shivangi Singh",   email:"shivangi@gmail.com",    phone:"+91 98765 00015", batchId:"b1", joinDate:"2026-01-25", pct:23.08, status:"In Progress" },
  { id:16, name:"Amjada KTP",       email:"amjada@gmail.com",      phone:"+91 98765 00016", batchId:"b3", joinDate:"2026-03-10", pct:0,     status:"Not Started" },
  { id:17, name:"Fida Kabir",       email:"fida@gmail.com",        phone:"+91 98765 00017", batchId:"b2", joinDate:"2026-02-14", pct:15.38, status:"In Progress" },
  { id:18, name:"Tisha Soni",       email:"tisha@gmail.com",       phone:"+91 98765 00018", batchId:"b1", joinDate:"2026-01-28", pct:7.69,  status:"In Progress" },
  { id:19, name:"Nadia Showkat",    email:"nadia@gmail.com",       phone:"+91 98765 00019", batchId:"b3", joinDate:"2026-03-12", pct:0,     status:"Not Started" },
  { id:20, name:"Nikunj Rawat",     email:"nikunj@gmail.com",      phone:"+91 98765 00020", batchId:"b2", joinDate:"2026-02-16", pct:84.62, status:"In Progress" },
];

const INIT_ASSIGNMENTS = () => [
  { id:101, teacherId:1,  courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:84.62, status:"In Progress" },
  { id:102, teacherId:1,  courseId:"c5",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:65.0,  status:"In Progress" },
  { id:103, teacherId:2,  courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:84.62, status:"In Progress" },
  { id:104, teacherId:2,  courseId:"c6",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:72.0,  status:"In Progress" },
  { id:105, teacherId:3,  courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:76.92, status:"In Progress" },
  { id:106, teacherId:3,  courseId:"c5",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:58.0,  status:"In Progress" },
  { id:107, teacherId:4,  courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:76.92, status:"In Progress" },
  { id:108, teacherId:4,  courseId:"c7",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:80.0,  status:"In Progress" },
  { id:109, teacherId:5,  courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-02-28", pct:0,     status:"Not Started" },
  { id:110, teacherId:5,  courseId:"c10", assignedDate:"2026-03-01", deadline:"2026-05-31", pct:0,     status:"Not Started" },
  { id:111, teacherId:6,  courseId:"c2",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:69.0,  status:"In Progress" },
  { id:112, teacherId:6,  courseId:"c8",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:90.0,  status:"In Progress" },
  { id:113, teacherId:7,  courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-02-28", pct:0,     status:"Not Started" },
  { id:114, teacherId:7,  courseId:"c11", assignedDate:"2026-03-01", deadline:"2026-05-31", pct:0,     status:"Not Started" },
  { id:115, teacherId:8,  courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:61.54, status:"In Progress" },
  { id:116, teacherId:8,  courseId:"c6",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:55.0,  status:"In Progress" },
  { id:117, teacherId:9,  courseId:"c3",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:53.85, status:"In Progress" },
  { id:118, teacherId:9,  courseId:"c10", assignedDate:"2026-02-01", deadline:"2026-04-30", pct:45.0,  status:"In Progress" },
  { id:119, teacherId:10, courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:46.15, status:"In Progress" },
  { id:120, teacherId:10, courseId:"c5",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:40.0,  status:"In Progress" },
  { id:121, teacherId:11, courseId:"c2",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:0,     status:"Not Started" },
  { id:122, teacherId:11, courseId:"c8",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:0,     status:"Not Started" },
  { id:123, teacherId:12, courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:38.46, status:"In Progress" },
  { id:124, teacherId:12, courseId:"c7",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:50.0,  status:"In Progress" },
  { id:125, teacherId:13, courseId:"c3",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:30.77, status:"In Progress" },
  { id:126, teacherId:13, courseId:"c9",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:25.0,  status:"In Progress" },
  { id:127, teacherId:14, courseId:"c4",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:0,     status:"Not Started" },
  { id:128, teacherId:14, courseId:"c11", assignedDate:"2026-03-01", deadline:"2026-05-31", pct:0,     status:"Not Started" },
  { id:129, teacherId:15, courseId:"c2",  assignedDate:"2026-01-15", deadline:"2026-02-28", pct:23.08, status:"In Progress" },
  { id:130, teacherId:15, courseId:"c6",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:30.0,  status:"In Progress" },
  { id:131, teacherId:16, courseId:"c10", assignedDate:"2026-03-01", deadline:"2026-05-31", pct:0,     status:"Not Started" },
  { id:132, teacherId:16, courseId:"c8",  assignedDate:"2026-03-01", deadline:"2026-05-31", pct:0,     status:"Not Started" },
  { id:133, teacherId:17, courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-02-28", pct:15.38, status:"In Progress" },
  { id:134, teacherId:17, courseId:"c5",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:12.0,  status:"In Progress" },
  { id:135, teacherId:18, courseId:"c2",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:7.69,  status:"In Progress" },
  { id:136, teacherId:18, courseId:"c12", assignedDate:"2026-03-01", deadline:"2026-05-31", pct:15.0,  status:"In Progress" },
  { id:137, teacherId:19, courseId:"c3",  assignedDate:"2026-03-01", deadline:"2026-05-31", pct:0,     status:"Not Started" },
  { id:138, teacherId:19, courseId:"c9",  assignedDate:"2026-03-01", deadline:"2026-05-31", pct:0,     status:"Not Started" },
  { id:139, teacherId:20, courseId:"c1",  assignedDate:"2026-01-15", deadline:"2026-03-31", pct:84.62, status:"In Progress" },
  { id:140, teacherId:20, courseId:"c6",  assignedDate:"2026-02-01", deadline:"2026-04-30", pct:78.0,  status:"In Progress" },
];

const MODULES = {
  c1:[
    ["Python Environment Setup",  60.13,51.08,8.33, false],["Variables & Data Types",    53.0, 47.48,12.75,false],
    ["Control Flow & Loops",      50.8, 47.0, 5.41, false],["Quiz 1 — Python Basics",    7.53, 7.49, 2.08, true ],
    ["Functions & Scope",         45.6, 42.27,11.02,false],["Lists & Dictionaries",      42.39,37.79,24.45,false],
    ["File Handling & Errors",    39.59,34.35,19.48,false],["Quiz 2 — Core Python",      4.08, 4.04, 2.17, true ],
    ["Object-Oriented Python",    15.17,14.37,5.0,  false],["Libraries & APIs",          23.7, 20.94,12.25,false],
    ["Quiz 3 — Advanced",         0,    0,    0,    true ],["Mini Project",              0,    0,    0,    false],
    ["Final Project & Review",    23.62,20.86,3.13, false],
  ],
  c2:[
    ["HTML Structure & Semantics",78.2, 74.5, 4.7,  false],["CSS Styling Fundamentals",  71.3, 67.8, 5.0,  false],
    ["Responsive Layouts",        64.5, 60.2, 6.7,  false],["JavaScript Intro",          58.8, 54.1, 8.0,  false],
    ["Quiz — HTML/CSS/JS",        52.3, 51.9, 0.8,  true ],["DOM Manipulation",          46.7, 42.3, 9.4,  false],
    ["Fetch & APIs",              38.4, 35.1, 8.6,  false],["Forms & Validation",        31.2, 28.8, 7.7,  false],
    ["Mini Project Build",        24.5, 21.3, 13.1, false],["Deploy & Review",           14.2, 8.5,  18.4, false],
  ],
  c3:[
    ["Intro to Scratch Interface",86.5, 83.2, 3.8,  false],["Motion & Sprites",          79.8, 76.4, 4.3,  false],
    ["Events & Broadcast",        73.2, 69.5, 5.1,  false],["Conditionals & Loops",      67.4, 63.8, 5.3,  false],
    ["Quiz — Logic Blocks",       61.2, 60.8, 0.7,  true ],["Variables & Lists",         55.6, 51.3, 7.7,  false],
    ["Building a Game",           48.9, 44.2, 9.6,  false],["Final App Project",         34.2, 25.9, 22.3, false],
  ],
  c4:[
    ["Big-O Notation",            68.5, 63.4, 7.4,  false],["Arrays & Strings",          62.1, 57.8, 6.9,  false],
    ["Linked Lists",              55.4, 50.2, 9.4,  false],["Stacks & Queues",           49.8, 45.1, 8.3,  false],
    ["Quiz — Linear Structures",  45.3, 44.8, 1.1,  true ],["Trees & BST",               40.2, 36.7, 11.5, false],
    ["Graphs & BFS/DFS",          34.6, 30.8, 14.8, false],["Dynamic Programming",       28.4, 24.9, 16.2, false],
    ["Quiz — Non-linear",         22.5, 22.1, 1.8,  true ],["Greedy Algorithms",         18.3, 15.6, 12.3, false],
    ["Sorting Deep Dive",         14.1, 11.8, 13.6, false],["Final: System Design",      10.2, 8.4,  24.5, false],
  ],
  c5:[
    ["Math Pedagogy Basics",      77.2, 73.8, 4.4,  false],["Number Sense & Operations", 70.5, 66.2, 6.1,  false],
    ["Place Value Teaching",      63.8, 59.4, 6.9,  false],["Fractions & Decimals",      57.4, 52.8, 8.0,  false],
    ["Quiz — Core Concepts",      52.1, 51.6, 1.0,  true ],["Word Problems Strategy",    45.6, 41.2, 9.6,  false],
    ["Mental Math Techniques",    38.3, 34.7, 9.4,  false],["Assessment Design",         31.1, 27.4, 11.9, false],
    ["Capstone: Lesson Plan",     22.4, 13.5, 32.0, false],
  ],
  c6:[
    ["Demo Class Structure",      87.3, 82.8, 5.2,  false],["Opening Hook & Warmup",     80.1, 75.4, 5.9,  false],
    ["Concept Delivery Flow",     72.6, 68.2, 6.1,  false],["Student Engagement Tactics",65.4, 61.7, 7.3,  false],
    ["Quiz — Class Techniques",   58.9, 58.4, 0.8,  true ],["Handling Confusion",        51.2, 46.8, 8.6,  false],
    ["Demo Close & Recap",        44.7, 40.3, 9.8,  false],["Full Mock Demo Class",      36.2, 26.9, 28.5, false],
  ],
  c7:[
    ["Problem Reading Techniques",91.2, 88.4, 3.1,  false],["Breaking Down Word Problems",85.6,82.1, 4.1,  false],
    ["Drawing & Visualization",   79.8, 76.3, 4.4,  false],["Multiple Solution Paths",   73.4, 69.8, 4.9,  false],
    ["Quiz — Problem Strategies", 68.9, 68.4, 0.7,  true ],["Practice & Review Set",     61.2, 45.1, 9.8,  false],
  ],
  c8:[
    ["What is Money?",            94.1, 91.8, 2.4,  false],["Needs vs Wants",            89.5, 86.2, 3.7,  false],
    ["Saving & Goal Setting",     83.7, 80.4, 3.9,  false],["Budgeting Basics",          78.2, 74.6, 4.6,  false],
    ["Quiz & Reflection",         72.4, 70.1, 2.8,  true ],
  ],
  c9:[
    ["Why Invest?",               67.2, 63.8, 5.1,  false],["How Banks Work",            59.4, 55.2, 7.1,  false],
    ["Stocks & Mutual Funds",     51.8, 47.3, 8.7,  false],["Compound Interest",         44.2, 40.6, 8.1,  false],
    ["Business Idea Canvas",      36.7, 32.4, 11.7, false],["Pitching Your Idea",        28.4, 24.8, 14.2, false],
    ["Final Project",             18.9, 18.9, 6.0,  false],
  ],
  c10:[
    ["What is a Robot?",          81.5, 77.8, 4.5,  false],["Sensors & Actuators",       74.2, 70.1, 5.5,  false],
    ["Basic Control Systems",     66.8, 62.4, 6.6,  false],["Build Session 1",           59.5, 55.2, 18.4, false],
    ["Quiz — Robotics Basics",    53.4, 52.8, 1.1,  true ],["Autonomous Motion",         45.8, 41.3, 9.8,  false],
    ["Line Following & Sensing",  38.2, 34.6, 11.2, false],["Final Build Challenge",     28.7, 22.8, 32.0, false],
  ],
  c11:[
    ["Arduino IDE Setup",         67.2, 62.8, 6.5,  false],["Digital I/O Basics",        60.4, 56.1, 7.1,  false],
    ["Analog Signals",            53.7, 49.4, 8.0,  false],["LED & Button Control",      47.8, 43.6, 8.8,  false],
    ["Quiz — Electronics Basics", 42.2, 41.8, 0.9,  true ],["Temperature & Light Sensors",36.4,32.7, 10.2, false],
    ["Serial Communication",      30.8, 27.4, 11.0, false],["Motor Control",             25.1, 21.8, 14.4, false],
    ["Ultrasonic Distance",       19.6, 16.4, 12.3, false],["Multi-sensor Project",      14.2, 11.8, 18.6, false],
    ["Final Circuit Build",        8.7,  8.7,  6.0, false],
  ],
  c12:[
    ["Competition Rules & Scoring",90.6,87.4, 3.5,  false],["Robot Design Strategy",     83.2, 79.5, 4.4,  false],
    ["Autonomous Programming",    76.4, 72.8, 14.2, false],["Driver Control Optimization",68.9,65.3, 8.5,  false],
    ["Practice Runs & Timing",    61.5, 57.8, 22.0, false],["Mock Competition Day",      52.3, 47.9, 38.0, false],
  ],
  c13:[],
};

const DIST = {
  c1: [{r:"0%",n:1148},{r:"1–23%",n:194},{r:"24–46%",n:212},{r:"47–62%",n:408},{r:"63–77%",n:390},{r:"78%+",n:146}],
  c2: [{r:"0%",n:420},{r:"1–25%",n:312},{r:"26–50%",n:356},{r:"51–75%",n:432},{r:"76–99%",n:166},{r:"Completed",n:156}],
  c3: [{r:"0%",n:168},{r:"1–25%",n:145},{r:"26–50%",n:185},{r:"51–75%",n:240},{r:"76–99%",n:155},{r:"Completed",n:312}],
  c4: [{r:"0%",n:198},{r:"1–25%",n:112},{r:"26–50%",n:98},{r:"51–75%",n:89},{r:"76–99%",n:48},{r:"Completed",n:89}],
  c5: [{r:"0%",n:486},{r:"1–30%",n:312},{r:"31–55%",n:398},{r:"56–75%",n:420},{r:"76–99%",n:205},{r:"Completed",n:284}],
  c6: [{r:"0%",n:198},{r:"1–30%",n:178},{r:"31–55%",n:234},{r:"56–75%",n:298},{r:"76–99%",n:156},{r:"Completed",n:392}],
  c7: [{r:"0%",n:89},{r:"1–33%",n:112},{r:"34–66%",n:178},{r:"67–99%",n:163},{r:"Completed",n:445}],
  c8: [{r:"0%",n:45},{r:"1–33%",n:78},{r:"34–66%",n:62},{r:"67–99%",n:37},{r:"Completed",n:521}],
  c9: [{r:"0%",n:134},{r:"1–25%",n:89},{r:"26–50%",n:67},{r:"51–99%",n:44},{r:"Completed",n:78}],
  c10:[{r:"0%",n:167},{r:"1–30%",n:134},{r:"31–55%",n:178},{r:"56–75%",n:145},{r:"76–99%",n:64},{r:"Completed",n:203}],
  c11:[{r:"0%",n:145},{r:"1–25%",n:89},{r:"26–50%",n:78},{r:"51–75%",n:56},{r:"76–99%",n:10},{r:"Completed",n:67}],
  c12:[{r:"0%",n:23},{r:"1–33%",n:34},{r:"34–66%",n:42},{r:"67–99%",n:23},{r:"Completed",n:112}],
  c13:[],
};

const SHEETS = [
  { id:"teachers",   icon:"👥", tab:"Teachers",       name:"Teacher Directory",   desc:"Add / view all teachers",           writable:true  },
  { id:"progress",   icon:"📊", tab:"Module_Progress", name:"Module Progress",    desc:"LMS completion data · read-only",   writable:false },
  { id:"assignments",icon:"📋", tab:"Assignments",     name:"Assignments",         desc:"Course assignments · push changes", writable:true  },
];
const SHEET_FILE = "TrainOS_Data";
const LAST_PULL  = "Today, 10:42 AM";

// ─── UTILS ───────────────────────────────────────────────────────────────────
const initials = n => n.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const avBg = n => ["#ffedd5","#dbeafe","#dcfce7","#fce7f3","#ede9fe","#fef9c3"][n.charCodeAt(0)%6];
const avFg = n => ["#c2410c","#1d4ed8","#15803d","#be185d","#6d28d9","#a16207"][n.charCodeAt(0)%6];
const fmt = d => { try { return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); } catch { return d; } };
const batchLabel = (id, batches) => batches.find(b=>b.id===id)?.name ?? id;
const sColor = s => s==="In Progress"?C.brand : s==="Completed"?C.green : C.muted;
const sBg    = s => s==="In Progress"?C.brand2: s==="Completed"?C.green2: "#f1f5f9";
const daysLeft = d => Math.ceil((new Date(d) - new Date()) / 86400000);

// Health-aware bar colour: red=overdue, amber=stuck<30%, green=done, brand=normal
const healthColor = (pct, status, deadline) => {
  if (status === "Completed") return C.green;
  if (new Date(deadline) < new Date()) return C.red;
  if (pct === 0) return C.muted;
  if (pct < 30)  return C.amber;
  return C.brand;
};

// ─── ATOMS ───────────────────────────────────────────────────────────────────
function Av({ name, size=32 }) {
  return <div style={{ width:size,height:size,borderRadius:"50%",background:avBg(name),color:avFg(name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.33,fontWeight:700,flexShrink:0,letterSpacing:"-.02em" }}>{initials(name)}</div>;
}
function Badge({ label, color, bg }) {
  return <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:12,background:bg,color,whiteSpace:"nowrap",letterSpacing:".01em" }}>{label}</span>;
}
function StatusBadge({ status }) {
  return <Badge label={status} color={sColor(status)} bg={sBg(status)} />;
}
// Health-aware progress bar — pass color explicitly
function PBar({ pct, h=5, color }) {
  const c = color || (pct > 0 ? C.brand : C.line);
  return <div style={{ flex:1,height:h,borderRadius:h,background:C.line,overflow:"hidden" }}><div style={{ height:"100%",width:`${Math.min(100,pct)}%`,background:c,borderRadius:h,transition:"width .5s ease" }} /></div>;
}
// Clickable KPI card — onClick optional
function Kpi({ label, value, sub, accent, icon, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ ...card, padding:"18px 20px", display:"flex", flexDirection:"column", gap:4,
        cursor:onClick?"pointer":"default",
        outline: hover&&onClick ? `2px solid ${accent||C.brand}` : "2px solid transparent",
        transition:"outline .12s" }}>
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
        <span style={{ fontSize:15 }}>{icon}</span>
        <span style={{ fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:".06em" }}>{label}</span>
        {onClick && <span style={{ marginLeft:"auto",fontSize:9,color:hover?(accent||C.brand):C.muted,fontWeight:600,transition:"color .12s" }}>VIEW →</span>}
      </div>
      <div style={{ fontSize:28,fontWeight:800,color:accent||C.ink2,lineHeight:1,letterSpacing:"-.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{sub}</div>}
    </div>
  );
}
function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
      <div>
        <div style={{ fontSize:20,fontWeight:800,color:C.ink,letterSpacing:"-.02em" }}>{title}</div>
        {sub && <div style={{ fontSize:13,color:C.ink3,marginTop:3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ padding:"48px 24px",textAlign:"center" }}>
      <div style={{ fontSize:36,marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:14,fontWeight:700,color:C.ink2,marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13,color:C.muted,maxWidth:280,margin:"0 auto" }}>{sub}</div>
    </div>
  );
}
// Toast notification
function Toast({ toast }) {
  if (!toast) return null;
  const bg   = toast.type==="error" ? C.red2  : toast.type==="warn" ? C.amber2 : C.green2;
  const col  = toast.type==="error" ? C.red   : toast.type==="warn" ? C.amber  : C.green;
  return (
    <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,
      background:bg,border:`1px solid ${col}22`,borderRadius:12,padding:"11px 18px",
      fontSize:13,fontWeight:600,color:col,...sh,whiteSpace:"nowrap",pointerEvents:"none",
      animation:"fadeIn .15s ease" }}>
      {toast.msg}
    </div>
  );
}

// ─── SYNC BAR ────────────────────────────────────────────────────────────────
// Now accepts pendingTeachers + pendingAssignments separately for breakdown
function SyncBar({ syncStatus, lastSynced, pendingTeachers, pendingAssignments, onPull, onPush }) {
  const pendingCount = pendingTeachers + pendingAssignments;
  const isPulling = syncStatus === "pulling";
  const isPushing = syncStatus === "pushing";
  const isDone    = syncStatus === "done";
  const busy      = isPulling || isPushing;

  // Build breakdown label
  const parts = [];
  if (pendingTeachers  > 0) parts.push(`${pendingTeachers} new teacher${pendingTeachers>1?"s":""}`);
  if (pendingAssignments > 0) parts.push(`${pendingAssignments} assignment${pendingAssignments>1?"s":""}`);
  const breakdown = parts.join(", ");

  return (
    <div style={{ display:"flex",alignItems:"center",gap:12,padding:"9px 16px",borderRadius:12,background:C.surface,border:`1px solid ${C.line}`,marginBottom:22,...sh,flexWrap:"wrap" }}>
      <div style={{ display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0 }}>
        <div style={{ width:24,height:24,borderRadius:7,background:"#e8f5e9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0 }}>
          <span style={{ color:"#2e7d32",fontSize:12 }}>✦</span>
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:12,fontWeight:700,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{SHEET_FILE}.xlsx</div>
          <div style={{ fontSize:10,color:C.muted }}>
            {busy ? (
              <span style={{ color:C.brand }}>{isPulling ? "⟳ Pulling from sheet…" : "⟳ Pushing changes…"}</span>
            ) : isDone ? (
              <span style={{ color:C.green }}>✓ Synced just now</span>
            ) : (
              `Last synced: ${lastSynced}`
            )}
          </div>
        </div>
      </div>

      <div style={{ display:"flex",gap:5 }}>
        {SHEETS.map(s=>(
          <div key={s.id} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:8,background:C.bg,border:`1px solid ${C.line}` }}>
            <span style={{ fontSize:11 }}>{s.icon}</span>
            <span style={{ fontSize:10,fontWeight:600,color:C.ink3 }}>{s.tab}</span>
            {!s.writable && <span style={{ fontSize:9,color:C.muted,background:C.line,padding:"1px 4px",borderRadius:4 }}>read</span>}
          </div>
        ))}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
        {pendingCount > 0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:1,padding:"4px 10px",borderRadius:10,background:C.brand2,border:`1px solid ${C.brand3}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:5 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:C.brand }} />
              <span style={{ fontSize:11,fontWeight:700,color:C.brand }}>{pendingCount} pending write{pendingCount!==1?"s":""}</span>
            </div>
            {breakdown && <span style={{ fontSize:10,color:C.brand,opacity:.75,paddingLeft:11 }}>{breakdown}</span>}
          </div>
        )}
        <button onClick={onPull} disabled={busy}
          style={{ ...btn(C.bg,C.ink3,9),padding:"6px 12px",fontSize:12,border:`1px solid ${C.line}`,opacity:busy?.5:1,cursor:busy?"not-allowed":"pointer" }}>
          {isPulling ? "⟳" : "↓"} Pull
        </button>
        <button onClick={onPush} disabled={busy||pendingCount===0}
          style={{ ...btn(pendingCount>0&&!busy?C.brand:"#e2e8f0",pendingCount>0&&!busy?"#fff":C.muted,9),padding:"6px 12px",fontSize:12,opacity:(busy||pendingCount===0)?.5:1,cursor:(busy||pendingCount===0)?"not-allowed":"pointer" }}>
          {isPushing ? "⟳" : "↑"} Push {pendingCount > 0 ? `(${pendingCount})` : ""}
        </button>
      </div>
    </div>
  );
}

// ─── MODAL SHELL ─────────────────────────────────────────────────────────────
function Modal({ title, sub, onClose, children, footer, width=520 }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(2px)" }}>
      <div style={{ background:C.surface,borderRadius:20,width,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",...sh,border:`1px solid ${C.line}` }}>
        <div style={{ padding:"20px 24px 16px",borderBottom:`1px solid ${C.line}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"sticky",top:0,background:C.surface,zIndex:1 }}>
          <div>
            <div style={{ fontSize:16,fontWeight:800,color:C.ink,letterSpacing:"-.01em" }}>{title}</div>
            {sub && <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{ ...btn(C.bg,"#64748b",8), padding:"5px 10px", fontSize:18, fontWeight:400, lineHeight:1, marginLeft:12, flexShrink:0 }}>×</button>
        </div>
        <div style={{ padding:"20px 24px" }}>{children}</div>
        {footer && <div style={{ padding:"14px 24px",borderTop:`1px solid ${C.line}`,display:"flex",gap:8,justifyContent:"flex-end",position:"sticky",bottom:0,background:C.surface }}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── ADD TEACHER MODAL ────────────────────────────────────────────────────────
function AddTeacherModal({ batches, onClose, onAdd }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", batchId:"b1", joinDate: new Date().toISOString().split("T")[0] });
  const [err, setErr] = useState({});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    setErr(e);
    return Object.keys(e).length===0;
  };
  const submit = () => { if (validate()) onAdd(form); };
  const Field = ({ label, k, type="text", placeholder="" }) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.ink3,marginBottom:6 }}>{label}</label>
      <input type={type} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
        style={{ ...input, borderColor: err[k]?C.red:C.line }} />
      {err[k] && <div style={{ fontSize:11,color:C.red,marginTop:4 }}>{err[k]}</div>}
    </div>
  );
  return (
    <Modal title="Add New Teacher" sub="Teacher will be added to the directory immediately" onClose={onClose}
      footer={<><button onClick={onClose} style={btn("#f1f5f9",C.ink3)}>Cancel</button><button onClick={submit} style={btn(C.brand,"#fff")}>Add Teacher</button></>}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <div style={{ gridColumn:"span 2" }}><Field label="Full Name *" k="name" placeholder="e.g. Priya Sharma" /></div>
        <Field label="Email Address *" k="email" type="email" placeholder="priya@gmail.com" />
        <Field label="Phone Number" k="phone" placeholder="+91 98765 43210" />
        <div>
          <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.ink3,marginBottom:6 }}>Batch *</label>
          <select value={form.batchId} onChange={e=>set("batchId",e.target.value)} style={{ ...input, cursor:"pointer" }}>
            {batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <Field label="Join Date" k="joinDate" type="date" />
      </div>
    </Modal>
  );
}

// ─── ASSIGN MODAL ─────────────────────────────────────────────────────────────
function AssignModal({ teachers, batches, preTeacherId, preCourseId, onClose, onAssign }) {
  const [step, setStep]   = useState(preCourseId ? 2 : 1);
  const [cid, setCid]     = useState(preCourseId || "c1");
  const [tids, setTids]   = useState(preTeacherId ? [preTeacherId] : []);
  const [dl, setDl]       = useState("2026-04-30");
  const [tsearch, setTsearch] = useState("");

  const toggleT = id => setTids(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const toggleAll = (list) => {
    const ids = list.map(t=>t.id);
    const allIn = ids.every(id=>tids.includes(id));
    setTids(s => allIn ? s.filter(x=>!ids.includes(x)) : [...new Set([...s,...ids])]);
  };
  const selCourse  = COURSES.find(c=>c.id===cid);
  const filteredT  = teachers.filter(t => !tsearch || t.name.toLowerCase().includes(tsearch.toLowerCase()) || t.email.toLowerCase().includes(tsearch.toLowerCase()));
  const steps      = ["Select Course","Select Teachers","Confirm"];

  return (
    <Modal title="Assign Course" sub={`Step ${step} of 3 — ${steps[step-1]}`} onClose={onClose} width={560}
      footer={<>
        {step>1 && <button onClick={()=>setStep(s=>s-1)} style={btn("#f1f5f9",C.ink3)}>← Back</button>}
        {step<3 && <button onClick={()=>setStep(s=>s+1)} disabled={step===2&&tids.length===0}
          style={{ ...btn(C.brand,"#fff"),opacity:step===2&&tids.length===0?.45:1 }}>Continue →</button>}
        {step===3 && <button onClick={()=>{onAssign(cid,tids,dl);onClose();}} style={btn(C.brand,"#fff")}>Confirm Assignment</button>}
      </>}>

      {step===1 && (
        <div style={{ display:"flex",flexDirection:"column",gap:6,maxHeight:400,overflowY:"auto" }}>
          {Object.entries(CATEGORIES).map(([catId,cat])=>{
            const coursesInCat = COURSES.filter(c=>c.cat===catId&&c.status==="active");
            return (
              <div key={catId}>
                <div style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",padding:"8px 4px 4px" }}>{cat.label}</div>
                {coursesInCat.map(c=>(
                  <div key={c.id} onClick={()=>setCid(c.id)}
                    style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,cursor:"pointer",background:cid===c.id?cat.bg:"transparent",border:`1px solid ${cid===c.id?cat.color+"44":C.line}`,marginBottom:4,transition:"all .1s" }}>
                    <span style={{ fontSize:18,flexShrink:0 }}>{c.icon}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:C.ink }}>{c.name}</div>
                      <div style={{ fontSize:11,color:C.muted }}>{c.modules} modules · {c.enrolled.toLocaleString()} enrolled</div>
                    </div>
                    {cid===c.id && <span style={{ color:cat.color,fontWeight:700 }}>✓</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {step===2 && (
        <div>
          <div style={{ marginBottom:12,display:"flex",alignItems:"center",gap:8 }}>
            <input value={tsearch} onChange={e=>setTsearch(e.target.value)} placeholder="Search teachers…" style={{ ...input, flex:1 }} />
            <button onClick={()=>toggleAll(filteredT)} style={{ ...btn("#f1f5f9",C.ink3,10), padding:"9px 14px", fontSize:12, whiteSpace:"nowrap", flexShrink:0 }}>
              {filteredT.every(t=>tids.includes(t.id)) ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div style={{ border:`1px solid ${C.line}`,borderRadius:12,maxHeight:320,overflowY:"auto" }}>
            {filteredT.length===0 && <div style={{ padding:24,textAlign:"center",color:C.muted,fontSize:13 }}>No teachers found</div>}
            {filteredT.map((t,i)=>(
              <div key={t.id} onClick={()=>toggleT(t.id)}
                style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:tids.includes(t.id)?C.brand2:"transparent",borderBottom:i<filteredT.length-1?`1px solid ${C.line}`:"none",transition:"background .1s" }}>
                <div style={{ width:18,height:18,borderRadius:5,border:`2px solid ${tids.includes(t.id)?C.brand:C.line}`,background:tids.includes(t.id)?C.brand:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s" }}>
                  {tids.includes(t.id) && <span style={{ color:"#fff",fontSize:11,lineHeight:1 }}>✓</span>}
                </div>
                <Av name={t.name} size={30} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.ink }}>{t.name}</div>
                  <div style={{ fontSize:11,color:C.muted }}>{batchLabel(t.batchId,BATCHES)}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
          {tids.length>0 && <div style={{ marginTop:10,fontSize:12,color:C.brand,fontWeight:600 }}>{tids.length} teacher{tids.length!==1?"s":""} selected</div>}
        </div>
      )}

      {step===3 && (
        <div>
          <div style={{ background:C.bg,borderRadius:12,padding:"16px 18px",marginBottom:16 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${C.line}` }}>
              <span style={{ fontSize:22 }}>{selCourse?.icon}</span>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:C.ink }}>{selCourse?.name}</div>
                <div style={{ fontSize:12,color:C.muted }}>{selCourse?.modules} modules</div>
              </div>
            </div>
            <div style={{ fontSize:12,color:C.muted,marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em" }}>Assigned to</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:14 }}>
              {tids.slice(0,6).map(tid=>{
                const t = teachers.find(x=>x.id===tid);
                return t ? (
                  <div key={tid} style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:C.surface,border:`1px solid ${C.line}` }}>
                    <Av name={t.name} size={18} /><span style={{ fontSize:12,color:C.ink2,fontWeight:500 }}>{t.name}</span>
                  </div>
                ) : null;
              })}
              {tids.length>6 && <div style={{ padding:"4px 10px",borderRadius:20,background:C.surface,border:`1px solid ${C.line}`,fontSize:12,color:C.muted }}>+{tids.length-6} more</div>}
            </div>
            <div style={{ flex:1 }}>
              <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.ink3,marginBottom:6 }}>Deadline</label>
              <input type="date" value={dl} onChange={e=>setDl(e.target.value)} style={input} />
            </div>
          </div>
          <div style={{ padding:"12px 14px",background:C.brand2,borderRadius:10,borderLeft:`3px solid ${C.brand}`,fontSize:12,color:"#92400e" }}>
            {tids.length} teacher{tids.length!==1?"s":""} will receive an email notification when assigned.
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── PAGE: DASHBOARD ──────────────────────────────────────────────────────────
function Dashboard({ teachers, assignments, onFilterTeachers }) {
  const inTraining  = new Set(assignments.filter(a=>a.status==="In Progress").map(a=>a.teacherId)).size;
  const notStarted  = assignments.filter(a=>a.status==="Not Started").length;
  const overdue     = assignments.filter(a=>a.status!=="Completed"&&new Date(a.deadline)<new Date()).length;
  const activeCourses = COURSES.filter(c=>c.status==="active").length;
  const draftCourses  = COURSES.filter(c=>c.status==="draft").length;
  const totalEnrolled = COURSES.filter(c=>c.status==="active").reduce((s,c)=>s+c.enrolled,0);
  const catSummary = Object.entries(CATEGORIES).map(([catId, cat])=>{
    const courses   = COURSES.filter(c=>c.cat===catId && c.status==="active");
    const enrolled  = courses.reduce((s,c)=>s+c.enrolled,0);
    const avgComp   = courses.length ? Math.round(courses.reduce((s,c)=>s+c.avg,0)/courses.length*10)/10 : 0;
    return { ...cat, catId, count:courses.length, enrolled, avgComp };
  });

  return (
    <div>
      <SectionHeader title="Dashboard" sub={`${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}`} />
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20 }}>
        <Kpi icon="📚" label="Active Courses"  value={activeCourses}  sub={`${draftCourses} draft · 4 subjects`} />
        <Kpi icon="🏃" label="In Training"     value={inTraining}     sub="at least 1 module started" accent={C.brand}
          onClick={()=>onFilterTeachers({ status:"In Progress", course:"all" })} />
        <Kpi icon="💤" label="Not Started"     value={notStarted}     sub="need a nudge"              accent={C.muted}
          onClick={()=>onFilterTeachers({ status:"Not Started", course:"all" })} />
        <Kpi icon="⚡" label="Overdue"          value={overdue}        sub="past their deadline"       accent={C.red}
          onClick={()=>onFilterTeachers({ status:"overdue", course:"all" })} />
      </div>

      <div style={{ ...card,padding:"18px 20px" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.ink }}>By Subject</div>
          <div style={{ fontSize:11,color:C.muted }}>{totalEnrolled.toLocaleString()} total enrolled</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
          {catSummary.map((cat)=>(
            <div key={cat.catId} style={{ background:cat.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${cat.color}22` }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:10 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:cat.color,flexShrink:0 }} />
                <span style={{ fontSize:12,fontWeight:700,color:C.ink }}>{cat.label}</span>
                <span style={{ fontSize:10,color:C.muted,marginLeft:"auto" }}>{cat.count} courses</span>
              </div>
              <div style={{ fontSize:22,fontWeight:800,color:cat.color,letterSpacing:"-.02em",marginBottom:4 }}>{cat.avgComp}%</div>
              <div style={{ fontSize:10,color:C.muted,marginBottom:8 }}>avg completion</div>
              <div style={{ height:4,borderRadius:4,background:`${cat.color}30`,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${cat.avgComp}%`,background:cat.color,borderRadius:4 }} />
              </div>
              <div style={{ fontSize:11,color:C.muted,marginTop:8 }}>{cat.enrolled.toLocaleString()} enrolled</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: COURSES ────────────────────────────────────────────────────────────
function Courses({ setTab, setAssignOpen }) {
  const [catFilter, setCatFilter] = useState("all");
  const activeCats  = [...new Set(COURSES.filter(c=>c.status==="active").map(c=>c.cat))];
  const visibleCats = catFilter === "all" ? activeCats : [catFilter];

  return (
    <div>
      <SectionHeader title="Courses" sub="12 active · 4 subjects · 13,452 enrolled"
        action={<button style={btn(C.brand,"#fff")}>+ New Course</button>} />
      <div style={{ display:"flex",gap:6,marginBottom:20,flexWrap:"wrap" }}>
        {[["all","All Courses",null],...Object.entries(CATEGORIES).map(([id,cat])=>[id,cat.label,cat])].map(([id,label,cat])=>{
          const active = catFilter===id;
          return (
            <button key={id} onClick={()=>setCatFilter(id)}
              style={{ padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:`1.5px solid ${active?(cat?.color||C.brand):C.line}`,cursor:"pointer",background:active?(cat?.bg||C.brand2):"#fff",color:active?(cat?.color||C.brand):C.ink3,transition:"all .12s",fontFamily:"inherit" }}>
              {label}
              {cat && <span style={{ marginLeft:5,fontSize:10,color:active?cat.color:C.muted }}>{COURSES.filter(c=>c.cat===id&&c.status==="active").length}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:28 }}>
        {visibleCats.map(catId=>{
          const cat     = CATEGORIES[catId];
          const courses = COURSES.filter(c=>c.cat===catId);
          return (
            <div key={catId}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:cat.color }} />
                <div style={{ fontSize:13,fontWeight:700,color:C.ink }}>{cat.label}</div>
                <div style={{ height:1,flex:1,background:C.line }} />
                <div style={{ fontSize:11,color:C.muted }}>{courses.filter(c=>c.status==="active").length} courses · {courses.filter(c=>c.status==="active").reduce((s,c)=>s+c.enrolled,0).toLocaleString()} enrolled</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                {courses.map(c=>(
                  <div key={c.id} style={{ ...card,padding:"20px",opacity:c.status==="draft"?.75:1,position:"relative" }}>
                    {c.status==="draft" && <span style={{ position:"absolute",top:14,right:14,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8,background:"#f1f5f9",color:C.muted,textTransform:"uppercase",letterSpacing:".04em" }}>Draft</span>}
                    <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:14 }}>
                      <div style={{ width:42,height:42,borderRadius:12,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{c.icon}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:14,fontWeight:700,color:C.ink,lineHeight:1.3 }}>{c.name}</div>
                        <div style={{ fontSize:11,color:C.muted,marginTop:3 }}>{c.desc}</div>
                      </div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
                      {[["Modules",c.modules],["Enrolled",c.enrolled.toLocaleString()]].map(([l,v])=>(
                        <div key={l} style={{ background:C.bg,borderRadius:9,padding:"9px 10px" }}>
                          <div style={{ fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:2 }}>{l}</div>
                          <div style={{ fontSize:16,fontWeight:800,color:C.ink,letterSpacing:"-.02em" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {c.status==="active" && (
                      <div style={{ marginBottom:14 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                          <span style={{ fontSize:10,color:C.muted,fontWeight:600 }}>AVG COMPLETION</span>
                          <span style={{ fontSize:11,fontWeight:700,color:cat.color }}>{c.avg}%</span>
                        </div>
                        <div style={{ height:5,borderRadius:5,background:C.line,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${c.avg}%`,background:cat.color,borderRadius:5,transition:"width .5s" }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>setAssignOpen(c.id)}
                        style={{ ...btn(c.status==="draft"?"#f1f5f9":cat.color,c.status==="draft"?C.muted:"#fff",10),flex:1,justifyContent:"center" }}>
                        {c.status==="draft"?"Publish & Assign":"Assign Teachers"}
                      </button>
                      <button onClick={()=>setTab("analytics")} style={{ ...btn("#f1f5f9",C.ink3,10),padding:"8px 14px" }}>Analytics</button>
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

// ─── PAGE: TEACHERS ───────────────────────────────────────────────────────────
function Teachers({ teachers, assignments, setAssignOpen, onAddTeacher, onUpdateDeadline, initialFilter }) {
  const [view,    setView]    = useState("assignments"); // "assignments" | "roster"
  const [search,  setSearch]  = useState("");
  const [cFilter, setCFilter] = useState(initialFilter?.course  || "all");
  const [sFilter, setSFilter] = useState(initialFilter?.status  || "all");
  const [sort,    setSort]    = useState({ col:"deadline", dir:"asc" });
  const [profile, setProfile] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [editDL,  setEditDL]  = useState(null);   // assignmentId being deadline-edited
  const [editVal, setEditVal] = useState("");
  const [toast,   setToast]   = useState(null);
  const toastTimer = useRef(null);

  // Sync initialFilter when it changes (e.g. dashboard KPI click)
  useEffect(() => {
    if (initialFilter) {
      setCFilter(initialFilter.course || "all");
      setSFilter(initialFilter.status || "all");
      setView("assignments");
    }
  }, [initialFilter]);

  const showToast = (msg, type="success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(()=>setToast(null), 2600);
  };

  // ── Build flat assignment rows
  const allRows = useMemo(() => {
    return assignments.map(a => {
      const t = teachers.find(x=>x.id===a.teacherId);
      const c = COURSES.find(x=>x.id===a.courseId);
      return (t && c) ? { ...a, teacher:t, course:c } : null;
    }).filter(Boolean);
  }, [assignments, teachers]);

  // ── Filter rows (with overdue as synthetic status filter)
  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (cFilter !== "all" && r.courseId !== cFilter) return false;
      const late = new Date(r.deadline) < new Date() && r.status !== "Completed";
      if (sFilter === "overdue" && !late) return false;
      if (sFilter !== "all" && sFilter !== "overdue" && r.status !== sFilter) return false;
      if (search && !r.teacher.name.toLowerCase().includes(search.toLowerCase()) &&
                   !r.teacher.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allRows, cFilter, sFilter, search]);

  // ── Sort rows
  const rows = useMemo(() => {
    const sorted = [...filteredRows];
    const { col, dir } = sort;
    sorted.sort((a, b) => {
      let va, vb;
      if (col === "teacher")  { va = a.teacher.name; vb = b.teacher.name; }
      if (col === "deadline") { va = new Date(a.deadline); vb = new Date(b.deadline); }
      if (col === "progress") { va = a.pct; vb = b.pct; }
      if (col === "status")   { va = a.status; vb = b.status; }
      if (va < vb) return dir==="asc" ? -1 : 1;
      if (va > vb) return dir==="asc" ?  1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRows, sort]);

  const toggleSort = (col) => {
    setSort(s => s.col===col ? { col, dir:s.dir==="asc"?"desc":"asc" } : { col, dir:"asc" });
  };
  const SortHdr = ({ col:c, label, style:st={} }) => {
    const active = sort.col===c;
    return (
      <div onClick={()=>toggleSort(c)} style={{ fontSize:10,fontWeight:700,color:active?C.brand:C.muted,textTransform:"uppercase",letterSpacing:".05em",cursor:"pointer",display:"flex",alignItems:"center",gap:3,userSelect:"none",...st }}>
        {label}
        <span style={{ fontSize:9,opacity:active?1:.3 }}>{active&&sort.dir==="desc"?"↓":"↑"}</span>
      </div>
    );
  };

  const overdueCt  = allRows.filter(r=>r.status!=="Completed"&&new Date(r.deadline)<new Date()).length;
  const notStartCt = allRows.filter(r=>r.status==="Not Started").length;

  // ── Bulk actions
  const allIds      = rows.map(r=>r.id);
  const allSelected = allIds.length > 0 && allIds.every(id=>selected.has(id));
  const toggleAll   = () => setSelected(s => allSelected ? new Set() : new Set(allIds));
  const toggleOne   = (id) => setSelected(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const handleRemind = (rows) => {
    const names = rows.slice(0,2).map(r=>r.teacher.name.split(" ")[0]).join(", ");
    const extra  = rows.length > 2 ? ` +${rows.length-2} more` : "";
    showToast(`✉ Reminder sent to ${names}${extra}`);
    setSelected(new Set());
  };

  const handleDeadlineSave = (assignId) => {
    if (editVal) {
      onUpdateDeadline(assignId, editVal);
      showToast("Deadline updated");
    }
    setEditDL(null);
    setEditVal("");
  };

  // ── Teacher profile drill-down
  if (profile !== null) {
    const t = teachers.find(x=>x.id===profile);
    if (!t) { setProfile(null); return null; }
    const ta = assignments.filter(a=>a.teacherId===t.id);
    return (
      <div>
        <button onClick={()=>setProfile(null)} style={{ fontSize:13,color:C.brand,fontWeight:700,background:"none",border:"none",cursor:"pointer",marginBottom:18,padding:0,display:"flex",alignItems:"center",gap:4 }}>← Back to Teachers</button>
        <div style={{ ...card,padding:"22px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:18 }}>
          <Av name={t.name} size={56} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20,fontWeight:800,color:C.ink,letterSpacing:"-.02em" }}>{t.name}</div>
            <div style={{ fontSize:13,color:C.muted,marginTop:3 }}>{t.email} · {t.phone}</div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginTop:8 }}>
              <StatusBadge status={t.status} />
              <span style={{ fontSize:12,color:C.muted }}>Joined {fmt(t.joinDate)} · {batchLabel(t.batchId,BATCHES)}</span>
            </div>
          </div>
          <button onClick={()=>setAssignOpen(null,t.id)} style={btn(C.brand,"#fff")}>+ Assign Course</button>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16 }}>
          <Kpi icon="📋" label="Courses Assigned" value={ta.length} />
          <Kpi icon="📊" label="Avg Completion"   value={ta.length>0?`${Math.round(ta.reduce((s,a)=>s+a.pct,0)/ta.length)}%`:"—"} accent={C.brand} />
          <Kpi icon="✅" label="Completed"        value={ta.filter(a=>a.status==="Completed").length} accent={C.green} />
        </div>
        <div style={{ ...card,padding:0,overflow:"hidden" }}>
          <div style={{ padding:"14px 20px",borderBottom:`1px solid ${C.line}`,fontSize:14,fontWeight:700,color:C.ink }}>Assigned Courses ({ta.length})</div>
          {ta.length===0 && <EmptyState icon="📚" title="No courses assigned" sub="Use the Assign Course button to get started." />}
          {ta.map(a=>{
            const c   = COURSES.find(x=>x.id===a.courseId);
            const cat = c ? CATEGORIES[c.cat] : { color:C.brand, bg:C.brand2 };
            if (!c) return null;
            const late  = new Date(a.deadline)<new Date()&&a.status!=="Completed";
            const hc    = healthColor(a.pct, a.status, a.deadline);
            return (
              <div key={a.id} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:`1px solid ${C.line}` }}>
                <div style={{ width:40,height:40,borderRadius:12,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:14,fontWeight:600,color:C.ink }}>{c.name}</div>
                  <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>Assigned {fmt(a.assignedDate)} · <span style={{ color:late?C.red:C.muted }}>Due {fmt(a.deadline)}{late?" ⚠":""}</span></div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
                    <div style={{ width:160 }}><PBar pct={a.pct} h={6} color={hc} /></div>
                    <span style={{ fontSize:12,fontWeight:700,color:hc }}>{a.pct}%</span>
                    <span style={{ fontSize:11,color:C.muted }}>{Math.round(a.pct/100*c.modules)}/{c.modules} modules</span>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Roster view
  const RosterView = () => {
    const assignedIds = new Set(assignments.map(a=>a.teacherId));
    return (
      <div style={{ ...card,padding:0,overflow:"hidden" }}>
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 100px",padding:"10px 20px",background:C.bg,borderBottom:`1px solid ${C.line}` }}>
          {["Teacher","Batch","Joined","Assignments","Status"].map(h=>(
            <div key={h} style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em" }}>{h}</div>
          ))}
        </div>
        {teachers.filter(t=> !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())).map((t,i,arr)=>{
          const assigned = assignments.filter(a=>a.teacherId===t.id).length;
          const isUnassigned = !assignedIds.has(t.id);
          return (
            <div key={t.id} onClick={()=>setProfile(t.id)}
              style={{ display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 100px",padding:"12px 20px",borderBottom:i<arr.length-1?`1px solid ${C.line}`:"none",alignItems:"center",cursor:"pointer",background:isUnassigned?"#fffbf7":"transparent",transition:"background .1s" }}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg}
              onMouseLeave={e=>e.currentTarget.style.background=isUnassigned?"#fffbf7":"transparent"}>
              <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
                <Av name={t.name} size={30} />
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.name}</div>
                  <div style={{ fontSize:11,color:C.muted }}>{t.email}</div>
                </div>
              </div>
              <div style={{ fontSize:12,color:C.ink3 }}>{batchLabel(t.batchId,BATCHES)}</div>
              <div style={{ fontSize:12,color:C.muted }}>{fmt(t.joinDate)}</div>
              <div style={{ fontSize:12,color:assigned>0?C.ink3:C.muted }}>
                {assigned > 0 ? `${assigned} course${assigned>1?"s":""}` : <span style={{ color:C.amber,fontWeight:600 }}>Unassigned</span>}
              </div>
              <StatusBadge status={t.status} />
            </div>
          );
        })}
      </div>
    );
  };

  const selectedRows = rows.filter(r=>selected.has(r.id));
  const needsAction  = rows.filter(r=>{
    const late = new Date(r.deadline)<new Date()&&r.status!=="Completed";
    return late || r.status==="Not Started";
  });

  return (
    <div>
      <Toast toast={toast} />
      <SectionHeader
        title="Teachers"
        sub={`${teachers.length} teachers · ${allRows.length} assignments · ${notStartCt} not started · ${overdueCt} overdue`}
        action={
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>setAssignOpen(null)} style={btn("#f1f5f9",C.ink3)}>Assign Course</button>
            <button onClick={onAddTeacher} style={btn(C.brand,"#fff")}>+ Add Teacher</button>
          </div>
        }
      />

      {/* Tab switcher */}
      <div style={{ display:"flex",gap:0,marginBottom:14,background:C.bg,borderRadius:10,padding:3,border:`1px solid ${C.line}`,width:"fit-content" }}>
        {[["assignments","Assignments"],["roster","All Teachers"]].map(([id,label])=>(
          <button key={id} onClick={()=>setView(id)}
            style={{ padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit",
              background:view===id?C.surface:"transparent",color:view===id?C.ink:C.muted,
              boxShadow:view===id?"0 1px 2px rgba(0,0,0,.08)":"none",transition:"all .12s" }}>
            {label}
            {id==="assignments" && <span style={{ marginLeft:6,fontSize:10,color:view===id?C.brand:C.muted }}>{allRows.length}</span>}
            {id==="roster"      && <span style={{ marginLeft:6,fontSize:10,color:view===id?C.brand:C.muted }}>{teachers.length}</span>}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ ...card,padding:"12px 16px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…" style={{ ...input,width:200,flexShrink:0 }} />
        {view==="assignments" && <>
          <div style={{ width:1,height:22,background:C.line,flexShrink:0 }} />
          <select value={cFilter} onChange={e=>setCFilter(e.target.value)} style={{ ...input,width:"auto",cursor:"pointer",flexShrink:0 }}>
            <option value="all">All Courses</option>
            {COURSES.filter(c=>c.status==="active").map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <div style={{ display:"flex",gap:4 }}>
            {[["all","All"],["In Progress","In Progress"],["Not Started","Not Started"],["overdue","Overdue"],["Completed","Completed"]].map(([val,label])=>{
              const active    = sFilter===val;
              const dotColor  = val==="In Progress"?C.brand:val==="Completed"?C.green:val==="overdue"?C.red:val==="Not Started"?C.muted:"transparent";
              return (
                <button key={val} onClick={()=>setSFilter(val)}
                  style={{ padding:"6px 10px",borderRadius:20,fontSize:11,fontWeight:600,border:`1.5px solid ${active?dotColor:C.line}`,cursor:"pointer",background:active?dotColor==="transparent"?C.brand:dotColor:"#fff",color:active?"#fff":C.ink3,transition:"all .12s",display:"flex",alignItems:"center",gap:4,fontFamily:"inherit" }}>
                  {val!=="all" && <span style={{ width:5,height:5,borderRadius:"50%",background:active?"rgba(255,255,255,.7)":dotColor,display:"inline-block",flexShrink:0 }} />}
                  {label}
                </button>
              );
            })}
          </div>
        </>}
        <span style={{ fontSize:12,color:C.muted,marginLeft:"auto",flexShrink:0 }}>
          {view==="assignments" ? `${rows.length} result${rows.length!==1?"s":""}` : `${teachers.length} teacher${teachers.length!==1?"s":""}`}
        </span>

        {/* Bulk remind bar */}
        {selected.size > 0 && (
          <div style={{ width:"100%",display:"flex",alignItems:"center",gap:10,marginTop:4,paddingTop:10,borderTop:`1px solid ${C.line}` }}>
            <span style={{ fontSize:12,fontWeight:600,color:C.ink }}>{selected.size} selected</span>
            <button onClick={()=>handleRemind(selectedRows)} style={{ ...btn(C.amber,"#fff",8),padding:"5px 14px",fontSize:12 }}>
              ✉ Send Reminder ({selected.size})
            </button>
            <button onClick={()=>setSelected(new Set())} style={{ ...btn("#f1f5f9",C.muted,8),padding:"5px 12px",fontSize:12 }}>Clear</button>
          </div>
        )}
      </div>

      {/* Roster view */}
      {view==="roster" && <RosterView />}

      {/* Assignments table */}
      {view==="assignments" && (
        <div style={{ ...card,padding:0,overflow:"hidden" }}>
          {/* Column headers with sort */}
          <div style={{ display:"grid",gridTemplateColumns:"32px 2fr 1.8fr 1fr 1fr 1.4fr 120px 80px",padding:"10px 20px",background:C.bg,borderBottom:`1px solid ${C.line}`,alignItems:"center" }}>
            <div>
              <div onClick={toggleAll} style={{ width:16,height:16,borderRadius:4,border:`2px solid ${allSelected?C.brand:C.line}`,background:allSelected?C.brand:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                {allSelected && <span style={{ color:"#fff",fontSize:10 }}>✓</span>}
              </div>
            </div>
            <SortHdr col="teacher"  label="Teacher" />
            <div style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em" }}>Course</div>
            <SortHdr col="deadline" label="Days Left" />
            <SortHdr col="progress" label="Progress" />
            <div style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em" }}>Deadline</div>
            <SortHdr col="status"   label="Status" />
            <div style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em" }}>Action</div>
          </div>

          {rows.length===0 && <EmptyState icon="👥" title="No results" sub="Try adjusting the course or status filter." />}

          {rows.map(r=>{
            const late = new Date(r.deadline)<new Date()&&r.status!=="Completed";
            const dl   = daysLeft(r.deadline);
            const hc   = healthColor(r.pct, r.status, r.deadline);
            const isSelected = selected.has(r.id);
            const needsRemind = late || r.status==="Not Started";
            const editingThis = editDL === r.id;

            return (
              <div key={r.id}
                style={{ display:"grid",gridTemplateColumns:"32px 2fr 1.8fr 1fr 1fr 1.4fr 120px 80px",padding:"11px 20px",borderBottom:`1px solid ${C.line}`,alignItems:"center",background:isSelected?"#fff7ed":r._pending?"#fffbf7":"transparent",transition:"background .1s" }}
                onMouseEnter={e=>{ if(!isSelected&&!r._pending) e.currentTarget.style.background=C.bg; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=isSelected?"#fff7ed":r._pending?"#fffbf7":"transparent"; }}>

                {/* Checkbox */}
                <div onClick={e=>{e.stopPropagation();toggleOne(r.id);}}
                  style={{ width:16,height:16,borderRadius:4,border:`2px solid ${isSelected?C.brand:C.line}`,background:isSelected?C.brand:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {isSelected && <span style={{ color:"#fff",fontSize:10 }}>✓</span>}
                </div>

                {/* Teacher */}
                <div onClick={()=>setProfile(r.teacher.id)} style={{ display:"flex",alignItems:"center",gap:8,minWidth:0,cursor:"pointer" }}>
                  {r._pending && <div style={{ width:6,height:6,borderRadius:"50%",background:C.brand,flexShrink:0 }} />}
                  <Av name={r.teacher.name} size={28} />
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.teacher.name}</div>
                    <div style={{ fontSize:10,color:C.muted }}>{batchLabel(r.teacher.batchId,BATCHES)}</div>
                  </div>
                </div>

                {/* Course */}
                <div style={{ display:"flex",alignItems:"center",gap:5,minWidth:0 }}>
                  <span style={{ fontSize:13,flexShrink:0 }}>{r.course.icon}</span>
                  <span style={{ fontSize:12,color:C.ink2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.course.name}</span>
                </div>

                {/* Days left */}
                <div>
                  {r.status==="Completed" ? (
                    <span style={{ fontSize:11,color:C.green,fontWeight:600 }}>Done</span>
                  ) : late ? (
                    <span style={{ fontSize:11,color:C.red,fontWeight:700 }}>{Math.abs(dl)}d overdue ⚠</span>
                  ) : (
                    <span style={{ fontSize:11,fontWeight:600,color:dl<=7?C.amber:dl<=14?C.ink3:C.muted }}>{dl}d left</span>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ flex:1 }}><PBar pct={r.pct} color={hc} /></div>
                  <span style={{ fontSize:11,fontWeight:700,color:hc,minWidth:34,flexShrink:0 }}>{r.pct}%</span>
                </div>

                {/* Deadline — clickable to edit inline */}
                <div>
                  {editingThis ? (
                    <div style={{ display:"flex",alignItems:"center",gap:4 }} onClick={e=>e.stopPropagation()}>
                      <input type="date" value={editVal} onChange={e=>setEditVal(e.target.value)}
                        style={{ ...input, padding:"4px 6px", fontSize:11, width:120 }} autoFocus />
                      <button onClick={()=>handleDeadlineSave(r.id)} style={{ ...btn(C.green,"#fff",6),padding:"4px 8px",fontSize:11 }}>✓</button>
                      <button onClick={()=>{setEditDL(null);setEditVal("");}} style={{ ...btn("#f1f5f9",C.muted,6),padding:"4px 6px",fontSize:11 }}>×</button>
                    </div>
                  ) : (
                    <span onClick={e=>{e.stopPropagation();setEditDL(r.id);setEditVal(r.deadline);}}
                      title="Click to edit deadline"
                      style={{ fontSize:11,color:late?C.red:C.muted,fontWeight:late?600:400,cursor:"pointer",textDecoration:"underline dotted",textUnderlineOffset:3 }}>
                      {fmt(r.deadline)}
                    </span>
                  )}
                </div>

                {/* Status badge */}
                <StatusBadge status={r.status} />

                {/* Inline remind button */}
                <div onClick={e=>e.stopPropagation()}>
                  {needsRemind ? (
                    <button onClick={()=>handleRemind([r])}
                      style={{ ...btn(late?C.red2:C.amber2,late?C.red:C.amber,6),padding:"4px 10px",fontSize:11,fontWeight:600 }}>
                      ✉ Remind
                    </button>
                  ) : (
                    <span style={{ fontSize:11,color:C.muted }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PAGE: ANALYTICS ─────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard", symbol:"◈" },
  { id:"courses",   label:"Courses",   symbol:"▣" },
  { id:"analytics", label:"Analytics", symbol:"▲" },
  { id:"teachers",  label:"Teachers",  symbol:"◯" },
];

function Analytics({ teachers, assignments }) {
  const [cid, setCid] = useState("c1");
  const c    = COURSES.find(x=>x.id===cid);
  const mods = MODULES[cid] || [];
  const dist = DIST[cid]    || [];

  const totalEnrolled = c.enrolled;
  const notStarted    = dist[0]?.n ?? 0;
  const completed     = c.completed;
  const inProgress    = totalEnrolled - notStarted - completed;
  const compPct       = totalEnrolled > 0 ? ((completed / totalEnrolled) * 100).toFixed(1) : 0;
  const onTrack       = assignments.filter(a=>a.courseId===cid&&a.status==="In Progress"&&daysLeft(a.deadline)>0).length;
  const atRisk        = assignments.filter(a=>a.courseId===cid&&a.status!=="Completed"&&daysLeft(a.deadline)<=0).length;

  const moduleRows = mods.map(([name, sp, cp, med, isQuiz], i) => {
    const dropoff    = sp > 0 ? +(sp - cp).toFixed(1) : 0;
    const dropoffPct = sp > 0 ? +((dropoff / sp) * 100).toFixed(1) : 0;
    const health     = sp === 0 ? "inactive" : dropoffPct > 15 ? "critical" : dropoffPct > 7 ? "warn" : "good";
    return { i, name, sp, cp, med, isQuiz, dropoff, dropoffPct, health };
  });
  const criticalMods = moduleRows.filter(m=>m.health==="critical").length;
  const avgDropoff   = moduleRows.filter(m=>m.sp>0).reduce((s,m)=>s+m.dropoffPct,0) / (moduleRows.filter(m=>m.sp>0).length||1);

  const funnelData = moduleRows.map(m => ({
    name: m.name.length > 22 ? m.name.slice(0,20)+"…" : m.name,
    reached: m.sp, completed: m.cp,
  }));
  const healthStyle = (h) => h==="critical" ? { color:C.red,   bg:C.red2,   label:"Critical" }
                           : h==="warn"     ? { color:C.amber, bg:C.amber2, label:"Watch" }
                           : h==="good"     ? { color:C.green, bg:C.green2, label:"Good" }
                           : { color:C.muted, bg:"#f1f5f9", label:"Inactive" };

  return (
    <div>
      <SectionHeader title="Analytics" sub="Module-level insight by course" />

      {/* Course picker */}
      <div style={{ ...card,padding:"12px 16px",marginBottom:18,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
        <span style={{ fontSize:12,color:C.muted,fontWeight:600,marginRight:4,flexShrink:0 }}>Course:</span>
        {COURSES.filter(c=>c.status==="active").map(course=>{
          const cat    = CATEGORIES[course.cat];
          const active = cid===course.id;
          return (
            <button key={course.id} onClick={()=>setCid(course.id)}
              style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,fontSize:12,fontWeight:600,border:`1.5px solid ${active?cat.color:C.line}`,cursor:"pointer",background:active?cat.bg:"transparent",color:active?cat.color:C.ink3,transition:"all .12s",fontFamily:"inherit",flexShrink:0 }}>
              <span style={{ fontSize:13 }}>{course.icon}</span>{course.name}
            </button>
          );
        })}
      </div>

      {c.status==="draft" ? (
        <EmptyState icon="🧠" title="Draft Course" sub="Publish this course to see analytics." />
      ) : <>
        {/* 3 KPIs: Enrolled + Completion Rate + At Risk */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18 }}>
          <Kpi icon="👥" label="Enrolled"       value={totalEnrolled.toLocaleString()} sub={`${inProgress.toLocaleString()} in progress`} />
          <Kpi icon="🎓" label="Completion Rate" value={`${compPct}%`} sub={`${completed.toLocaleString()} of ${totalEnrolled.toLocaleString()} completed`} accent={C.green} />
          <Kpi icon="⚠" label="At Risk"         value={atRisk} sub={`overdue · ${onTrack} on track`} accent={atRisk>0?C.red:C.muted} />
        </div>

        {/* Funnel chart */}
        <div style={{ ...card,padding:"18px 20px",marginBottom:18 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.ink }}>Module Funnel</div>
            <div style={{ display:"flex",gap:14 }}>
              {[["#e0edff","Reached"],["#dcfce7","Completed"]].map(([bg,label])=>(
                <div key={label} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.muted }}>
                  <div style={{ width:10,height:10,borderRadius:2,background:bg,border:`1px solid ${C.line}` }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(200,mods.length*28)}>
            <BarChart data={funnelData} layout="vertical" margin={{ left:8,right:20,top:0,bottom:0 }} barCategoryGap="30%">
              <XAxis type="number" domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{ fontSize:10,fill:C.muted }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize:11,fill:C.ink3 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v,n)=>[`${v}%`,n==="reached"?"Reached":"Completed"]} contentStyle={{ fontSize:12,borderRadius:8,border:`1px solid ${C.line}` }} />
              <Bar dataKey="reached"   fill="#e0edff" radius={[0,4,4,0]} />
              <Bar dataKey="completed" fill="#dcfce7" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Module health table */}
        <div style={{ ...card,padding:0,overflow:"hidden" }}>
          <div style={{ padding:"14px 20px",borderBottom:`1px solid ${C.line}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.ink }}>Module Health</div>
            <div style={{ display:"flex",gap:10,fontSize:11,color:C.muted }}>
              {criticalMods>0 && <span style={{ color:C.red,fontWeight:600 }}>{criticalMods} critical</span>}
              <span>avg drop-off {avgDropoff.toFixed(1)}%</span>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"28px 1.8fr 1fr 1fr 90px 80px 72px",padding:"10px 20px",background:C.bg,borderBottom:`1px solid ${C.line}` }}>
            {["#","Module","Reached","Completed","Drop-off","Med. Time","Health"].map(h=>(
              <div key={h} style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em" }}>{h}</div>
            ))}
          </div>
          {moduleRows.map((m,i)=>{
            const hs = healthStyle(m.health);
            return (
              <div key={i} style={{ display:"grid",gridTemplateColumns:"28px 1.8fr 1fr 1fr 90px 80px 72px",gap:0,padding:"12px 20px",borderBottom:`1px solid ${C.line}`,alignItems:"center",background:m.health==="inactive"?"#fafafa":"transparent" }}>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <div style={{ width:20,height:20,borderRadius:6,background:m.isQuiz?C.blue2:C.brand2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:m.isQuiz?C.blue:C.brand }}>
                    {m.isQuiz?"Q":m.i+1}
                  </div>
                </div>
                <div style={{ paddingRight:12 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:m.health==="inactive"?C.muted:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.name}</div>
                  <div style={{ fontSize:10,color:C.muted,marginTop:1 }}>{m.isQuiz?"Assessment":"Content"}</div>
                </div>
                <div style={{ paddingRight:12 }}>
                  {m.sp > 0 ? <div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:60 }}><PBar pct={m.sp} h={5} /></div><span style={{ fontSize:12,fontWeight:700,color:C.brand }}>{m.sp}%</span></div> : <span style={{ fontSize:12,color:C.muted }}>—</span>}
                </div>
                <div style={{ paddingRight:12 }}>
                  {m.cp > 0 ? <div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:60 }}><PBar pct={m.cp} h={5} color={C.green} /></div><span style={{ fontSize:12,fontWeight:700,color:C.green }}>{m.cp}%</span></div> : <span style={{ fontSize:12,color:C.muted }}>—</span>}
                </div>
                <div>
                  {m.sp > 0 ? <span style={{ fontSize:13,fontWeight:700,color:m.dropoffPct>15?C.red:m.dropoffPct>7?C.amber:C.muted }}>{m.dropoffPct > 0 ? `−${m.dropoffPct}%` : "—"}</span> : <span style={{ fontSize:12,color:C.muted }}>—</span>}
                </div>
                <div style={{ fontSize:12,color:m.med>0?C.ink3:C.muted }}>{m.med > 0 ? `${m.med} min` : "—"}</div>
                <div><span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:10,background:hs.bg,color:hs.color }}>{hs.label}</span></div>
              </div>
            );
          })}
        </div>
      </>}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,           setTab]           = useState("dashboard");
  const [teachers,      setTeachers]      = useState(INIT_TEACHERS);
  const [assignments,   setAssignments]   = useState(INIT_ASSIGNMENTS);
  const [assignModal,   setAssignModal]   = useState(null);
  const [addTeacher,    setAddTeacher]    = useState(false);
  const [syncStatus,    setSyncStatus]    = useState("idle");
  const [lastSynced,    setLastSynced]    = useState(LAST_PULL);
  // Pre-filter for Teachers page, set by Dashboard KPI clicks
  const [teacherFilter, setTeacherFilter] = useState(null);

  const pendingTeachers    = useMemo(()=>teachers.filter(t=>t._pending).length,    [teachers]);
  const pendingAssignments = useMemo(()=>assignments.filter(a=>a._pending).length, [assignments]);

  const openAssign = (courseId=null, teacherId=null) => setAssignModal({ courseId, teacherId });

  // Dashboard KPI click → navigate to Teachers with preset filter
  const handleFilterTeachers = (filter) => {
    setTeacherFilter({ ...filter, _ts: Date.now() }); // _ts forces useEffect to re-run even if same filter
    setTab("teachers");
  };

  const handleAssign = (cid, tids, deadline) => {
    const today = new Date().toISOString().split("T")[0];
    const toAdd = tids.map(tid => ({
      id: Date.now() + tid, teacherId:tid, courseId:cid,
      assignedDate:today, deadline, pct:0, status:"Not Started", _pending:true,
    }));
    setAssignments(prev => [...toAdd, ...prev]);
    setTab("teachers");
  };

  const handleAddTeacher = (form) => {
    setTeachers(prev => [...prev, {
      id:Date.now(), name:form.name.trim(), email:form.email.trim(),
      phone:form.phone.trim()||"—", batchId:form.batchId, joinDate:form.joinDate,
      pct:0, status:"Not Started", _pending:true,
    }]);
    setAddTeacher(false);
  };

  const handleUpdateDeadline = (assignId, newDate) => {
    setAssignments(prev => prev.map(a => a.id===assignId ? { ...a, deadline:newDate, _pending:true } : a));
  };

  const handlePull = () => {
    setSyncStatus("pulling");
    setTimeout(() => {
      setTeachers(prev   => prev.map(t=>({...t,_pending:false})));
      setAssignments(prev => prev.map(a=>({...a,_pending:false})));
      setLastSynced("Just now"); setSyncStatus("done");
      setTimeout(()=>setSyncStatus("idle"), 2500);
    }, 1400);
  };

  const handlePush = () => {
    if (pendingTeachers + pendingAssignments === 0) return;
    setSyncStatus("pushing");
    setTimeout(() => {
      setTeachers(prev   => prev.map(t=>({...t,_pending:false})));
      setAssignments(prev => prev.map(a=>({...a,_pending:false})));
      setLastSynced("Just now"); setSyncStatus("done");
      setTimeout(()=>setSyncStatus("idle"), 2500);
    }, 1600);
  };

  return (
    <div style={{ display:"flex", background:C.bg, fontFamily:"'DM Sans','Nunito',system-ui,sans-serif", minHeight:600 }}>
      {/* Sidebar */}
      <div style={{ width:210, background:C.surface, borderRight:`1px solid ${C.line}`, display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
        <div style={{ padding:"20px 18px 16px", borderBottom:`1px solid ${C.line}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🎓</div>
            <div>
              <div style={{ fontSize:14,fontWeight:800,color:C.ink,letterSpacing:"-.02em" }}>TrainOS</div>
              <div style={{ fontSize:10,color:C.muted,letterSpacing:".02em" }}>Admin Console</div>
            </div>
          </div>
        </div>
        <nav style={{ padding:"10px 8px", flex:1 }}>
          {NAV.map(n=>{
            const active = tab===n.id;
            return (
              <button key={n.id} onClick={()=>setTab(n.id)}
                style={{ display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 12px",borderRadius:10,border:"none",cursor:"pointer",marginBottom:2,background:active?C.brand2:"transparent",color:active?C.brand:C.ink3,fontWeight:active?700:500,fontSize:13,textAlign:"left",transition:"all .12s",fontFamily:"inherit" }}>
                <span style={{ fontSize:12,opacity:.7 }}>{n.symbol}</span>
                {n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.line}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <Av name="Suneet Jagdev" size={28} />
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:C.ink }}>Suneet J.</div>
              <div style={{ fontSize:10,color:C.muted }}>Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1,padding:"24px 32px",overflowY:"auto",minHeight:"100vh" }}>
        <SyncBar
          syncStatus={syncStatus} lastSynced={lastSynced}
          pendingTeachers={pendingTeachers} pendingAssignments={pendingAssignments}
          onPull={handlePull} onPush={handlePush}
        />
        {tab==="dashboard" && <Dashboard teachers={teachers} assignments={assignments} onFilterTeachers={handleFilterTeachers} />}
        {tab==="courses"   && <Courses   setTab={setTab} setAssignOpen={openAssign} />}
        {tab==="analytics" && <Analytics teachers={teachers} assignments={assignments} />}
        {tab==="teachers"  && <Teachers
          teachers={teachers} assignments={assignments}
          setAssignOpen={openAssign} onAddTeacher={()=>setAddTeacher(true)}
          onUpdateDeadline={handleUpdateDeadline}
          initialFilter={teacherFilter}
        />}
      </div>

      {assignModal!==null && <AssignModal teachers={teachers} batches={BATCHES} preTeacherId={assignModal.teacherId} preCourseId={assignModal.courseId} onClose={()=>setAssignModal(null)} onAssign={handleAssign} />}
      {addTeacher && <AddTeacherModal batches={BATCHES} onClose={()=>setAddTeacher(false)} onAdd={handleAddTeacher} />}
    </div>
  );
}

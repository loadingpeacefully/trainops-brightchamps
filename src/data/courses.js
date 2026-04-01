import { C } from '@data/theme';

export const CATEGORIES = {
  coding:  { label:"Coding",        color:C.blue,   lo:C.blueLo,   bg:"#eff6ff" },
  maths:   { label:"Maths",         color:C.brand,  lo:C.brandLo,  bg:"#fff7ed" },
  finlit:  { label:"Fin. Literacy", color:C.green,  lo:C.greenLo,  bg:"#f0fdf4" },
  robotics:{ label:"Robotics",      color:C.purple, lo:C.purpleLo, bg:"#f5f3ff" },
};

export const COURSES = [
  {id:"c1", cat:"coding",  icon:"🐍",name:"Intro to Python",           modules:13,status:"active",enrolled:0,completed:0,avg:0,desc:"Variables · loops · functions · first programs"},
  {id:"c2", cat:"coding",  icon:"🌐",name:"Web Dev Basics",            modules:10,status:"active",enrolled:0,completed:0,avg:0,desc:"HTML · CSS · JavaScript · responsive layouts"},
  {id:"c3", cat:"coding",  icon:"🎮",name:"App Building with Scratch", modules:8, status:"active",enrolled:0,completed:0,avg:0,desc:"Visual programming · game design · logic blocks"},
  {id:"c4", cat:"coding",  icon:"⚙️",name:"Advanced Algorithms",       modules:12,status:"active",enrolled:634, completed:89, avg:31.0,desc:"Sorting · recursion · time complexity · DSA"},
  {id:"c5", cat:"maths",   icon:"📐",name:"Foundation Math Teaching",  modules:9, status:"active",enrolled:0,completed:0,avg:0,desc:"Number sense · operations · pedagogy framework"},
  {id:"c6", cat:"maths",   icon:"🎯",name:"Demo Class Math Mastery",   modules:8, status:"active",enrolled:0,completed:0,avg:0,desc:"Live class tactics · concept delivery · Q&A flow"},
  {id:"c7", cat:"maths",   icon:"🧮",name:"Math Problem Solving",      modules:6, status:"active",enrolled:987, completed:445,avg:74.2,desc:"Problem framing · heuristics · worked examples"},
  {id:"c8", cat:"finlit",  icon:"💰",name:"Money Basics for Kids",     modules:5, status:"active",enrolled:743, completed:521,avg:82.4,desc:"Saving · budgeting · needs vs wants · allowances"},
  {id:"c9", cat:"finlit",  icon:"📈",name:"Investing & Entrepreneurship",modules:7,status:"active",enrolled:412,completed:78, avg:35.2,desc:"Compound interest · business models · pitch skills"},
  {id:"c10",cat:"robotics",icon:"🤖",name:"Intro to Robotics",         modules:8, status:"active",enrolled:891, completed:203,avg:54.7,desc:"Sensors · actuators · build-a-bot · basic control"},
  {id:"c11",cat:"robotics",icon:"🔌",name:"Arduino & Sensors",         modules:11,status:"active",enrolled:445, completed:67, avg:28.9,desc:"Circuit design · breadboarding · sensor programming"},
  {id:"c12",cat:"robotics",icon:"🏆",name:"Robotics Competition Prep", modules:6, status:"active",enrolled:234, completed:112,avg:67.5,desc:"Strategy · autonomous routines · scoring systems"},
  {id:"c13",cat:"coding",  icon:"🧠",name:"AI & Machine Learning",     modules:10,status:"draft", enrolled:0,   completed:0,  avg:0,   desc:"Neural nets · training data · model evaluation"},
];

export const MODULES = {
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

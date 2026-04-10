import { C } from '@data/theme';

export const CATEGORIES = {
  coding:  { label:"Coding",        color:C.blue,   bg:"#eff6ff" },
  maths:   { label:"Maths",         color:C.brand,  bg:"#fff7ed" },
  finlit:  { label:"Fin. Literacy", color:C.green,  bg:"#f0fdf4" },
  robotics:{ label:"Robotics",      color:C.purple, bg:"#f5f3ff" },
};

export const COURSES = [
  {id:"c1", cat:"coding",  icon:"🐍",name:"Intro to Python",           modules:13,status:"active",enrolled:0,completed:0,avg:0,desc:"Variables · loops · functions · first programs"},
  {id:"c2", cat:"coding",  icon:"🌐",name:"Web Dev Basics",            modules:10,status:"active",enrolled:0,completed:0,avg:0,desc:"HTML · CSS · JavaScript · responsive layouts"},
  {id:"c3", cat:"coding",  icon:"🎮",name:"App Building with Scratch", modules:8, status:"active",enrolled:0,completed:0,avg:0,desc:"Visual programming · game design · logic blocks"},
  {id:"c4", cat:"coding",  icon:"⚙️",name:"Advanced Algorithms",       modules:12,status:"active",enrolled:0,completed:0,avg:0,desc:"Sorting · recursion · time complexity · DSA"},
  {id:"c5", cat:"maths",   icon:"📐",name:"Foundation Math Teaching",  modules:9, status:"active",enrolled:0,completed:0,avg:0,desc:"Number sense · operations · pedagogy framework"},
  {id:"c6", cat:"maths",   icon:"🎯",name:"Demo Class Math Mastery",   modules:8, status:"active",enrolled:0,completed:0,avg:0,desc:"Live class tactics · concept delivery · Q&A flow"},
  {id:"c7", cat:"maths",   icon:"🧮",name:"Math Problem Solving",      modules:6, status:"active",enrolled:0,completed:0,avg:0,desc:"Problem framing · heuristics · worked examples"},
  {id:"c8", cat:"finlit",  icon:"💰",name:"Money Basics for Kids",     modules:5, status:"active",enrolled:0,completed:0,avg:0,desc:"Saving · budgeting · needs vs wants · allowances"},
  {id:"c9", cat:"finlit",  icon:"📈",name:"Investing & Entrepreneurship",modules:7,status:"active",enrolled:0,completed:0,avg:0,desc:"Compound interest · business models · pitch skills"},
  {id:"c10",cat:"robotics",icon:"🤖",name:"Intro to Robotics",         modules:8, status:"active",enrolled:0,completed:0,avg:0,desc:"Sensors · actuators · build-a-bot · basic control"},
  {id:"c11",cat:"robotics",icon:"🔌",name:"Arduino & Sensors",         modules:11,status:"active",enrolled:0,completed:0,avg:0,desc:"Circuit design · breadboarding · sensor programming"},
  {id:"c12",cat:"robotics",icon:"🏆",name:"Robotics Competition Prep", modules:6, status:"active",enrolled:0,completed:0,avg:0,desc:"Strategy · autonomous routines · scoring systems"},
  {id:"c13",cat:"coding",  icon:"🧠",name:"AI & Machine Learning",     modules:10,status:"draft", enrolled:0,   completed:0,  avg:0,   desc:"Neural nets · training data · model evaluation"},
];

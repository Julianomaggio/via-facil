import { spawn } from 'node:child_process';
const server=spawn(process.execPath,['server.js'],{stdio:['ignore','pipe','pipe']});
let output='';server.stdout.on('data',d=>output+=d);server.stderr.on('data',d=>output+=d);
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
try{await wait(1200);const res=await fetch('http://127.0.0.1:5173/api/health');const data=await res.json();if(!data.ok)throw new Error('Health check falhou');console.log('OK: servidor e API funcionando.')}finally{server.kill()}

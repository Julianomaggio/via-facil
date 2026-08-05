import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 5173);
const SECRET = process.env.JWT_SECRET || 'via-facil-dev-secret-change-in-production';

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const cleanUser = ({ passwordHash, salt, ...user }) => user;
const json = (res, status, data) => {res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};

async function readDb(){return JSON.parse(await fs.readFile(DB_PATH,'utf8'));}
async function writeDb(db){await fs.writeFile(DB_PATH,JSON.stringify(db,null,2));}
function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){const hash=crypto.scryptSync(password,salt,64).toString('hex');return {salt,passwordHash:hash};}
function verifyPassword(password,user){return crypto.timingSafeEqual(Buffer.from(hashPassword(password,user.salt).passwordHash,'hex'),Buffer.from(user.passwordHash,'hex'));}
function sign(payload){const body=Buffer.from(JSON.stringify({...payload,exp:Date.now()+7*86400000})).toString('base64url');const sig=crypto.createHmac('sha256',SECRET).update(body).digest('base64url');return `${body}.${sig}`;}
function verify(token){const [body,sig]=String(token||'').split('.');if(!body||!sig)return null;const expected=crypto.createHmac('sha256',SECRET).update(body).digest('base64url');if(sig!==expected)return null;const payload=JSON.parse(Buffer.from(body,'base64url').toString());return payload.exp>Date.now()?payload:null;}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1e6)throw new Error('Payload muito grande');}return raw?JSON.parse(raw):{};}
function auth(req){return verify(req.headers.authorization?.replace(/^Bearer\s+/i,''));}

async function seed(){const db=await readDb();if(db.users.length)return;const adminId=id('usr'),driverId=id('usr');const a=hashPassword('admin123'),d=hashPassword('motorista123');db.users.push({id:adminId,name:'Administrador Via Fácil',email:'admin@viafacil.com',phone:'(00) 90000-0000',role:'admin',rating:5,verified:true,...a,createdAt:now()},{id:driverId,name:'Carlos Motorista',email:'motorista@viafacil.com',phone:'(00) 98888-0000',role:'driver',rating:4.9,verified:true,vehicle:'Chevrolet Onix • ABC1D23',...d,createdAt:now()});const date=(n)=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);db.rides.push({id:id('ride'),driverId,origin:'Centro',destination:'Aeroporto',date:date(1),time:'08:00',seats:3,availableSeats:3,price:28,vehicle:'Chevrolet Onix',notes:'Uma parada rápida no caminho.',status:'active',createdAt:now()},{id:id('ride'),driverId,origin:'Rodoviária',destination:'Centro',date:date(2),time:'17:30',seats:4,availableSeats:4,price:18,vehicle:'Chevrolet Onix',notes:'Bagagem pequena permitida.',status:'active',createdAt:now()});await writeDb(db);}

async function api(req,res,url){
  const user=auth(req);const db=await readDb();const method=req.method;
  if(method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,app:'Via Fácil'});
  if(method==='POST'&&url.pathname==='/api/auth/register'){const data=await body(req);if(!data.name||!data.email||!data.password)return json(res,400,{error:'Nome, e-mail e senha são obrigatórios.'});if(db.users.some(u=>u.email.toLowerCase()===data.email.toLowerCase()))return json(res,409,{error:'Este e-mail já está cadastrado.'});const pass=hashPassword(data.password);const newUser={id:id('usr'),name:data.name.trim(),email:data.email.trim().toLowerCase(),phone:data.phone?.trim()||'',role:['passenger','driver'].includes(data.role)?data.role:'passenger',rating:5,verified:false,...pass,createdAt:now()};db.users.push(newUser);await writeDb(db);return json(res,201,{token:sign({id:newUser.id,role:newUser.role,name:newUser.name}),user:cleanUser(newUser)});}
  if(method==='POST'&&url.pathname==='/api/auth/login'){const data=await body(req);const found=db.users.find(u=>u.email.toLowerCase()===String(data.email||'').toLowerCase());if(!found||!verifyPassword(data.password||'',found))return json(res,401,{error:'E-mail ou senha incorretos.'});return json(res,200,{token:sign({id:found.id,role:found.role,name:found.name}),user:cleanUser(found)});}
  if(method==='GET'&&url.pathname==='/api/rides'){const origin=url.searchParams.get('origin')||'',destination=url.searchParams.get('destination')||'',date=url.searchParams.get('date')||'';const rides=db.rides.filter(r=>r.status==='active').filter(r=>!origin||r.origin.toLowerCase().includes(origin.toLowerCase())).filter(r=>!destination||r.destination.toLowerCase().includes(destination.toLowerCase())).filter(r=>!date||r.date===date).map(r=>({...r,driver:cleanUser(db.users.find(u=>u.id===r.driverId)||{})})).sort((a,b)=>`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));return json(res,200,{rides});}
  if(!user)return json(res,401,{error:'Faça login para continuar.'});
  if(method==='GET'&&url.pathname==='/api/me'){const found=db.users.find(u=>u.id===user.id);return json(res,200,{user:cleanUser(found)});}
  if(method==='POST'&&url.pathname==='/api/rides'){const data=await body(req);if(!data.origin||!data.destination||!data.date||!data.time||!data.seats||data.price===undefined)return json(res,400,{error:'Preencha todos os campos obrigatórios.'});const ride={id:id('ride'),driverId:user.id,origin:data.origin,destination:data.destination,date:data.date,time:data.time,seats:Number(data.seats),availableSeats:Number(data.seats),price:Number(data.price),vehicle:data.vehicle||'Veículo não informado',notes:data.notes||'',status:'active',createdAt:now()};db.rides.push(ride);await writeDb(db);return json(res,201,{ride});}
  const bookMatch=url.pathname.match(/^\/api\/rides\/([^/]+)\/book$/);if(method==='POST'&&bookMatch){const data=await body(req),seats=Number(data.seats||1),ride=db.rides.find(r=>r.id===bookMatch[1]);if(!ride||ride.status!=='active')return json(res,404,{error:'Carona não encontrada.'});if(ride.driverId===user.id)return json(res,400,{error:'Você não pode reservar sua própria carona.'});if(seats<1||seats>ride.availableSeats)return json(res,400,{error:'Quantidade de vagas indisponível.'});const booking={id:id('book'),rideId:ride.id,passengerId:user.id,seats,total:seats*ride.price,status:'confirmed',createdAt:now()};ride.availableSeats-=seats;db.bookings.push(booking);await writeDb(db);return json(res,201,{booking});}
  if(method==='GET'&&url.pathname==='/api/my/bookings')return json(res,200,{bookings:db.bookings.filter(b=>b.passengerId===user.id).map(b=>({...b,ride:db.rides.find(r=>r.id===b.rideId)}))});
  const cancelMatch=url.pathname.match(/^\/api\/bookings\/([^/]+)\/cancel$/);if(method==='PATCH'&&cancelMatch){const booking=db.bookings.find(b=>b.id===cancelMatch[1]&&b.passengerId===user.id);if(!booking)return json(res,404,{error:'Reserva não encontrada.'});if(booking.status!=='cancelled'){booking.status='cancelled';const ride=db.rides.find(r=>r.id===booking.rideId);if(ride)ride.availableSeats+=booking.seats;await writeDb(db);}return json(res,200,{booking});}
  if(method==='POST'&&url.pathname==='/api/deliveries'){const data=await body(req);if(!data.pickup||!data.destination||!data.date||!data.time||!data.packageType||!data.recipient)return json(res,400,{error:'Preencha todos os campos obrigatórios.'});const delivery={id:id('del'),customerId:user.id,pickup:data.pickup,destination:data.destination,date:data.date,time:data.time,packageType:data.packageType,recipient:data.recipient,phone:data.phone||'',notes:data.notes||'',status:'requested',trackingCode:`VF${Math.random().toString(36).slice(2,8).toUpperCase()}`,createdAt:now()};db.deliveries.push(delivery);await writeDb(db);return json(res,201,{delivery});}
  if(method==='GET'&&url.pathname==='/api/my/deliveries')return json(res,200,{deliveries:db.deliveries.filter(d=>d.customerId===user.id)});
  if(method==='GET'&&url.pathname==='/api/admin/summary'){if(user.role!=='admin')return json(res,403,{error:'Acesso restrito ao administrador.'});return json(res,200,{users:db.users.length,rides:db.rides.length,bookings:db.bookings.length,deliveries:db.deliveries.length,revenue:db.bookings.filter(b=>b.status==='confirmed').reduce((s,b)=>s+b.total,0)});}
  return json(res,404,{error:'Rota não encontrada.'});
}

async function serve(req,res,url){let pathname=decodeURIComponent(url.pathname);if(pathname==='/')pathname='/index.html';let file=path.normalize(path.join(PUBLIC_DIR,pathname));if(!file.startsWith(PUBLIC_DIR))return json(res,403,{error:'Acesso negado.'});try{const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{const data=await fs.readFile(path.join(PUBLIC_DIR,'index.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(data);}}

await seed();
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,`http://${req.headers.host||'127.0.0.1'}`);if(url.pathname.startsWith('/api/'))await api(req,res,url);else await serve(req,res,url);}catch(err){console.error(err);json(res,500,{error:'Erro interno do servidor.'});}});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\nVIA FÁCIL disponível na porta ${PORT}\n`);
});
// ---------- Custom cursor / reticle ----------
const reticle = document.getElementById('reticle');
const dot = document.getElementById('reticle-dot');
let mx = window.innerWidth/2, my = window.innerHeight/2;
window.addEventListener('mousemove', (e)=>{
  mx = e.clientX; my = e.clientY;
  dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
});
function animateReticle(){
  reticle.style.left = mx + 'px';
  reticle.style.top = my + 'px';
  requestAnimationFrame(animateReticle);
}
animateReticle();
document.querySelectorAll('a, .project-card, .tag-cloud span').forEach(el=>{
  el.addEventListener('mouseenter', ()=> reticle.classList.add('active'));
  el.addEventListener('mouseleave', ()=> reticle.classList.remove('active'));
});

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold:0.15 });
revealEls.forEach(el=> io.observe(el));

const tagClouds = document.querySelectorAll('.tag-cloud');
const io2 = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io2.unobserve(entry.target);
    }
  });
}, { threshold:0.2 });
tagClouds.forEach(el=> io2.observe(el));

// stagger tag animation delays
document.querySelectorAll('.tag-cloud').forEach(cloud=>{
  [...cloud.children].forEach((span,i)=>{
    span.style.transitionDelay = (i*0.04)+'s';
  });
});
document.querySelectorAll('.det-label').forEach((label,i)=>{
  label.style.animationDelay = (0.4 + i*0.18)+'s';
});

// ---------- Project card 3D tilt ----------
document.querySelectorAll('.project-card').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left)/rect.width - 0.5;
    const py = (e.clientY - rect.top)/rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${py*-3}deg) rotateY(${px*3}deg) translateZ(0)`;
  });
  card.addEventListener('mouseleave', ()=>{
    card.style.transform = '';
    card.style.transition = 'transform .5s ease';
  });
  card.addEventListener('mouseenter', ()=>{ card.style.transition = 'none'; });
});

// ---------- Particle / node network canvas ----------
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [];
const NODE_COUNT = window.innerWidth < 700 ? 40 : 85;
const LINK_DIST = 130;
const MOUSE_RADIUS = 160;
let mouseX = -9999, mouseY = -9999;

function resize(){
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resize);

function initNodes(){
  nodes = [];
  for(let i=0;i<NODE_COUNT;i++){
    nodes.push({
      x: Math.random()*W,
      y: Math.random()*H,
      vx: (Math.random()-0.5)*0.25,
      vy: (Math.random()-0.5)*0.25
    });
  }
}

document.getElementById('hero').addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});
document.getElementById('hero').addEventListener('mouseleave', ()=>{
  mouseX = -9999; mouseY = -9999;
});

function drawFrame(){
  ctx.clearRect(0,0,W,H);
  // update
  nodes.forEach(n=>{
    n.x += n.vx; n.y += n.vy;
    if(n.x < 0 || n.x > W) n.vx *= -1;
    if(n.y < 0 || n.y > H) n.vy *= -1;
  });
  // links
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const a = nodes[i], b = nodes[j];
      const dx = a.x-b.x, dy = a.y-b.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < LINK_DIST){
        const opacity = (1 - dist/LINK_DIST) * 0.28;
        ctx.strokeStyle = `rgba(242,169,59,${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
    // mouse proximity glow line
    const dxm = nodes[i].x - mouseX, dym = nodes[i].y - mouseY;
    const dm = Math.sqrt(dxm*dxm + dym*dym);
    if(dm < MOUSE_RADIUS){
      const opacity = (1 - dm/MOUSE_RADIUS) * 0.55;
      ctx.strokeStyle = `rgba(242,169,59,${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    }
  }
  // nodes
  nodes.forEach(n=>{
    const dxm = n.x-mouseX, dym = n.y-mouseY;
    const dm = Math.sqrt(dxm*dxm+dym*dym);
    const near = dm < MOUSE_RADIUS;
    ctx.fillStyle = near ? 'rgba(242,169,59,0.9)' : 'rgba(242,169,59,0.45)';
    ctx.beginPath();
    ctx.arc(n.x, n.y, near ? 2.2 : 1.4, 0, Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(drawFrame);
}

resize();
initNodes();
drawFrame();

// ---------- Active nav link on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', ()=>{
  let current = '';
  sections.forEach(sec=>{
    const rect = sec.getBoundingClientRect();
    if(rect.top <= 120 && rect.bottom >= 120) current = sec.id;
  });
  navLinks.forEach(link=>{
    link.style.color = link.getAttribute('href') === '#'+current ? 'var(--text)' : '';
  });
});

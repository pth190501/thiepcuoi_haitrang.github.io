/**
 * Wedding Gate + Scroll Animations + Slider + Countdown + Calendar + Music Toggle
 */

const WEDDING_DATE_ISO = "2026-01-22T10:00:00+07:00"; // sửa giờ/ngày tại đây

// ---------- Gate ----------
const gate = document.getElementById("gate");
const enterBtn = document.getElementById("enterBtn");
const toggleMusicGate = document.getElementById("toggleMusicGate");

const bgMusic = document.getElementById("bgMusic");
const toggleMusic = document.getElementById("toggleMusic");
const musicText = document.getElementById("musicText");

let musicOn = false;

async function safePlayMusic(){
  try{
    // Nếu bạn chưa thay assets/music.mp3 thì sẽ không phát được (file placeholder rỗng)
    await bgMusic.play();
    musicOn = true;
    musicText.textContent = "Nhạc: ON";
  }catch(err){
    // Autoplay blocked / missing file
    musicOn = false;
    musicText.textContent = "Nhạc: OFF";
  }
}

function stopMusic(){
  try{ bgMusic.pause(); }catch(e){}
  musicOn = false;
  musicText.textContent = "Nhạc: OFF";
}

enterBtn.addEventListener("click", async () => {
  if (!gate) return;

  // Start opening animation
  gate.classList.add("is-opening");

  // Play music
  if (!musicOn) await safePlayMusic();

  // Block interaction immediately
  gate.style.pointerEvents = "none";

  // Sau khi animation cửa chạy xong
  setTimeout(() => {
    gate.classList.add("is-hidden");
    gate.setAttribute("aria-hidden", "true");

    // 🔥 FORCE CLEAR overlay / blur / GPU layer
    gate.style.backdropFilter = "none";
    gate.style.webkitBackdropFilter = "none";
    gate.style.opacity = "0";

    // 🔥 Force browser repaint
    gate.getBoundingClientRect();

    // 🔥 Remove khỏi layout hoàn toàn
    setTimeout(() => {
      gate.style.display = "none";
    }, 150);

  }, 1000); // khớp animation ~900ms
});

toggleMusicGate.addEventListener("click", async () => {
  if (!musicOn) await safePlayMusic();
  else stopMusic();
});

toggleMusic.addEventListener("click", async () => {
  if (!musicOn) await safePlayMusic();
  else stopMusic();
});

// ---------- Clock (góc phải dưới) ----------
const nowClock = document.getElementById("nowClock");
function pad2(n){ return String(n).padStart(2,"0"); }
function tickClock(){
  const now = new Date();
  nowClock.textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
}
setInterval(tickClock, 1000);
tickClock();

// ---------- Countdown ----------
const target = new Date(WEDDING_DATE_ISO).getTime();
const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");

function updateCountdown(){
  const now = Date.now();
  let diff = Math.max(0, target - now);
  const s = Math.floor(diff/1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);

  cdDays.textContent = days;
  cdHours.textContent = pad2(hours);
  cdMins.textContent = pad2(mins);
  cdSecs.textContent = pad2(secs);
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ---------- Mini Calendar (Jan 2026) ----------
const miniCalendar = document.getElementById("miniCalendar");
const HEART_DAY = 22; // ngày cưới

function renderCalendar(){
  if (!miniCalendar) return;

  const weekdays = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  miniCalendar.innerHTML = "";

  // Head
  weekdays.forEach(w => {
    const cell = document.createElement("div");
    cell.className = "cell head";
    cell.textContent = w;
    miniCalendar.appendChild(cell);
  });

  const year = 2026, monthIndex = 0; // Jan
  const first = new Date(year, monthIndex, 1);
  // Convert Sunday=0 to Monday=0
  let day = first.getDay(); // 0..6 (Sun..Sat)
  let offset = (day + 6) % 7; // Mon=0 ... Sun=6

  // blanks
  for (let i=0;i<offset;i++){
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = "";
    cell.style.opacity = "0.35";
    miniCalendar.appendChild(cell);
  }

  const daysInMonth = new Date(year, monthIndex+1, 0).getDate();
  for (let d=1; d<=daysInMonth; d++){
    const cell = document.createElement("div");
    cell.className = "cell" + (d === HEART_DAY ? " heart" : "");
    cell.textContent = d === HEART_DAY ? "❤ " + d : d;
    miniCalendar.appendChild(cell);
  }
}
renderCalendar();

// ---------- Scroll animations (IntersectionObserver) ----------
const items = document.querySelectorAll("[data-animate]");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting){
      e.target.classList.add("in-view");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

items.forEach(el => io.observe(el));

// ---------- Album slider ----------
const track = document.getElementById("albumTrack");
const viewport = document.getElementById("albumViewport");
const prev = document.getElementById("prevSlide");
const next = document.getElementById("nextSlide");
const dotsWrap = document.getElementById("dots");

let slideIndex = 0;
const slides = () => Array.from(track?.children || []);
function setSlide(i){
  const total = slides().length;
  if (!total) return;
  slideIndex = (i + total) % total;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  updateDots();
}

function buildDots(){
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  slides().forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === slideIndex ? " is-active" : "");
    b.addEventListener("click", () => setSlide(i));
    dotsWrap.appendChild(b);
  });
}
function updateDots(){
  if (!dotsWrap) return;
  [...dotsWrap.children].forEach((d, i) => {
    d.classList.toggle("is-active", i === slideIndex);
  });
}
buildDots();
setSlide(0);

prev?.addEventListener("click", () => setSlide(slideIndex - 1));
next?.addEventListener("click", () => setSlide(slideIndex + 1));

// Swipe (mobile)
let startX = 0;
viewport?.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
}, {passive:true});
viewport?.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const dx = endX - startX;
  if (Math.abs(dx) > 40){
    if (dx < 0) setSlide(slideIndex + 1);
    else setSlide(slideIndex - 1);
  }
}, {passive:true});

// Auto-play slider
// setInterval(() => setSlide(slideIndex + 1), 4500);

// ---------- Gift modal ----------
const giftBtn = document.getElementById("giftBtn");
const giftModal = document.getElementById("giftModal");

function openGift(){
  giftModal.classList.add("is-open");
  giftModal.setAttribute("aria-hidden", "false");
}
function closeGift(){
  giftModal.classList.remove("is-open");
  giftModal.setAttribute("aria-hidden", "true");
}

giftBtn?.addEventListener("click", openGift);
giftModal?.addEventListener("click", (e) => {
  const t = e.target;
  if (t?.dataset?.close === "1") closeGift();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeGift();
});

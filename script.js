/* ===================================================
   PIZZAFIRE — Main JavaScript
   =================================================== */

// ===== PIZZA BUILDER STATE =====
let pizzaState = {
  size: 'Medium',
  sizePrice: 12.99,
  toppings: [],
  toppingPrice: 1.50,
};
let cartCount = 0;

// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      // Auto-open pizza builder after 0.5s
      setTimeout(() => openPizzaBuilder(), 500);
    }
  }, 1800);
});

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

// ===== AUTH STATE =====
function initAuth() {
  const user = JSON.parse(localStorage.getItem('pf_loggedIn') || 'null');
  const greet = document.getElementById('userGreeting');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');

  if (user) {
    const firstName = user.name.split(' ')[0];
    if (greet) { greet.textContent = `Hi, ${firstName} 👋`; greet.style.display = 'flex'; }
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (mobileLoginBtn) mobileLoginBtn.textContent = `Hi, ${firstName} 👋`;
  } else {
    if (greet) greet.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('pf_loggedIn');
  window.location.reload();
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initScrollAnimations();
});

// ===== PIZZA BUILDER =====
function openPizzaBuilder() {
  const overlay = document.getElementById('pizzaOverlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePizzaBuilder() {
  const overlay = document.getElementById('pizzaOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('pizzaOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePizzaBuilder();
    });
  }
});

// Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePizzaBuilder();
});

// ===== SIZE SELECTION =====
function selectSize(btn) {
  // Update active state
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  pizzaState.size = btn.dataset.size;
  pizzaState.sizePrice = parseFloat(btn.dataset.price);
  const scale = parseFloat(btn.dataset.scale);

  // Animate pizza scale
  const pizza = document.getElementById('pizza3d');
  if (pizza) {
    pizza.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    pizza.style.transform = `perspective(400px) rotateX(20deg) scale(${scale})`;
  }

  // Update labels
  const sizeLabel = document.getElementById('sizeLabel');
  const sizeNames = { Small: '8"', Medium: '12"', Large: '14"', XL: '16"' };
  if (sizeLabel) sizeLabel.textContent = `${pizzaState.size} ${sizeNames[pizzaState.size] || ''}`;

  updatePrice();
}

// ===== TOPPING TOGGLE =====
function toggleTopping(checkbox) {
  const topping = checkbox.value;
  const layerId = `tLayer_${topping}`;
  const layer = document.getElementById(layerId);

  if (checkbox.checked) {
    if (!pizzaState.toppings.includes(topping)) pizzaState.toppings.push(topping);
    if (layer) {
      layer.style.transition = 'opacity 0.4s ease';
      layer.style.opacity = '1';
    }
  } else {
    pizzaState.toppings = pizzaState.toppings.filter(t => t !== topping);
    if (layer) layer.style.opacity = '0';
  }
  updatePrice();
}

// ===== PRICE UPDATE =====
function updatePrice() {
  const total = pizzaState.sizePrice + (pizzaState.toppings.length * pizzaState.toppingPrice);

  const livePrice = document.getElementById('livePrice');
  const summTotal = document.getElementById('summTotal');
  const summSize = document.getElementById('summSize');
  const summToppings = document.getElementById('summToppings');

  const formatted = `$${total.toFixed(2)}`;

  if (livePrice) {
    livePrice.style.transform = 'scale(1.1)';
    setTimeout(() => { livePrice.style.transform = 'scale(1)'; }, 200);
    livePrice.textContent = formatted;
  }
  if (summTotal) summTotal.textContent = formatted;
  if (summSize) summSize.textContent = pizzaState.size;
  if (summToppings) {
    summToppings.textContent = pizzaState.toppings.length > 0
      ? pizzaState.toppings.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
      : 'None';
  }
}

// ===== SURPRISE ME =====
function surpriseMe() {
  // Random size
  const sizes = document.querySelectorAll('.size-btn');
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

  // Clear toppings first
  document.querySelectorAll('.topping-card input').forEach(cb => {
    cb.checked = false;
    toggleTopping(cb);
  });
  pizzaState.toppings = [];

  // Set random size
  selectSize(randomSize);

  // Random toppings (2-4)
  const toppingCheckboxes = Array.from(document.querySelectorAll('.topping-card input'));
  const shuffled = toppingCheckboxes.sort(() => Math.random() - 0.5);
  const count = Math.floor(Math.random() * 3) + 2;
  shuffled.slice(0, count).forEach((cb, i) => {
    setTimeout(() => {
      cb.checked = true;
      toggleTopping(cb);
    }, i * 150);
  });

  // Fun animation
  const pizza = document.getElementById('pizza3d');
  if (pizza) {
    pizza.style.animation = 'none';
    pizza.offsetHeight; // reflow
    pizza.style.animation = '';
    pizza.style.transform = `${pizza.style.transform} rotateZ(360deg)`;
    setTimeout(() => {
      pizza.style.transform = `perspective(400px) rotateX(20deg) scale(${parseFloat(randomSize.dataset.scale)})`;
    }, 600);
  }
}

// ===== ADD TO CART =====
function addToCart() {
  cartCount++;
  const confirm = document.getElementById('cartConfirm');
  const notif = document.getElementById('cartNotif');
  const countEl = document.getElementById('cartCount');

  if (confirm) {
    confirm.classList.add('show');
    setTimeout(() => confirm.classList.remove('show'), 2000);
  }
  if (countEl) countEl.textContent = cartCount;
  if (notif) {
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
  }

  // Save to localStorage
  const order = {
    id: Date.now(),
    size: pizzaState.size,
    toppings: [...pizzaState.toppings],
    price: pizzaState.sizePrice + (pizzaState.toppings.length * pizzaState.toppingPrice),
    time: new Date().toLocaleString(),
  };
  const cart = JSON.parse(localStorage.getItem('pf_cart') || '[]');
  cart.push(order);
  localStorage.setItem('pf_cart', JSON.stringify(cart));
}

// ===== MENU FILTER =====
function filterMenu(cat, btn) {
  // Update tabs
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide cards
  document.querySelectorAll('.menu-card').forEach(card => {
    if (card.dataset.cat === cat) {
      card.style.display = 'block';
      card.style.animation = 'fadeInUp 0.3s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });
}

// ===== PASSWORD TOGGLE (shared between pages) =====
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const animEls = document.querySelectorAll(
    '.menu-card, .offer-card, .testi-card, .about-feat, .info-card'
  );

  animEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
  });
}

// ===== INIT PRICE =====
document.addEventListener('DOMContentLoaded', () => {
  updatePrice();
});








// ===== 3D CAROUSEL INTERACTION CODE =====




document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carousel");
  const area = document.getElementById("area");
  const cards = document.querySelectorAll(".card");

  if (!carousel || !area) return;

  let isDown = false;
  let startX;
  let currentRotation = 0;
  let angle = 0;

  // --- Mouse Events ---
  area.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.clientX;
    carousel.style.transition = "none"; // Dragging ke waqt animation smooth rakhne ke liye transition remove karein
  });

  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    snapToCard();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    let move = e.clientX - startX;
    angle = currentRotation + move * 0.3; // Speed factor multiplier
    carousel.style.transform = `rotateY(${angle}deg)`;
  });

  // --- Touch Events (Mobile Support) ---
  area.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].clientX;
    carousel.style.transition = "none";
  });

  area.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    let move = e.touches[0].clientX - startX;
    angle = currentRotation + move * 0.3;
    carousel.style.transform = `rotateY(${angle}deg)`;
  });

  area.addEventListener("touchend", () => {
    if (!isDown) return;
    isDown = false;
    snapToCard();
  });

  // Near card par auto-snap karne ka function
  function snapToCard() {
    let step = 72; // 360deg / 5 cards = 72
    let snapped = Math.round(angle / step) * step;
    currentRotation = snapped;

    carousel.style.transition = "transform 0.5s ease-out";
    carousel.style.transform = `rotateY(${snapped}deg)`;
  }

  // --- Click to Flip handling ---
  cards.forEach((card, index) => {
    card.addEventListener("click", (e) => {
      // Agar back side ka read more button click ho to card flip wapis na ho
      if (e.target.closest('button')) return;

      // Baqi tamam pehle se flipped cards ko wapis normal position par laye
      cards.forEach((c) => {
        if (c !== card) c.classList.remove("flipped");
      });

      // Is card ko flip toggle karein
      card.classList.toggle("flipped");

      // Card ko screen ke bilkul samne lane ke liye carousel ko rotate karein
      let targetAngle = -index * 72;
      currentRotation = targetAngle;
      angle = targetAngle; // Align drag state angle

      carousel.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
      carousel.style.transform = `rotateY(${targetAngle}deg)`;
    });
  });
});






// ye be mera code hen

  // ===== 3D CARD STACK GALLERY LOGIC =====
const stack = document.getElementById('cardStack');

if (stack) {
  const cards = Array.from(stack.getElementsByClassName('stack-card'));
  const nextBtn = document.getElementById('stackNextBtn');

  function updateStack() {
    cards.forEach((card, index) => {
      if (index === 0) {
        card.style.transform = "translateY(0) scale(1) rotate(0deg)";
        card.style.opacity = "1";
        card.style.zIndex = cards.length;
        card.style.pointerEvents = "auto";
      } else if (index < 3) {
        const translateY = index * 25;
        const scale = 1 - index * 0.05;
        const rotate = index * 3;
        
        card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
        card.style.opacity = "0.9";
        card.style.zIndex = cards.length - index;
        card.style.pointerEvents = "none";
      } else {
        card.style.transform = "translateY(60px) scale(0.8) rotate(10deg)";
        card.style.opacity = "0";
        card.style.zIndex = 0;
        card.style.pointerEvents = "none";
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const topCard = cards.shift();
      
      topCard.style.transform = "translateX(150%) rotate(30deg) scale(0.9)";
      topCard.style.opacity = "0";
      
      setTimeout(() => {
        stack.appendChild(topCard);
        cards.push(topCard);
        updateStack();
      }, 300);
    });
  }

  // Pehli baar stack load karne ke liye call kiya
  updateStack();
}
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-loaded");

  const body = document.body;
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const cartCount = document.getElementById("cartCount");
  const pageTransition = document.querySelector(".page-transition");
  const toast = document.getElementById("toast");
  const cursorGlow = document.querySelector(".cursor-glow");

  const fitModal = document.getElementById("fitModal");
  const sizeChartModal = document.getElementById("sizeChartModal");
  const fitForm = document.getElementById("fitForm");
  const heightInput = document.getElementById("heightInput");
  const weightInput = document.getElementById("weightInput");
  const bodyTypeInput = document.getElementById("bodyTypeInput");

  const fitResultSize = document.getElementById("fitResultSize");
  const fitResultSummary = document.getElementById("fitResultSummary");
  const fitResultNote = document.getElementById("fitResultNote");
  const fitProfileLabel = document.getElementById("fitProfileLabel");
  const fitChestEstimate = document.getElementById("fitChestEstimate");
  const fitWaistEstimate = document.getElementById("fitWaistEstimate");
  const fitMeterFill = document.getElementById("fitMeterFill");
  const fitPreviewResult = document.getElementById("fitPreviewResult");

  const STORAGE_KEY = "auracal-cart";

  function handleHeaderScroll() {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Cursor glow
  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    });
  } else if (cursorGlow) {
    cursorGlow.style.display = "none";
  }

  // Parallax hero video
  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    window.addEventListener(
      "scroll",
      () => {
        const offset = window.scrollY * 0.08;
        heroVideo.style.transform = `scale(1.08) translateY(${offset}px)`;
      },
      { passive: true }
    );
  }

  // Reveal animations
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));

  // Page transitions for internal html links
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      pageTransition.classList.add("is-active");

      setTimeout(() => {
        window.location.href = href;
      }, 450);
    });
  });

  // Modal logic
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    const stillOpen = document.querySelector(".modal.is-open");
    if (!stillOpen) {
      body.classList.remove("modal-open");
    }
  }

  document.querySelectorAll("[data-open-fit]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(fitModal));
  });

  document.querySelectorAll("[data-open-size-chart]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(sizeChartModal));
  });

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeModal(btn.closest(".modal"));
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal.is-open").forEach((modal) => closeModal(modal));
    }
  });

  // Smart Fit tool
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function calculateFit(height, weight, bodyType) {
    const bodyTypeAdjustments = {
      slim: -0.6,
      athletic: 0.35,
      average: 0,
      broad: 0.85
    };

    const adjustment = bodyTypeAdjustments[bodyType] ?? 0;

    const heightFactor = (height - 160) / 7.5;
    const weightFactor = (weight - 55) / 6.8;
    const score = heightFactor + weightFactor + adjustment + 4.2;

    let size = "M";
    if (score <= 2.8) size = "XS";
    else if (score <= 4.4) size = "S";
    else if (score <= 6.2) size = "M";
    else if (score <= 8.2) size = "L";
    else if (score <= 10.2) size = "XL";
    else size = "XXL";

    const chest = Math.round(height * 0.29 + weight * 0.34 + adjustment * 4);
    const waist = Math.round(height * 0.23 + weight * 0.24 + adjustment * 3);

    const summaries = {
      XS: "A close, refined silhouette with a sharper luxury fit profile.",
      S: "Trim and sleek with clean proportions and minimal excess volume.",
      M: "Balanced profile for everyday tailored comfort and premium layering.",
      L: "Relaxed precision with enough space for elevated movement.",
      XL: "Roomier structure for statement layering and added comfort.",
      XXL: "Generous fit profile ideal for broader, layered silhouettes."
    };

    const notes = {
      slim: "Your slimmer frame benefits from a cleaner silhouette across AURACAL tops.",
      athletic: "Your athletic build may prefer a touch more room around the chest and shoulders.",
      average: "Your build aligns well with our standard tailored balance.",
      broad: "Your broader frame benefits from comfortable structure through the torso."
    };

    const profileNames = {
      slim: "Slim Build",
      athletic: "Athletic Build",
      average: "Average Build",
      broad: "Broad Build"
    };

    const meterValues = {
      XS: 10,
      S: 28,
      M: 45,
      L: 63,
      XL: 81,
      XXL: 97
    };

    return {
      size,
      chest,
      waist,
      summary: summaries[size],
      note: notes[bodyType] || notes.average,
      profile: profileNames[bodyType] || profileNames.average,
      meter: meterValues[size]
    };
  }

  function updateFitUI() {
    const height = Number(heightInput?.value || 175);
    const weight = Number(weightInput?.value || 72);
    const bodyType = bodyTypeInput?.value || "average";

    const result = calculateFit(height, weight, bodyType);

    if (fitResultSize) fitResultSize.textContent = result.size;
    if (fitResultSummary) fitResultSummary.textContent = result.summary;
    if (fitResultNote) {
      fitResultNote.textContent = `${result.note} Recommended AURACAL top size: ${result.size}.`;
    }
    if (fitProfileLabel) fitProfileLabel.textContent = result.profile;
    if (fitChestEstimate) fitChestEstimate.textContent = `${result.chest} cm`;
    if (fitWaistEstimate) fitWaistEstimate.textContent = `${result.waist} cm`;
    if (fitMeterFill) fitMeterFill.style.width = `${result.meter}%`;

    if (fitPreviewResult) {
      fitPreviewResult.innerHTML = `
        <strong>Recommended size: ${result.size}</strong>
        <p>${result.summary}</p>
      `;
    }
  }

  [heightInput, weightInput, bodyTypeInput].forEach((field) => {
    if (field) {
      field.addEventListener("input", updateFitUI);
      field.addEventListener("change", updateFitUI);
    }
  });

  if (fitForm) {
    fitForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updateFitUI();
      showToast("Smart Fit updated successfully.");
    });
  }

  updateFitUI();

  // Cart storage
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1
      });
    }

    saveCart(cart);
    updateCartCount();
    showToast(`${product.name} added to cart.`);
  }

  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image
      };

      addToCart(product);
    });
  });

  updateCartCount();

  // Newsletter
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      newsletterForm.reset();
      showToast("Welcome to the AURACAL inner circle.");
    });
  }

  // Toast
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  // Close modal when clicking inside modal panel is not intended
  document.querySelectorAll(".modal-panel").forEach((panel) => {
    panel.addEventListener("click", (event) => event.stopPropagation());
  });
});
// Smooth Scrolling for Navigation Links
document.querySelectorAll('a [ href ^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Navbar Background Change on Scroll
const navbar = document.querySelector(". navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    navbar.style.background = "rgba (255 , 255 , 255 , 0.98)";
  } else {
    navbar.style.background = "rgba (255 , 255 , 255 , 0.95)";
  }
});
console.log("Portfolio loaded successfully !");

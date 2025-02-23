<template>
    <div class="landing-page">
      <nav class="navbar">
        <div class="logo">Mentry</div>
        <div class="nav-links">
          <a href="#" class="nav-link">About</a>
          <a href="#" class="nav-link">Stories</a>
          <a href="#" class="nav-link">Community</a>
        </div>
      </nav>
  
      <header class="header">
        <h1 class="animate-title">Mentry</h1>
        <p class="tagline">Your journey to mental wellness through storytelling</p>
        <div class="header-buttons">
          <NuxtLink class="cta-button primary" to="/signup">Get Started / Singup</NuxtLink>
          <button class="cta-button secondary">Learn More</button>
        </div>
      </header>
  
      <section class="features">
        <div class="feature-card">
          <div class="icon">📖</div>
          <h3>Share Your Story</h3>
          <p>Express yourself in a safe and supportive environment</p>
        </div>
        <div class="feature-card">
          <div class="icon">❤️</div>
          <h3>Find Support</h3>
          <p>Connect with others who understand your journey</p>
        </div>
        <div class="feature-card">
          <div class="icon">🌟</div>
          <h3>Grow Together</h3>
          <p>Learn and heal through shared experiences</p>
        </div>
      </section>
  
      <section class="intro">
        <h2>Welcome to Mentry</h2>
        <p>Discover the power of storytelling to improve your mental health. Share your stories, read others' experiences, and find support in our community.</p>
      </section>
  
      <footer class="footer">
        <p>&copy; 2025 Mentry. All rights reserved.</p>
      </footer>
    </div>
  </template>
  
  <style scoped>
  .landing-page {
    min-height: 100vh;
    font-family: 'Segoe UI', Arial, sans-serif;
    background: linear-gradient(135deg, #ff7e5f, #feb47b);
    color: white;
  }
  
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 4rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
  
  .logo {
    font-size: 1.8rem;
    font-weight: bold;
  }
  
  .nav-links {
    display: flex;
    gap: 2rem;
  }
  
  .nav-link {
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    transition: opacity 0.3s;
  }
  
  .nav-link:hover {
    opacity: 0.8;
  }
  
  .header {
    text-align: center;
    padding: 6rem 2rem;
  }
  
  .animate-title {
    font-size: 5em;
    font-weight: 700;
    margin: 0;
    animation: fadeInDown 1s ease-out;
  }
  
  .tagline {
    font-size: 1.6em;
    margin: 1.5rem 0;
    opacity: 0.9;
  }
  
  .header-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }
  
  .cta-button {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .primary {
    background: white;
    color: #ff7e5f;
  }
  
  .secondary {
    background: transparent;
    border: 2px solid white;
    color: white;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 4rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    transition: transform 0.3s ease;
  }
  
  .feature-card:hover {
    transform: translateY(-5px);
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .intro {
    text-align: center;
    max-width: 800px;
    margin: 4rem auto;
    padding: 2rem;
  }
  
  .footer {
    text-align: center;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.1);
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .navbar {
      padding: 1rem 2rem;
      flex-direction: column;
      gap: 1rem;
    }
  
    .header-buttons {
      flex-direction: column;
      align-items: center;
    }
  
    .features {
      padding: 2rem;
    }
  }
  </style>
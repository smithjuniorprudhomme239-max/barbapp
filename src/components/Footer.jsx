import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} FadeKing Barbershop. All rights reserved.</p>
      <div className="socials">
        <a href="#">Instagram</a>
        <a href="#">Facebook</a>
        <a href="#">TikTok</a>
      </div>
    </footer>
  )
}

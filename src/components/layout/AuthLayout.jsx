export default function AuthLayout({
  children
}) {
  return <main className="auth-layout">
    <section className="auth-card">{children}</section>
  </main>;
}

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter-transition">
      {children}
    </div>
  )
}

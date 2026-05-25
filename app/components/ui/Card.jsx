export default function Card({ children, className = '' }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '0.5px solid #e5e3dd',
        borderRadius: '16px',
        padding: '1.5rem',
        color: '#1a1a18',
      }}
      className={className}
    >
      {children}
    </div>
  )
}
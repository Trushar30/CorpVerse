export default function Card({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl p-6 ${
        hoverEffect ? 'glass-card' : 'glass-panel'
      } ${glow ? 'glow-purple' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

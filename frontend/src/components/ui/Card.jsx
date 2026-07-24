export default function Card({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  ...props
}) {
  return (
    <div
      className={`rounded-none p-6 ${
        hoverEffect ? 'pixel-card' : 'pixel-panel'
      } ${glow ? 'glow-purple' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

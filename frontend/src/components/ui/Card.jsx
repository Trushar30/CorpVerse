export default function Card({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  ...props
}) {
  return (
    <div
      className={`p-8 ${
        hoverEffect ? 'cozy-card' : 'bg-cozy-surface rounded-2xl border-[1.5px] border-cozy-border-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_0_rgba(0,0,0,0.25)]'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

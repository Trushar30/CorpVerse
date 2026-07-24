export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold transition-all duration-200 rounded-full focus:outline-none cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed border-[1.5px] border-cozy-border-accent shadow-[0_4px_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-1 font-sans';

  const variants = {
    primary:
      'bg-cozy-accent-primary text-cozy-base hover:brightness-110 border-cozy-accent-primary',
    secondary:
      'bg-cozy-surface text-cozy-text-primary hover:bg-cozy-elevated hover:border-cozy-accent-primary',
    outline:
      'bg-transparent border-cozy-accent-primary text-cozy-accent-primary hover:bg-cozy-accent-primary/10',
    ghost:
      'bg-transparent text-cozy-text-secondary hover:text-cozy-text-primary border-transparent shadow-none active:shadow-none active:translate-y-0 hover:bg-cozy-surface/50',
    glow:
      'bg-cozy-accent-primary text-cozy-base hover:brightness-110 border-cozy-accent-primary', // Fallback for previous glow usage
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

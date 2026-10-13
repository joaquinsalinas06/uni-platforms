/**
 * Ícono vectorial de IA (Sparkle técnico + nodo) acorde al lenguaje visual
 * de manual de ingeniería de las plataformas.
 */
export function AiSparkleIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M10 2L11.85 7.4L17.25 9.25L11.85 11.1L10 16.5L8.15 11.1L2.75 9.25L8.15 7.4L10 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="color-mix(in srgb, currentColor 16%, transparent)"
      />
      <path
        d="M15.8 2.2L16.35 3.9L18.05 4.45L16.35 5L15.8 6.7L15.25 5L13.55 4.45L15.25 3.9L15.8 2.2Z"
        fill="currentColor"
      />
      <circle cx="4.5" cy="15.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

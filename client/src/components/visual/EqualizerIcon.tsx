interface EqualizerIconProps {
  className?: string
}

export function EqualizerIcon({
  className = 'h-3.5 w-3.5 text-primary',
}: EqualizerIconProps) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="4" width="3" height="8" rx="1.5">
        <animate
          attributeName="height"
          values="4;12;4"
          dur="0.75s"
          repeatCount="indefinite"
        />
        <animate attributeName="y" values="6;2;6" dur="0.75s" repeatCount="indefinite" />
      </rect>
      <rect x="6.5" y="2" width="3" height="12" rx="1.5">
        <animate
          attributeName="height"
          values="12;4;12"
          dur="0.65s"
          repeatCount="indefinite"
        />
        <animate attributeName="y" values="2;6;2" dur="0.65s" repeatCount="indefinite" />
      </rect>
      <rect x="12" y="5" width="3" height="6" rx="1.5">
        <animate
          attributeName="height"
          values="6;13;6"
          dur="0.85s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          values="5;1.5;5"
          dur="0.85s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  )
}

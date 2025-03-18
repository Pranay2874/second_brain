export function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5" // Fixed: Changed stroke-width → strokeWidth
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round" // Fixed: Changed stroke-linecap → strokeLinecap
        strokeLinejoin="round" // Fixed: Changed stroke-linejoin → strokeLinejoin
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

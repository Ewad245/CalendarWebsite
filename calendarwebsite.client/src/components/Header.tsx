import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <>
      <ThemeToggle />
      <div className="max-w-7xl mx-auto">
        <h1
          id="tableLabel"
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-neutral-700 dark:text-neutral-50 text-center sm:text-left"
        >
          Staff Check-in Calendar
        </h1>
        <p className="mb-6 text-neutral-700 dark:text-neutral-50 text-center sm:text-left text-sm sm:text-base">
          Monthly view of staff check-in/out times
        </p>
      </div>
    </>
  );
}

import { lazy, Suspense, type ComponentProps } from "react";

type CalendarType = (typeof import("@/components/ui/calendar"))["Calendar"];
type CalendarProps = ComponentProps<CalendarType>;

const CalendarLazy = lazy(async () => ({
  default: (await import("@/components/ui/calendar")).Calendar,
}));

export function LazyCalendar(props: CalendarProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[300px] w-[280px] items-center justify-center p-3 text-sm text-muted-foreground">
          Loading calendar…
        </div>
      }
    >
      <CalendarLazy {...props} />
    </Suspense>
  );
}

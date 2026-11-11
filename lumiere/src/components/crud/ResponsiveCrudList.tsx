import type { ReactNode } from "react";

type Props = { desktop: ReactNode; mobile: ReactNode };

export function ResponsiveCrudList({ desktop, mobile }: Props) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white md:block">
        {desktop}
      </div>
      <div className="md:hidden">{mobile}</div>
    </>
  );
}

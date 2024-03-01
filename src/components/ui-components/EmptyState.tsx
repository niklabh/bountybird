import Image from "next/image";
import React, { ReactNode } from "react";

const EmptyState = ({
  children,
  label,
}: {
  children?: ReactNode;
  label: string;
}) => {
  return (
    <div className="flex flex-col gap-5 items-center justify-center py-20 text-gray-300">
      <div className="p-20 flex justify-center items-center rounded-full w-72 h-72 bg-[#1D1D1D]">

      <Image
        src="/assets/empty-state.svg"
        alt="empty state"
        width={120}
        height={120}
        />
        </div>
      <h2 className=" text-2xl font-semibold text-white">{label}</h2>
      {children}
    </div>
  );
};

export default EmptyState;

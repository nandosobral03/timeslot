"use client";

import { Plus } from "lucide-react";

const AddVideoButton = ({ topPosition, height, onClick }: { topPosition: number; height: number; onClick: () => void }) => (
  <div
    className="absolute w-full h-2 bg-transparent hover:bg-white/20 cursor-pointer z-10 transition-colors group"
    style={{
      top: topPosition + height - 4,
    }}
    onClick={onClick}
  >
    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
      <Plus className="text-black text-lg font-medium leading-none" size={16} />
    </div>
  </div>
);

export default AddVideoButton;

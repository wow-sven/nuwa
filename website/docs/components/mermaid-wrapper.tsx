"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export const MermaidWrapper: React.FC<
  React.PropsWithChildren<{ title?: string }>
> = ({ children, title }) => {
  return (
    <div className="w-full my-4">
      <Dialog>
        <DialogTrigger className="bg-gray-100 rounded-xl w-full">
          {children}
        </DialogTrigger>
        <DialogContent className="bg-gray-100 rounded-xl w-full !max-w-screen-lg p-6 dialog-svg-wrapper">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {title ?? ""}
          </DialogTitle>
          <div className="w-full h-full overflow-auto dialog-csv-table">
            {children}
          </div>
          <DialogFooter className="sm:justify-end sm:items-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MermaidWrapper;

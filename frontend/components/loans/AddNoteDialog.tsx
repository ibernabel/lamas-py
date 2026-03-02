"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddLoanNote } from "@/hooks/use-loan-applications";

interface AddNoteDialogProps {
  loanId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoteDialog({ loanId, open, onOpenChange }: AddNoteDialogProps) {
  const [note, setNote] = useState("");
  const addNote = useAddLoanNote();

  const handleAdd = () => {
    if (!note.trim()) return;
    
    addNote.mutate(
      { id: loanId, note },
      {
        onSuccess: () => {
          setNote("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a specialized comment or observation to this loan application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Type your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-25"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!note.trim() || addNote.isPending}
          >
            {addNote.isPending ? "Adding..." : "Add Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

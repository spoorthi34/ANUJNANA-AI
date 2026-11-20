import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, FileText, Loader2, LogIn, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { deleteNote, listNotes, uploadNote, validateNoteFile, type LearnerNote } from "@/lib/learnerNotes";

function StatusBadge({ note }: { note: LearnerNote }) {
  if (note.status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
        <CheckCircle2 className="h-3 w-3" /> Ready for the tutor
      </span>
    );
  }
  if (note.status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold text-destructive">
        <AlertCircle className="h-3 w-3" /> Couldn't read
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
      <Loader2 className="h-3 w-3 animate-spin" /> Reading…
    </span>
  );
}

export default function Notes() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<LearnerNote[]>([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setNotes(await listNotes());
    } catch {
      toast({ title: "Couldn't load your notes", variant: "destructive" });
    } finally {
      setFetching(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) refresh();
    else setFetching(false);
  }, [user, refresh]);

  const handleFile = async (file: File | undefined) => {
    if (!file || !user || uploading) return;
    const problem = validateNoteFile(file);
    if (problem) {
      toast({ title: problem, variant: "destructive" });
      return;
    }
    setUploading(file.name);
    try {
      const result = await uploadNote(user.id, file);
      toast({ title: "Notes added", description: `${file.name}: ${result.pages} page${result.pages === 1 ? "" : "s"} ready for the tutor.` });
    } catch (error) {
      toast({ title: "Couldn't add this file", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setUploading(null);
      if (inputRef.current) inputRef.current.value = "";
      refresh();
    }
  };

  const handleDelete = async (note: LearnerNote) => {
    try {
      await deleteNote(note);
      setNotes((prev) => prev.filter((item) => item.id !== note.id));
      toast({ title: "Deleted", description: `${note.title} is no longer used by the tutor.` });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Couldn't delete", variant: "destructive" });
    }
  };

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <div className="glass-card rounded-2xl p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-2xl font-bold text-foreground">My Study Notes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to upload your own PDFs and notes. The tutor will search them and show which page each hint comes from.
          </p>
          <Button asChild className="mt-5 gap-2">
            <Link to="/login?next=%2Fnotes"><LogIn className="h-4 w-4" /> Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <FileText className="h-8 w-8 text-primary" /> My Study Notes
        </h1>
        <p className="mt-1 text-muted-foreground">
          Add your class notes or textbook PDFs. Only you can see them. The Ask Doubt tutor searches them alongside the lessons and cites the page it used.
        </p>
      </motion.div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-secondary bg-secondary/10" : "border-border bg-card"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="font-semibold text-foreground">Reading {uploading}…</p>
            <p className="text-xs text-muted-foreground">This can take up to a minute for long PDFs.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-9 w-9 text-secondary" />
            <p className="font-semibold text-foreground">Drop a file here, or</p>
            <Button onClick={() => inputRef.current?.click()} className="gap-2">
              <UploadCloud className="h-4 w-4" /> Choose a file
            </Button>
            <p className="text-xs text-muted-foreground">PDF, TXT or MD · up to 10 MB and 60 pages · typed text (scanned photos can't be read yet)</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          className="hidden"
          aria-label="Upload notes file"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">Your files</h2>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/learn"><Sparkles className="h-4 w-4" /> Ask the tutor</Link>
          </Button>
        </div>
        {fetching ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : notes.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No notes yet. Upload one above — the tutor will start using it straight away.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-foreground">{note.title}</p>
                  <StatusBadge note={note} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {note.status === "failed"
                    ? note.error_message
                    : `${note.page_count} page${note.page_count === 1 ? "" : "s"} · ${note.chunk_count} searchable passages · added ${new Date(note.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Delete ${note.title}`} onClick={() => handleDelete(note)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

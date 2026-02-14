import { FormEvent, useEffect, useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../lib/api";
import { useAppState } from "../lib/appState";
import type { Note, NoteType } from "../lib/types";

const noteTypes: NoteType[] = ["question", "promise", "conviction", "action", "comfort"];

export default function Notes() {
  const { bootstrap } = useAppState();
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteType, setNoteType] = useState<NoteType>("question");
  const [ref, setRef] = useState(bootstrap?.resume?.lastRef ?? bootstrap?.today.johnRef ?? "John 1:1");
  const [body, setBody] = useState("");

  async function load() {
    setNotes(await api.listNotes(10));
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.saveNote({ noteType, ref, body });
    setBody("");
    await load();
  }

  return (
    <section className="stack">
      <h1>Thread notes</h1>
      <form className="card stack" onSubmit={submit}>
        <label>
          Type
          <select value={noteType} onChange={(event) => setNoteType(event.target.value as NoteType)}>
            {noteTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Verse ref
          <input value={ref} onChange={(event) => setRef(event.target.value)} />
        </label>
        <label>
          Note
          <textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} required />
        </label>
        <PrimaryButton type="submit">Add note</PrimaryButton>
      </form>

      <article className="card stack">
        <h2>Recent notes</h2>
        {notes.map((note) => (
          <div key={note.id} className="stack soft-divider">
            <p><strong>{note.noteType}</strong> - {note.ref}</p>
            <p>{note.body}</p>
          </div>
        ))}
      </article>
    </section>
  );
}

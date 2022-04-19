import { Form, Link } from "@remix-run/react";
import type { Note } from "~/models/note.server";

export function NoteDetails({
  note,
}: {
  note: Pick<Note, "title" | "body"> & Partial<Pick<Note, "id">>;
}) {
  return (
    <div>
      <h3 className="text-2xl font-bold">{note.title}</h3>
      <p className="py-6">{note.body}</p>
      <hr className="my-4" />
      <div className="flex justify-between gap-4">
        <Link
          to={note.id ? "edit" : ""}
          className={`rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 ${
            note.id ? "" : "opacity-60"
          }`}
        >
          Edit
        </Link>
        <Form method="post">
          <button
            type="submit"
            className={`rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 ${
              note.id ? "" : "opacity-60"
            }`}
            disabled={!note.id}
          >
            Delete
          </button>
        </Form>
      </div>
    </div>
  );
}

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { ActionData } from "~/components/note-editor";
import { handleSubmission } from "~/components/note-editor";
import { NoteEditor } from "~/components/note-editor";
import type { Note } from "~/models/note.server";
import { getNote, editNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

type LoaderData = { note: Note };

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ userId, id: params.noteId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ note });
};

export const action: ActionFunction = async ({ request }) => {
  const responseOrNote = await handleSubmission({ request });
  if (responseOrNote instanceof Response) {
    return responseOrNote;
  }
  const { id, ...updatedData } = responseOrNote;
  if (id === null) {
    return new Response("Not Found", { status: 404 });
  }

  const note = await editNote({ id, ...updatedData });

  return redirect(`/notes/${note.id}`);
};

export default function EditNotePage() {
  const data = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  return <NoteEditor note={data.note} actionData={actionData} />;
}

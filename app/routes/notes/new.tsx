import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData, useTransition } from "@remix-run/react";
import { NoteDetails } from "~/components/note-details";
import type { ActionData } from "~/components/note-editor";
import { handleSubmission } from "~/components/note-editor";
import { NoteEditor } from "~/components/note-editor";
import { createNote } from "~/models/note.server";

export const action: ActionFunction = async ({ request }) => {
  const responseOrNote = await handleSubmission({ request });
  if (responseOrNote instanceof Response) {
    return responseOrNote;
  }

  const note = await createNote(responseOrNote);

  return redirect(`/notes/${note.id}`);
};

export default function NewNotePage() {
  const actionData = useActionData() as ActionData;
  const transition = useTransition();
  return transition.submission ? (
    <NoteDetails
      note={
        Object.fromEntries(transition.submission.formData.entries()) as {
          title: string;
          body: string;
        }
      }
    />
  ) : (
    <NoteEditor actionData={actionData} />
  );
}

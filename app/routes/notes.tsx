import * as React from "react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useCatch,
  useFetcher,
  useFetchers,
  useLoaderData,
  useMatches,
  useNavigate,
} from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import type { Note } from "~/models/note.server";
import { deleteNote, getNoteListItems } from "~/models/note.server";

type LoaderData = {
  noteListItems: Awaited<ReturnType<typeof getNoteListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const noteListItems = await getNoteListItems({ userId });
  return json<LoaderData>({ noteListItems });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const id = formData.get("noteId");
  if (typeof id !== "string") {
    throw json({ error: "noteId is required" }, { status: 400 });
  }
  if (Math.random() < 0.5) {
    return json({ error: "This was a random failure" }, { status: 500 });
  }
  await deleteNote({ id, userId });
  return new Response("ok");
};

export default function NotesPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  const fetchers = useFetchers();
  const hasNotes =
    data.noteListItems.filter(
      (n) =>
        !fetchers.find(
          (f) =>
            f.submission?.formData.get("action") === "delete-note" &&
            f.submission?.formData.get("noteId") === n.id
        )
    ).length > 0;

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>

          <hr />

          {!hasNotes ? <p className="p-4">No notes yet</p> : null}

          <ol>
            {data.noteListItems.map((note) => (
              <NoteLi key={note.id} note={note} />
            ))}
          </ol>
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NoteLi({ note }: { note: Pick<Note, "id" | "title"> }) {
  const fetcher = useFetcher();
  const matches = useMatches();
  const navigate = useNavigate();
  const isOnNotePage = matches.find((m) => m.params.noteId === note.id);

  const isDeleting = fetcher.submission?.formData.get("noteId") === note.id;

  React.useEffect(() => {
    if (isDeleting) navigate("/notes");
  }, [isOnNotePage, isDeleting, navigate]);

  if (isDeleting) return null;

  return (
    <li className={`border-b p-4 ${isDeleting ? "opacity-30" : ""}`}>
      <div className="flex justify-between text-xl">
        <NavLink
          className={({ isActive }) => `${isActive ? "bg-white" : ""}`}
          to={note.id}
          prefetch="intent"
        >
          📝 {note.title}
        </NavLink>
        <fetcher.Form method="post">
          <input type="hidden" name="noteId" value={note.id} />
          <button disabled={isDeleting} name="action" value="delete-note">
            🗑
          </button>
        </fetcher.Form>
      </div>
      {fetcher.data?.error ? (
        <span className="text-red-700">{fetcher.data.error}</span>
      ) : null}
    </li>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 400) {
    return (
      <div>
        You did it wrong... <pre>{caught.data.error}</pre>
      </div>
    );
  }

  if (caught.status === 404) {
    return <div>Not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

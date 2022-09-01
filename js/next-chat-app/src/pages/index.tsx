import { useChannelMessage, useReadChannelState } from "@onehop/react";
import { startTransition, useEffect, useRef, useState } from "react";
import { HOP_CHANNEL_NAME } from "../utils/config";
import { getErrorMessage } from "../utils/errors";
import { Message, PickWhereValuesAre } from "../utils/types";

export default function Index() {
	const [loading, setLoading] = useState(false);
	const [General, setGeneral] = useState<Array<Message>>([]);

	const [message, setMessage] = useState<Omit<Message, "id" | "isAdmin">>({
		author: "",
		content: "",
	});

	const inputRef = useRef<HTMLInputElement | null>(null);

	useChannelMessage<Message>(HOP_CHANNEL_NAME, "MESSAGE_CREATE", message => {
		setGeneral(General => [message, ...General]);
	});

	const { state } = useReadChannelState<{ General: Message[] }>(HOP_CHANNEL_NAME);

	useEffect(() => {
		if (General.length === 0 && state && state.General.length > 0) {
			setGeneral(state.General);
		}
	}, [state, General]);

	useEffect(() => {
		if (!loading) {
			inputRef.current?.focus();
		}
	}, [loading]);

	const set = (key: keyof PickWhereValuesAre<Omit<Message, "id">, string>) => {
		return (event: React.ChangeEvent<HTMLInputElement>) => {
			setMessage(m => ({ ...m, [key]: event.target.value }));
		};
	};

	return (
		<div>
			<h1>Hop.io live chat app</h1>

			<p>
				This is a Next.js app leveraging{" "}
				<a href="https://docs.hop.io/channels/overview">Hop Channels</a> and{" "}
				<a href="https://www.npmjs.com/package/@onehop/js">Hop's JavaScript SDK</a>.
			</p>

			<form
				onSubmit={async e => {
					e.preventDefault();

					if (message.content.trim() === "") {
						return;
					}

					setLoading(true);

					try {
						const request = new Request("/api/message", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(message),
						});

						const response = await fetch(request);
						const body = (await response.json()) as
							| { success: true }
							| { success: false; message: string };

						if (!body.success) {
							throw new Error(body.message);
						}

						setMessage(old => ({ ...old, content: "" }));
					} catch (e: unknown) {
						console.error(e);
						alert(getErrorMessage(e));
					} finally {
						startTransition(() => {
							setLoading(false);
						});
					}
				}}>
				<input
					disabled={loading}
					type="text"
					placeholder="Author"
					value={message.author}
					onChange={set("author")}
				/>

				<input
					ref={inputRef}
					disabled={loading}
					type="text"
					placeholder="Write a message..."
					value={message.content}
					onChange={set("content")}
				/>

				<button disabled={loading} type="submit">
					Send
				</button>
			</form>

			<ul>
				{General.map(message => (
					<li key={message.id}>
						<b style={{ color: message.isAdmin ? "gold" : "black" }}>{message.author}</b>:{" "}
						<span>{message.content}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

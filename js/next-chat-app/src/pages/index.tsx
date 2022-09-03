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
		date:"",
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
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous"></link>	
			<title>Texuto</title>		
			<nav className="navbar navbar-dark bg-dark">
				<div className="container">
					<a className="navbar-brand" href="#">Texuto</a>
				</div>
			</nav>				
			<nav className="discordnav"> 
				<a href="" className="active"></a>
				<hr/>
				<a href=""></a> 
				<a href=""></a>
				<a href=""></a>
				<a href=""></a>
				<a href=""></a>			
			</nav>		
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
						className="User"
						disabled={loading}
						type="text"
						placeholder="Username"
						value={message.author}
						onChange={set("author")}
					/>

					<input
						className="InpField"
						ref={inputRef}
						disabled={loading}
						type="text"
						placeholder="Write a message..."
						value={message.content}
						onChange={set("content")}
					/>

					<button disabled={loading} type="submit" className="sendbutton">Send</button>				
			</form>
			
				{General.map(message => (
					<div className="msg-container">
						<div className="message-blue">
							<li key={message.id} className="UniqueList">
								<b style={{ color: message.isAdmin ? "gold" : "black" }}>{message.author}</b><br/>{" "}
								<span>{message.content}</span>
								<div className="message-timestamp-left">{message.date}</div>
							</li>
						</div>
					</div>
				))}
		</div>
	);
}

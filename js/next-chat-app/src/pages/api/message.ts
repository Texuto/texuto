import { Hop, APIAuthentication } from "@onehop/js";
import { nanoid } from "nanoid";
import { NextApiHandler } from "next";
import { ChannelName } from "../api/channel";
import { Message } from "../../utils/types";

const hop = new Hop(process.env.HOP_PROJECT_TOKEN as APIAuthentication);

const handler: NextApiHandler = async (req, res) => {
	const { content, author, date} = req.body;

	if (!content || !author) {
		return res.status(400).json({
			success: false,
			message: "Missing `.content` or `.author` field",
		});
	}

	const message: Message = {
		id: nanoid(),
		content: content.trim(),		
			author: author === process.env.HOP_PROJECT_TOKEN ? "blaze" : author.trim(),
			date: date === process.env.HOP_PROJECT_TOKEN ? "" : new Date().toLocaleTimeString(),
		isAdmin: author === process.env.HOP_PROJECT_TOKEN,						
	};

	await hop.channels.publishMessage(ChannelName, "MESSAGE_CREATE", message);

	await hop.channels.setState<{ General: Message[] }>(ChannelName, state => ({
		General: [message, ...state.General].slice(0, 20),
	}));

	res.status(200).json({
		success: true,
	});
};

export default handler;

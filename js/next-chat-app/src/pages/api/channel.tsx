var ActiveChannelName = "General" 

function ChangeChannel(value) {
     ActiveChannelName = value;
}   

export{ActiveChannelName as ChannelName, ChangeChannel}
const socket = io('https://live-chat-app-mandeep.vercel.app/', {
    autoConnect: false
});

fetch('/userdata')
.then(response => response.json())
.then(({username, userId}) => {
    if (userId !== null) {
        console.log(username, userId);
        socket.auth = {user: username, id: userId};
        socket.connect();
    }
})
.catch(error => {
    console.error('Error fetching user data:', error);
});

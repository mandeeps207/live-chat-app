const socket = io(window.location.origin, {
    autoConnect: false
});
// Socket methods
class socketMethods {
    async socketConnect(user, id) {
        socket.auth = {user, id}
        await socket.connect();
    }
}

fetch('/userdata')
.then(response => response.json())
.then(({username, userId}) => {
    if (userId !== null) {
        console.log(username, userId);
        const conn = new socketMethods();
        conn.socketConnect(username, userId);
    }
})
.catch(error => {
    console.error('Error fetching user data:', error);
});

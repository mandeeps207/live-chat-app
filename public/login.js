// Login form handler
const form = document.querySelector('#login-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.elements['username'].value;
    const password = form.elements['password'].value;
    const result = document.querySelector('#error');
    const formOption = form.elements['loginOption'].value;
    let options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password, formOption})
    };
    try {
        const res = await fetch('/login', options);
        const {message} = await res.json();
        if(res.status === 409 || 503 || 403) {
            result.classList.add('text-danger');
            result.innerHTML = message;
        }
        if(res.status === 201) {
            result.classList.remove('text-danger');
            result.classList.add('text-success');
            result.innerHTML = message;
            setTimeout(() => {
                window.location.href = ('/');
            }, 2000);
        }
    } catch (error) {
        result.classList.add('text-danger');
        result.innerHTML = error.message;
    }
});
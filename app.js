const SUPABASE_URL = 'https://jizxkjrdmkylwmssjnws.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppenhranJkbWt5bHdtc3NqbndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTI1MjgsImV4cCI6MjA1NTkyODUyOH0.FaaBjP3nJE3E0LVsx9VJT2qI0lXbn9uJNQkgNO86IX8';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentGerente = null;

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { user, error } = await supabase.auth.signIn({
        email,
        password
    });

    if (error) {
        alert(error.message);
    } else {
        currentGerente = user;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        document.getElementById('gerente-name').textContent = user.email;
        loadClientes();
    }
}

async function loadClientes() {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('gerente_id', currentGerente.id);

    if (error) {
        alert(error.message);
    } else {
        const clientesList = document.getElementById('clientes-list');
        clientesList.innerHTML = '';
        data.forEach(cliente => {
            const clienteDiv = document.createElement('div');
            clienteDiv.textContent = `Nombre: ${cliente.nombre}, Email: ${cliente.email}, Teléfono: ${cliente.telefono}`;
            clientesList.appendChild(clienteDiv);
        });
    }
}

async function logout() {
    await supabase.auth.signOut();
    currentGerente = null;
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
}

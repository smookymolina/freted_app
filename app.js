/* Estilos generales */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #e9f2f9;
    color: #333;
    transition: background-color 0.3s ease;
}

/* Contenedor principal */
#login-section, #dashboard-section {
    max-width: 400px;
    margin: 50px auto;
    background: #ffffff;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Títulos */
h2 {
    color: #0056b3;
    text-align: center;
    margin-bottom: 20px;
}

h3 {
    color: #007bff;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
    margin-top: 20px;
}

/* Campos de entrada */
input[type="email"], input[type="password"], input[type="file"] {
    width: 100%;
    padding: 10px;
    margin-top: 8px;
    margin-bottom: 16px;
    border: 2px solid #007bff;
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 14px;
}

input[type="email"]:focus, input[type="password"]:focus, input[type="file"]:focus {
    border-color: #0056b3;
    outline: none;
}

/* Botones */
button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

/* Lista de reclutas */
#reclutas-list {
    margin-top: 20px;
}

#reclutas-list div {
    padding: 10px;
    margin-top: 5px;
    background-color: #f8f9fa;
    border-left: 5px solid #007bff;
    border-radius: 4px;
    font-size: 14px;
}

/* Selector de color */
#color-picker {
    margin-top: 20px;
    text-align: center;
}

#color-picker label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
    color: #007bff;
}

#color-picker input[type="color"] {
    width: 50px;
    height: 50px;
    padding: 5px;
    border: 2px solid #007bff;
    border-radius: 50%;
    cursor: pointer;
}

/* Responsive design */
@media (max-width: 768px) {
    body {
        padding: 10px;
    }

    #login-section, #dashboard-section {
        margin: 20px auto;
        padding: 15px;
    }

    h2 {
        font-size: 24px;
    }

    h3 {
        font-size: 18px;
    }

    button {
        font-size: 14px;
    }
}

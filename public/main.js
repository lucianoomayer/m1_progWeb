const cookies = document.cookie.split(";");


let nomeUsuario = "";
let horaLogin = "";
let nomeNavegador = "";
let validadeSessao = "";
let historico = [];

for (let i = 0; i < cookies.length; i++) {
    const pedaco = cookies[i].trim();

    if (pedaco.startsWith("nome=")) {
        nomeUsuario = decodeURIComponent(pedaco.split("=")[1]);
    }
    else if (pedaco.startsWith("hora=")) {
        horaLogin = decodeURIComponent(pedaco.split("=")[1]);
    }
    else if (pedaco.startsWith("navegador=")) {
        nomeNavegador = decodeURIComponent(pedaco.split("=")[1]);
    }
    else if (pedaco.startsWith("validade=")) {
        validadeSessao = decodeURIComponent(pedaco.split("=")[1]);
    }
    else if (pedaco.startsWith("historico=")) {
        try {
            historico = JSON.parse(decodeURIComponent(pedaco.split("=")[1]));
        } catch (erro) {
            historico = [];
        }
    }
}

document.getElementById('userName').innerText = nomeUsuario;
document.getElementById('loginDateTime').innerText = horaLogin;
document.getElementById('userAgentInfo').innerText = nomeNavegador;
document.getElementById('sessionValidity').innerText = validadeSessao;

const corpoDaTabela = document.getElementById('historyTableBody');
corpoDaTabela.innerHTML = ""; // Limpa aquela linha falsa [dia e horário] do HTML

for (let i = 0; i < historico.length; i++) {
    const item = historico[i];
    
    corpoDaTabela.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${item.hora}</td>
            <td>${item.navegador}</td>
        </tr>
    `;
}
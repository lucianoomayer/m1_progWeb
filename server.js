const express = require('express');
const path = require('node:path');
const { log } = require('node:console');

const app = express();
const publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.listen(5000);

const usuarios = [
    { id: 1, nome: 'Steve', username: 'steve@gmail.com', password: '123456' },
    { id: 2, nome: 'Leonardo', username: 'leonardo@gmail.com', password: '111222' },
    { id: 3, nome: 'Luciano', username: 'luciano@gmail.com', password: '654321' }
];

function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(";").forEach((pedaco) => {
        const [chave, valor] = pedaco.trim().split("=");
        if (chave) {
            cookies[chave] = decodeURIComponent(valor || "");
        }
    });

    return cookies;
}

app.get("/", function (req, res) {
    const cookiesNavegador = req.headers.cookie;
    if(!cookiesNavegador || !cookiesNavegador.includes("nome=")){
        res.redirect("/login");
    } else {
        res.redirect("/inicio");
    }
});

app.get("/login", function (req, res) {
    res.sendFile(path.join(publicDir, "login.html"));
})

app.post("/login", function (req, res) {

    const usuarioDigitado = req.body.username;
    const senhaDigitada = req.body.password;
    const manterConectado = req.body.manter_conectado;

    const usuarioValido = usuarios.find(
        (u) => u.username === usuarioDigitado && u.password === senhaDigitada
    );

    if (usuarioValido) {
        const msTresDias = 3 * 24 * 60 * 60 * 1000; //Cálculo de 3 dias em ms (259200000 ms)
        let textoValidade = "fechar o navegador";
        let opcoesCookie = {};

        if (manterConectado) {
            opcoesCookie = { maxAge:  msTresDias}

            const dataFutura = new Date(Date.now() + msTresDias);

            // toLocaleString() mostra a data e a hora bonitinhas (ex: "02/09/2026, 13:37:55")
            textoValidade = dataFutura.toLocaleString();

            res.cookie('manterConectado', 'true', { maxAge: msTresDias });
        }

        const horaLogin = new Date().toLocaleString();
        const navegadorLogin = req.headers['user-agent'];

        // Histórico acumula os logins em um cookie próprio, independente do "manter conectado",
        // para não perder o registro de acessos anteriores mesmo em sessões sem essa opção marcada.
        const cookiesAtuais = parseCookies(req.headers.cookie);
        let historico = [];
        if (cookiesAtuais.historico) {
            try {
                historico = JSON.parse(cookiesAtuais.historico);
            } catch (erro) {
                historico = [];
            }
        }
        // Mantém no histórico apenas os acessos do usuário que está logando agora,
        // para não misturar o histórico de contas diferentes no mesmo navegador.
        historico = historico.filter((item) => item.usuarioId === usuarioValido.id);
        historico.push({ hora: horaLogin, navegador: navegadorLogin, usuarioId: usuarioValido.id });

        res.cookie('nome', usuarioValido.nome, opcoesCookie);
        res.cookie('hora', horaLogin, opcoesCookie);
        res.cookie('navegador', navegadorLogin, opcoesCookie);
        res.cookie('validade', textoValidade, opcoesCookie);
        res.cookie('historico', JSON.stringify(historico), { maxAge: msTresDias });


        console.log("Usuário logado:", usuarioValido.nome);
        res.redirect("/inicio");
    } else {
        res.redirect("/login?erro=1");
    }
});

app.get("/inicio", function (req, res) {
    const cookiesNavegador = req.headers.cookie;

    if (!cookiesNavegador || !cookiesNavegador.includes("nome=")) {
        console.log("Tentativa de acesso sem login. Bloqueado!");
        return res.redirect("/login");
    }
    res.sendFile(path.join(publicDir, "inicio.html"));
});

app.get("/logout", function (req, res) {
    res.clearCookie('nome');
    res.clearCookie('hora');
    res.clearCookie('navegador');
    res.clearCookie('validade');
    res.clearCookie('manterConectado');
    // 'historico' não é limpo no logout: o histórico de logins deve
    // persistir entre sessões, mesmo sem "manter conectado" marcado.

    res.redirect("/login");
})
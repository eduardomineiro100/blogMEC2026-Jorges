function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto == null ? '' : String(texto);
    return div.innerHTML;
}

function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

const listaPalavroes = [
    "porra", "caralho", "merda", "buceta", "puta", "putinha",
    "piroca", "cacete", "arrombado", "arrombada", "viado",
    "burro", "macaco", "cuzão", "fdp", "vsf", "desgraça",
    "otario", "otário", "idiota", "imbecil"
];

const regexPalavroes = new RegExp(
    '\\b(' + listaPalavroes.map(normalizar).join('|') + ')',
    'i'
);

function contemPalavrao(texto) {
    return regexPalavroes.test(normalizar(texto));
}

const playlist = [
    {
        titulo: "🔥 MUSIC PLAYER v1.0 🔥 (Desireless - Voyage Voyage)",
        url: "https://ia600602.us.archive.org/11/items/ytdown.com-you-tube-desireless-voyage-voyage-official-hd-vid-media-nlgm-h-5q-9u-nk-008-128k/YTDown.com_YouTube_Desireless-Voyage-Voyage-Official-HD-Vid_Media_NlgmH5q9uNk_008_128k.mp3"
    },
    {
        titulo: "🔥 MUSIC PLAYER v1.0 🔥 (Evanescence - Bring Me To Life)",
        url: "https://ia601809.us.archive.org/25/items/ytdown.com-you-tube-evanescence-bring-me-to-life-official-hd-media-3-yxaa-gg-tqym-009-128k/YTDown.com_YouTube_Evanescence-Bring-Me-To-Life-Official-HD_Media_3YxaaGgTQYM_009_128k.mp3"
    },
    {
        titulo: "🔥 MUSIC PLAYER v1.0 🔥 (Sheryl Crow - Real Gone)",
        url: "https://ia601401.us.archive.org/34/items/ytdown.com-you-tube-real-gone-by-sheryl-crow-from-the-cars-s-media-62-vjm-0-ugfv-8-009-128k/YTDown.com_YouTube_Real-Gone-by-Sheryl-Crow-from-the-Cars-S_Media_62Vjm0UGfv8_009_128k.mp3"
    }
];

const player = {
    indiceAtual: 0,
    audio: document.getElementById('bgmusic'),
    source: document.getElementById('audio-source'),
    titulo: document.getElementById('player-title')
};

function mudarMusica(direcao) {
    player.indiceAtual += direcao;

    if (player.indiceAtual >= playlist.length) {
        player.indiceAtual = 0;
    }

    if (player.indiceAtual < 0) {
        player.indiceAtual = playlist.length - 1;
    }

    const faixa = playlist[player.indiceAtual];

    player.source.src = faixa.url;
    player.titulo.innerText = faixa.titulo;
    player.audio.load();
}

function toggleAdmin() {
    const panel = document.getElementById('adminPanel');

    if (panel) {
        panel.style.display =
            panel.style.display === 'block' ? 'none' : 'block';
    }
}

const sessao = {
    pronta: false
};

auth.onAuthStateChanged((user) => {
    sessao.pronta = !!user;

    if (user) {
        localStorage.setItem('meuCriadorUid', user.uid);
        carregarPostagens();
    }
});

function avisarCarregando() {
    alert('Ainda carregando, aguarde um segundo e tente de novo.');
}

function mensagemDeErro(error) {
    if (error && String(error.message).includes('permission_denied')) {
        return 'o banco de dados recusou a operação (permission_denied). ' +
               'Se estiver testando localmente, confira o App Check.';
    }
    return error && error.message ? error.message : String(error);
}

let ouvindoPostagens = false;

function carregarPostagens() {
    if (ouvindoPostagens) {
        return;
    }
    ouvindoPostagens = true;

    db.ref('posts').on('value', (snapshot) => {
        renderizarPostagens(snapshot.val() || {});
    }, (error) => {
        ouvindoPostagens = false;
        console.log('Erro ao carregar postagens:', error);
    });
}

function renderizarPostagens(dados) {
    const coluna = document.getElementById('blogPostsColumn');
    coluna.innerHTML = '';

    const uidGuardado = localStorage.getItem('meuCriadorUid');
    const meuUid = auth.currentUser ? auth.currentUser.uid : uidGuardado;

    Object.entries(dados).reverse().forEach(([idPost, post]) => {
        coluna.appendChild(criarElementoPost(idPost, post, meuUid, uidGuardado));
    });
}

function criarElementoPost(idPost, post, meuUid, uidGuardado) {
    const curtidasAtuais = Number(post.curtidas || 0);
    const jaCurtiu = meuUid && post.curtidoPor && post.curtidoPor[meuUid] === true;
    const ehMeuPost = meuUid && (post.autor === meuUid || post.autor === uidGuardado);

    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    postDiv.innerHTML = `
        <div class="post-title">${escaparHtml(post.titulo)}</div>

        <div class="date">${escaparHtml(post.data)}</div>

        <p>${escaparHtml(post.conteudo)}</p>

        <div style="margin-top: 10px; text-align: left;">
            ${botaoCurtirHtml(idPost, curtidasAtuais, jaCurtiu)}
            ${ehMeuPost ? botaoExcluirHtml(idPost) : ''}
        </div>
    `;

    return postDiv;
}

function botaoCurtirHtml(idPost, curtidas, jaCurtiu) {
    if (jaCurtiu) {
        return `
            <button
                class="retro-button"
                style="padding: 3px 8px; opacity: 0.6; cursor: not-allowed;"
                disabled
            >
                ✅ Já Curtiu (${curtidas})
            </button>
        `;
    }

    return `
        <button
            class="retro-button"
            onclick="curtirPost('${idPost}')"
            style="cursor: pointer; padding: 3px 8px;"
        >
            🔥 Curtir (${curtidas})
        </button>
    `;
}

function botaoExcluirHtml(idPost) {
    return `
        <button
            class="retro-button"
            onclick="excluirPost('${idPost}')"
            style="cursor: pointer; padding: 3px 8px; background: #333; margin-left: 10px;"
        >
            ❌ Excluir
        </button>
    `;
}

function adicionarPostagem() {
    if (!sessao.pronta) {
        avisarCarregando();
        return;
    }

    if (!respeitaCooldownDePostagem()) {
        alert('Aguarde 30 segundos antes de postar de novo.');
        return;
    }

    const titulo = document.getElementById('postTitleInput').value.trim();
    const conteudo = document.getElementById('postContentInput').value.trim();

    if (titulo === "" || conteudo === "") {
        alert('Preencha o titulo e o conteudo da postagem!');
        return;
    }

    if (contemPalavrao(titulo) || contemPalavrao(conteudo)) {
        alert('Sua postagem contém palavras não permitidas. Ajuste o texto e tente novamente.');
        return;
    }

  const uid = auth.currentUser.uid;
const novoId = db.ref('posts').push().key;

const atualizacoes = {};
atualizacoes['posts/' + novoId] = {
    titulo: titulo,
    data: formatarDataAtual(),
    conteudo: conteudo,
    curtidas: 0,
    autor: uid
};
atualizacoes['ratelimit/' + uid] = firebase.database.ServerValue.TIMESTAMP;

db.ref().update(atualizacoes)
.then(() => {
    
        localStorage.setItem('ultimoPostTimestamp', Date.now());
        document.getElementById('postTitleInput').value = "";
        document.getElementById('postContentInput').value = "";
    })
    .catch((error) => {
        alert('Não foi possível publicar: ' + mensagemDeErro(error));
        console.log('Erro ao publicar post:', error);
    });
}

function respeitaCooldownDePostagem() {
    const ultimoPost = Number(localStorage.getItem('ultimoPostTimestamp'));
    const agoraTs = Date.now();

    return !ultimoPost || (agoraTs - ultimoPost) >= 30000;
}

function formatarDataAtual() {
    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');

    return `Postado em: ${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

function curtirPost(idPost) {
    if (!sessao.pronta) {
        avisarCarregando();
        return;
    }

    const uid = auth.currentUser.uid;
    const postRef = db.ref('posts/' + idPost);

    postRef.transaction((post) => {
        if (post === null) {
            return;
        }

        if (!post.curtidoPor) {
            post.curtidoPor = {};
        }

        if (post.curtidoPor[uid]) {
            return;
        }

        post.curtidas = Number(post.curtidas || 0) + 1;
        post.curtidoPor[uid] = true;

        return post;
    })
    .then((resultado) => {
        if (!resultado.committed) {
            console.log('Curtida não aplicada (já curtido ou post removido).');
        }
    })
    .catch((error) => {
        alert('Não foi possível curtir: ' + mensagemDeErro(error));
        console.log('Erro ao curtir post:', error);
    });
}

function excluirPost(idPost) {
    if (!sessao.pronta) {
        avisarCarregando();
        return;
    }

    const postRef = db.ref('posts/' + idPost);

    postRef.once('value')
        .then((snapshot) => {
            const post = snapshot.val();

            if (!post) {
                alert('Essa postagem não existe mais.');
                return;
            }

            if (post.autor !== auth.currentUser.uid) {
                alert('Você só pode excluir suas próprias postagens.');
                return;
            }

            if (confirm('Tem certeza que deseja excluir a sua postagem?')) {
                return postRef.remove();
            }
        })
        .catch((error) => {
            alert('Não foi possível excluir: ' + mensagemDeErro(error));
            console.log('Erro ao excluir post:', error);
        });
}

const coresConfete = ['#ff0000', '#ff6600', '#ffcc00'];
const INTERVALO_MINIMO_CONFETE_MS = 40;
let ultimoConfeteEm = 0;

document.addEventListener('mousemove', function (e) {
    const agora = Date.now();

    if (agora - ultimoConfeteEm < INTERVALO_MINIMO_CONFETE_MS) {
        return;
    }
    ultimoConfeteEm = agora;

    criarConfete(e.clientX, e.clientY);
});

function criarConfete(x, y) {
    const confete = document.createElement('div');

    const corAleatoria = coresConfete[Math.floor(Math.random() * coresConfete.length)];
    const tamanho = Math.random() * (10 - 4) + 4;
    const eQuadrado = Math.random() > 0.5;

    confete.style.position = 'fixed';
    confete.style.left = x + 'px';
    confete.style.top = y + 'px';
    confete.style.width = tamanho + 'px';
    confete.style.height = tamanho + 'px';
    confete.style.backgroundColor = corAleatoria;
    confete.style.borderRadius = eQuadrado ? '0px' : '50%';
    confete.style.pointerEvents = 'none';
    confete.style.zIndex = '999999';
    confete.style.transition = 'all 0.7s ease-out';

    const desvioX = (Math.random() - 0.5) * 40;
    const quedaY = Math.random() * 50 + 30;
    const rotacao = Math.random() * 360;

    document.body.appendChild(confete);

    setTimeout(() => {
        confete.style.opacity = '0';
        confete.style.transform = `translate(${desvioX}px, ${quedaY}px) rotate(${rotacao}deg)`;
    }, 50);

    setTimeout(() => {
        confete.remove();
    }, 700);
}
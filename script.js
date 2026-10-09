/* =========================
   ESTADO DEL JUEGO
========================= */
let puntos = 0;
let vidas = 3;
let ejercicioActual = 0;
let respuestaCorrecta = 0;
let puntoA = { x: 0, y: 0 };
let puntoB = { x: 0, y: 0 };
let racha = 0;
let mejorRacha = 0;
let aciertos = 0;
let intentos = 0;
let ordenEjercicios = [];

/*
   Banco de 10 ejercicios con distancias EXACTAS y VARIADAS.
   Incluye triángulos pitagóricos clásicos + otros valores exactos.
*/
const bancoEjercicios = [
    { A: [0, 0],   B: [3, 4],   d: 5 },      // 3-4-5
    { A: [1, 1],   B: [4, 5],   d: 5 },      // 3-4-5 desplazado
    { A: [0, 0],   B: [5, 12],  d: 13 },     // 5-12-13
    { A: [-2, 3],  B: [4, 11],  d: 10 },     // 6-8-10
    { A: [0, 0],   B: [8, 15],  d: 17 },     // 8-15-17
    { A: [2, -1],  B: [6, 2],   d: 5 },      // 4-3-5
    { A: [-3, -4], B: [0, 0],   d: 5 },      // 3-4-5
    { A: [1, 2],   B: [7, 10],  d: 10 },     // 6-8-10
    { A: [-1, 0],  B: [2, 4],   d: 5 },      // 3-4-5
    { A: [0, 0],   B: [9, 12],  d: 15 }      // 9-12-15
];

/* Fisher-Yates shuffle → orden aleatorio cada partida */
function mezclar(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* =========================
   INICIAR
========================= */
function iniciarJuego() {
    document.getElementById('inicio').style.display = 'none';
    document.getElementById('juego').style.display = 'block';
    document.getElementById('victoria').style.display = 'none';
    document.getElementById('gameover').style.display = 'none';

    puntos = 0;
    vidas = 3;
    ejercicioActual = 0;
    racha = 0;
    mejorRacha = 0;
    aciertos = 0;
    intentos = 0;

    // Orden aleatorio cada vez → no se puede memorizar la secuencia
    ordenEjercicios = mezclar(bancoEjercicios);

    actualizarEstadisticas();
    nuevaPregunta();
}

function reiniciarTodo() {
    document.getElementById('victoria').style.display = 'none';
    document.getElementById('gameover').style.display = 'none';
    document.getElementById('inicio').style.display = 'block';
    document.getElementById('juego').style.display = 'none';
}

/* =========================
   NUEVA PREGUNTA
========================= */
function nuevaPregunta() {
    if (ejercicioActual >= ordenEjercicios.length) {
        terminarJuego(true);
        return;
    }

    const ejercicio = ordenEjercicios[ejercicioActual];

    puntoA = { x: ejercicio.A[0], y: ejercicio.A[1] };
    puntoB = { x: ejercicio.B[0], y: ejercicio.B[1] };
    respuestaCorrecta = ejercicio.d;

    // Verificación de seguridad
    const dx = puntoB.x - puntoA.x;
    const dy = puntoB.y - puntoA.y;
    const calc = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(calc - respuestaCorrecta) > 0.001) {
        respuestaCorrecta = Math.round(calc * 100) / 100;
    }

    document.getElementById('puntoA').textContent =
        `🔴 A = (${puntoA.x}, ${puntoA.y})`;
    document.getElementById('puntoB').textContent =
        `🔵 B = (${puntoB.x}, ${puntoB.y})`;

    document.getElementById('respuesta').value = '';
    document.getElementById('respuesta').focus();

    const res = document.getElementById('resultado');
    res.className = 'resultado neutral';
    res.textContent = '💡 Calcula la distancia exacta entre A y B.';

    document.getElementById('comprobar').style.display = 'block';
    document.getElementById('siguiente').style.display = 'none';

    document.getElementById('nivelBadge').textContent =
        `Misión ${ejercicioActual + 1}/${ordenEjercicios.length}`;
    document.getElementById('progresoTexto').textContent =
        `Misión ${ejercicioActual + 1} de ${ordenEjercicios.length}`;

    actualizarBarra();
    dibujarPlano();
}

/* =========================
   PLANO CARTESIANO
========================= */
function dibujarPlano() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const ancho = canvas.width;
    const alto = canvas.height;

    ctx.clearRect(0, 0, ancho, alto);

    // Fondo con degradado sutil
    const grad = ctx.createRadialGradient(ancho / 2, alto / 2, 0, ancho / 2, alto / 2, ancho * 0.7);
    grad.addColorStop(0, '#12152e');
    grad.addColorStop(1, '#0a0c1c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, ancho, alto);

    const centroX = ancho / 2;
    const centroY = alto / 2;
    const escala = 38;

    // Cuadrícula
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;

    for (let i = -8; i <= 8; i++) {
        const x = centroX + i * escala;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, alto);
        ctx.stroke();

        const y = centroY - i * escala;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ancho, y);
        ctx.stroke();
    }

    // Ejes con flechas
    ctx.strokeStyle = '#8b85c9';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    // Eje X
    ctx.beginPath();
    ctx.moveTo(20, centroY);
    ctx.lineTo(ancho - 20, centroY);
    ctx.stroke();
    // Flecha X
    ctx.beginPath();
    ctx.moveTo(ancho - 20, centroY);
    ctx.lineTo(ancho - 32, centroY - 7);
    ctx.lineTo(ancho - 32, centroY + 7);
    ctx.closePath();
    ctx.fillStyle = '#8b85c9';
    ctx.fill();

    // Eje Y
    ctx.beginPath();
    ctx.moveTo(centroX, 20);
    ctx.lineTo(centroX, alto - 20);
    ctx.stroke();
    // Flecha Y
    ctx.beginPath();
    ctx.moveTo(centroX, 20);
    ctx.lineTo(centroX - 7, 32);
    ctx.lineTo(centroX + 7, 32);
    ctx.closePath();
    ctx.fill();

    // Etiquetas de ejes
    ctx.fillStyle = '#a5a3c0';
    ctx.font = 'bold 13px system-ui, Arial';
    ctx.fillText('x', ancho - 18, centroY - 12);
    ctx.fillText('y', centroX + 12, 28);

    // Números
    ctx.fillStyle = '#7c7a9a';
    ctx.font = '12px system-ui, Arial';
    for (let i = -7; i <= 7; i++) {
        if (i === 0) continue;
        ctx.fillText(String(i), centroX + i * escala - 4, centroY + 16);
        ctx.fillText(String(i), centroX + 8, centroY - i * escala + 4);
    }

    // Origen
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui, Arial';
    ctx.fillText('0', centroX + 6, centroY + 14);

    // Coordenadas de puntos
    const ax = centroX + puntoA.x * escala;
    const ay = centroY - puntoA.y * escala;
    const bx = centroX + puntoB.x * escala;
    const by = centroY - puntoB.y * escala;

    // Línea de distancia (con glow)
    ctx.shadowColor = 'rgba(167, 139, 250, 0.6)';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Segmentos de proyección (líneas punteadas)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, ay);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.setLineDash([]);

    // Punto A
    ctx.shadowColor = 'rgba(244, 63, 94, 0.7)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(ax, ay, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ax, ay, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Punto B
    ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bx, by, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Letras
    ctx.font = 'bold 17px system-ui, Arial';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('A', ax + 16, ay - 10);
    ctx.fillText('B', bx + 16, by - 10);
    ctx.shadowBlur = 0;
}

/* =========================
   COMPROBAR RESPUESTA
========================= */
function comprobarRespuesta() {
    const input = document.getElementById('respuesta');
    const valor = Number(input.value);
    const resultado = document.getElementById('resultado');

    if (input.value === '' || isNaN(valor)) {
        resultado.className = 'resultado incorrecto';
        resultado.textContent = '⚠️ Escribe un número primero.';
        return;
    }

    intentos++;
    const correcto = Math.abs(valor - respuestaCorrecta) < 0.02;

    if (correcto) {
        puntos += 10;
        racha++;
        aciertos++;
        if (racha > mejorRacha) mejorRacha = racha;

        resultado.className = 'resultado correcto';
        resultado.innerHTML =
            `🎉 ¡CORRECTO!<br>` +
            `La distancia es <strong>${respuestaCorrecta}</strong><br>` +
            `⭐ +10 puntos` +
            (racha >= 3 ? ` · 🔥 Racha ×${racha}` : '');

        crearConfeti();
        pulseStat('statPuntos');
        pulseStat('statRacha');
    } else {
        vidas--;
        racha = 0;

        resultado.className = 'resultado incorrecto';
        resultado.innerHTML =
            `❌ Incorrecto.<br>` +
            `La distancia exacta es <strong>${respuestaCorrecta}</strong>`;

        pulseStat('statVidas');
    }

    actualizarEstadisticas();

    document.getElementById('comprobar').style.display = 'none';
    document.getElementById('siguiente').style.display = 'block';

    if (vidas <= 0) {
        setTimeout(() => terminarJuego(false), 1400);
    }
}

/* =========================
   SIGUIENTE
========================= */
function siguienteReto() {
    if (vidas <= 0) return;
    ejercicioActual++;
    nuevaPregunta();
    actualizarEstadisticas();
}

/* =========================
   ESTADÍSTICAS Y BARRA
========================= */
function actualizarEstadisticas() {
    document.getElementById('puntos').textContent = puntos;
    document.getElementById('vidas').textContent = vidas;
    document.getElementById('racha').textContent = racha;
}

function pulseStat(id) {
    const el = document.getElementById(id);
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
}

function actualizarBarra() {
    const pct = (ejercicioActual / ordenEjercicios.length) * 100;
    document.getElementById('barra').style.width = pct + '%';
}

/* =========================
   FINAL
========================= */
function terminarJuego(gano) {
    document.getElementById('juego').style.display = 'none';

    if (gano) {
        document.getElementById('victoria').style.display = 'block';
        document.getElementById('finalPuntos').textContent = puntos;
        document.getElementById('finalRacha').textContent = mejorRacha;
        document.getElementById('finalEjercicios').textContent = ordenEjercicios.length;

        const precision = intentos > 0
            ? Math.round((aciertos / intentos) * 100)
            : 100;
        document.getElementById('finalPrecision').textContent = precision + '%';

        let stars = '⭐';
        if (precision >= 70 || puntos >= 70) stars = '⭐⭐';
        if (precision >= 90 || puntos >= 90) stars = '⭐⭐⭐';
        document.getElementById('estrellas').textContent = stars;

        crearConfeti();
        setTimeout(crearConfeti, 400);
    } else {
        document.getElementById('gameover').style.display = 'block';
        document.getElementById('goPuntos').textContent = puntos;
        document.getElementById('goCompletados').textContent = ejercicioActual;
    }
}

/* =========================
   CONFETI
========================= */
function crearConfeti() {
    const colores = ['#f43f5e', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399', '#f472b6'];
    for (let i = 0; i < 30; i++) {
        const confeti = document.createElement('div');
        confeti.style.cssText = `
            position: fixed;
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 8}px;
            background: ${colores[Math.floor(Math.random() * colores.length)]};
            left: ${Math.random() * 100}%;
            top: -12px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
            z-index: 9999;
            pointer-events: none;
            opacity: 0.9;
        `;
        document.body.appendChild(confeti);

        const duracion = 1200 + Math.random() * 1800;
        const drift = (Math.random() - 0.5) * 200;

        confeti.animate(
            [
                { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 40}px) translateX(${drift}px) rotate(${720 + Math.random() * 360}deg)`, opacity: 0 }
            ],
            { duration: duracion, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
        );

        setTimeout(() => confeti.remove(), duracion);
    }
}

/* Enter para comprobar */
document.getElementById('respuesta').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const btn = document.getElementById('comprobar');
        if (btn.style.display !== 'none') comprobarRespuesta();
    }
});
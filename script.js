// Base de datos simulada de usuarios
const usuarios = {
    "usuario1": { password: "1234", role: "user" },
    "admin": { password: "admin123", role: "admin" },
    "tecnico1": { password: "tec123", role: "tecnico" }
};

// Base de datos simulada de alertas
let alertas = [
    { barrio: "El Prado", mensaje: "Poste inclinado en la calle 72", fecha: new Date('2025-05-10'), usuario: "user1" },
    { barrio: "Alameda del Río", mensaje: "Cable suelto cerca del parque", fecha: new Date('2025-05-11'), usuario: "user2" },
    { barrio: "La Victoria", mensaje: "Chispa en transformador", fecha: new Date('2025-05-12'), usuario: "user3" }
];

// Base de datos simulada del estado eléctrico
const estadoElectrico = {
    "El Prado": { voltaje: 220, postes: 50, danados: 1, fluido: true, tensionCables: 15 },
    "Alameda del Río": { voltaje: 215, postes: 45, danados: 0, fluido: true, tensionCables: 10 },
    "La Victoria": { voltaje: 210, postes: 60, danados: 2, fluido: true, tensionCables: 25 },
    "Los Andes": { voltaje: 225, postes: 55, danados: 1, fluido: true, tensionCables: 18 },
    "San José": { voltaje: 218, postes: 40, danados: 0, fluido: true, tensionCables: 12 },
    "Rebolo": { voltaje: 230, postes: 35, danados: 1, fluido: true, tensionCables: 22 },
    "Me Quejo": { voltaje: 208, postes: 50, danados: 3, fluido: false, tensionCables: 35 },
    "Ciudadela 20 de Julio": { voltaje: 235, postes: 60, danados: 2, fluido: true, tensionCables: 28 },
    "Villa Carolina": { voltaje: 200, postes: 30, danados: 0, fluido: true, tensionCables: 30 },
    "Boston": { voltaje: 240, postes: 45, danados: 1, fluido: true, tensionCables: 20 },
    "Montecristo": { voltaje: 195, postes: 55, danados: 2, fluido: false, tensionCables: 40 },
    "Riomar": { voltaje: 245, postes: 40, danados: 0, fluido: true, tensionCables: 15 },
    "Altos del Limón": { voltaje: 205, postes: 50, danados: 1, fluido: true, tensionCables: 25 },
    "Los Nogales": { voltaje: 235, postes: 35, danados: 0, fluido: true, tensionCables: 18 },
    "Las Nieves": { voltaje: 198, postes: 45, danados: 3, fluido: false, tensionCables: 38 },
    "Bella Arena": { voltaje: 242, postes: 40, danados: 1, fluido: true, tensionCables: 22 }
};

// Variables para el gráfico
let graficoTension;
let intervaloMonitoreo;
let datosTension = [];
let tiempoTranscurrido = 0;
const maxPuntos = 60; // Mostrar últimos 60 puntos (1 minuto si se actualiza cada segundo)

// Función para inicializar el gráfico
function inicializarGrafico() {
    const ctx = document.getElementById('grafico-tension').getContext('2d');
    
    graficoTension = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(maxPuntos).fill(''),
            datasets: [
                {
                    label: 'Tensión (V)',
                    data: [],
                    borderColor: 'gold',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Límite Mínimo (200V)',
                    data: Array(maxPuntos).fill(200),
                    borderColor: 'red',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: 'Límite Máximo (250V)',
                    data: Array(maxPuntos).fill(250),
                    borderColor: 'red',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: 'Ideal (220V)',
                    data: Array(maxPuntos).fill(220),
                    borderColor: 'lightgreen',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            scales: {
                y: {
                    min: 180,
                    max: 260,
                    title: {
                        display: true,
                        text: 'Voltaje (V)',
                        color: 'gold'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'white'
                    }
                },
                x: {
                    display: false,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'gold',
                    bodyColor: 'white',
                    borderColor: 'gold',
                    borderWidth: 1
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Función para actualizar el gráfico
function actualizarGrafico(valorTension) {
    // Agregar nuevo dato
    datosTension.push(valorTension);
    tiempoTranscurrido++;
    
    // Mantener solo los últimos puntos
    if (datosTension.length > maxPuntos) {
        datosTension.shift();
    }
    
    // Actualizar gráfico
    graficoTension.data.datasets[0].data = datosTension;
    graficoTension.update();
    
    // Actualizar indicadores
    document.getElementById('voltaje-actual').textContent = `${valorTension} V`;
    document.getElementById('tension-cables').textContent = `${calcularTensionCables(valorTension)}%`;
    
    // Determinar estado de la red
    const estadoRed = document.getElementById('estado-red');
    estadoRed.className = '';
    
    if (valorTension < 200 || valorTension > 250) {
        estadoRed.textContent = 'CRÍTICO';
        estadoRed.classList.add('critico');
    } else if (valorTension < 210 || valorTension > 240) {
        estadoRed.textContent = 'INESTABLE';
        estadoRed.classList.add('inestable');
    } else {
        estadoRed.textContent = 'ESTABLE';
        estadoRed.classList.add('estable');
    }
}

// Función para calcular tensión de cables (simulación)
function calcularTensionCables(voltaje) {
    // Simular que la tensión de cables es un porcentaje basado en la desviación del voltaje ideal (220V)
    const desviacion = Math.abs(voltaje - 220);
    let tension = Math.min(100, Math.round((desviacion / 30) * 100));
    
    // Añadir algo de variación aleatoria para hacerlo más realista
    tension += Math.floor(Math.random() * 5) - 2;
    
    return Math.max(0, Math.min(100, tension));
}

// Función para simular monitoreo
function iniciarMonitoreo() {
    if (intervaloMonitoreo) {
        alert("El monitoreo ya está en ejecución");
        return;
    }
    
    // Valor inicial (220V ± 10)
    let voltajeActual = 220 + Math.floor(Math.random() * 21) - 10;
    
    // Iniciar actualizaciones cada segundo
    intervaloMonitoreo = setInterval(() => {
        // Variación normal (±2V)
        voltajeActual += Math.floor(Math.random() * 5) - 2;
        
        // Mantener dentro de límites razonables (aunque puede superarlos)
        voltajeActual = Math.max(150, Math.min(270, voltajeActual));
        
        actualizarGrafico(voltajeActual);
    }, 1000);
    
    // Actualizar estado de los botones
    document.querySelectorAll('.controles button')[0].disabled = true;
    document.querySelectorAll('.controles button')[1].disabled = false;
}

function detenerMonitoreo() {
    if (!intervaloMonitoreo) {
        alert("El monitoreo no está en ejecución");
        return;
    }
    
    clearInterval(intervaloMonitoreo);
    intervaloMonitoreo = null;
    
    // Actualizar estado de los botones
    document.querySelectorAll('.controles button')[0].disabled = false;
    document.querySelectorAll('.controles button')[1].disabled = true;
}

function simularFalla() {
    if (!intervaloMonitoreo) {
        alert("Inicie el monitoreo primero");
        return;
    }
    
    // Simular una caída de tensión brusca
    let voltaje = datosTension.length > 0 ? datosTension[datosTension.length - 1] : 220;
    const fallaInterval = setInterval(() => {
        voltaje -= 10 + Math.floor(Math.random() * 15);
        if (voltaje <= 0) {
            clearInterval(fallaInterval);
            voltaje = 0;
        }
        actualizarGrafico(voltaje);
    }, 500);
    
    // Restaurar después de 5 segundos
    setTimeout(() => {
        clearInterval(fallaInterval);
        if (intervaloMonitoreo) {
            // Continuar con monitoreo normal
        } else {
            // Dejar en valor estable
            actualizarGrafico(220);
        }
    }, 5000);
}

// Función para cargar alertas en el panel de admin
function cargarAlertasAdmin() {
    const lista = document.getElementById('lista-alertas-admin');
    lista.innerHTML = "";
    
    alertas.sort((a, b) => b.fecha - a.fecha).forEach(alerta => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${alerta.barrio}</strong> 
            <small>(${alerta.fecha.toLocaleDateString()} ${alerta.fecha.toLocaleTimeString()})</small>: 
            ${alerta.mensaje}
            <button class="btn-resolver" onclick="resolverAlerta(this)">Resolver</button>
        `;
        lista.appendChild(li);
    });
}

function filtrarAlertas() {
    const barrio = document.getElementById('filtro-barrio').value;
    const lista = document.getElementById('lista-alertas-admin');
    lista.innerHTML = "";
    
    const alertasFiltradas = barrio === "todos" 
        ? alertas 
        : alertas.filter(a => a.barrio === barrio);
    
    alertasFiltradas.sort((a, b) => b.fecha - a.fecha).forEach(alerta => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${alerta.barrio}</strong> 
            <small>(${alerta.fecha.toLocaleDateString()} ${alerta.fecha.toLocaleTimeString()})</small>: 
            ${alerta.mensaje}
            <button class="btn-resolver" onclick="resolverAlerta(this)">Resolver</button>
        `;
        lista.appendChild(li);
    });
}

function resolverAlerta(boton) {
    const li = boton.parentElement;
    const textoAlerta = li.textContent.replace('Resolver', '').trim();
    
    // Encontrar y eliminar la alerta del array
    for (let i = 0; i < alertas.length; i++) {
        const alertaTexto = `${alertas[i].barrio} (${alertas[i].fecha.toLocaleDateString()} ${alertas[i].fecha.toLocaleTimeString()}): ${alertas[i].mensaje}`;
        if (alertaTexto === textoAlerta) {
            alertas.splice(i, 1);
            break;
        }
    }
    
    li.remove();
}

// Función para cargar el estado eléctrico
function cargarEstadoElectrico() {
    let postesDanados = 0;
    let postesTotales = 0;
    let barriosConProblemas = 0;
    
    for (const barrio in estadoElectrico) {
        postesDanados += estadoElectrico[barrio].danados;
        postesTotales += estadoElectrico[barrio].postes;
        if (!estadoElectrico[barrio].fluido || estadoElectrico[barrio].danados > 0) {
            barriosConProblemas++;
        }
    }
    
    document.getElementById('postes-danados').innerHTML = 
        `Postes dañados: <span>${postesDanados}/${postesTotales}</span>`;
    
    const voltajePromedio = calcularVoltajePromedio();
    document.getElementById('voltaje-promedio').innerHTML = 
        `Voltaje promedio: <span>${voltajePromedio}V</span>`;
    
    const fluidoGeneral = document.getElementById('fluido-general').querySelector('span');
    fluidoGeneral.textContent = barriosConProblemas > 0 ? `${barriosConProblemas} barrios con problemas` : "Funcionando";
    fluidoGeneral.className = barriosConProblemas > 0 ? "estado-critico" : "estado-bueno";
}

function calcularVoltajePromedio() {
    let total = 0;
    let count = 0;
    
    for (const barrio in estadoElectrico) {
        total += estadoElectrico[barrio].voltaje;
        count++;
    }
    
    return Math.round(total / count);
}

function actualizarEstados() {
    // Simular actualización automática de estados
    for (const barrio in estadoElectrico) {
        // Pequeña variación aleatoria en el voltaje
        estadoElectrico[barrio].voltaje = 215 + Math.floor(Math.random() * 10);
        
        // Pequeña probabilidad de que falle el fluido
        if (Math.random() < 0.05) {
            estadoElectrico[barrio].fluido = false;
        } else {
            estadoElectrico[barrio].fluido = true;
        }
        
        // Pequeña probabilidad de daño en postes
        if (Math.random() < 0.1 && estadoElectrico[barrio].danados < estadoElectrico[barrio].postes / 10) {
            estadoElectrico[barrio].danados++;
        } else if (Math.random() < 0.05 && estadoElectrico[barrio].danados > 0) {
            estadoElectrico[barrio].danados--;
        }
        
        // Actualizar tensión de cables
        estadoElectrico[barrio].tensionCables = calcularTensionCables(estadoElectrico[barrio].voltaje);
    }
    
    cargarEstadoElectrico();
    alert("Estados eléctricos actualizados automáticamente");
}

function generarReporte() {
    // Simular generación de reporte
    let reporte = "REPORTE DIARIO - ESTADO ELÉCTRICO\n\n";
    reporte += `Fecha: ${new Date().toLocaleDateString()}\n`;
    reporte += `Hora: ${new Date().toLocaleTimeString()}\n\n`;
    reporte += "RESUMEN GENERAL:\n";
    
    let postesDanados = 0;
    let postesTotales = 0;
    let barriosConProblemas = 0;
    
    for (const barrio in estadoElectrico) {
        postesDanados += estadoElectrico[barrio].danados;
        postesTotales += estadoElectrico[barrio].postes;
        if (!estadoElectrico[barrio].fluido || estadoElectrico[barrio].danados > 0) {
            barriosConProblemas++;
        }
    }
    
    reporte += `- Postes dañados: ${postesDanados}/${postesTotales} (${Math.round(postesDanados/postesTotales*100)}%)\n`;
    reporte += `- Barrios con problemas: ${barriosConProblemas} de ${Object.keys(estadoElectrico).length}\n`;
    reporte += `- Voltaje promedio: ${calcularVoltajePromedio()}V\n\n`;
    
    reporte += "DETALLE POR BARRIO:\n";
    for (const barrio in estadoElectrico) {
        const estado = estadoElectrico[barrio];
        reporte += `\nBARRIO: ${barrio}\n`;
        reporte += `- Voltaje: ${estado.voltaje}V\n`;
        reporte += `- Postes: ${estado.danados}/${estado.postes} dañados\n`;
        reporte += `- Tensión cables: ${estado.tensionCables}%\n`;
        reporte += `- Fluido eléctrico: ${estado.fluido ? "Normal" : "Interrumpido"}\n`;
    }
    
    reporte += "\nALERTAS RECIENTES:\n";
    alertas.slice(0, 5).forEach(alerta => {
        reporte += `\n- [${alerta.barrio}] ${alerta.mensaje} (${alerta.fecha.toLocaleDateString()})\n`;
    });
    
    // En una aplicación real, esto podría generar un PDF o enviar por email
    console.log(reporte);
    alert("Reporte generado. Ver consola para detalles.");
    
    // Simular descarga del reporte
    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-electrico-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Funciones de login/logout
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (usuarios[username] && usuarios[username].password === password) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('role', usuarios[username].role);
        
        document.getElementById('login-container').style.display = 'none';
        
        if (usuarios[username].role === 'admin') {
            document.getElementById('admin-container').style.display = 'block';
            cargarAlertasAdmin();
            cargarEstadoElectrico();
            inicializarGrafico();
        } else {
            document.getElementById('app-container').style.display = 'block';
        }
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    
    // Limpiar campos
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Detener monitoreo si está activo
    if (intervaloMonitoreo) {
        clearInterval(intervaloMonitoreo);
        intervaloMonitoreo = null;
    }
}

// Funciones para usuarios normales
function verificarFluido() {
    const barrio = document.getElementById('barrios').value;
    const mensaje = document.getElementById('estadoFluido');
    
    if (barrio === 'default') {
        mensaje.textContent = 'Por favor selecciona un barrio.';
        mensaje.style.color = 'red';
    } else {
        const estado = estadoElectrico[barrio];
        const textoEstado = estado.fluido ? 'funcionando correctamente' : 'con interrupciones';
        const colorEstado = estado.fluido ? 'lightgreen' : 'red';
        
        mensaje.innerHTML = `
            En <strong>${barrio}</strong> el fluido eléctrico está <span style="color:${colorEstado}">${textoEstado}</span>.<br>
            Voltaje promedio: <strong>${estado.voltaje}V</strong><br>
            Postes dañados: <strong>${estado.danados}/${estado.postes}</strong><br>
            Tensión en cables: <strong>${estado.tensionCables}%</strong>
        `;
        mensaje.style.color = 'white';
    }
}

function agregarAlerta() {
    const alertaTexto = document.getElementById('nuevaAlerta').value.trim();
    const barrio = document.getElementById('barrios').value;
    const username = localStorage.getItem('username') || 'usuario';
    
    if (alertaTexto !== '' && barrio !== 'default') {
        const nuevaAlerta = {
            barrio: barrio,
            mensaje: alertaTexto,
            fecha: new Date(),
            usuario: username
        };
        
        alertas.push(nuevaAlerta);
        
        const li = document.createElement('li');
        li.textContent = `[${barrio}] ${alertaTexto}`;
        li.onclick = function() {
            li.remove();
        };
        document.getElementById('listaAlertas').appendChild(li);
        document.getElementById('nuevaAlerta').value = '';
        
        // Notificar al admin si está conectado
        if (localStorage.getItem('role') === 'admin') {
            cargarAlertasAdmin();
        }
    } else {
        alert('Por favor selecciona un barrio y escribe una alerta');
    }
}

// Verificar si el usuario ya está logueado al cargar la página
window.onload = function() {
    if (localStorage.getItem('loggedIn') === 'true') {
        document.getElementById('login-container').style.display = 'none';
        
        if (localStorage.getItem('role') === 'admin') {
            document.getElementById('admin-container').style.display = 'block';
            cargarAlertasAdmin();
            cargarEstadoElectrico();
            inicializarGrafico();
        } else {
            document.getElementById('app-container').style.display = 'block';
        }
    }
};
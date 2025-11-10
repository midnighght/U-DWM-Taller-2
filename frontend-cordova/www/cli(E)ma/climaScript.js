//API Key de OpenWeatherMap - no se debe compartir jiji 
const API_KEY = '7d34876ff24f8468071e5a74cbb50ef3';

//elementos
const inputCiudad = document.getElementById('input-ciudad');
const botonBuscar = document.getElementById('boton-buscar');
const cargando = document.getElementById('cargando');
const mensajeInicial = document.getElementById('mensaje-inicial');
const datosClima = document.getElementById('datos-clima');
const mensajeError = document.getElementById('mensaje-error');
const textoError = document.getElementById('texto-error');
const nombreCiudad = document.getElementById('nombre-ciudad');
const iconoClima = document.getElementById('icono-clima');
const temperatura = document.getElementById('temperatura');
const descripcionClima = document.getElementById('descripcion-clima');
const sensacionTermica = document.getElementById('sensacion-termica');
const humedad = document.getElementById('humedad');
const viento = document.getElementById('viento');
const botonesCiudad = document.querySelectorAll('.boton-ciudad');


function iniciarApp() {
    cargando.style.display = 'none';
    configurarEventos();
}

// conf.
function configurarEventos() {
    botonBuscar.addEventListener('click', buscarClima);
    
    inputCiudad.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') buscarClima();
    });
    
    botonesCiudad.forEach(function(boton) {
        boton.addEventListener('click', function() {
            const ciudad = this.getAttribute('data-ciudad');
            inputCiudad.value = ciudad;
            buscarClima();
        });
    });
}

//busqueda de clima
async function buscarClima() {
    const ciudad = inputCiudad.value.trim();
    
    if (!ciudad) {
        mostrarError('Por favor, escribe una ciudad');
        return;
    }
    
    mostrarCargando();
    ocultarResultados();
    ocultarError();
    
    try {
        const datos = await obtenerDatosClima(ciudad);
        mostrarDatosClima(datos);
    } catch (error) {
        mostrarError(error.message);
    } finally {
        ocultarCargando();
    }
}

// obtener datos api
async function obtenerDatosClima(ciudad) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`;
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
        if (respuesta.status === 404) {
            throw new Error('Ciudad no encontrada. verifica el nombre.');
        } else if (respuesta.status === 401) {
            throw new Error('Error de API Key :c');
        } else {
            throw new Error('Error del servicio. Intenta después.');
        }
    }
    return await respuesta.json();
}

// mostrar datos
function mostrarDatosClima(datos) {
    nombreCiudad.textContent = `${datos.name}, ${datos.sys.country}`;
    temperatura.textContent = `${Math.round(datos.main.temp)}°C`;
    
    const descripcion = datos.weather[0].description;
    descripcionClima.textContent = descripcion.charAt(0).toUpperCase() + descripcion.slice(1);
    
    sensacionTermica.textContent = `${Math.round(datos.main.feels_like)}°C`;
    humedad.textContent = `${datos.main.humidity}%`;
    viento.textContent = `${datos.wind.speed} m/s`;
    
    actualizarIconoClima(datos.weather[0].icon);
    mostrarResultados();
}

// actualizar icono
function actualizarIconoClima(codigoIcono) {
    iconoClima.className = 'fas text-5xl mr-4';
    
    if (codigoIcono.includes('01')) {
        iconoClima.classList.add('fa-sun', 'text-yellow-200');
    } else if (codigoIcono.includes('02')) {
        iconoClima.classList.add('fa-cloud-sun', 'text-yellow-100');
    } else if (codigoIcono.includes('03') || codigoIcono.includes('04')) {
        iconoClima.classList.add('fa-cloud', 'text-gray-200');
    } else if (codigoIcono.includes('09') || codigoIcono.includes('10')) {
        iconoClima.classList.add('fa-cloud-rain', 'text-blue-200');
    } else if (codigoIcono.includes('11')) {
        iconoClima.classList.add('fa-bolt', 'text-yellow-300');
    } else if (codigoIcono.includes('13')) {
        iconoClima.classList.add('fa-snowflake', 'text-blue-100');
    } else if (codigoIcono.includes('50')) {
        iconoClima.classList.add('fa-smog', 'text-gray-300');
    } else {
        iconoClima.classList.add('fa-cloud', 'text-gray-200');
    }
}
// mostrar error
function mostrarError(mensaje) {
    textoError.textContent = mensaje;
    mensajeError.classList.remove('oculto');
    mensajeInicial.style.display = 'none';
    datosClima.classList.add('oculto');
}


function mostrarCargando() { 
    cargando.style.display = 'block'; 
    mensajeInicial.style.display = 'none';
}

function ocultarCargando() { 
    cargando.style.display = 'none'; 
}

function mostrarResultados() { 
    datosClima.classList.remove('oculto'); 
    mensajeInicial.style.display = 'none'; 
}

function ocultarResultados() { 
    datosClima.classList.add('oculto'); 
    mensajeError.classList.add('oculto');
}

function ocultarError() { 
    mensajeError.classList.add('oculto'); 
}

document.addEventListener('DOMContentLoaded', iniciarApp);
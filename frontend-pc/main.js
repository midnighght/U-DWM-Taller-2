 
// var button = document.getElementById('myButton');
// if (button) {
//     button.addEventListener('click', function () {
//         alert('Button clicked!');
//     });
// }


// let : scope dentro del bloque
// const: existen en cualquier parte del script
// var : existen dentro de las funciones

x = 3;
const cuadrado = x => x*x;
const lambda = (a,b) => {
    return a*b;
}

console.log(lambda(3,4));

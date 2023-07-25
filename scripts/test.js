// function pepe(array=[]){
//   a="";
//   for (let index = 0; index < array.length; index++) {
//     a += array[index];

//   }
//   return a;
// }

// // console.log(pepe(["a","b","c","d"]))

// console.log(pepe("caco"))

// console.log(Number.MAX_VALUE*2 - Number.POSITIVE_INFINITY)

// let colors = ['red', 'green', 'blue']
// colors[30] = "pepe"
// console.log(colors.length)
// for (let i = 0; i < colors.length; i++) {
//   console.log(colors[i])
// }

// colors.forEach(papo => console.log(papo , colors.indexOf(papo)))

// var myCar = new Object();

// var myCar = {
//   papo: 'FordPapo',
//   pepo: 'MustangPepo',
//   popo: 19696869
// };

// myCar['make']  = 'Ford';
// myCar['model'] = 'Mustang';
// myCar['year']  = 1969;
// myCar.pepe = 'pepon';

// console.log(myCar)

// Se crean y asignan cuatro variables de una sola vez,
// separadas por comas

// var pepe = {
//   a:1,
//   b:2,
//   c:3
// };

// pupu = new Object();
// pupu.a = 10;
// pupu.b = 20;
// pupu.c = 30;

// console.log(pepe, typeof(pepe), pepe.a);
// console.log(pupu, typeof(pupu), pupu.a);

// var popo = Object.create (pepe);

// console.log(popo, typeof(popo));
// // popo.prototype;

// // Propiedades y método de encapsulación para Animal
// var Animal = {
//   type: 'Invertebrates', // Valor predeterminado de las propiedades
//   displayType: function() {  // Método que mostrará el tipo de Animal
//     console.log(this.type);
//   }
// };

// // Crea un nuevo tipo de animal llamado animal1
// var animal1 = Object.create(Animal);
// animal1.displayType(); // Muestra: Invertebrates

// // Crea un nuevo tipo de animal llamado Fishes
// var fish = Object.create(Animal);
// // fish.type = 'Fishes';
// fish.displayType();    // Muestra: Fishes

// console.log(animal1.[[Prototype]])

// function displayCar() {
//   var result = `Un hermoso ${this.year} ${this.make} ${this.model}`;
//   result += `\nde ${this.owner.name}`;
//   console.log(result);
// }

// function Person(name, edad){
//   this.name = name;
//   this.edad = edad;
// }

// function Car(make="nada", model="vnado", year=1900, owner={}) {
//   this.make = make;
//   this.model = model;
//   this.year = year;
//   this.owner = owner;
//   this.displayCar = displayCar;
// }

// carlos = new Person("carlitos", 32);

// auto1 = new Car("ford", "fiesta", 1992, carlos);
// auto1.nueva_prop = "caca"

// console.log(auto1);
// console.log(auto1.owner);
// console.log(auto1.owner.name);
// auto1.displayCar();

// auto2 = new Car(year=299);
// console.log(auto2)

Array.prototype.subarray = function (start, end) {
  if (!end) {
    end = -1
  }
  return this.slice(start, this.length + 1 - end * -1)
}
const array1 = [[1, 2], 3]

// console.log(array1.includes([1, 2]))
// console.log(array1.includes(3))

// console.log(array1.indexOf([1, 2]))
// console.log(array1.indexOf(3))

// console.log(array1.findIndex(a => a[0] == 1 && a[1] == 2))

point = { x: 144, y: 216 }
snakeBody = [
  [216, 216],
  [216, 144],
  [144, 144],
  [144, 216]
]
console.log(snakeBody.slice(-1))



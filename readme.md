El Snake (a veces también llamado La serpiente o La viborita) es un videojuego lanzado a mediados de la década de 1970 que ha mantenido su popularidad desde entonces, convirtiéndose en un clásico. En 1998, el Snake obtuvo una audiencia masiva tras convertirse en un juego estándar pre-grabado en los teléfonos Nokia.

Argumento
En el juego, el jugador controla a una serpiente, que vaga alrededor de un plano delimitado, recogiendo alimentos, tratando de evitar golpearse contra paredes que rodean el área de juego o su propio cuerpo. Cada vez que la serpiente come el cuerpo crece, provocando que aumente la dificultad del juego. El usuario controla la dirección de la cabeza de la serpiente (arriba, abajo, izquierda o derecha) y el cuerpo de la serpiente sigue la cabeza. Además, el jugador no puede detener el movimiento de la serpiente, mientras que el juego está en marcha.
(https://es.wikipedia.org/wiki/La_serpiente_(videojuego)#)

En esta versión se puede jugar de forma manual o automáticamente con la asistencia de la inteligencia artificial.

La red neuronal está basada en el trabajo de: https://github.com/patrickloeber/snake-ai-pytorch.

El modelo fue entrenado con “entrenamiento por refuerzo”, un algoritmo de aprendizaje automático (machine learning). 
La principal particularidad de este algoritmo es que no requiere datos etiquetados previamente.

Durante el entrenamiento, un agente de software explora un entorno desconocido y determina las acciones a llevar a cabo mediante prueba y error con el fin de maximizar la "recompensa".

En este caso el agente recibe recompensas cuando la víbora come las frutas y castigos por salirse de los límites del tablero o chocar contra su propio cuerpo.

El modelo consta de una capa de entrada de 14 neuronas que representan el entorno, una capa oculta y una capa de salida de 3 neuronas que indican si la víbora debe seguir adelante, doblar a la derecha o a la izquierda.

Capa de entrada:
1.	Peligro adelante
2.	Peligro a la derecha
3.	Peligro a la izquierda

4.	Moviéndose hacia la izquierda
5.	Moviéndose hacia la derecha
6.	Moviéndose hacia arriba
7.	Moviéndose hacia abajo

8.	Posición de la fruta hacia la izquierda
9.	Posición de la fruta hacia la derecha
10.	Posición de la fruta hacia arriba
11.	Posición de la fruta hacia abajo

12.	Posición de la cola adelante
13.	Posición de la cola a la derecha
14.	Posición de la cola a la izquierda

Capa de salida:
1.	Seguir adelante
2.	Girar a la derecha
3.	Girara a la izquierda

El modelo de IA fue entrenado con PyTorch en Google Colab y posteriormente exportado a ONNX (Open Neural Network Exchange), un formato abierto para representar modelos de Deep learning.

Funcionamiento:
Se caga el ONNX Runtime Web (ORT) usando un script tag.
Posteriormente se carga el modelo entrenado y se crea una sesión para inferencia.
Para cada movimiento de la vivora, se ingresa a la sesion un array de 14 valores binarios y se obtiene un array de 3 valores que indican que acción se debe tomar.

Se ejecuta totalmente del lado del cliente.

Durante el entrenamiento se compara el estado actual de entorno y el estado previo.
Se evalúa el resultado de la acción tomada y se calcula los premios y castigos para esa acción.
Por este motivo, el modelo puede predecir los efectos de una acción solamente en el paso posterior.

En algunas situaciones una acción puede tener efectos varios pasos en el futuro, dejando a la víbora encerrada.
Para esos casos la mejor opción es que la cabeza siga a la cola (último bloque), ya que con cada movimiento de la víbora, la cola se desplaza dejando un espacio disponible hacia donde moverse.

Se calcula la distancia y se indica si el camino más largo hasta la cola es: hacia delante, derecha o izquierda.
Para ello se utilizan los últimos tres valores del array de entrada.

![6](https://github.com/ElMarcelis/Snake/assets/135712335/0e5bc765-5ea7-4fd5-9e88-38da0fc14c14)
![7](https://github.com/ElMarcelis/Snake/assets/135712335/9aa261d6-9e40-4449-8fb3-42fe6296ca43)

Por último en la etapa final, si queda uno o más espacios libres separados de la fruta, la víbora tiende a iterar, repitiendo una y otra vez el mismo camino.
Cuando se detecta este comportamiento la solución es seguir, cuando sea posible, el bloque anterior al último.
Esto permite desplazar el espacio libre permintiendo nuevos caminos y aumentando la posibilidad de completar el juego.

![1](https://github.com/ElMarcelis/Snake/assets/135712335/d9f96549-2e14-4f7c-a252-2b658c5f186d)
![2](https://github.com/ElMarcelis/Snake/assets/135712335/e4d777b7-a2e1-4407-bdea-7318ce02ce86)
![3](https://github.com/ElMarcelis/Snake/assets/135712335/eeb7496d-fa8e-4987-8a18-4565a4ea860e)


pepe
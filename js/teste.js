
import * as THREE from 'three';
// import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from './../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from './../node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from './../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { CSS2DRenderer } from './../node_modules/three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS2DObject } from './../node_modules/three/examples/jsm/renderers/CSS2DRenderer.js';
// import { Projector } from './node_modules/three/examples/jsm/loaders/DRACOLoader.js';

// Configurando a cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,0,5);

// Renderizador
const renderer = new THREE.WebGLRenderer();
let labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';


// Tamanho da tela
renderer.setSize(window.innerWidth, window.innerHeight);

// Linkando o renderizador
document.body.appendChild( labelRenderer.domElement );
document.body.appendChild(renderer.domElement);

// camera rotacao
const controls = new OrbitControls( camera, labelRenderer.domElement );
controls.minDistance = 5;
controls.update();

// melhorar apresentação do modelo
const pmremGenerator = new THREE.PMREMGenerator( renderer );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;
scene.updateMatrixWorld(true);

// Instanciando o loader
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const geometry =  new  THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
// cube.scale.setX(2);00
// console.log(cube1BB.getCenter())
// adicionar primeiro cubo
const cube = new THREE.Mesh(geometry, material)
const cubos = [];
cubos.push(cube)
scene.add(cube)
let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(cube)
cube.userData.tamanho = {
	iniciox: cube1BB.min.x,
	fimx: cube1BB.max.x,
}
cube.box3 = cube1BB;
console.log(cube1BB)
 

const menuDiv = document.createElement( 'div' );

menuDiv.className = 'label';
menuDiv.className = 'hide';

const armarioButton = document.createElement( 'button' );
armarioButton.textContent = "adicionar armario"
armarioButton.className = 'botaoEscolha';

const armarioGrandeButton = document.createElement( 'button' );
armarioGrandeButton.textContent = "adicionar armario grande"
armarioGrandeButton.className = 'botaoEscolha';

const paneleiroButton = document.createElement( 'button' );
paneleiroButton.textContent = "adicionar paneleiro"
paneleiroButton.className = 'botaoEscolha';

const balcaoButton = document.createElement( 'button' );
balcaoButton.textContent = "adicionar balcão"
balcaoButton.className = 'botaoEscolha'

const balcaoGrandeButton = document.createElement( 'button' );
balcaoGrandeButton.textContent = "adicionar Balcao Grande"
balcaoGrandeButton.className = 'botaoEscolha'

menuDiv.appendChild(armarioButton)
menuDiv.appendChild(armarioGrandeButton)
menuDiv.appendChild(balcaoGrandeButton)
menuDiv.appendChild(paneleiroButton)
menuDiv.appendChild(balcaoButton)

let corEscolhida = "#ffffff";
let positionEscolhida = "#ffffff";
let xEscolhido = 0;
let yEscolhido = 0;
let uuidEscolhido = "";
let adicionaCubo = true;

balcaoButton.addEventListener('pointerdown', function(event){
	corEscolhida = "#E56399";
	console.log("ros")

	if (adicionaCubo) addBalcao(xEscolhido, yEscolhido)
	menuDiv.classList.add("hide");
	adicionaCubo = false;
});
armarioButton.addEventListener('pointerdown', function(event){
	corEscolhida = "#E56399";
	console.log("ros")

	if (adicionaCubo) addArmario(xEscolhido, yEscolhido)
	
	adicionaCubo = false;
});
armarioGrandeButton.addEventListener('pointerdown', function(event){
	corEscolhida = "#E56399";
	console.log("ros")

	if (adicionaCubo) addArmarioGrande(xEscolhido, yEscolhido)
	
	adicionaCubo = false;
});
balcaoGrandeButton.addEventListener('pointerdown', function(event){
	corEscolhida = "#E56399";
	console.log("ros")

	if (adicionaCubo) addBalcaoGrande(xEscolhido, yEscolhido)
	
	adicionaCubo = false;
});
paneleiroButton.addEventListener('pointerdown', function(event){
	corEscolhida = "#E56399";
	console.log("ros")

	if (adicionaCubo) addPaneleiro(xEscolhido, yEscolhido)
	
	adicionaCubo = false;
});

const menuLabel = new CSS2DObject( menuDiv );
menuLabel.position.y = 2

scene.add( menuLabel );
console.log(scene)
// Instantiate a loader
// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './node_modules/three/examples/js/libs/draco/' );
loader.setDRACOLoader( dracoLoader );
var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 2 );
hemiLight.position.set( 100, 300, 0 );
// scene.add( hemiLight );
// Load a glTF resource



window.addEventListener('resize', function(){
	var width = window.innerWidth;
	var height = window.innerHeight;
	renderer.setSize(width, height)
	camera.aspect = width/height;
	camera.updateProjectionMatrix;
})

// clique mouse
window.addEventListener('click', function(){


	raycaster.setFromCamera( pointer, camera );;
	var intersects = raycaster.intersectObjects( scene.children );
	console.log(intersects)
	if (intersects.length>0){
		
		// menuDiv.classList.remove("hide");
		menuDiv.classList.add("label");
		const position = intersects[0].object.position;
		uuidEscolhido = intersects[0].object.id
		console.log(uuidEscolhido)
		console.log(intersects[0])
		// direita
		if ((intersects[0].point.x>=0.3) && (intersects[0].point.y>=0.3 &&  intersects[0].point.y<=0.7) ){
			console.log('direita aqyu')

			positionEscolhida = intersects[0].object.position;
			xEscolhido = 1;
			yEscolhido = 0
			adicionaCubo = true;
			
		}
		// cima
		
		else if (intersects[0].point.y>=0.7 && !intersects[0].object.cima?.preenchido){
			console.log('cima')
			positionEscolhida = intersects[0].object.position;
			xEscolhido = 0;
			yEscolhido = 1;
			adicionaCubo = true;
		}
		// esquerda
		else if ((intersects[0].point.x<=-0.3) && (intersects[0].point.y>=0.3 &&  intersects[0].point.y<=0.7) ){
			console.log('esquerda')
			positionEscolhida = intersects[0].object.position;
			xEscolhido = -1;
			yEscolhido = 0
			adicionaCubo = true;
		}
		// baixo
		else if(intersects[0].point.y<=0.3 ){
			console.log('baixo')
			positionEscolhida = intersects[0].object.position;
			xEscolhido = 0;
			yEscolhido = -1
			adicionaCubo = true;
		}

	}

	
	

})
// move mouse
function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( pointer, camera );
	var intersects = raycaster.intersectObjects( scene.children );
	if (intersects.length>0){
		armarioButton.classList.remove("hide")
		armarioGrandeButton.classList.remove("hide")
		balcaoGrandeButton.classList.remove("hide")
		balcaoButton.classList.remove("hide")
		paneleiroButton.classList.remove("hide")
		menuDiv.classList.add("hide");
		menuDiv.classList.add("label");
		const position = intersects[0].object.position;
		uuidEscolhido = intersects[0].object.id;


		// console.log(uuidEscolhido)
		let cubeEscolhido = scene.getObjectById(uuidEscolhido);
		if(!cubeEscolhido.userData.tamanho){
			console.log('n tem')
			uuidEscolhido = intersects[0].object.parent.parent.id;
			cubeEscolhido = scene.getObjectById(uuidEscolhido);
		}
		// console.log(intersects[0].object.parent.userData.tamanho);
		const raioPositivo = cubeEscolhido.userData.tamanho.fimx - cubeEscolhido.userData.tamanho.fimx/4;
		const raioNegativo = cubeEscolhido.userData.tamanho.iniciox + cubeEscolhido.userData.tamanho.fimx/4;

			// direita
		
			console.log(intersects[0].point, raioPositivo)
			if (intersects[0].point.x>=raioPositivo ){
				console.log('primeira direita')
				menuDiv.classList.remove("hide");
				// armarioButton.classList.add("hide")
				// armarioGrandeButton.classList.add("hide")
				positionEscolhida = intersects[0].object.position;
				xEscolhido = 1;
				yEscolhido = 0
				adicionaCubo = true;
				menuLabel.position.setX(cubeEscolhido.position.x+1)
				menuLabel.position.setY(cubeEscolhido.position.y)
			}
			// // cima
			
			// else if (intersects[0].uv.y>=0.7 && !intersects[0].object.cima?.preenchido){
			// 	balcaoButton.classList.add("hide")
			// 	balcaoGrandeButton.classList.add("hide")
			// 	paneleiroButton.classList.add("hide")
			// 	console.log('cima')
			// 	menuDiv.classList.remove("hide");
			// 	positionEscolhida = intersects[0].object.position;
			// 	xEscolhido = 0;
			// 	yEscolhido = 1;
			// 	adicionaCubo = true;
			// 	menuLabel.position.setX(intersects[0].object.position.x)
			// 	menuLabel.position.setY(intersects[0].object.position.y+1)
			// }
			// esquerda
			else if ( intersects[0].point.x<=raioNegativo
				){
				console.log('esquerda esta')
				menuDiv.classList.remove("hide");
				// armarioButton.classList.add("hide")
				// armarioGrandeButton.classList.add("hide")
				positionEscolhida = intersects[0].object.position;
				xEscolhido = -1;
				yEscolhido = 0
				adicionaCubo = true;
				menuLabel.position.setX(cubeEscolhido.position.x-1)
				menuLabel.position.setY(cubeEscolhido.position.y)
			}
			// // baixo
			// else if(intersects[0].uv.y<=0.3){
			// 	console.log('baixo')
			// 	// // menuDiv.classList.remove("hide");
			// 	// positionEscolhida = intersects[0].object.position;
			// 	// xEscolhido = 0;
			// 	// yEscolhido = -1
			// 	// adicionaCubo = true;
			// 	// menuLabel.position.setX(intersects[0].object.position.x)
			// 	// menuLabel.position.setY(intersects[0].object.position.y-1.1)
			// }
		// if (intersects[0].faceIndex == 8 || intersects[0].faceIndex == 9){
		// 	// console.log(intersects[0].object.geometry)
			

		// }
		// else if (intersects[0].faceIndex == 3){
		// 	console.log('esquerda')
		// 	menuDiv.classList.remove("hide");
		// 	positionEscolhida = intersects[0].object.position;
		// 	xEscolhido = -1;
		// 	yEscolhido = 0
		// 	adicionaCubo = true;
		// 	menuLabel.position.setX(intersects[0].object.position.x-1)
		// 	menuLabel.position.setY(intersects[0].object.position.y)
		// }
		// else if (intersects[0].faceIndex == 1){
		// 	console.log('direita')
		// 	menuDiv.classList.remove("hide");
		// 	positionEscolhida = intersects[0].object.position;
		// 	xEscolhido = 1;
		// 	yEscolhido = 0
		// 	adicionaCubo = true;
		// 	menuLabel.position.setX(intersects[0].object.position.x+1)
		// 	menuLabel.position.setY(intersects[0].object.position.y)
		// }
		// else if (intersects[0].faceIndex == 5 || intersects[0].faceIndex == 4){
		// 	console.log('cima')
		// 	menuDiv.classList.remove("hide");
		// 	positionEscolhida = intersects[0].object.position;
		// 	xEscolhido = 0;
		// 	yEscolhido = 1;
		// 	adicionaCubo = true;
		// 	menuLabel.position.setX(intersects[0].object.position.x)
		// 	menuLabel.position.setY(intersects[0].object.position.y+1)
		// }
		// else if (intersects[0].faceIndex == 7){
		// 	console.log('baixo')
		// 	menuDiv.classList.remove("hide");
		// 	positionEscolhida = intersects[0].object.position;
		// 	xEscolhido = 0;
		// 	yEscolhido = -1
		// 	adicionaCubo = true;
		// 	menuLabel.position.setX(intersects[0].object.position.x)
		// 	menuLabel.position.setY(intersects[0].object.position.y-1.1)
		// }
	}

	


}
window.addEventListener( 'pointermove', onPointerMove );




function animate(){
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	labelRenderer.render( scene, camera );
	controls.update();


}

function addBalcao(posicao, px, py){
	corEscolhida = "#00ff00";
	const  geometry =  new  THREE.BoxGeometry();

	const material = new THREE.MeshBasicMaterial({color: corEscolhida});
	const cube = new THREE.Mesh(geometry, material)
	let cubeEscolhido = scene.getObjectById(uuidEscolhido);
	console.log(cubeEscolhido)
	cube.position.setY(0);
	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)
	cube.box3 = cube2BB;
	
	const tamanhox = cube2BB.max.x - cube2BB.min.x;
	const tamanhoy = cube2BB.max.y - cube2BB.min.y;
	
	

	console.log(cube2BB)

	// direita
	if (px>0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.max.x)+cube.box3.max.x);
		cube.userData.tamanho = {
			iniciox: cubeEscolhido.box3.max.x,
			fimx: cubeEscolhido.box3.max.x + tamanhox ,
		}
		cubeEscolhido.direita = {preenchido: true, id: cube.id};
	}
	// esquerda
	else if (px<0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.min.x)+cube.box3.min.x);

		cubeEscolhido.esquerda = {preenchido: true, id: cube.id};
		cube.userData.tamanho = {
			iniciox: cubeEscolhido.box3.min.x,
			fimx: cubeEscolhido.box3.min.x - tamanhox ,
		}
	}
	// baixo
	else if (py<0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.min.y)+cube.box3.min.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.baixo = {preenchido: true, id: cube.id}

	}
	// cima
	else if (py>0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.max.y)+cube.box3.max.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.cima = {preenchido: true, id: cube.id};

	}
	cube.position.getComponent(0);
	cube.name = "teste"
	cube.direita = "true"
	cubos.push(cube);
	menuDiv.classList.add("hide");
	console.log(cubeEscolhido)
	scene.add(cube)
	console.log(cube)
}
function addBalcaoGrande(posicao, px, py){
	corEscolhida = "#000000";
	const  geometry =  new  THREE.BoxGeometry();

	const material = new THREE.MeshBasicMaterial({color: corEscolhida});
	const cube = new THREE.Mesh(geometry, material)
	cube.scale.x = 2;
	let cubeEscolhido = scene.getObjectById(uuidEscolhido);
	console.log(cubeEscolhido)
	cube.position.setY(0);
	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)
	cube.box3 = cube2BB;
	console.log(cube2BB)
	const tamanhox = cube2BB.max.x - cube2BB.min.x;
	const tamanhoy = cube2BB.max.y - cube2BB.min.y;
	// direita
	if (px>0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.max.x)+cube.box3.max.x);
		
		cubeEscolhido.direita = {preenchido: true, id: cube.id};
		cube.userData.tamanho = {
			iniciox: cubeEscolhido.box3.max.x,
			fimx: cubeEscolhido.box3.max.x + tamanhox ,
		}
	}
	// esquerda
	else if (px<0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.min.x)+cube.box3.min.x);
	
		cubeEscolhido.esquerda = {preenchido: true, id: cube.id};
		cube.userData.tamanho = {
			iniciox: cubeEscolhido.box3.min.x,
			fimx: cubeEscolhido.box3.min.x - tamanhox ,
		}

	}
	// baixo
	else if (py<0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.min.y)+cube.box3.min.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.baixo = {preenchido: true, id: cube.id}

	}
	// cima
	else if (py>0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.max.y)+cube.box3.max.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.cima = {preenchido: true, id: cube.id};

	}
	cube.position.getComponent(0);
	cube.name = "teste"
	cube.direita = "true"
	cubos.push(cube);
	menuDiv.classList.add("hide");
	console.log(cubeEscolhido)
	scene.add(cubos[cubos.length-1])
}
function addPaneleiro(posicao, px, py){
	const  geometry =  new  THREE.BoxGeometry();
	corEscolhida = "#395756";
	const material = new THREE.MeshBasicMaterial({color: corEscolhida});
	const cube = new THREE.Mesh(geometry, material)
	cube.scale.y = 2.5;
	let cubeEscolhido = scene.getObjectById(uuidEscolhido);
	console.log(cubeEscolhido)
	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)
	cube.box3 = cube2BB;
	console.log(cube2BB)

	// direita
	if (px>0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.max.x)+cube.box3.max.x);
		cube.position.setY(0.75);
		cubeEscolhido.direita = {preenchido: true, id: cube.id};
	}
	// esquerda
	else if (px<0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.min.x)+cube.box3.min.x);
		cube.position.setY(0.75);
		cubeEscolhido.esquerda = {preenchido: true, id: cube.id};

	}
	// baixo
	else if (py<0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.min.y)+cube.box3.min.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.baixo = {preenchido: true, id: cube.id}

	}
	// cima
	else if (py>0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.max.y)+cube.box3.max.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.cima = {preenchido: true, id: cube.id};

	}
	cube.position.getComponent(0);
	cube.name = "teste"
	cube.direita = "true"
	cubos.push(cube);
	menuDiv.classList.add("hide");
	console.log(cubeEscolhido)
	scene.add(cubos[cubos.length-1])
}
function addArmario(posicao, px, py){
	const  geometry =  new  THREE.BoxGeometry();
	corEscolhida = "#ECA400";
	const material = new THREE.MeshBasicMaterial({color: corEscolhida});
	const cube = new THREE.Mesh(geometry, material)
	cube.scale.y = 0.5
	let cubeEscolhido = scene.getObjectById(uuidEscolhido);
	console.log(cubeEscolhido)
	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)
	cube.box3 = cube2BB;
	console.log(cube2BB)

	// direita
	if (px>0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.max.x)+cube.box3.max.x);
		cube.position.setY(1.75);
		cubeEscolhido.direita = {preenchido: true, id: cube.id};
	}
	// esquerda
	else if (px<0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.min.x)+cube.box3.min.x);
		cube.position.setY(posicao.y);
		cubeEscolhido.esquerda = {preenchido: true, id: cube.id};

	}
	// baixo
	else if (py<0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.min.y)+cube.box3.min.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.baixo = {preenchido: true, id: cube.id}

	}
	// cima
	else if (py>0){
		cube.position.setY(1.75);
		cube.position.setX(posicao.x);
		cubeEscolhido.cima = {preenchido: true, id: cube.id};

	}
	cube.position.getComponent(0);
	cube.name = "teste"
	cube.direita = "true"
	cubos.push(cube);
	menuDiv.classList.add("hide");
	console.log(cubeEscolhido)
	scene.add(cubos[cubos.length-1])
}
function addArmarioGrande(posicao, px, py){
	const  geometry =  new  THREE.BoxGeometry();
	corEscolhida = "#00CECB";
	const material = new THREE.MeshBasicMaterial({color: corEscolhida});
	const cube = new THREE.Mesh(geometry, material)
	
	let cubeEscolhido = scene.getObjectById(uuidEscolhido);
	console.log(cubeEscolhido)
	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)
	cube.box3 = cube2BB;
	console.log(cube2BB)

	// direita
	if (px>0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.max.x)+cube.box3.max.x);
		cube.position.setY(posicao.y);
		cubeEscolhido.direita = {preenchido: true, id: cube.id};
	}
	// esquerda
	else if (px<0){
		cube.position.setX(cubeEscolhido.position.x+(cubeEscolhido.box3.min.x)+cube.box3.min.x);
		cube.position.setY(posicao.y);
		cubeEscolhido.esquerda = {preenchido: true, id: cube.id};

	}
	// baixo
	else if (py<0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.min.y)+cube.box3.min.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.baixo = {preenchido: true, id: cube.id}

	}
	// cima
	else if (py>0){
		cube.position.setY(cubeEscolhido.position.y+(cubeEscolhido.box3.max.y)+cube.box3.max.y);
		cube.position.setX(posicao.x);
		cubeEscolhido.cima = {preenchido: true, id: cube.id};

	}
	cube.position.getComponent(0);
	cube.name = "teste"
	cube.direita = "true"
	cubos.push(cube);
	menuDiv.classList.add("hide");
	console.log(cubeEscolhido)
	scene.add(cubos[cubos.length-1])
}

animate()

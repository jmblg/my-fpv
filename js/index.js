import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib'; // Utiliser three-stdlib pour OrbitControls

class Entity {
    static id = 1;

    constructor(type, sizeT, positionT, color, animated) {
        this.id = Entity.id;
   
        this.type = null;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.color = null;
        this.animated = null;

        this.update(type, sizeT, positionT, color, animated);

        Entity.id++;
    }

    changeColor(color) {
        if (color == null) {
            let newColorRgbt = colorgen("fluo");
            color = rgbToHex(newColorRgbt);
        }
        let hex = color.replace('#', '');

        let r = parseInt(hex.slice(0, 2), 16) / 255;
        let g = parseInt(hex.slice(2, 4), 16) / 255;
        let b = parseInt(hex.slice(4, 6), 16) / 255;

        let newColor = new THREE.Color(r, g, b);
        this.material = new THREE.MeshBasicMaterial({ color: newColor });
        this.mesh.material = this.material;
    }

    update(type, sizeT, positionT, color, animated) {
        this.type = type;
    
        // Vérifier si la géométrie doit être mise à jour
        if (type === "cube") {
            if (!this.geometry || !(this.geometry instanceof THREE.BoxGeometry)) {
                this.geometry = new THREE.BoxGeometry(sizeT[0], sizeT[1], sizeT[2]);
            } else {
                this.geometry.parameters.width = sizeT[0];
                this.geometry.parameters.height = sizeT[1];
                this.geometry.parameters.depth = sizeT[2];
                this.geometry.dispose(); // Libérer l'ancienne géométrie
                this.geometry = new THREE.BoxGeometry(sizeT[0], sizeT[1], sizeT[2]); // Créer une nouvelle géométrie
            }
        } else if (type === "sphere") {
            if (!this.geometry || !(this.geometry instanceof THREE.SphereGeometry)) {
                this.geometry = new THREE.SphereGeometry(sizeT[0], sizeT[1], sizeT[2]);
            } else {
                this.geometry.parameters.radius = sizeT[0];
                this.geometry.parameters.widthSegments = sizeT[1];
                this.geometry.parameters.heightSegments = sizeT[2];
                this.geometry.dispose(); // Libérer l'ancienne géométrie
                this.geometry = new THREE.SphereGeometry(sizeT[0], sizeT[1], sizeT[2]); // Créer une nouvelle géométrie
            }
        }
    
        // Vérifier si le mesh existe déjà
        if (!this.mesh) {
            // Si le mesh n'existe pas encore, on le crée
            this.material = new THREE.MeshBasicMaterial({ color: color || 0x00ff00 });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            scene.add(this.mesh);  // Ajouter le mesh à la scène si nécessaire
        } else {
            // Si le mesh existe déjà, on met simplement à jour ses propriétés
            this.mesh.geometry = this.geometry;
            this.mesh.material = new THREE.MeshBasicMaterial({ color: color || 0x00ff00 });
        }
    
        // Mise à jour de la position
        this.mesh.position.set(positionT[0], positionT[1], positionT[2]);
    
        // Mise à jour de la couleur
        this.color = color;
        this.changeColor(this.color);
    
        // Mise à jour de l'animation
        this.animated = animated;
    }
    
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10); // Positionner la caméra pour qu'elle regarde le sol
camera.lookAt(0, 0, 0); // Regarder vers le centre (où le sol est positionné)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x87CEEB); // sky

// ground
const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2; // Rotation pour que le plan soit horizontal
plane.position.set(1, 0.5, 1);
scene.add(plane);

// entities
let entietiesT = new Array();

// light
const light = new THREE.AmbientLight(0x404040, 5); // Lumière ambiante pour éclairer la scène
scene.add(light);

// controls
const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);

  entietiesT.forEach((entity) => {
    if (entity.animated == true) {
        entity.mesh.rotation.x += 0.01;
        entity.mesh.rotation.y += 0.01;
    }
  });

  controls.update();

  renderer.render(scene, camera);
}

// Lancer l'animation
animate();

// Adapter la taille du rendu lorsque la fenêtre est redimensionnée
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


////

function myFpv_addAnEntity() {
    let type = document.getElementById("myFpv_addAnEntity_type").value;

    let sizeT = new Array();
    sizeT[0] = document.getElementById("myFpv_addAnEntity_sizeX").value;
    sizeT[1] = document.getElementById("myFpv_addAnEntity_sizeY").value;
    sizeT[2] = document.getElementById("myFpv_addAnEntity_sizeZ").value;

    let positionT = new Array();
    positionT[0] = document.getElementById("myFpv_addAnEntity_positionX").value;
    positionT[1] = document.getElementById("myFpv_addAnEntity_positionY").value;
    positionT[2] = document.getElementById("myFpv_addAnEntity_positionZ").value;

    let color = document.getElementById("myFpv_addAnEntity_color").value;

    let animated = false; if (document.getElementById("myFpv_addAnEntity_animated").checked) { animated = true; }

    entietiesT.push(new Entity(type, sizeT, positionT, color, animated));

    myFpv_entities_all_select();

    scene.add(entietiesT[entietiesT.length-1].mesh);
}

function myFpv_updateAnEntity() {
    let id = document.getElementById("myFpv_entities_all_select").value;
    
    let type = document.getElementById("myFpv_addAnEntity_type").value;

    let sizeT = new Array();
    sizeT[0] = document.getElementById("myFpv_addAnEntity_sizeX").value;
    sizeT[1] = document.getElementById("myFpv_addAnEntity_sizeY").value;
    sizeT[2] = document.getElementById("myFpv_addAnEntity_sizeZ").value;

    let positionT = new Array();
    positionT[0] = document.getElementById("myFpv_addAnEntity_positionX").value;
    positionT[1] = document.getElementById("myFpv_addAnEntity_positionY").value;
    positionT[2] = document.getElementById("myFpv_addAnEntity_positionZ").value;

    let color = document.getElementById("myFpv_addAnEntity_color").value;

    let animated = false; if (document.getElementById("myFpv_addAnEntity_animated").checked) { animated = true; }

    let entityO = entietiesT.find(o => o.id.toString() === id.toString());
    entityO.update(type, sizeT, positionT, color, animated);
}

function myFpv_entities_all_select() {
    let html = "";
    entietiesT.forEach((entity, index, array) => {
        let select = ""; if (index === array.length - 1) { select = " selected"; }
        html += "<option value='" + entity.id + "'" + select + ">" + entity.id + " - " + entity.type + " (" + entity.color + ")</option>";
      });
    document.getElementById("myFpv_entities_all_select").innerHTML = html;
}

function colorgen(type)
	{
    let rgbt = new Array();
	switch (type)
		{
		case "dark" :
            rgbt[0] =nbralet(0,200); rgbt[1] = nbralet(0,200); rgbt[2] = nbralet(0,200);
		break;
		case "fluo" :
			let the255 = nbralet(0,3);
			let the0 = nbralet(0,3);
			if (the255 == the0) { the0++; } if (the0 == 3) { the0 = 0; }

			rgbt[0] = nbralet(0,256); rgbt[1] = nbralet(0,256); rgbt[2] = nbralet(0,256);
			rgbt[the255] = 255; rgbt[the0] = 0;
		break;
		}

	return rgbt;
	}

function rgbToHex(rgbt) {
        let r = rgbt[0];
        let g = rgbt[1];
        let b = rgbt[2];

        return "#" + 
            r.toString(16).padStart(2, '0') + 
            g.toString(16).padStart(2, '0') + 
            b.toString(16).padStart(2, '0');
    }

function nbralet(min,max)
	{
	return Math.floor(Math.random() * max) + min;
	}

document.querySelector("#myFpv_entities_all_select").addEventListener("change", function() {
    let entityO = entietiesT.find(o => o.id.toString() === this.value.toString());

    document.getElementById("myFpv_addAnEntity_type").value = entityO.type;

    document.getElementById("myFpv_addAnEntity_sizeX").value = entityO.mesh.geometry.parameters.width;
    document.getElementById("myFpv_addAnEntity_sizeY").value = entityO.mesh.geometry.parameters.height;
    document.getElementById("myFpv_addAnEntity_sizeZ").value = entityO.mesh.geometry.parameters.depth;

    document.getElementById("myFpv_addAnEntity_positionX").value = entityO.mesh.position.x;
    document.getElementById("myFpv_addAnEntity_positionY").value = entityO.mesh.position.y;
    document.getElementById("myFpv_addAnEntity_positionZ").value = entityO.mesh.position.z;

    document.getElementById("myFpv_addAnEntity_color").value = entityO.color;
});

document.querySelector("#myFpv_addAnEntityBtn").addEventListener("click", function() {
    myFpv_addAnEntity();
});

document.querySelector("#myFpv_updateAnEntityBtn").addEventListener("click", function() {
    myFpv_updateAnEntity();
});
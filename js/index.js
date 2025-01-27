import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

class Entity {
    static id = 0;

    constructor(type, sizeT, positionT, color, opacity, animated) {
        this.id = Entity.id;
        this.name = type;
   
        this.type = null;
        this.positionInitial = positionT;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.color = null;
        this.animated = null;

        this.group = 0;

        this.update(type, sizeT, positionT, color, opacity, animated);

        Entity.id++;
    }

    changeColor(color, opacity) {
        if (color == null) {
            let newColorRgbt = colorgen("fluo");
            color = rgbToHex(newColorRgbt);
        }
        let hex = color.replace('#', '');

        let r = parseInt(hex.slice(0, 2), 16) / 255;
        let g = parseInt(hex.slice(2, 4), 16) / 255;
        let b = parseInt(hex.slice(4, 6), 16) / 255;

        let newColor = new THREE.Color(r, g, b);
        this.material = new THREE.MeshBasicMaterial({
            color: newColor,
            transparent: true,
            opacity: opacity // Ajuste ce nombre pour régler le niveau de transparence
        });
        this.mesh.material = this.material;
    }

    update(type, sizeT, positionT, color, opacity, animated) {
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
        this.changeColor(this.color, opacity);
    
        // Mise à jour de l'animation
        this.animated = animated;
        if (this.animated == false) {
            this.mesh.rotation.x = 0;
            this.mesh.rotation.y = 0;
        }
    }

    setName(txt) {
        this.name = txt;
    }

    setGroup(id_group) {
        this.group = id_group;
    }

    destroy() {
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh = null;
        }
    
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }
        
        if (this.material) {
            this.material.dispose();
            this.material = null;
        }
    
        this.type = null;
        this.color = null;
        this.animated = null;
    }    
    
}

class Group {
    static id = 1;

    constructor(name) {
        this.id = Group.id;
        this.name = name;

        Group.id++;
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
const planeGeometry = new THREE.PlaneGeometry(250, 250);
const planeTextureLoader = new THREE.TextureLoader();
const planeTexture = planeTextureLoader.load("img/200.png");
planeTexture.wrapS = THREE.RepeatWrapping;
planeTexture.wrapT = THREE.RepeatWrapping;
planeTexture.repeat.set(250, 250);
const planeMaterial = new THREE.MeshLambertMaterial({ 
    map: planeTexture
});
// const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2; // Rotation pour que le plan soit horizontal
plane.position.set(1, 0.5, 1);
scene.add(plane);

// entities
let entietiesT = new Array();
let entityToAdd = null;

// groupes
let groupsT = new Array();

// light
const light = new THREE.AmbientLight(0x404040, 5); // Lumière ambiante pour éclairer la scène
scene.add(light);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
let keysT = new Array();
keysT.left = false; keysT.right = false; keysT.top = false; keysT.bottom = false;

function animate() {
  requestAnimationFrame(animate);

  myFpv_toAddAnEntity();

  entietiesT.forEach((entity) => {
    if (entity.animated == true) {
        entity.mesh.rotation.x += 0.01;
        entity.mesh.rotation.y += 0.01;
    }
  });

    if (keysT.right == true) { 
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        let right = new THREE.Vector3(-direction.z, 0, direction.x); 
        right.normalize();
        camera.position.addScaledVector(right, 0.1);
        controls.target.addScaledVector(right, 0.1);
    }
    if (keysT.left == true) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        let left = new THREE.Vector3(direction.z, 0, -direction.x);
        left.normalize();
        camera.position.addScaledVector(left, 0.1);
        controls.target.addScaledVector(left, 0.1);
    }
    if (keysT.top == true) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.normalize();
        camera.position.addScaledVector(direction, 0.1);
        controls.target.addScaledVector(direction, 0.1);
    }
    if (keysT.bottom == true) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.normalize();
        camera.position.addScaledVector(direction, -0.1);
        controls.target.addScaledVector(direction, -0.1);
    }

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


//////////////////

function myFpv_toAddAnEntity() {
    let t = myFpv_prepareAnEntity();
    t.opacity = 0.25;

    if (!entityToAdd) {
        entityToAdd = new Entity(t.type, t.sizeT, t.positionT, t.color, t.opacity, t.animated);
    } else {
        entityToAdd.update(t.type, t.sizeT, t.positionT, t.color, t.opacity, t.animated);
    }
}

function myFpv_addAnEntity() {
    let t = myFpv_prepareAnEntity();

    entietiesT.push(new Entity(t.type, t.sizeT, t.positionT, t.color, t.opacity, t.animated));

    myFpv_entities_all_select();

    scene.add(entietiesT[entietiesT.length-1].mesh);
}

function myFpv_updateAnEntity() {
    let id = document.getElementById("myFpv_entities_all_select").value;

    let t = myFpv_prepareAnEntity();

    let entityO = entietiesT.find(o => o.id.toString() === id.toString());
    entityO.update(t.type, t.sizeT, t.positionT, t.color, t.opacity, t.animated);
}

function myFpv_deleteAnEntityBtn() {
    let id = document.getElementById("myFpv_entities_all_select").value;
    let index = entietiesT.findIndex(o => o.id.toString() === id.toString());

    let entityO = entietiesT[index];

    // détruire dans le tableau
    entietiesT.splice(index, 1);

    // détruire en tant qu'objet
    entityO.destroy();

    myFpv_entities_all_select();
}

function myFpv_prepareAnEntity() {
    let t = new Array();

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
    let opacity = 1;

    let animated = false; if (document.getElementById("myFpv_addAnEntity_animated").checked) { animated = true; }

    t.type = type;
    t.sizeT = sizeT;
    t.positionT = positionT;
    t.color = color;
    t.opacity = opacity;
    t.animated = animated;

    return t;
}

function myFpv_entities_all_select() {
    let html = "";
    if (entietiesT.length > 0) {
        entietiesT.forEach((entity, index, array) => {
            let select = ""; if (index === array.length - 1) { select = " selected"; }
            html += "<option value='" + entity.id + "'" + select + ">" + entity.id + " - " + entity.name + " (" + entity.color + ")</option>";
        });
        document.querySelectorAll(".myFpv-entities-select").forEach(element => {
            element.disabled = false;
          });
        document.getElementById("myFpv_renameEntity").disabled = false;
        document.getElementById("myFpv_renameEntityBtn").disabled = false;
        document.getElementById("myFpv-group-entities-all-btn").disabled = false;
    } else {
        document.querySelectorAll(".myFpv-entities-select").forEach(element => {
            element.disabled = true;
          });
        document.getElementById("myFpv_renameEntity").disabled = true;
        document.getElementById("myFpv_renameEntityBtn").disabled = true;
        document.getElementById("myFpv-group-entities-all-btn").disabled = true;
    }
    document.getElementById("#myFpv_entities_all_select").innerHTML = html;
}

function myFpv_groups_all_select() {
    let html = "";
    if (groupsT.length > 0) {
        groupsT.forEach(element => {
        html += `<div id="myFpv-groups-group-block-id-${element.id}" class="myFpv-groups-group-block">${element.name}</div>`;
      });
    }
    document.getElementById("myFpv-groups-all").innerHTML = html;
}

function colorgen(type)	{
    let rgbt = new Array();
	switch (type)
		{
		case "dark" :
            rgbt[0] = nbralet(0,200); rgbt[1] = nbralet(0,200); rgbt[2] = nbralet(0,200);
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

window.onkeyup = function(e) 	{
        var key = e.keyCode || e.which;

        switch (key)
            {
            case 37 :
                keysT.left = false;
            break;

            case 39 :
                keysT.right = false;
            break;
                
            case 38 :
                keysT.top = false;
            break;
            case 40 :
                keysT.bottom = false;
            break;
            }
        }

window.onkeydown = function(e) {
        var key = e.keyCode || e.which;

        switch (key)
            {
            case 37:
                keysT.left = true;
            break;
                
            case 39:
                keysT.right = true;
            break;
                    
            case 38:
                keysT.top = true;
            break;
                
            case 40:
                keysT.bottom = true;
            break;
    
            }
        console.log(camera.position.x + " " + camera.position.z)
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

document.querySelector("#myFpv_entities_all_select").addEventListener("change", function() {
    document.getElementById("myFpv_renameEntity").value = "";
});

document.querySelector("#myFpv_renameEntityBtn").addEventListener("click", function() {
    let name = document.getElementById("myFpv_renameEntity").value;
    let id = document.getElementById("myFpv_entities_all_select").value;
    let entityO = entietiesT.find(o => o.id.toString() === id.toString());
    entityO.setName(name);

    myFpv_entities_all_select();
});

document.querySelector("#myFpv_addAnEntityBtn").addEventListener("click", function() {
    myFpv_addAnEntity();
});

document.querySelector("#myFpv_updateAnEntityBtn").addEventListener("click", function() {
    myFpv_updateAnEntity();
});

document.querySelector("#myFpv_deleteAnEntityBtn").addEventListener("click", function() {
    myFpv_deleteAnEntityBtn();
});

document.querySelector("#myFpv_groups_addBtn").addEventListener("click", function() {
    let name = document.getElementById("myFpv_groups_add").value;

    if (name != "") {
        groupsT.push(new Group(name));

        myFpv_groups_all_select();

        document.getElementById("myFpv_groups_add").value = "";
    }
});

document.getElementById("myFpv-groups-window").addEventListener("click", function(event) {
    document.querySelectorAll(".myFpv-groups-group-block").forEach(element => {
      element.addEventListener("click", function() {
        let id = parseInt(this.id.replace("myFpv-groups-group-block-id-",""));
        let groupO = groupsT.find(o => o.id.toString() === id.toString());

        document.getElementById("myFpv-group-name").textContent = `${groupO.name} (${groupO.id})`;
      });
    });
  });

document.querySelector("#myFpv-group-entities-all-btn").addEventListener("click", function() {
    let id = document.getElementById("myFpv-group-entities-all").value;
    let entityO = entietiesT.find(o => o.id.toString() === id.toString());

    let html = document.getElementById("myFpv-group-entities-selections_list").innerHTML;
    html += `<div class="myFpv-group-entities-selections_list-line">${entityO.id} - ${entityO.name} (${entityO.color})</div>`;
    document.getElementById("myFpv-group-entities-selections_list").innerHTML = html;
});
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

        this.id_group = 0;

        this.markerCube = null;

        this.update(type, sizeT, positionT, color, opacity, animated);

        Entity.id++;
    }

    changeColor(color, opacity) {
        if (color == null) {
            let newColorRgbt = colorgen("fluo");
            color = rgbToHex(newColorRgbt);
        }

        let newColor = colorThree(color);
        
        this.material = new THREE.MeshBasicMaterial({
            color: newColor,
            transparent: true,
            opacity: opacity
        });
        this.mesh.material = this.material;
    }

    selected() {
        if (this.markerCube == null) {
            const markerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });  // Vert
            this.markerCube = new THREE.Mesh(markerGeometry, markerMaterial);
            
            this.markerCube.position.set(this.mesh.position.x, parseInt(this.mesh.position.y) + 1, this.mesh.position.z);
            
            scene.add(this.markerCube);
        } else {
            this.markerCube.position.set(this.mesh.position.x, parseInt(this.mesh.position.y) + 1, this.mesh.position.z);
        }
    }

    unselected() {
        scene.remove(this.markerCube);
        this.markerCube.geometry.dispose();
        this.markerCube.material.dispose();
        this.markerCube = null;
    }

    update(type, sizeT, positionT, color, opacity, animated) {
        this.type = type;
    
        if (type === "cube") {
            if (!this.geometry || !(this.geometry instanceof THREE.BoxGeometry)) {
                this.geometry = new THREE.BoxGeometry(sizeT[0], sizeT[1], sizeT[2]);
            } else {
                this.geometry.parameters.width = sizeT[0];
                this.geometry.parameters.height = sizeT[1];
                this.geometry.parameters.depth = sizeT[2];
                this.geometry.dispose(); // Libérer l'ancienne géométrie
                this.geometry = new THREE.BoxGeometry(sizeT[0], sizeT[1], sizeT[2]);
            }
        } else if (type === "sphere") {
            if (!this.geometry || !(this.geometry instanceof THREE.SphereGeometry)) {
                this.geometry = new THREE.SphereGeometry(sizeT[0], sizeT[1], sizeT[2]);
            } else {
                this.geometry.parameters.radius = sizeT[0];
                this.geometry.parameters.widthSegments = sizeT[1];
                this.geometry.parameters.heightSegments = sizeT[2];
                this.geometry.dispose(); // Libérer l'ancienne géométrie
                this.geometry = new THREE.SphereGeometry(sizeT[0], sizeT[1], sizeT[2]);
            }
        }
    
         if (!this.mesh) {
            // Si le mesh n'existe pas encore, on le crée
            this.material = new THREE.MeshBasicMaterial({ color: color || 0x00ff00 });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            scene.add(this.mesh);
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
        this.id_group = id_group;
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
let entity_lastSelection = null;
let entityToAdd = null;

// groupes
let groupsT = new Array();

// light
const light = new THREE.AmbientLight(0x888888, 5); // Lumière ambiante pour éclairer la scène
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
    let id_group = document.getElementById("myFpv_groups_all_select").value;

    entietiesT.push(new Entity(t.type, t.sizeT, t.positionT, t.color, t.opacity, t.animated));

    // DERNIERE SELECTION !!! IL FAUT FINIR CA
    if (entity_lastSelection == null) {
        entity_lastSelection = entietiesT[entietiesT.length-1];
    }

    myFpv_groups_all_select_entities(id_group);

    scene.add(entietiesT[entietiesT.length-1].mesh);

    entietiesT[entietiesT.length-1].selected();
}

function myFpv_updateAnEntity() {
    let id = document.getElementById("myFpv_entities_all_select").value;

    let t = myFpv_prepareAnEntity();

    let entityO = entietiesT.find(o => o.id.toString() === id.toString());
    entityO.update(t.type, t.sizeT, t.positionT, t.color, t.opacity, t.animated);

    entityO.selected();
}

function myFpv_deleteAnEntityBtn() {
    let id = document.getElementById("myFpv_entities_all_select").value;
    let id_group = document.getElementById("myFpv_groups_all_select").value;

    let index = entietiesT.findIndex(o => o.id.toString() === id.toString());

    let entityO = entietiesT[index];

    // détruire dans le tableau
    entietiesT.splice(index, 1);

    // détruire en tant qu'objet
    entityO.destroy();

    myFpv_groups_all_select_entities(id_group);
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

function myFpv_groups_all_select_entities(id) {
    // afficher tous les objets du groupe concerné dans le select myFpv_entities_all_select
    let html = "";
    let t = entietiesT.filter(entity => parseInt(entity.id_group) === parseInt(id));
    t.forEach((entity, index, array) => {
        let select = "";
        if ((id == 0)&&(index === array.length - 1)) { select = " selected"; }
        html += "<option value='" + entity.id + "'" + select + ">" + entity.id + " - " + entity.name + " (" + entity.color + ")</option>";
    });
    document.getElementById("myFpv_entities_all_select").innerHTML = html;

    document.querySelectorAll(".myFpv-entities-select").forEach(element => {
        element.disabled = true;
      });
    document.getElementById("myFpv_renameEntity").disabled = true;
    document.getElementById("myFpv_renameEntityBtn").disabled = true;
    document.getElementById("myFpv-group-entities-all-btn").disabled = true;
    if (entietiesT.length > 0) {
        document.querySelectorAll(".myFpv-entities-select").forEach(element => {
            element.disabled = false;
        });
        document.getElementById("myFpv_renameEntity").disabled = false;
        document.getElementById("myFpv_renameEntityBtn").disabled = false;
        document.getElementById("myFpv-group-entities-all-btn").disabled = false;
    }
}

function myFpv_groups_all_select() {
    let htmlWindow = "";
    let htmlSelect = `<option value="0">No group</option>`;
    groupsT.forEach(element => {
        htmlWindow += `<div id="myFpv-groups-group-block-id-${element.id}" class="myFpv-groups-group-block">${element.name}</div>`;
        htmlSelect += `<option value="${element.id}">${element.name}</option>`;
    });
    document.getElementById("myFpv-groups-all").innerHTML = htmlWindow;
    document.getElementById("myFpv_groups_all_select").innerHTML = htmlSelect;
}

function myFpv_groups_entities_select(id) {
    let id_group = document.getElementById("myFpv_groups_all_select").value;

    let htmlSelect = ""; let htmlEntitiesGroup = "";
    entietiesT.forEach((entity) => {
    if (entity.id_group == 0) {
            htmlSelect += "<option value='" + entity.id + "'>" + entity.id + " - " + entity.name + " (" + entity.color + ")</option>";
        }
    else if (entity.id_group == id) {
        htmlEntitiesGroup += `<div class="myFpv-group-entities-selections_list-line">${entity.id} - ${entity.name} (${entity.color})</div>`;
        }
    });
    if (htmlSelect != "") { document.getElementById("myFpv-group-entities-all").disabled = false; }
    document.getElementById("myFpv-group-entities-all").innerHTML = htmlSelect;
    document.getElementById("myFpv-group-entities-selections_list").innerHTML = htmlEntitiesGroup;

    myFpv_groups_all_select_entities(id_group);
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

function colorThree(hex) {
    hex = hex.replace('#', '');

    let r = parseInt(hex.slice(0, 2), 16) / 255;
    let g = parseInt(hex.slice(2, 4), 16) / 255;
    let b = parseInt(hex.slice(4, 6), 16) / 255;

    let newColor = new THREE.Color(r, g, b);

    return newColor;
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
        }

window.onload = function(){
    myFpv_groups_all_select();
};

document.querySelectorAll(".myFpv-close").forEach(element => {
    element.addEventListener("click", function() {
        let id = this.id.replace("-close","")
        document.getElementById(id).style.display = "none";
    });
  });

document.querySelector("#myFpv_menu-entities").addEventListener("mouseover", function() {
    document.getElementById("myFpv_menu-entities-window").style.display = "inline";
});

document.querySelector("#myFpv_menu-entities-window").addEventListener("mouseleave", function() {
    document.getElementById("myFpv_menu-entities-window").style.display = "none";
});

document.querySelector("#myFpv_menu-entities-window-entities_all").addEventListener("click", function() {
    document.getElementById("myFpv-entities_all-window").style.display = "inline";
});

document.querySelector("#myFpv_menu-entities-window-manage_groups").addEventListener("click", function() {
    document.getElementById("myFpv-groups-window").style.display = "inline";
    document.getElementById("myFpv-parameters-window").style.display = "none";
});

document.querySelector("#myFpv_menu-parameters").addEventListener("click", function() {
    document.getElementById("myFpv-parameters-window").style.display = "inline";
    document.getElementById("myFpv-groups-window").style.display = "none";
    document.getElementById("myFpv-group-window").style.display = "none";
});

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

document.querySelector("#myFpv_groups_all_select").addEventListener("change", function() {
    myFpv_groups_all_select_entities(this.value);
});

document.querySelector("#myFpv_entities_all_select").addEventListener("change", function() {
    document.getElementById("myFpv_renameEntity").value = "";
});

document.querySelector("#myFpv_renameEntityBtn").addEventListener("click", function() {
    let name = document.getElementById("myFpv_renameEntity").value;
    let id = document.getElementById("myFpv_entities_all_select").value;
    let id_group = document.getElementById("myFpv_groups_all_select").value;

    let entityO = entietiesT.find(o => o.id.toString() === id.toString());
    entityO.setName(name);

    myFpv_groups_all_select_entities(id_group);

    // rafraîchir éventuellement fenêtre myFpv-group-window (c'est mieux si elle est ouverte)
    let refresh_idGroup_window = document.getElementById("myFpv-group-window-id").value;
    if (refresh_idGroup_window != "") {
        myFpv_groups_entities_select(refresh_idGroup_window);
    }
});

document.querySelector("#myFpv_addAnEntityBtn").addEventListener("click", function() {
    myFpv_addAnEntity();

    // rafraîchir éventuellement fenêtre myFpv-group-window (c'est mieux si elle est ouverte)
    let refresh_idGroup_window = document.getElementById("myFpv-group-window-id").value;
    if (refresh_idGroup_window != "") {
        myFpv_groups_entities_select(refresh_idGroup_window);
    }
});

document.querySelector("#myFpv_updateAnEntityBtn").addEventListener("click", function() {
    myFpv_updateAnEntity();
});

document.querySelector("#myFpv_deleteAnEntityBtn").addEventListener("click", function() {
    myFpv_deleteAnEntityBtn();

    // rafraîchir éventuellement fenêtre myFpv-group-window (c'est mieux si elle est ouverte)
    let refresh_idGroup_window = document.getElementById("myFpv-group-window-id").value;
    if (refresh_idGroup_window != "") {
        myFpv_groups_entities_select(refresh_idGroup_window);
    }
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

        myFpv_groups_entities_select(groupO.id);

        document.getElementById("myFpv-group-window-id").value = id;

        document.getElementById("myFpv-group-name").textContent = `${groupO.name} (${groupO.id})`;

        document.getElementById("myFpv-group-window").style.display = "inline";
      });
    });
  });

document.querySelector("#myFpv-group-entities-all-btn").addEventListener("click", function() {
    let id = document.getElementById("myFpv-group-entities-all").value;
    let id_group = document.getElementById("myFpv-group-window-id").value;

    let entityO = entietiesT.find(o => o.id.toString() === id.toString());

    entityO.setGroup(id_group);

    myFpv_groups_entities_select(id_group);
});

document.querySelector("#myFpv-parameters-groundColor-btn").addEventListener("click", function() {
    let color = document.getElementById("myFpv-parameters-groundColor").value;

    let newColor = colorThree(color);

    plane.material.map = null; // Remove texture
    plane.material = new THREE.MeshBasicMaterial({ color: newColor }); // Set new color without lighting effect
    plane.material.needsUpdate = true;
});

document.querySelector("#myFpv-parameters-skyColor-btn").addEventListener("click", function() {
    let color = document.getElementById("myFpv-parameters-skyColor").value;

    let newColor = colorThree(color);

    renderer.setClearColor(newColor);
});
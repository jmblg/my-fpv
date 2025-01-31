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

        this.selectedT = null;

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
        if (this.selectedT == null) {
            this.selectedT = new Array();

            const markerGeometryX = new THREE.BoxGeometry(0.25, 0.25, parseInt(this.mesh.geometry.parameters.depth));
            const markerGeometryY = new THREE.BoxGeometry(parseInt(this.mesh.geometry.parameters.width), 0.25, 0.25);
            const markerGeometryZ = new THREE.BoxGeometry(0.25, parseInt(this.mesh.geometry.parameters.height), 0.25);

            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

            this.selectedT.x = new THREE.Mesh(markerGeometryX, markerMaterial);
            this.selectedT.y = new THREE.Mesh(markerGeometryY, markerMaterial);
            this.selectedT.z = new THREE.Mesh(markerGeometryZ, markerMaterial);

            this.selectedT.x.name = "size-x";
            this.selectedT.y.name = "size-y";
            this.selectedT.z.name = "size-z";

            // Lier l'entité parent
            this.selectedT.x.parentEntity = this;
            this.selectedT.y.parentEntity = this;
            this.selectedT.z.parentEntity = this;

            this.selectedT.x.position.set(parseInt(this.mesh.position.x) + parseInt(this.mesh.geometry.parameters.width) / 2 + 0.5, this.mesh.position.y, this.mesh.position.z);
            this.selectedT.y.position.set(this.mesh.position.x, parseInt(this.mesh.position.y) + parseInt(this.mesh.geometry.parameters.height) / 2 + 0.5, this.mesh.position.z);
            this.selectedT.z.position.set(this.mesh.position.x, this.mesh.position.y, parseInt(this.mesh.position.z) + parseInt(this.mesh.geometry.parameters.depth) / 2 + 0.5);

            scene.add(this.selectedT.x);
            scene.add(this.selectedT.y);
            scene.add(this.selectedT.z);
        } else {
            this.selectedT.x.position.set(parseInt(this.mesh.position.x) + parseInt(this.mesh.geometry.parameters.width) / 2 + 0.5, this.mesh.position.y, this.mesh.position.z);
            this.selectedT.y.position.set(this.mesh.position.x, parseInt(this.mesh.position.y) + parseInt(this.mesh.geometry.parameters.height) / 2 + 0.5, this.mesh.position.z);
            this.selectedT.z.position.set(this.mesh.position.x, this.mesh.position.y, parseInt(this.mesh.position.z) + parseInt(this.mesh.geometry.parameters.depth) / 2 + 0.5);
        }
    }

    selected_color(color) {
        if (this.selectedT) {
            color = rgbToHex(color);
            
            let newColor = colorThree(color);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: newColor });

            this.selectedT.x.material = markerMaterial;
            this.selectedT.y.material = markerMaterial;
            this.selectedT.z.material = markerMaterial;
        }
    }

    unselected() {
        scene.remove(this.selectedT.x); scene.remove(this.selectedT.y); scene.remove(this.selectedT.z);
        this.selectedT.x.geometry.dispose(); this.selectedT.x.material.dispose();
        this.selectedT.y.geometry.dispose(); this.selectedT.y.material.dispose();
        this.selectedT.z.geometry.dispose(); this.selectedT.z.material.dispose();
        this.selectedT = null;
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
            this.mesh.entity = this;
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

        this.geometry = null;
        this.material = null;
        this.mesh = null;

        Group.id++;
    }

    // CECI EST A REGLER :
    selected(sizeT, positionT) {
        if (!this.geometry || !(this.geometry instanceof THREE.BoxGeometry)) {
            this.geometry = new THREE.BoxGeometry(sizeT[0], sizeT[1], sizeT[2]);
        } else {
            this.geometry.parameters.width = sizeT[0];
            this.geometry.parameters.height = sizeT[1];
            this.geometry.parameters.depth = sizeT[2];
            this.geometry.dispose(); // Libérer l'ancienne géométrie
            this.geometry = new THREE.BoxGeometry(sizeT[0], sizeT[1], sizeT[2]);
        }

        if (!this.mesh) {
            // Si le mesh n'existe pas encore, on le crée
            this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            scene.add(this.mesh);
        } else {
            // Si le mesh existe déjà, on met simplement à jour ses propriétés
            this.mesh.geometry = this.geometry;
            this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        }

        // Mise à jour de la position
        this.mesh.position.set(positionT[0], positionT[1], positionT[2]);
    }
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 15); // Positionner la caméra pour qu'elle regarde le sol
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

// selector color
let color_selectorT = new Array();
color_selectorT.background = new Array();
color_selectorT.color = new Array(); color_selectorT.color[0] = 0, color_selectorT.color[1] = 0, color_selectorT.color[2] = 255;
color_selectorT.status = new Array(); color_selectorT.status[0] = "-", color_selectorT.status[1] = "+", color_selectorT.status[2] = "+";
color_selectorT.is = 2;

// groupes
let groupsT = new Array();
let groupAllgroupsWindowOpen = false;

// light
const light = new THREE.AmbientLight(0x888888, 5); // Lumière ambiante pour éclairer la scène
scene.add(light);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
let keysT = new Array();
keysT.left = false; keysT.right = false; keysT.top = false; keysT.bottom = false;

// mouse
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let mouse_previous = new THREE.Vector2();
let mouseIsMoving_wt = camera;
let intersects = [];

function animate() {
    requestAnimationFrame(animate);

    myFpv_toAddAnEntity();

    // si une entité est animée :
    entietiesT.forEach((entity) => {
        if (entity.animated == true) {
            entity.mesh.rotation.x += 0.01;
            entity.mesh.rotation.y += 0.01;
        }
    });

  // modification de la couleur des mini-cubes de sélection :
    if (color_selectorT) {
        color_fluo_update(color_selectorT);
        let id_o_selected = document.getElementById("myFpv_entities_all_select").value;
        if (id_o_selected) {
            let entityO = entietiesT.find(o => o.id.toString() === id_o_selected.toString());
            entityO.selected_color(color_selectorT.color);
        }
    }

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
    if (mouseIsMoving_wt != camera) {
        controls.enableRotate = false;
    } else {
        controls.enableRotate = true;
    }

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

    myFpv_groups_all_select_entities(id_group);

    scene.add(entietiesT[entietiesT.length-1].mesh);

    // SELECTION DE L ENTITÉ
    if (entity_lastSelection != null) {
        entity_lastSelection.unselected();
    }
    entity_lastSelection = entietiesT[entietiesT.length-1];
    entietiesT[entietiesT.length-1].selected();
}

function myFpv_updateAnEntity() {
    let id = document.getElementById("myFpv_entities_all_select").value;

    let t = myFpv_prepareAnEntity();

    let entityO = entietiesT.find(o => o.id.toString() === id.toString());
    if (entityO) {
        entityO.update(t.type, t.sizeT, t.positionT, t.color, t.opacity, t.animated);

        entityO.selected();
    }
}

function myFpv_deleteAnEntityBtn() {
    let id = document.getElementById("myFpv_entities_all_select").value;
    // il se peut que l'id de l'entité sélectionnée ne correspond pas à cet id .. Il vaut mieux privilégier l'id du bloc sélectionné
    let entityOT = entietiesT.filter(entity => entity.selectedT != null);
    let entityO = entityOT[0];
    if (entityO) {
        id = entityO.id;
    }

    let id_group = document.getElementById("myFpv_groups_all_select").value;

    let index = entietiesT.findIndex(o => o.id.toString() === id.toString());
    entityO = entietiesT[index];
    
    // détruire dans le tableau
    entietiesT.splice(index, 1);

    // détruire en tant qu'objet
    if (entityO) {
        // mettre directement l'id_group de l'entité pour être sûr :
        id_group = entityO.id_group;
        entityO.destroy();
        }

    myFpv_groups_all_select_entities(id_group);

    // SELECTION DE L ENTITÉ ACTUELLEMENT DANS LE SELECT PRINCIPAL (all entities):
    let id_entity_selected = document.getElementById("myFpv_entities_all_select").value;
    let entityO_selected = entietiesT.find(o => o.id.toString() === id_entity_selected.toString());

    if (entity_lastSelection != null) {
        entity_lastSelection.unselected();
    }
    entity_lastSelection = entityO_selected;

    if (entityO_selected) {
        entityO_selected.selected();
    }
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

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    if (mouseIsMoving_wt != camera) {
        if (mouse_previous.y != mouse.y) {
            if (mouseIsMoving_wt.name == "size-y") {
                let y = document.getElementById("myFpv_addAnEntity_sizeY").value;
                if (mouse_previous.y < mouse.y) {
                        y++;
                    } else if ((mouse_previous.y > mouse.y)&&(y > 1)) {
                        y--;
                    }
                document.getElementById("myFpv_addAnEntity_sizeY").value = y;
                myFpv_updateAnEntity();
            } else if (mouseIsMoving_wt.name == "size-z") {
                let z = document.getElementById("myFpv_addAnEntity_sizeZ").value;
                if (mouse_previous.y > mouse.y) {
                        z++;
                    } else if ((mouse_previous.y < mouse.y)&&(z > 1)) {
                        z--;
                    }
                document.getElementById("myFpv_addAnEntity_sizeZ").value = z;
                myFpv_updateAnEntity();
            }
        }
        else if (mouse_previous.x != mouse.x) {
            if (mouseIsMoving_wt.name == "size-x") {
                let x = document.getElementById("myFpv_addAnEntity_sizeX").value;
                if (mouse_previous.x < mouse.x) {
                        x++;
                    } else if ((mouse_previous.x > mouse.x)&&(x > 1)) {
                        x--;
                    }
                document.getElementById("myFpv_addAnEntity_sizeX").value = x;
                myFpv_updateAnEntity();
            }
        }

        mouse_previous.x = mouse.x;
        mouse_previous.y = mouse.y;
    }
}

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    intersects = getIntersects();

    if ((intersects.length > 0)&&(groupAllgroupsWindowOpen == false)) {
        // Si on a trouvé une intersection avec n'importe quelle entité dans la scène :
        let intersectedObject = intersects[0].object;

        if (intersectedObject.entity) {
            if (intersectedObject.entity.id == 0) {
                // l'objet avec l'id 0 est l'entité de création (translucide) .. Il faut donc vérifier si elle ne supperpose pas un autre objet
                intersectedObject = intersects[1].object;
            }
            if (intersectedObject.entity) {
                // on peut à présent sélectionner la bonne entité :
                let entityO = entietiesT.find(o => o.id.toString() === intersectedObject.entity.id.toString());
                
                if (entityO) {
                    // mettre son numéro de groupe dans le sélecteur concerné :
                    document.getElementById("myFpv_groups_all_select").value = entityO.id_group;
                    const event = new Event('change');  // Crée un nouvel événement 'change'
                    document.getElementById("myFpv_groups_all_select").dispatchEvent(event);
                    // mettre son id à elle dans le sélecteur concerné :
                    setTimeout(function(){
                        document.getElementById("myFpv_entities_all_select").value = entityO.id;
                        const event2 = new Event('change');
                        document.getElementById("myFpv_entities_all_select").dispatchEvent(event2);
                    }, 100);
                }
            }
        }

        if (intersectedObject.name === "size-x" || intersectedObject.name === "size-y" || intersectedObject.name === "size-z") {
             // Accéder à l'entité parente et afficher son ID
             const parentEntity = intersectedObject.parentEntity;
             if (parentEntity) {
                mouseIsMoving_wt = intersectedObject;

                mouse_previous.x = mouse.x;
                mouse_previous.y = mouse.y;
             }

        }
    }
}

function onMouseUp(event) {
    mouseIsMoving_wt = camera;
}

// obtenir les intersections entre le rayon et la scène
function getIntersects() {
    return raycaster.intersectObjects(scene.children);
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

function color_fluo_update(wt)
	{
        var to_switch = false;

        if (wt.status[wt.is] == "+")
            {
            if (wt.color[wt.is] < 255) { wt.color[wt.is]+=1; } else { wt.status[wt.is] = "-"; to_switch = true; }
            }
        else
            {
            if (wt.color[wt.is] > 0) { wt.color[wt.is]-=1; } else { wt.status[wt.is] = "+"; to_switch = true; }
            }
            
        if (to_switch == true)
            {
            switch (wt.is)
                {
                case 0 : wt.is = 1; break;
                case 1 : wt.is = 2; break;
                case 2 : wt.is = 0; break;
                }
            }
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

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);

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
    document.getElementById("myFpv-group-window").style.display = "none";
});

document.querySelector("#myFpv_menu-parameters").addEventListener("click", function() {
    document.getElementById("myFpv-parameters-window").style.display = "inline";
    document.getElementById("myFpv-groups-window").style.display = "none";
    document.getElementById("myFpv-group-window").style.display = "none";
});

document.querySelector("#myFpv_entities_all_selectGroups_btn").addEventListener("click", function() {
    if (document.getElementById("myFpv-entities_all-window-byEntities").style.display == "none") {
        groupAllgroupsWindowOpen = false;

        document.getElementById("myFpv-entities_all-window-h5").textContent = "All entities";
        document.getElementById("myFpv_entities_all_selectGroups_btn").textContent = "Select by group";

        document.getElementById("myFpv-entities_all-window-byEntities").style.display = "inline";
        document.getElementById("myFpv-entities_all-window-byGroups").style.display = "none";

        if (entity_lastSelection) {
            entity_lastSelection.selected();
        }
    } else {
        groupAllgroupsWindowOpen = true;

        let selectT = new Array();
        const selectElement = document.getElementById("myFpv_groups_all_select");
        for (let i = 0; i < selectElement.options.length; i++) {
            selectT.push(selectElement.options[i].value);
          }
        // on vérifie qu'il y a au moins un groupe créé :
        if (selectT.length > 1) {
        document.getElementById("myFpv-entities_all-window-h5").textContent = "All groups";
        document.getElementById("myFpv_entities_all_selectGroups_btn").textContent = "Select by entity";

        document.getElementById("myFpv-entities_all-window-byEntities").style.display = "none";
        document.getElementById("myFpv-entities_all-window-byGroups").style.display = "inline";

        // déselectionner l'entité actuellement sélectionnée
        let entityOT = entietiesT.filter(entity => entity.selectedT != null);
        let entityO = entityOT[0];
        if (entityO) {
            entity_lastSelection = entityO;
            entityO.unselected();
        }

        // directement placer le dernier select
        if (selectElement.value == 0) {
                selectElement.selectedIndex = selectElement.options.length - 1;
                const event = new Event('change');  // Crée un nouvel événement 'change'
                selectElement.dispatchEvent(event);
            }
        } else {
            alert(`You must create at least one group in "Group manager".`);
        }
    }
});

document.querySelector("#myFpv_entities_all_manageGroups_btn").addEventListener("click", function() {
    document.getElementById("myFpv-groups-window").style.display = "inline";
    document.getElementById("myFpv-parameters-window").style.display = "none";
    document.getElementById("myFpv-group-window").style.display = "none";
});

document.querySelector("#myFpv-entities_all-window-byGroups-addEntity-btn").addEventListener("click", function() {
    document.getElementById("myFpv-groups-window").style.display = "inline";
    document.getElementById("myFpv-parameters-window").style.display = "none";
    document.getElementById("myFpv-group-window").style.display = "none";
    let id = document.getElementById("myFpv_groups_all_select").value;
    if (id != 0) {
        let groupO = groupsT.find(o => o.id.toString() === id.toString());

        myFpv_groups_entities_select(groupO.id);

        document.getElementById("myFpv-group-window-id").value = id;

        document.getElementById("myFpv-group-name").textContent = `${groupO.name} (${groupO.id})`;

        document.getElementById("myFpv-group-window").style.display = "inline";
    }
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

    // SELECTION DE L ENTITÉ :
    if (entity_lastSelection != null) {
        entity_lastSelection.unselected();
    }
    entity_lastSelection = entityO;
    entityO.selected();
});

document.querySelector("#myFpv_groups_all_select").addEventListener("change", function() {
 /*   // on va déselectionner l'entité actuellement selected et sélectionner celle qui devrait l'être à présent donc document.getElementById("myFpv_groups_all_select").value);
    let entityOT = entietiesT.filter(entity => entity.selectedT != null);
    let entityO = entityOT[0];
    if (entityO) {
        entity_lastSelection = entityO;
        entityO.unselected();
        let id_entity = document.getElementById("myFpv_groups_all_select").value;
        entityO = entietiesT.find(o => o.id.toString() === id_entity.toString());
        entityO.selected();
    }*/

    // calculer la position x, y, z la plus éloignée sur l'ensemble des objets
    // il faudra aussi calculer la plus petite position, pour créer un width et height géants qu'on ajoutera dans la classe group
    let positionT = new Array();
    positionT.x = null, positionT.y = null, positionT.z = null;

    let sizeT = new Array();
    sizeT.x = null, sizeT.y = null, sizeT.z = null;

    if (document.getElementById("myFpv_groups_all_select").value != 0) {
        let t = entietiesT.filter(entity => entity.id_group === document.getElementById("myFpv_groups_all_select").value);
        t.forEach(element => {
            if (positionT.x == null) { positionT.x = element.mesh.position.x; }
            if (positionT.y == null) { positionT.y = element.mesh.position.y; }
            if (positionT.z == null) { positionT.z = element.mesh.position.z; }
            if (element.mesh.position.x > positionT.x) {
                positionT.x = element.mesh.position.x;
            }
            if (element.mesh.position.y > positionT.y) {
                positionT.y = element.mesh.position.y;
            }
            if (element.mesh.position.z > positionT.z) {
                positionT.z = element.mesh.position.z;
            }

            if (sizeT.x == null) { sizeT.x = element.mesh.geometry.parameters.width; }
            if (sizeT.y == null) { sizeT.y = element.mesh.geometry.parameters.height; }
            if (sizeT.z == null) { sizeT.x = element.mesh.geometry.parameters.depth; }
            if (element.mesh.geometry.parameters.width > sizeT.x) {
                sizeT.x = element.mesh.geometry.parameters.width;
            }
            if (element.mesh.geometry.parameters.height > sizeT.y) {
                sizeT.y = element.mesh.geometry.parameters.height;
            }
            if (element.mesh.geometry.parameters.depth > sizeT.z) {
                sizeT.z = element.mesh.geometry.parameters.depth;
            }
            console.log(positionT.x,positionT.y,positionT.z,sizeT.x,sizeT.y,sizeT.z);
          });
    }

    if (positionT.x == null) { positionT.x = 1; }
    if (positionT.y == null) { positionT.y = 1; }
    if (positionT.z == null) { positionT.z = 1; }
    if (sizeT.x == null) { sizeT.x = 1; }
    if (sizeT.y == null) { sizeT.y = 1; }
    if (sizeT.z == null) { sizeT.x = 1; }

    let groupO = groupsT.find(o => o.id.toString() === document.getElementById("myFpv_groups_all_select").value.toString());
    if (groupO) {
        groupO.selected(sizeT, positionT);
    }

    document.getElementById("myFpv_Group_positionX").value = positionT.x;
    document.getElementById("myFpv_Group_positionY").value = positionT.y;
    document.getElementById("myFpv_Group_positionZ").value = positionT.z;

    document.getElementById("myFpv_Group_sizeX").value = sizeT.x;
    document.getElementById("myFpv_Group_sizeY").value = sizeT.y;
    document.getElementById("myFpv_Group_sizeZ").value = sizeT.z;

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
    let checkiffirst = document.getElementById("myFpv_entities_all_select").value;
    if (checkiffirst != "") {
        let width = 3;
        let height = 3;
        let depth = 3;
        document.getElementById("myFpv_addAnEntity_sizeX").value = width;
        document.getElementById("myFpv_addAnEntity_sizeY").value = height;
        document.getElementById("myFpv_addAnEntity_sizeZ").value = depth;

        let x = document.getElementById("myFpv_addAnEntity_positionX").value;
        let y = document.getElementById("myFpv_addAnEntity_positionY").value;
        let z = document.getElementById("myFpv_addAnEntity_positionZ").value;
        x++; y++; z--;
        document.getElementById("myFpv_addAnEntity_positionX").value = x;
        document.getElementById("myFpv_addAnEntity_positionY").value = y;
        document.getElementById("myFpv_addAnEntity_positionZ").value = z;
    }

    myFpv_addAnEntity();

    // rafraîchir éventuellement fenêtre myFpv-group-window (c'est mieux si elle est ouverte)
    let refresh_idGroup_window = document.getElementById("myFpv-group-window-id").value;
    if (refresh_idGroup_window != "") {
        myFpv_groups_entities_select(refresh_idGroup_window);
    }
});

document.querySelector("#myFpv_duplicateAnEntityBtn").addEventListener("click", function() {
    let x = document.getElementById("myFpv_addAnEntity_positionX").value;
    let y = document.getElementById("myFpv_addAnEntity_positionY").value;
 //   let z = document.getElementById("myFpv_addAnEntity_positionZ").value;
    x++; y++;// z--;
    document.getElementById("myFpv_addAnEntity_positionX").value = x;
    document.getElementById("myFpv_addAnEntity_positionY").value = y;
 //   document.getElementById("myFpv_addAnEntity_positionZ").value = z;

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

    if (entityO) {
        entityO.setGroup(id_group);

        myFpv_groups_entities_select(id_group);

        // SELECTION DE L ENTITÉ ACTUELLEMENT DANS LE SELECT PRINCIPAL (all entities):
        let id_entity_selected = document.getElementById("myFpv_entities_all_select").value;
        let entityO_selected = entietiesT.find(o => o.id.toString() === id_entity_selected.toString());
        if (entityO_selected) {
            if (entity_lastSelection != null) {
                entity_lastSelection.unselected();
            }
            entity_lastSelection = entityO_selected;
            entityO_selected.selected();
        }
    }
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
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

class Entity {
    static id = 0;

    constructor(type, sizeT, positionT, color, texture, opacity, animatedT) {
        this.id = Entity.id;
        this.name = type;
   
        this.type = null;
        this.positionInitial = positionT;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.color = null;
        this.texture = null;
        this.animatedT = new Array;

        this.id_group = 0;

        this.selectedT = null;
        this.selected_type = "";

        this.update(type, sizeT, positionT, color, texture, opacity, animatedT);

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
        const angle = Math.PI / 4;

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

            this.selected_type = "size";
        } else {
            this.selectedT.x.position.set(parseInt(this.mesh.position.x) + parseInt(this.mesh.geometry.parameters.width) / 2 + 0.5, this.mesh.position.y, this.mesh.position.z);
            this.selectedT.y.position.set(this.mesh.position.x, parseInt(this.mesh.position.y) + parseInt(this.mesh.geometry.parameters.height) / 2 + 0.5, this.mesh.position.z);
            this.selectedT.z.position.set(this.mesh.position.x, this.mesh.position.y, parseInt(this.mesh.position.z) + parseInt(this.mesh.geometry.parameters.depth) / 2 + 0.5);

            if (this.selected_type == "size") {
                this.selected_type = "position";
            } else {
                this.selected_type = "size";
            }
        }
    }

    selected_resize(sizeT) {
        // Mettre à jour les géométries des marqueurs sélectionnés
        this.selectedT.x.geometry.dispose(); // Libérer les anciennes géométries
        this.selectedT.y.geometry.dispose();
        this.selectedT.z.geometry.dispose();
        
        // Recréer les géométries avec les nouvelles dimensions
        this.selectedT.x.geometry = new THREE.BoxGeometry(0.25, 0.25, sizeT.z);
        this.selectedT.y.geometry = new THREE.BoxGeometry(sizeT.x, 0.25, 0.25);
        this.selectedT.z.geometry = new THREE.BoxGeometry(0.25, sizeT.y, 0.25);
 
        // Repositionner les marqueurs en fonction de la nouvelle taille
        this.selectedT.x.position.set(
            parseInt(this.mesh.position.x) + sizeT.x / 2 + 0.5, 
            this.mesh.position.y, 
            this.mesh.position.z
        );
        this.selectedT.y.position.set(
            this.mesh.position.x, 
            parseInt(this.mesh.position.y) + sizeT.y / 2 + 0.5, 
            this.mesh.position.z
        );
        this.selectedT.z.position.set(
            this.mesh.position.x, 
            this.mesh.position.y, 
            parseInt(this.mesh.position.z) + sizeT.z / 2 + 0.5
        );
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
        this.selected_type = "";
    }

    update(type, sizeT, positionT, color, texture, opacity, animatedT) {
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

        // Mise à jour de la texture
        this.texture = texture;

        // Mise à jour de l'animation
        this.animatedT = animatedT;
        if (this.animatedT.x == false) {
            this.mesh.rotation.x = 0;
        }
        if (this.animatedT.y == false) {
            this.mesh.rotation.y = 0;
        }
        if (this.animatedT.z == false) {
            this.mesh.rotation.z = 0;
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
        this.animatedT = null;
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
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-10, 8.5, 10); // Positionner la caméra pour qu'elle regarde le sol
camera.lookAt(0, 0, 0); // Regarder vers le centre (où le sol est positionné)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x050519); // sky

// ground
const planeGeometry = new THREE.PlaneGeometry(250, 250);
const planeTextureLoader = new THREE.TextureLoader();
const planeTexture = planeTextureLoader.load("img/200.png");
planeTexture.wrapS = THREE.RepeatWrapping;
planeTexture.wrapT = THREE.RepeatWrapping;
planeTexture.repeat.set(250, 250);
const planeMaterial = new THREE.MeshLambertMaterial({ 
    map: planeTexture,
    opacity: 1,  // Ajuste la valeur de l'opacité entre 0 (transparent) et 1 (opaque)
    transparent: true // Nécessaire pour que la transparence soit effective
});
// const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2; // Rotation pour que le plan soit horizontal
plane.position.set(1, 0.5, 1);
scene.add(plane);

// entities
let entietiesT = new Array();
let entityToAdd = null;

// selector color
let color_selectorT = new Array();
color_selectorT.fluo = new Array();
color_selectorT.fluo.background = new Array();
color_selectorT.fluo.color = new Array(); color_selectorT.fluo.color[0] = 0, color_selectorT.fluo.color[1] = 0, color_selectorT.fluo.color[2] = 255;
color_selectorT.fluo.status = new Array(); color_selectorT.fluo.status[0] = "-", color_selectorT.fluo.status[1] = "+", color_selectorT.fluo.status[2] = "+";
color_selectorT.fluo.is = 2;
color_selectorT.bw = new Array();
color_selectorT.bw.color = new Array(); color_selectorT.bw.color[0] = 255, color_selectorT.bw.color[1] = 255, color_selectorT.bw.color[2] = 255;
color_selectorT.bw.status = "+";

// groupes

// light
const light = new THREE.AmbientLight(0x888888, 5); // Lumière ambiante pour éclairer la scène
scene.add(light);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
let keysT = new Array();
keysT.left = false; keysT.right = false; keysT.top = false; keysT.bottom = false;
keysT.speed = 0.1;

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
        if (entity.animatedT.x == true) {
            entity.mesh.rotation.x += 0.01;
        }
        if (entity.animatedT.y == true) {
            entity.mesh.rotation.y += 0.01;
        }
        if (entity.animatedT.z == true) {
            entity.mesh.rotation.z += 0.01;
        }
    });

  // modification de la couleur des mini-cubes de sélection :
    if (color_selectorT) {
        color_update(color_selectorT.fluo, "fluo");
        color_update(color_selectorT.bw, "bw");
        let id_o_selected = document.getElementById("myFpv_entities_all_select").value;
        if (id_o_selected) {
            let entityO = entietiesT.find(o => o.id.toString() === id_o_selected.toString());
            if (entityO.selected_type == "size") {
                entityO.selected_color(color_selectorT.fluo.color);
            } else {
                entityO.selected_color(color_selectorT.bw.color);
            }
        }
    }

    if ((keysT.right)||(keysT.left)||(keysT.top)||(keysT.bottom)) {
        keysT.speed += 0.005;
    }
    if ((keysT.right == false)&&(keysT.left == false)&&(keysT.top == false)&&(keysT.bottom == false)&&(keysT.speed != 0.1)) {
        keysT.speed = 0.1;
    }

    if (keysT.right == true) { 
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        let right = new THREE.Vector3(-direction.z, 0, direction.x); 
        right.normalize();
        camera.position.addScaledVector(right, keysT.speed);
        controls.target.addScaledVector(right, keysT.speed);
    }
    if (keysT.left == true) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        let left = new THREE.Vector3(direction.z, 0, -direction.x);
        left.normalize();
        camera.position.addScaledVector(left, keysT.speed);
        controls.target.addScaledVector(left, keysT.speed);
    }
    if (keysT.top == true) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.normalize();
        camera.position.addScaledVector(direction, keysT.speed);
        controls.target.addScaledVector(direction, keysT.speed);
    }
    if (keysT.bottom == true) {
        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.normalize();
        camera.position.addScaledVector(direction, -keysT.speed);
        controls.target.addScaledVector(direction, -keysT.speed);
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
        entityToAdd = new Entity(t.type, t.sizeT, t.positionT, t.color, t.texture, t.opacity, t.animatedT);
    } else {
        entityToAdd.update(t.type, t.sizeT, t.positionT, t.color, t.texture, t.opacity, t.animatedT);
    }
}

function myFpv_addAnEntity() {
    let t = myFpv_prepareAnEntity();

    entietiesT.push(new Entity(t.type, t.sizeT, t.positionT, t.color, t.texture, t.opacity, t.animatedT));

    scene.add(entietiesT[entietiesT.length-1].mesh);

    // Désélection de toutes les entités :
    let entityOT = entietiesT.filter(entity => entity.selectedT != null);
    entityOT.forEach(function(element){
        element.unselected();
    });

    // SELECTION DE L ENTITÉ PRÉCISE :
    entietiesT[entietiesT.length-1].selected();

    myFpv_entities_all_select();

    // sélectionner dans le selecteur de "All entities" la dernière entité générée
    document.getElementById("myFpv_entities_all_select").value = entietiesT[entietiesT.length-1].id;
}

function myFpv_updateAnEntity(byMouse) {
    let id = document.getElementById("myFpv_entities_all_select").value;

    let t = myFpv_prepareAnEntity();

    let entityO = entietiesT.find(o => o.id.toString() === id.toString());
    if (entityO) {
        if (byMouse == false) { entityO.unselected(); }
        entityO.update(t.type, t.sizeT, t.positionT, t.color, t.texture, t.opacity, t.animatedT);
        if (byMouse == false) { entityO.selected(); }
    }
}

function myFpv_deleteAnEntityBtn() {
    let entityOT = entietiesT.filter(entity => entity.selectedT != null);
    let entityO = entityOT[0];
 
    if (entityO) {
        // on en profite d'abord pour déselectionner toutes les entités sélectionnées de entityOT :
        entityOT.forEach(function(element){
            element.unselected();
        });

        // ensuite on passe à la destruction :
        let id = entityO.id;
        document.getElementById("myFpv_entities_all_select").value = id;
        entityO.destroy();

        let index = entietiesT.findIndex(o => o.id.toString() === id.toString());
        // détruire dans le tableau :
        entietiesT.splice(index, 1);

        // rafraichir le input select
        myFpv_entities_all_select();
        // prendre la dernière id du select
        if (document.getElementById("myFpv_entities_all_select").length > 0) {
            document.getElementById("myFpv_entities_all_select").selectedIndex = document.getElementById("myFpv_entities_all_select").options.length - 1;
            const event = new Event('change');
            document.getElementById("myFpv_entities_all_select").dispatchEvent(event);
        }

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

    let texture = document.getElementById("myFpv-entities_all-textures-window-id").value;

    let animatedT = new Array(); animatedT.x = false; animatedT.y = false; animatedT.z = false;
    if (document.getElementById("myFpv_addAnEntity_animated-x").checked) { animatedT.x = true; }
    if (document.getElementById("myFpv_addAnEntity_animated-y").checked) { animatedT.y = true; }
    if (document.getElementById("myFpv_addAnEntity_animated-z").checked) { animatedT.z = true; }

    t.type = type;
    t.sizeT = sizeT;
    t.positionT = positionT;
    t.color = color;
    t.texture = texture;
    t.opacity = opacity;
    t.animatedT = animatedT;

    return t;
}

function myFpv_entities_all_select() {
    let html = "";
    entietiesT.forEach(function(element){
        html += `<option value="${element.id}">${element.id} - ${element.name} (${element.color})</option>`;
    });
    document.getElementById("myFpv_entities_all_select").innerHTML = html;

    if (document.getElementById("myFpv_entities_all_select").length == 0) {
        document.getElementById("myFpv_entities_all_select").disabled = true;
        document.getElementById("myFpv_renameEntity").disabled = true;
        document.getElementById("myFpv_renameEntityBtn").disabled = true;
    } else {
        document.getElementById("myFpv_entities_all_select").disabled = false;
        document.getElementById("myFpv_renameEntity").disabled = false;
        document.getElementById("myFpv_renameEntityBtn").disabled = false;
    }
}

function myFpv_textures_load() {
    const textureFiles = [
        "bricks-1.jpg",
        "bricks-2.jpg",
        "bricks-3.jpg",
        "metal-1.jpg",
        "paper-1.jpg",
        "sweet-1.jpg",
        "textile-1.jpg",
        "wood-1.jpg",
        "wood-2.jpg",
        "wood-3.jpg"
    ];

    let html = "";
    textureFiles.forEach(element => {
        html += `<div class="myFpv-entities_all-textures-block">
        <input type="radio" name="myFpv-entities_all-textures-block" id="myFpv-entities_all-textures-block-id-${element}" hidden />
            <label for="myFpv-entities_all-textures-block-id-${element}">
                <img src="img/textures/${element}" />
            </label>
        </div>`;
    });

    document.getElementById("myFpv-entities_all-textures-selections_list").innerHTML = html;
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    if (mouseIsMoving_wt != camera) {
        // modifier curseur souris
        document.body.style.cursor = "all-scroll";

        // retrouver le nom de l'entité sélectionnée
        let id_o_selected = document.getElementById("myFpv_entities_all_select").value;
        if (id_o_selected) {
        let entityO = entietiesT.find(o => o.id.toString() === id_o_selected.toString());
        if (entityO) {
            if (mouse_previous.y != mouse.y) {
                if (mouseIsMoving_wt.name == "size-y") {
                    let y = document.getElementById("myFpv_addAnEntity_" + entityO.selected_type + "Y").value;
                    if (mouse_previous.y < mouse.y) {
                            y++;
                        } else if (((mouse_previous.y > mouse.y)&&(y > 1))||(entityO.selected_type == "position")) {
                            y--;
                        }
                    document.getElementById("myFpv_addAnEntity_" + entityO.selected_type + "Y").value = y;
                    myFpv_updateAnEntity(true);
                } else if (mouseIsMoving_wt.name == "size-z") {
                    let z = document.getElementById("myFpv_addAnEntity_" + entityO.selected_type + "Z").value;
                    if (mouse_previous.y > mouse.y) {
                            z++;
                        } else if (((mouse_previous.y < mouse.y)&&(z > 1))||(entityO.selected_type == "position")) {
                            z--;
                        }
                    document.getElementById("myFpv_addAnEntity_" + entityO.selected_type + "Z").value = z;
                    myFpv_updateAnEntity(true);
                }
            }
            else if (mouse_previous.x != mouse.x) {
                if (mouseIsMoving_wt.name == "size-x") {
                    let x = document.getElementById("myFpv_addAnEntity_" + entityO.selected_type + "X").value;
                    if (mouse_previous.x < mouse.x) {
                            x++;
                        } else if (((mouse_previous.x > mouse.x)&&(x > 1))||(entityO.selected_type == "position")) {
                            x--;
                        }
                    document.getElementById("myFpv_addAnEntity_" + entityO.selected_type + "X").value = x;
                    myFpv_updateAnEntity(true);
                }
            }

            mouse_previous.x = mouse.x;
            mouse_previous.y = mouse.y;

            // redimensionner les barres de sélections autour de l'entité (sur la scène) :

            let sizeT = new Array();
            sizeT.x = document.getElementById("myFpv_addAnEntity_sizeX").value;
            sizeT.y = document.getElementById("myFpv_addAnEntity_sizeY").value;
            sizeT.z = document.getElementById("myFpv_addAnEntity_sizeZ").value;

            entityO.selected_resize(sizeT);
            }
        }
    } else {
        document.body.style.cursor = "default";
    }
}

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    intersects = getIntersects();

    if (intersects.length > 0) {
        // Si on a trouvé une intersection avec n'importe quelle entité dans la scène :
        let intersectedObject = intersects[0].object;

        if (intersectedObject.entity) {
            if (intersectedObject.entity.id == 0) {
                // l'objet avec l'id 0 est l'entité de création (translucide) .. Il faut donc vérifier si elle ne supperpose pas un autre objet
                intersectedObject = intersects[1].object;
            }
            if (intersectedObject.entity) {
                let entityO = entietiesT.find(o => o.id.toString() === intersectedObject.entity.id.toString());
                if (entityO) {
                    document.getElementById("myFpv_entities_all_select").value = entityO.id;
                    const event2 = new Event('change');
                    document.getElementById("myFpv_entities_all_select").dispatchEvent(event2);
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

function color_update(wt, how)
	{
        if (how == "fluo") {
            let to_switch = false;

            if (wt.status[wt.is] == "+") {
                if (wt.color[wt.is] < 255) { wt.color[wt.is]+=1; } else { wt.status[wt.is] = "-"; to_switch = true; }
            } else {
                if (wt.color[wt.is] > 0) { wt.color[wt.is]-=1; } else { wt.status[wt.is] = "+"; to_switch = true; }
            }
                
            if (to_switch == true) {
                switch (wt.is) {
                    case 0 : wt.is = 1; break;
                    case 1 : wt.is = 2; break;
                    case 2 : wt.is = 0; break;
                }
            }
        } else if (how == "bw") {
            if (wt.status == "+") {
                if (wt.color[0] < 255) {
                    wt.color[0]+=2; wt.color[1]+=2; wt.color[2]+=2;
                } else {
                    wt.status = "-";
                }
            } else {
                if (wt.color[0] > 0) {
                    wt.color[0]-=2; wt.color[1]-=2; wt.color[2]-=2;
                } else {
                    wt.status = "+";
                }
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

document.querySelector("#myFpv_menu-parameters").addEventListener("click", function() {
    document.getElementById("myFpv-parameters-window").style.display = "inline";
});

document.querySelector("#myFpv_entities_all_select").addEventListener("change", function() {
    /// on va virer tous les potentiels actuels selected des différentes entités sur la scène
    // SAUF si l'objet qui nous intéresse est déjà sélectionné !
    let entityOT = entietiesT.filter(entity => entity.selectedT != null);
    let entityO = entietiesT.find(o => o.id.toString() === this.value.toString());
    let id_for_selection = 0;
    if (entityO) { id_for_selection = entityO.id; }
    entityOT.forEach(function(element){
        if (element.id != id_for_selection) {
            element.unselected();
        }
    });

    // ensuite on peut s'occuper de l'entité entityO :

    document.getElementById("myFpv_addAnEntity_type").value = entityO.type;

    document.getElementById("myFpv_addAnEntity_sizeX").value = entityO.mesh.geometry.parameters.width;
    document.getElementById("myFpv_addAnEntity_sizeY").value = entityO.mesh.geometry.parameters.height;
    document.getElementById("myFpv_addAnEntity_sizeZ").value = entityO.mesh.geometry.parameters.depth;

    document.getElementById("myFpv_addAnEntity_positionX").value = entityO.mesh.position.x;
    document.getElementById("myFpv_addAnEntity_positionY").value = entityO.mesh.position.y;
    document.getElementById("myFpv_addAnEntity_positionZ").value = entityO.mesh.position.z;

    document.getElementById("myFpv_addAnEntity_color").value = entityO.color;
    document.getElementById("myFpv-entities_all-textures-window-id").value = entityO.texture;

    document.getElementById("myFpv_addAnEntity_animated-x").checked = entityO.animatedT.x;
    document.getElementById("myFpv_addAnEntity_animated-y").checked = entityO.animatedT.y;
    document.getElementById("myFpv_addAnEntity_animated-z").checked = entityO.animatedT.z;

    entityO.selected();
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
    document.getElementById("myFpv_entities_all_select").value = id;
});

document.querySelector("#myFpv_addAnEntity_texture-btn").addEventListener("click", function() {
    document.getElementById("myFpv-entities_all-textures-window").style.display = "inline";
});

document.querySelector("#myFpv_addAnEntity_texture-delete-btn").addEventListener("click", function() {
    document.querySelectorAll('input[name="myFpv-entities_all-textures-block"]').forEach(radio => {
        radio.checked = false;
    });

    document.getElementById("myFpv-entities_all-textures-window-id").value = "";

    document.getElementById("myFpv_addAnEntity_texture-btn").style.backgroundImage = "none";
    document.getElementById("myFpv_addAnEntity_texture-btn").style.color = "initial";

    this.style.display = "none";
});

document.querySelector("#myFpv-entities_all-textures-selections_list").addEventListener("change", function(event) {
    if (event.target && event.target.name === "myFpv-entities_all-textures-block") {
        let img = event.target.id.replace("myFpv-entities_all-textures-block-id-","");

        document.getElementById("myFpv-entities_all-textures-window-id").value = event.target.id;
        document.getElementById("myFpv_addAnEntity_texture-btn").style.backgroundImage = "url('img/textures/" + img + "')";
        document.getElementById("myFpv_addAnEntity_texture-btn").style.color = "transparent";

        document.getElementById("myFpv_addAnEntity_texture-delete-btn").style.display = "inline";

        document.getElementById("myFpv-entities_all-textures-window").style.display = "none";
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
        let confirm_msg = `Do you want to place the element higher than position Y ?`;
        var r = confirm(confirm_msg);
        if (r == true) {
            y = parseInt(y) + parseInt(height);
        }
        document.getElementById("myFpv_addAnEntity_positionX").value = x;
        document.getElementById("myFpv_addAnEntity_positionY").value = y;
        document.getElementById("myFpv_addAnEntity_positionZ").value = z;
    }

    let color = rgbToHex(colorgen("dark"));
    document.getElementById("myFpv_addAnEntity_color").value = color;

    myFpv_addAnEntity();
});

document.querySelector("#myFpv_duplicateAnEntityBtn").addEventListener("click", function() {
    let x = document.getElementById("myFpv_addAnEntity_positionX").value;
    x++;
    let y = document.getElementById("myFpv_addAnEntity_positionY").value;
    y++;
    document.getElementById("myFpv_addAnEntity_positionX").value = x;
    document.getElementById("myFpv_addAnEntity_positionY").value = y;

    myFpv_addAnEntity();
});

document.querySelector("#myFpv_updateAnEntityBtn").addEventListener("click", function() {
    myFpv_updateAnEntity(false);
});

document.querySelector("#myFpv_deleteAnEntityBtn").addEventListener("click", function() {
    myFpv_deleteAnEntityBtn();
});

document.querySelector("#myFpv-parameters-groundColor-btn").addEventListener("click", function() {
    let color = document.getElementById("myFpv-parameters-groundColor").value;

    let newColor = colorThree(color);

    plane.material.map = null; // Remove texture
    plane.material = new THREE.MeshBasicMaterial({ color: newColor }); // Set new color without lighting effect
    plane.material.needsUpdate = true;
    plane.visible = true;
});

document.querySelector("#myFpv-parameters-groundErase-btn").addEventListener("click", function() {
    plane.visible = false;
});

document.querySelector("#myFpv-parameters-groundReset-btn").addEventListener("click", function() {
    plane.material = new THREE.MeshLambertMaterial({ 
        map: planeTexture,  // Rétablir la texture d'origine
        opacity: 1,
        transparent: true
    });
    plane.material.needsUpdate = true;
    plane.visible = true;
});

document.querySelector("#myFpv-parameters-skyColor-btn").addEventListener("click", function() {
    let color = document.getElementById("myFpv-parameters-skyColor").value;

    let newColor = colorThree(color);

    renderer.setClearColor(newColor);
});

document.querySelector("#myFpv-parameters-skyReset-btn").addEventListener("click", function() {
    renderer.setClearColor(0x050519);
});

window.onload = function() {

    myFpv_textures_load();
};
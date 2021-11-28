const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );

const camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 1000 );

// Creates a rendering context (similar to canvas.getContext(webgl))
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Create camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 10;
controls.update(); //controls.update() must be called after any manual changes to the camera's transform

// Adds a canvas element with that context to the HTML body
document.body.appendChild(renderer.domElement);

// Creates a cylinder
const geometry1 = new THREE.BoxGeometry();
const geometry = new THREE.CylinderGeometry(1, 1, 5, 32 );
// const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const phongMaterial = new THREE.MeshPhongMaterial( { color: 0xff1000, shininess: 16 } );
const phongMaterial1 = new THREE.MeshPhongMaterial( { color: 0x01ff00, shininess: 16 } );
const phongMaterial2 = new THREE.MeshPhongMaterial( { color: 0x0001ff, shininess: 16 } );
const cylinder = new THREE.Mesh(geometry, phongMaterial);
const cube = new THREE.Mesh(geometry1, phongMaterial1);
const cube2 = new THREE.Mesh(geometry1, phongMaterial2);

// Examples of transformations
cylinder.position.x = -5;
cylinder.position.y = -2;
// cylinder.rotation.x = 60;
// cylinder.rotation.y = 45;

cube.position.x = -5;
cube.position.y = -4;
// cube.rotation.x = 60;
// cube.rotation.y = 45;

cylinder.scale.x = Math.sin(1) ;
cylinder.scale.y = Math.sin(1);
cylinder.scale.z = Math.sin(1);

cube.scale.x = 5 ;
cube.scale.y = 2;
cube.scale.z = 5;

cube2.position.x = 5;
cube2.position.y = -4;
// cube2.rotation.x = 60;
// cube2.rotation.y = 45;

cube2.scale.x = 5;
cube2.scale.y = 2;
cube2.scale.z = 5;

scene.add(cylinder);
scene.add(cube);
scene.add(cube2);

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
				hemiLight.position.set( 0, 20, 0 );
				scene.add( hemiLight );
// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );

directionalLight.target =
scene.add(directionalLight);


press_timer = 0;
key_up = 0;
window.addEventListener("keydown", function(event) {

	switch (event.key) {
		case "s":
				window.alert("Your score is: " + success_num)

				break;
		default:
				console.log("down");
				cylinder.scale.y = Math.sin(1 - press_timer/5);
				cylinder.position.y -=  press_timer/100;
				press_timer += 0.01;
				key_up = 0;
				break;
	}


});

window.addEventListener("keyup", function(event) {
    console.log("up");
    console.log(press_timer);
		key_up = 1;
});

time = 0;
jump_t = 0;
stop_x = 0;

hit1 = 0;
hit_prev = 0;
next_stage = 1;	// keep going , ort
success_num = 0;
function draw() {
    requestAnimationFrame(draw);

    // cylinder.rotation.x += time/100;

		if(next_stage = 1){
				c_x = cylinder.position.x;
				c_y = cylinder.position.y;
				cylinder.position.x = -5;
				if(success_num % 2 == 0 && success_num > 0){
						cube.position.x = -5;
						cube2.position.x = 5 + 1 * success_num;
				}else if(success_num % 2 != 0 && success_num > 0){
						cube2.position.x = -5;
						cube.position.x = 5 + 1 * success_num;
				}
				next_stage = 0;
		}
		if (jump_t < (press_timer*25)/2 && key_up){
				cylinder.scale.y = Math.sin(1);
				cylinder.position.x = -5 + jump_t;
				cylinder.position.y = -2 + ((jump_t/2.5) * (jump_t/2));
				jump_t += 0.05;
		}else if(jump_t < (press_timer*25) && !stop_x && key_up){
				highest_y = cylinder.position.y;
				cylinder.position.x = -5 + jump_t;
				if(cylinder.position.y > -2){
						cylinder.position.y = highest_y - (	((jump_t - (press_timer*25)/2)/2) * ((jump_t - (press_timer*25)/2)/2));
				}else{
						stop_x = 1;
						key_up = 0;
				}

				// console.log(cylinder.position.y);
				jump_t += 0.05;
		}

		if(success_num % 2 == 0){ // determine cube 2
				land_cube = cube2;
		}else{
				land_cube = cube;
		}
		if(document.getElementById("move_plat").checked){
				land_cube.position.x = 8 + Math.sin(time) * 2 + 1 * success_num;
		}




		if(stop_x){
				// determine if hit
				cpx = cylinder.position.x
				if(success_num % 2 == 0){ // determine cube 2
						if(cpx < cube2.position.x + 2.5 && cpx > cube2.position.x - 2.5){
								hit1 = 1;
						}
				}else if(success_num % 2 != 0){
						if(cpx < cube.position.x + 2.5 && cpx > cube.position.x - 2.5){
								hit1 = 1;
						}
				}

				if(hit1){
						window.alert("You successfully land it! Gain 1 point ")
				}else{
						window.alert("You missed it! Try one more time")
				}

				success_num += hit1;
				next_stage = hit1;
				console.log(hit1);
				hit1 = 0;
				stop_x = 0;
				jump_t = 0;
				press_timer = 0;



		}

    // Examples of animation
    // cylinder.scale.y = Math.sin(time);
    time += 0.01;

    renderer.render(scene, camera);
}
draw();

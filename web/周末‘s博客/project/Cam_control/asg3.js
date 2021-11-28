// Shaders (GLSL)
// https://en.wikipedia.org/wiki/Phong_reflection_model
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;

    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;

    uniform vec3 u_Color;
    uniform vec3 u_ambientColor;
    uniform vec3 u_diffuseColor1;
    uniform vec3 u_diffuseColor2;
    uniform vec3 u_specularColor;
    uniform float u_specularAlpha;

    uniform vec3 u_eyePosition;
    uniform vec3 u_lightPosition;
    uniform vec3 u_lightDirection;


    varying vec4 v_Color;

    vec3 calcAmbient() {
        return u_ambientColor * u_Color;
    }

    vec3 calcDiffuse(vec3 l, vec3 n, vec3 lColor) {
        float nDotL = max(dot(l, n), 0.0);
        return lColor * u_Color * nDotL;
    }

    vec3 calcSpecular(vec3 r, vec3 v) {
        float rDotV = max(dot(r, v), 0.0);
        float rDotVPowAlpha = pow(rDotV, u_specularAlpha);
        return u_specularColor * u_Color * rDotVPowAlpha;
    }

    void main() {
        // Mapping obj coord system to world coord system
        vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

        vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz; // Normal

        vec3 l1 = normalize(u_lightPosition - worldPos.xyz); // Light direction 1
        vec3 l2 = normalize(u_lightDirection); // Light direction 2

        vec3 v = normalize(u_eyePosition - worldPos.xyz);   // View direction

        vec3 r1 = reflect(l1, n); // Reflected light direction
        vec3 r2 = reflect(l2, n); // Reflected light direction

        // Smooth shading (Goraud)
        vec3 ambient = calcAmbient();

        vec3 diffuse1 = calcDiffuse(l1, n, u_diffuseColor1);
        vec3 diffuse2 = calcDiffuse(l2, n, u_diffuseColor2);

        vec3 specular1 = calcSpecular(r1, v);
        vec3 specular2 = calcSpecular(r2, v);


        v_Color = vec4(ambient + (diffuse1 + diffuse2) + (specular1 + specular2), 1.0);
        gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
    }
`;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;

    }
`;

let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

// Cubes in the world
let lightPosition = new Vector3([0.0, 0.0, 1.0]);
let lightDirection = new Vector3([1.0, 1.0, 1.0]);


let lightRotation = new Matrix4().setRotate(1, 0,1,0);

// let eyePosition = new Vector3([0.0, 0.0, 0.0]);

let models = [];

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_ViewMatrix = null;
let u_ProjMatrix = null;

let u_Color = null;
let u_ambientColor = null;
let u_diffuseColor1 = null;
let u_diffuseColor2 = null;
let u_specularColor = null;
let u_specularAlpha = null;

let u_lightPosition = null;
let u_eyePosition = null;

function drawModel(model) {
    // Update model matrix combining translate, rotate and scale from cube
    modelMatrix.setIdentity();

    // Apply translation for this part of the animal
    modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);

    // Apply rotations for this part of the animal
    modelMatrix.rotate(model.rotate[0], 1, 0, 0);
    modelMatrix.rotate(model.rotate[1], 0, 1, 0);
    modelMatrix.rotate(model.rotate[2], 0, 0, 1);

    // Apply scaling for this part of the animal
    modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);


    // Send vertices and indices from model to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);

    // Draw model
    if(document.getElementById("frame_s").checked){
        gl.drawElements(gl.LINE_LOOP, model.indices.length, gl.UNSIGNED_SHORT, 0);
    }else{
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
    }

}

function onCubeCreation() {
    let cube2 = new Cube([0.0, 0.0, 1.0]);
    models.push(cube2);

    let newOption = document.createElement("option");
    newOption.text = "Cube " + models.length;
    newOption.value = models.length;
    let cubeSelect = document.getElementById('cubeSelect');
    cubeSelect.add(newOption);
}

function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

ii = 0;
function draw() {


    // do the animation. equation belows are from
    // my quadratic curve calculation
    if(document.getElementById("anim").checked){
        ii+=0.001;
        i=ii%3;
        if(i < 2){
          x_curve = 5*i*i - 10*i;
          y_curve = 0;
          z_curve = -5*i + 5;
        }else{
          x_curve = 1.65*i*i - 3.3*i;
          y_curve = 0;
          z_curve = 3.33*i*i - 11.665*i + 5;
        }

        camera.eye = new Vector3([x_curve,y_curve, z_curve]);
        camera.updateView();
    }

    // Set light data    0.0, 0.0, 0.0  1.0, 0.8, 0.2
    // set light color to warm orange
    // if both lights are off, then only ambient light
    if(document.getElementById("amb").checked){
      gl.uniform3f(u_ambientColor, 0.2, 0.16, 0.04); // 0.2, 0.2, 0.2
    }else{
      gl.uniform3f(u_ambientColor, 0.0, 0.0, 0.0); // 0.2, 0.2, 0.2
    }

    if(document.getElementById("dif").checked && !document.getElementById("pl_off_dl_off").checked){
      gl.uniform3f(u_diffuseColor1, 0.8, 0.64,0.16); // 0.8, 0.8, 0.8
      gl.uniform3f(u_diffuseColor2, 0.8, 0.64,0.16); // 0.8, 0.8, 0.8
    }else{
      gl.uniform3f(u_diffuseColor1, 0.0, 0.0, 0.0); // 0.8, 0.8, 0.8
      gl.uniform3f(u_diffuseColor2, 0.0, 0.0, 0.0); // 0.8, 0.8, 0.8
    }

    if(document.getElementById("spe").checked && !document.getElementById("pl_off_dl_off").checked){
      gl.uniform3f(u_specularColor, 1.0, 0.8, 0.2); // 1.0, 1.0, 1.0
    }else{
      gl.uniform3f(u_specularColor, 0.0, 0.0, 0.0); // 1.0, 1.0, 1.0
    }


    gl.uniform1f(u_specularAlpha,document.getElementById("speFactor").value);




    // Draw frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rotate point light
    // lightPosition = lightRotation.setTranslate(0.0,0.2,0.0);
    // Set light position according to user's selection
    if(document.getElementById("pl_on_dl_on").checked || document.getElementById("pl_on_dl_off").checked){
        light_x = document.getElementById("lx").value;
        light_y = document.getElementById("ly").value;
        light_z = document.getElementById("lz").value;
        lightPosition=new Vector3([light_x, light_y, light_z]);
    }else if(document.getElementById("pl_off_dl_on").checked){
        lightPosition=new Vector3([10.0, 10.0, -10.0]);
        lightDirection=new Vector3([1.0, 1.0, -1.0]);
    }
    if(document.getElementById("pl_on_dl_off").checked){
        lightDirection=lightPosition;
    }
    if(document.getElementById("pl_on_dl_on").checked || document.getElementById("pl_off_dl_on").checked){
        lightDirection=new Vector3([1.0, 1.0, -1.0]);
    }


    // gl.uniform3fv(u_lightPosition, lightPosition.elements);
    pointLightSphere.setTranslate(lightPosition.elements[0],
                                  lightPosition.elements[1],
                                  lightPosition.elements[2]);

    gl.uniform3fv(u_eyePosition, camera.eye.elements);
    // Update View matrix in the shader
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    // Update Projection matrix in the shader
    gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projMatrix.elements);

    gl.uniform3fv(u_lightPosition, lightPosition.elements);
    gl.uniform3fv(u_lightDirection, lightDirection.elements);

    for(let m of models) {
        if (document.getElementById("flat_s").checked ){
            m.normals = m.nor_flat;
        }else{ // smooth
            m.normals = m.nor_smooth;
        }
        drawModel(m);
    }
    drawModel(pointLightSphere);

    requestAnimationFrame(draw);
}

function addModel(color, shapeType) {
    let model = null;
    switch (shapeType) {
        case "cube":
            model = new Cube(color);
            break;
        case "sphere":
            model = new Sphere(color, 13);
            break;
    }

    if(model) {
        models.push(model);

        // Add an option in the selector
        let selector = document.getElementById("cubeSelect");
        let cubeOption = document.createElement("option");
        cubeOption.text = shapeType + " " + models.length;
        cubeOption.value = models.length - 1;
        selector.add(cubeOption);

        // Activate the cube we just created
        selector.value = cubeOption.value;
    }

    return model;
}

function onRotationInput(value) {
    // Get the selected cube
    let selector = document.getElementById("cubeSelect");
    let selectedCube = models[selector.value];

    selectedCube.setRotate(0.0, value, 0.0);
}

function onZoomInput(value) {
    console.log(1.0 + value/10);
    camera.zoom(1.0 + value/10);
}

window.addEventListener("keydown", function(event) {
    let speed = 1.0;

    switch (event.key) {
      case "w":
          console.log("forward");
          camera.moveForward(speed);
          break;
      case "a":
          console.log("left");
          camera.moveSideways(-speed);
          break;
      case "s":
          console.log("back");
          camera.moveForward(-speed);
          break;
      case "d":
          console.log("right");
          camera.moveSideways(speed);
          break;

      case "q":
          console.log("pan left");
          camera.pan(5);
          break;
      case "e":
          console.log("pan right");
          camera.pan(-5);
          break;
      case "z":
          console.log("tilt down");
          camera.tilt(-5);
          break;
      case "c":
          console.log("tilt up");
          camera.tilt(5);
          break;
      case "o":
          console.log("orthographic");
          camera = new Camera("orthographic");
          break;
      case "p":
          console.log("perspective");
          camera = new Camera("perspective");
          break;



    }
});


function main() {
    // Retrieving the canvas tag from html document
    canvas = document.getElementById("canvas");

    // Get the rendering context for 2D drawing (vs WebGL)
    gl = canvas.getContext("webgl");
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    // Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compiling both shaders and sending them to the GPU
    if(!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed to initialize shaders.");
        return -1;
    }

    // Retrieve uniforms from shaders
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");

    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
    u_diffuseColor1 = gl.getUniformLocation(gl.program, "u_diffuseColor1");
    u_diffuseColor2 = gl.getUniformLocation(gl.program, "u_diffuseColor2");
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
    u_specularAlpha = gl.getUniformLocation(gl.program, "u_specularAlpha");

    u_lightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");

    let y_up = 0.8;
    let x_up = 0.5;

    let cube1 = addModel([1.0, 0, 0], "cube");
    cube1.setTranslate(0.1, 0.2, 0.0);
    cube1.setScale(0.2, 0.2, 0.6);
    cube1.setRotate(0.0, -120, 0.0);

    let cube2 = addModel([0.5,0.2,0.9], "cube");
    cube2.setTranslate(-0.2, 0.1, -0.1);
    cube2.setScale(0.1, 0.1, 0.6);
    cube2.setRotate(90,0,90);
    // let sphere = addModel([1.0, 0.0, 0.0], "sphere");
    // sphere.setScale(0.5, 0.5, 0.5);

    pointLightSphere = new Sphere([1.0, 0.8, 0.2], 6);
    pointLightSphere.setScale(0.1, 0.1, 0.1);
    pointLightSphere.setTranslate(lightPosition.elements[0],
                                  lightPosition.elements[1],
                                  lightPosition.elements[2]);
    // models.push(pointLightSphere);

    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }
    gl.uniform3fv(u_lightPosition, lightPosition.elements);
    gl.uniform3fv(u_lightDirection, lightDirection.elements);

    // Set camera data

    camera = new Camera("perspective");
    draw();
}

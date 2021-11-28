class Camera {
    constructor(cameraType) {
        this.near = 2;
        this.far = 1000;
        this.fov = 50;

        this.eye = new Vector3([0, 0, 5]);
        this.center = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.projMatrix = new Matrix4();
        if(cameraType == "perspective") {
            this.projMatrix.setPerspective(this.fov, canvas.width/canvas.height, this.near, this.far);
        }
        else if(cameraType == "orthographic") {

            this.projMatrix.setOrtho(-1, 1, -1, 1, this.near, this.far)
            // this.zoom(1);
        }

        this.viewMatrix = new Matrix4();
        this.updateView();
    }

    moveForward(scale) {
        // Compute forward vector
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.mul(scale);

        // Add forward vector to eye and center
        this.eye.add(forward);
        this.center.add(forward);

        this.updateView();
    }

    zoom(scale) {
        this.projMatrix.setPerspective(this.fov * scale, canvas.width/canvas.height, this.near, this.far);
    }

    moveSideways(scale) {
        //1. Calculate forward vector: center - eye
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);

        //2. Calculate right vetor: up x forward
        let right = Vector3.cross(forward, this.up)
        right.normalize();
        right.mul(scale);

        // Add forward vector to eye and center
        this.eye.add(right);
        this.center.add(right);

        this.updateView();

        console.log(right);
    }

    pan(angle) {
        // Rotate center point around the up vector
        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, this.up.elements[0],
                                   this.up.elements[1],
                                   this.up.elements[2]);

       // Compute forward vector
       let forward = new Vector3(this.center.elements);
       forward.sub(this.eye);

       // Rotate forward vector around up vector
       let forward_prime = rotMatrix.multiplyVector3(forward);
       this.center.set(forward_prime);

       this.updateView();
    }

    tilt(angle) {
        //1. Calculate forward vector: center - eye
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);

        //2. Calculate right vetor: up x forward
        let right = Vector3.cross(forward, this.up)
        right.normalize();

        // 3. Create a rotation matrix with angle and the right vector
        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, right.elements[0],
                                   right.elements[1],
                                   right.elements[2]);

        // 4. Rotate forward vector around the right vector
        // with the matrix you create in 3.
        let forward_prime = rotMatrix.multiplyVector3(forward);

        // 5. Set the eye point to be the result of 3.
        this.center.set(forward_prime);

        // 6. Rotate the up vector around the right vector
        // with the matrix you create in 3.
        this.up = rotMatrix.multiplyVector3(this.up);

        // Normalize this.up?
        this.updateView();
    }

    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0],
            this.eye.elements[1],
            this.eye.elements[2],
            this.center.elements[0],
            this.center.elements[1],
            this.center.elements[2],
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );
    }
}

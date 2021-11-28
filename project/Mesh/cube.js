class Cube {

    constructor(color) {

          let vertix_b = [[0,0,0]]; // buttom coordinates
          let vertix_t = [[0,0,1]]; // top coordinates
          let vertix = []; // all coordinates
          // if you wanna change num of sides of cylinder, do it here!!!
          let num_ver=4;

          let angle = (360/num_ver) * (Math.PI/180);

          for(var i = 1; i <= num_ver; i++){
              // vertex calculation
              var x = (Math.cos(angle * (i-1))).toFixed(2);
              var y = (Math.sin(angle * (i-1))).toFixed(2);
              vertix_b.push([x, y, 0.0]);
              vertix_t.push([x, y, 1.0]);
          }
          // vertix store all verteices without repeat
          vertix = vertix_b.concat(vertix_t);
          // push each vertex's coordinate as needed
          let ver_this = [];
          for(var i = 0; i<=(num_ver*2)+1;i++){
              // push buttom and cap
              ver_this.push(vertix[i][0]);
              ver_this.push(vertix[i][1]);
              ver_this.push(vertix[i][2]);
          }

          for(var i = 1; i<=num_ver;i++){
              // pushing sides of cylender
              // first vertex
              ver_this.push(vertix[i][0]);
              ver_this.push(vertix[i][1]);
              ver_this.push(vertix[i][2]);
              // second vertex
              ver_this.push(vertix[i+num_ver+1][0]);
              ver_this.push(vertix[i+num_ver+1][1]);
              ver_this.push(vertix[i+num_ver+1][2]);

              if(i+num_ver+2 > (num_ver*2)+1){  // reached the end, back to 1
                  ver_this.push(vertix[num_ver+2][0]);
                  ver_this.push(vertix[num_ver+2][1]);
                  ver_this.push(vertix[num_ver+2][2]);

                  ver_this.push(vertix[1][0]);
                  ver_this.push(vertix[1][1]);
                  ver_this.push(vertix[1][2]);
              }else{
                  ver_this.push(vertix[i+num_ver+2][0]);
                  ver_this.push(vertix[i+num_ver+2][1]);
                  ver_this.push(vertix[i+num_ver+2][2]);

                  ver_this.push(vertix[i+1][0]);
                  ver_this.push(vertix[i+1][1]);
                  ver_this.push(vertix[i+1][2]);
              }

          }
          // assign vertex into class variable
          this.vertices = new Float32Array(ver_this);

          let nor_this = [];
          for(var i = 0; i<=num_ver;i++){
              // push the normal for the buttom
              // same direction
              nor_this.push(0.0, 0.0, -1.0);
          }
          for(var i = 0; i<=num_ver;i++){
            // push the normal for the cap
            // same direction
              nor_this.push(0.0, 0.0, 1.0);
          }


          for(let i = 1; i<=num_ver;i++){
              // pushing normal for each sides
              // each side maked up by 4 verteices, so repeat 4 times
              // algorithm's details are in feature.html
              for(var ii = 0; ii<4;ii++){
                nor_this.push(vertix[i][0]);
                nor_this.push(vertix[i][1]);
                nor_this.push(vertix[i][2]);
              }
          }
          this.normals = new Float32Array(nor_this);

          // Indices of the vertices
          // push the triangle as needed
          let ind_this = [];
          for(var i = 1; i<=num_ver;i++){ // buttom
            ind_this.push(i);
            if(i==num_ver){
                ind_this.push(1);
            }else{
                ind_this.push(i+1);
            }
            ind_this.push(0);
          }

          for(var i = 1; i<=num_ver;i++){ // cap
            ind_this.push(i+1+num_ver);
            if(i==num_ver){
                ind_this.push(2+num_ver);
            }else{
                ind_this.push(i+2+num_ver);
            }
            ind_this.push(1+num_ver);
          }

          for(var i = 1; i<=num_ver;i++){
              ind_this.push(2*num_ver+2+4*(i-1));
              ind_this.push(2*num_ver+2+1+4*(i-1));
              ind_this.push(2*num_ver+2+2+4*(i-1));

              ind_this.push(2*num_ver+2+4*(i-1));
              ind_this.push(2*num_ver+2+2+4*(i-1));
              ind_this.push(2*num_ver+2+3+4*(i-1));
          }
          this.indices = new Uint16Array(ind_this);

        this.color = color;

        this.translate = [0.0, 0.0, 0.0];
        this.rotate    = [0.0, 0.0, 0.0];
        this.scale     = [1.0, 1.0, 1.0];
    }

    setScale(x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
    }

    setRotate(x, y, z) {
        this.rotate[0] = x;
        this.rotate[1] = y;
        this.rotate[2] = z;
    }

    setTranslate(x, y, z) {
        this.translate[0] = x;
        this.translate[1] = y;
        this.translate[2] = z;
    }
}

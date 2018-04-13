
/*
Game 0
This is a ThreeJS program which implements a simple game
The user moves a cube around the board trying to knock balls into a cone

*/


	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var camera, camera1, avatarCam, edgeCam, edgeCam1;  // we have two cameras in the main scene
	var avatar;
	// var npc;
	// var npc2;
	var redballs = [];
	var maze = [];
	// here are some mesh objects ...
	var cone;
	var endScene, endCamera, endText;





	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false, rotateFwd:false, rotateBwd:false,
		    camera:camera}

	var gameState =
			{score:0, health:10, scene:'main', camera:'none', music:"none"}
	const grid_width = 5;
	const ground_width = 550;
	const wall_height = 20;
	var nextwall;

	// Here is the main game control
  init(); //
	initControls();

	animate();  // start the animation loop!




	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('youwon.png',10);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,0);
		endScene.add(light1);

		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);

	}
	function createStartScene(){
		startScene = initScene();
		startText = createSkyBox('start.png',5);
		startScene.add(startText);
		var light = createPointLight();
		light.position.set(0,200,20);
		startScene.add(light);
		//gameState.scene='start';
		startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		startCamera.position.set(0,50,1);
		startCamera.lookAt(0,0,0);
	}
	function createLoseScene(){
		loseScene = initScene();
		loseText = createSkyBox('lose.png',5);
		loseScene.add(loseText);
		var light = createPointLight();
		light.position.set(0,200,20);
		loseScene.add(light);
		loseCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		loseCamera.position.set(0,50,1);
		loseCamera.lookAt(0,0,0);
	}

	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
      initPhysijs();
			scene = initScene();
			createEndScene();
			initRenderer();
			createMainScene();
			createLoseScene();
			createStartScene();
	}


	function createMainScene(){
      // setup lighting
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			var light2 = createSpotLight();
			light2.position.set(0,2,-5);
			scene.add(light2);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);

			camera1 = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera1.position.set(50,60,-100);
			camera1.lookAt(0,0,-100);


			// create the ground and the skybox
			var ground = createGround('planeTexture.jpg');
			scene.add(ground);
			var skybox = createSkyBox('planeTexture.jpg',1);
			scene.add(skybox);

			// create the avatar
			avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
			//avatar = createAvatar();
			createAvatar();

			gameState.camera = avatarCam;

      edgeCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
      edgeCam.position.set(50,50,-50);

			edgeCam1 = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
      edgeCam1.position.set(10,50,10);

			createMaze();

			var wall = createWall(0xffaa00,50,3,1);
			wall.position.set(10,0,10);
			//scene.add(wall);

	}
	//this method is called in main scene, too c
	function createMaze(){
		wall_color = 0xff0000;
		var lengthRecord;
		//wall_length = 20;
		//I initialize all maze Wall with even index as alongZ and all maze wal with odd index as alongZ=false
		maze[0] = createMazeWall(wall_color, 100,alongZ=true);
		maze[0].position.set(0, 0, -50);

		maze[1] = createMazeWall(wall_color, 90);
		crrLength = 100;
		nextLength =100;
		//left to right: crr, next, crrAlongZ, nextLength, attach on the positive axis side, crrLength, attach position.
		setPosition(maze[0],maze[1],true,nextLength,true,crrLength,10);
	//	maze[0].add(maze[1]);
		maze[2]	= createMazeWall(wall_color, 100);
		crrLength=nextLength;
		nextLength =100;
		setPosition(maze[1],maze[2],false,nextLength,false,crrLength,4);

		maze[3] = createMazeWall(wall_color, 100, alongZ=true);
		crrLength = nextLength;
		nextLength =100;
		setPosition(maze[2],maze[3],true,nextLength,false,crrLength,4);

		maze[4] = createMazeWall(wall_color, 100);
		crrLength = nextLength;
		nextLength =100;
		setPosition(maze[3],maze[4],false,nextLength,false,crrLength,3);
	//	maze[1].add(maze[2]);
		maze[5] = createMazeWall(wall_color, 90, 45, 0, 0,alongZ=true);
		maze[6] = createMazeWall(wall_color, 60, 45, 0, 15);
		//stick all of the maze wall together.
		var index = 0;
		while(maze[index+1]!=null){
			maze[index].add(maze[index+1]);
			index++;
		}

		scene.add(maze[0]);
	}

	// function crrAlongZ(index){
	// 	if(index%2==0){
	// 		return true;
	// 	}
	// 	return false;
	// }
	function setPosition(crr,next,crrAlongZ,nextLength,poSide,crrLength,attP){
		if(crrAlongZ){
			if(poSide){
				next.position.x=crr.position.x+nextLength/2+2.5;
			}else{
				next.position.x=crr.position.x-nextLength/2-2.5;
			}
			next.position.z= crr.position.z+crrLength/2-attP*5-2.5;
		}else{
			if(poSide){
				next.position.z=crr.position.z+nextLength/2+2.5;
			}else{
				next.position.z=crr.position.z-nextLength/2-2.5;
			}
			next.position.x= crr.position.x+crrLength/2-attP*5-2.5;
		}
		next.position.y = crr.position.y;
		return;
	}

	function createMazeWall(color,length,alongZ = false){
		var geometry;
		if(alongZ){
		geometry = new THREE.BoxGeometry(grid_width, wall_height, length)
		}
		else{
		geometry = new THREE.BoxGeometry(length, wall_height, grid_width)
		}

		var texture = new THREE.TextureLoader().load( '../images/'+'B04.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: color,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5)
		mesh = new Physijs.BoxMesh(geometry, pmaterial, 0)
		//mesh.position.set(x, y, z)
		mesh.castShadow = true;
		return mesh;
	}

	function randN(n){
		return Math.random()*n;
	}


	function addBalls(){
		var numBalls = 20;
		for(i=0;i<numBalls;i++){
			var ball;
			if(i%4 != 0){
				ball = createBall();
				ball.position.set(randN(20)+15,30,randN(20)+15);
				scene.add(ball);
			}
			else{
				ball = createBall(color=0xfc1b1b, restitution=4)
				ball.position.set(randN(20)+15,30,randN(20)+15);
				redballs.push(ball)
				scene.add(ball);
				ball.setDamping(0.7,0.5)
			}

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==cone){
						console.log("ball "+i+" hit the cone");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						if (gameState.score==numBalls) {
							gameState.scene='youwon';
						}
            //scene.remove(ball);  // this isn't working ...
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}
	function addBalls1(){
		var numBalls = 20;
		for(i=0;i<numBalls;i++){
			var ball;
			ball = createGreenBall();
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);
			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						gameState.health -= 1;
						if (gameState.health==0) {
							gameState.scene='lose';
						}

					}
				}
			)
		}
	}


	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( 'sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene(){
		//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
		return scene;
	}

  function initPhysijs(){
    Physijs.scripts.worker = 'js/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
  }
	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}


	function createSpotLight(){
		var light;
		light = new THREE.SpotLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 1024;  // default
		light.shadow.mapSize.height = 1024; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}

	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 1024;  // default
		light.shadow.mapSize.height = 1024; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}


	function createBoxMesh(color){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}


  function createWall(color,w,h,d){
    var geometry = new THREE.BoxGeometry( w, h, d);
    var material = new THREE.MeshLambertMaterial( { color: color} );
    mesh = new Physijs.BoxMesh( geometry, material, 0 );
    mesh.castShadow = true;
    return mesh;
  }


	function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( ground_width, ground_width, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		mesh.position.z -= ground_width/2-5
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}



	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.BoxGeometry( ground_width, ground_width*2, ground_width );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 2 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.Mesh( geometry, material, 0 );
		mesh.position.z -= ground_width/2-5
		//mesh.receiveShadow = false;


		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical


	}

	function createAvatar(){
	/*	//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.BoxGeometry( 5, 5, 6);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.8);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.castShadow = true;

		avatarCam.position.set(0,4,0);
		avatarCam.lookAt(0,4,10);
		mesh.add(avatarCam);

		return mesh;*/
		//var suzanne;
		var loader = new THREE.JSONLoader();
		var loader1 = new THREE.OBJLoader();
		loader.load("models/suzanne.json",
					function ( geometry, materials ) {
						console.log("loading suzanne");
						geometry.scale(1,1,1);
						var material = //materials[ 0 ];
						new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
						var pmaterial=new Physijs.createMaterial(material,0.9,0.8);
						avatar = new Physijs.BoxMesh( geometry, pmaterial );
						console.log("created suzanne mesh");
						console.dir(geometry)
						console.log(JSON.stringify(avatar.scale));// = new THREE.Vector3(4.0,1.0,1.0);
						//scene.add(suzanne);
						avatar.position.z = -10;
						avatar.position.y = 3;
						avatar.position.x = 0;
						avatar.castShadow = true;
						avatar.translateY(20);
						avatarCam.translateY(-4);
						avatarCam.translateZ(3);
						avatarCam.position.set(0,2,0);
						avatarCam.lookAt(0,2,10);
						avatar.add(avatarCam);
						//avatar.rotateY=Math.PI/2;
						scene.add(avatar);
						avatar.setDamping(0.1,0.1);
						avatar.mass = 10000;
						console.dir(avatar)
						return avatar;
					},
					function(xhr){
						console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
					function(err){console.log("error in loading: "+err);}
		)


	}



	function createConeMesh(r,h){
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
	}


	function createBall(color=0xffff00, restitution=0.4){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		var pmaterial = new Physijs.createMaterial(material,0.9,restitution);
    var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.castShadow = true;
		return mesh;
	}


	function createGreenBall(color=0x00ff00, restitution=0.4){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		var pmaterial = new Physijs.createMaterial(material,0.9,restitution);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.castShadow = true;
		return mesh;
	}



	var clock;
	function reset(){
		avatar.__dirtyPosition = true;
		avatar.position.set(0,50,0);
	}
	function initControls(){
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener( 'keydown', keydown);
			window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event){
		// console.log("Keydown: '"+event.key+"'");
		//console.dir(event);
		// first we handle the "play again" key in the "youwon" scene
		if ((gameState.scene == 'youwon'||gameState.scene == 'lose')&& event.key=='r') {
			console.log("init");
			reset();
			gameState.scene = 'start';
			gameState.score = 0;
			addBalls();
			return;
		}
		if(event.key=='p'){
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.health = 10;
		}

		// this is the regular scene
		switch (event.key){
			case "b": addBalls1(); break;
			// change the way the avatar is moving

			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "r": controls.up = true; break;
			case "f": controls.down = true; break;
			case "m": controls.speed = 30; break;
      case " ": controls.fly = true;
          console.log("space!!");
          break;
      case "h": controls.reset = true; break;
			case "u": controls.rotateFwd = true; break;
			case "j": controls.rotateBwd = true; break;

			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = avatarCam; break;
      case "3": gameState.camera = edgeCam; break;
			case "4": gameState.camera = camera1; break;
			case "5": gameState.camera = edgeCam1; break;

			// move the camera around, relative to the avatar
			case "ArrowLeft": avatarCam.translateY(1);break;
			case "ArrowRight": avatarCam.translateY(-1);break;
			case "ArrowUp": avatarCam.translateZ(-1);break;
			case "ArrowDown": avatarCam.translateZ(1);break;
			case "q": avatarCam.rotateY(0.25);break;
			case "e": avatarCam.rotateY(-0.25);break;

			// add music key
			case "6": gameState.music = "loop"; break;
			case "7": gameState.music = "good"; break;


		}

	}

	function keyup(event){
		// console.log("Keyup:"+event.key);
		// console.dir(event);
		switch (event.key){
			case "w": controls.fwd   = false;  break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "r": controls.up    = false; break;
			case "f": controls.down  = false; break;
			case "m": controls.speed = 10; break;
      case " ": controls.fly = false; break;
      case "h": controls.reset = false; break;
			case "u": controls.rotateFwd = false; break;
			case "j": controls.rotateBwd = false; break;
			case "k": reset();

			// add music key
			case "6": gameState.music = "none"; break;
			case "7": gameState.music = "none"; break;

		}
	}

	function updateRedBalls(){
		for(i = 0; i<redballs.length; i+=1){
			var v = redballs[i].getLinearVelocity()
			var length = v.length();
			// ||length < 0.01||redballs[i].position.y > 5
			if(redballs[i].position.y < -50||redballs[i].position.y > 5){
				break;
			}
			var dif = new THREE.Vector3();
			var new_v = new THREE.Vector3();
			var cone_position = new THREE.Vector3(cone.position.x, cone.position.y-3, cone.position.z);
			dif.subVectors(cone_position, redballs[i].position)
			new_v.addVectors(v, dif.multiplyScalar(1/cone.position.distanceTo(redballs[i].position)).multiplyScalar(0.03).multiplyScalar(v.length()))
			redballs[i].__dirtyPosition = true;
			redballs[i].setLinearVelocity(new_v);
		}
	}

	// function updateNPC(){
	// 	npc.lookAt(avatar.position);
	//   npc.__dirtyPosition = true;
	// 	if(avatar.position.distanceTo(npc.position)<20){
	// 		npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(5));
	// 	}
	// }
	//
	// function updateNPC2(){
	// 	npc2.lookAt(avatar.position);
	// 	npc2.__dirtyPosition = true;
	// 	if(avatar.position.distanceTo(npc2.position)<20){
	// 		npc2.setLinearVelocity(npc2.getWorldDirection().multiplyScalar(-3));
	// 	}
	// }


	function updateAvatar(){
		// "change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

    if (controls.fly){
      avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

		if ((controls.left&&!controls.bwd)||(controls.right&&controls.bwd)){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if ((controls.left&&controls.bwd)||(controls.right&&!controls.bwd)){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}
		else if(controls.rotateFwd){
			avatar.setAngularVelocity(new THREE.Vector3(controls.speed*0.1,0,0));
		}else if(controls.rotateBwd){
			avatar.setAngularVelocity(new THREE.Vector3(-controls.speed*0.1,0,0));
		}
		else{
			avatar.setAngularVelocity(new THREE.Vector3(0,0,0))
		}

    if (controls.reset){
      avatar.__dirtyPosition = true;
      avatar.position.set(40,10,40);
    }

	}



	function animate() {

		requestAnimationFrame( animate );

		switch(gameState.scene) {
			case "lose":
				loseText.rotateY(0.005);
				renderer.render( loseScene, loseCamera );
				break;
			case "start":
				startText.rotateY(0.005);
				renderer.render( startScene, startCamera );
				break;
			case "youwon":
				endText.rotateY(0.005);
				renderer.render( endScene, endCamera );
				break;

			case "main":
				updateAvatar();
				// updateNPC();
				// updateNPC2();
				updateRedBalls();
        edgeCam.lookAt(avatar.position);
				edgeCam1.lookAt(avatar.position);
	    	scene.simulate();
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				break;

			default:
			  console.log("don't know the scene "+gameState.scene);
		}


    // play backgroud music
		switch(gameState.music){
			case "none":
			  break;
			case "loop":
				soundEffect("loop.mp3");
				break;
			case "good":
		    soundEffect("good.wav");
				break;

		}




		//draw heads up display ..
		var info = document.getElementById("info");
		// console.dir(document.getElementById("info"))
		info.innerHTML='<div style="font-size:24pt">Score: '
    + gameState.score
    + " health="+gameState.health
    + '</div>';
	}

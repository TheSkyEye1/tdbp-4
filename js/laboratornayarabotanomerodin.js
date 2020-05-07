var container;
var camera,scene,render, sceneOrtho, cameraOrtho;
var N = 256;
var radius = 1;
var circler;
var ccylinder;
var brvis=0;
var clock = new THREE.Clock();
var mouse = { x: 0, y: 0 };
var targetList = [];
var geometry, terra;
var bractiv;
var objects = new Map();
var keyboard = new THREEx.KeyboardState();
var selected;
var particles = [];
var objectList = [];
var mouseofadown = false;
var oldpos = new THREE.Vector3(0,0,0);
var isintersect = true;
var gui;
var loader = new THREE.TextureLoader();
var g = new THREE.Vector3(0, -9.8 , 0);
var wind = new THREE.Vector3(0.0, 0.0, 0.0);
var partVis = false;
var buttons = [];
init();
animate();

function init() 
{
    container = document.getElementById( 'container' );
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 40000 );
    camera.position.set(N*1.5, N/2, N/2);
    camera.lookAt(new THREE.Vector3(N/2, 0, N/2));

    var width = window.innerWidth;
    var height = window.innerHeight;
    sceneOrtho = new THREE.Scene();
    cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, -height / 2, 1, 10 );
    cameraOrtho.position.z = 10;

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000ff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'wheel', onDocumentMouseScroll, false );
    renderer.domElement.addEventListener("contextmenu",function (event)
    {
        event.preventDefault();
    });
                                        
    var spotLight = new THREE.SpotLight( 0xffe9ce );
    spotLight.position.set( N*1.5, N*1.5, N/2 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 100;
    spotLight.shadow.camera.far = 1000;
    spotLight.shadow.camera.fov = 60;

    scene.add( spotLight );
    renderer.autoClear = false;
    genterrain();
    addcircle();
    addcylinder();
    GUI();
    loadModel('models/static/tree/', "Tree.obj", "Tree.mtl", 0.6, 'tree');
    loadModel('models/static/palma/', "Palma001.obj", "Palma001.mtl", 0.6, 'palma');
    loadModel('models/static/bush/', "Bush1.obj", "Bush1.mtl", 2, 'bush');
    loadModel('models/static/house/', "Cyprys_House.obj", "Cyprys_House.mtl", 4, 'house');

    addSprite('pics/house1.png', 'pics/house2.png');
    addSprite('pics/tree1.png', 'pics/tree2.png');
    addSprite('pics/palm1.png', 'pics/palm2.png');
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    cameraOrtho.left = -width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = -height / 2;
    cameraOrtho.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate()
{
    var delta = clock.getDelta();
    if (brvis != 0)
    {
        geodraw(brvis, delta);
    }
    rain(delta);
    requestAnimationFrame( animate );
    render();
    
}

function render() 
{
    renderer.clear();
    renderer.render( scene, camera );
    renderer.clearDepth();
    renderer.render( sceneOrtho, cameraOrtho);
}

function genterrain()
{
    geometry = new THREE.Geometry();

    for (var i=0; i < N; i++)
    {
        for (var j=0; j < N; j++)
        {
            geometry.vertices.push(new THREE.Vector3( i, 0.0, j));
        }
    }
 
    for (var i=0; i < N-1; i++)
        for (var j=0; j < N-1; j++)
        {
            var ind0 = i + j*N;
            var ind1 = (i+1) + j*N;
            var ind2 = (i+1) + (j+1)*N;
 
            geometry.faces.push(new THREE.Face3( ind0, ind1, ind2));

            var ind3 = i + j*N;
            var ind4 = (i+1) + (j+1)*N;
            var ind5 = i + (j+1)*N;
 
            geometry.faces.push(new THREE.Face3( ind3, ind4, ind5));

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),      
                new THREE.Vector2((i+1)/(N-1), j/(N-1)),      
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))]);
 
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),      
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),      
                new THREE.Vector2(i/(N-1), (j+1)/(N-1))]);
 
        }
    geometry.computeFaceNormals();  
    geometry.computeVertexNormals();
    var loader = new THREE.TextureLoader();
    var tex = loader.load('pics/grasstile.jpg');
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set( 4, 4 );
    
    var mat = new THREE.MeshLambertMaterial({ 
        map: tex,    
        wireframe: false,    
        side: THREE.DoubleSide });
    terra = new THREE.Mesh(geometry, mat);
    terra.position.set(0,0,0);
    terra.receiveShadow = true;
    scene.add(terra);
    targetList.push(terra);
}

function onDocumentMouseMove( event )
{
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var mpos = {};
    mpos.x = event.clientX - (window.innerWidth / 2);
    mpos.y = (window.innerHeight / 2) - event.clientY;

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    vector.unproject(camera);
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = ray.intersectObjects(targetList);
        
    if(bractiv == true)
    {
        if ( intersects.length > 0 )
        {
            if (ccylinder != null)
            {
                ccylinder.visible = true;
                ccylinder.position.copy(intersects[0].point);
                ccylinder.position.y += 2.5;
            }
            if (circler != null)
            {
                circler.visible = true;
                circler.position.copy(intersects[0].point);
                circler.position.y = 0;

                for (var i = 0; i < circler.geometry.vertices.length; i++)
                {
            
                    var pos = new THREE.Vector3();
                    pos.copy(circler.geometry.vertices[i]);
                    pos.applyMatrix4(circler.matrixWorld);
                    
                    var x = Math.round(pos.x);
                    var z = Math.round(pos.z);
                    
                    if(x>=0 && x<N && z>=0 && z<N)
                    {
                        var y =  geometry.vertices[z + x * N].y;
                        circler.geometry.vertices[i].y = y + 0.03;
                    }
                    else
                    circler.geometry.vertices[i].y = 0;
                }       
                circler.geometry.verticesNeedUpdate = true;
            }
        }
        else
        {
            circler.visible = false;
            ccylinder.visible = false;
        }
        
    }
    else
    {
        if ( intersects.length > 0 )
        {
            if(selected != null && mouseofadown == true)
            {
               
                

                for(var i = 0; i< objectList.length; i++)
                {
                    if(selected.userData.cube != objectList[i])
                    {
                        objectList[i].material.visible = false;
                        objectList[i].material.color = {r:0,g:1,b:0};
                        selected.userData.cube.material.color = {r:0,g:1,b:0};
                        
                        if(intersect( selected.userData, objectList[i].userData.model.userData) == true)
                        {
                            objectList[i].material.color = {r:1,g:0,b:0};
                            selected.userData.cube.material.visible = true;
                            selected.userData.cube.material.color = {r:1,g:0,b:0};
                            objectList[i].material.visible = true;
                            isintersect = false;
                        }
                        else
                        {
                            isintersect = true;
                        }
                    }
                }
                selected.position.copy(intersects[0].point);
                selected.userData.box.setFromObject(selected);
                var pos = new THREE.Vector3();
                selected.userData.box.getCenter(pos);
                selected.userData.obb.position.copy(pos);
                selected.userData.cube.position.copy(pos);
                

            }
        }
    }
    
    for(var i = 0; i<3; i++)
    {
        hitButton(mpos, buttons[i]);
    }


}


function onDocumentMouseScroll( event )
{
    if(bractiv == true)
    {
        if (radius > 1)
            if (event.wheelDelta < 0)
            {
                radius-=1;
            }

        if (radius < N/4)
            if (event.wheelDelta > 0)
            {
                radius += 1;
            }    

        circler.scale.set(radius, 1, radius);
    }
}

function onDocumentMouseDown( event ) 
{
    if(bractiv == true)
    {
        if (event.which == 1)
        {
            brvis = 1;
        }

        if (event.which == 3)
        {
            brvis = -1;
        }
    }
    else
    {
        mouseofadown = true;
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        vector.unproject(camera);
        var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        var intersects = ray.intersectObjects(objectList, true);
        if ( intersects.length > 0)
        {
            
            if(selected != null)
            {
                selected.userData.cube.material.visible = false;
                selected = intersects[0].object.userData.model;
                selected.userData.cube.material.visible = true;
            }
            else
            {
                selected = intersects[0].object.userData.model;
                selected.userData.cube.material.visible = true;
            }
            oldpos.copy(new THREE.Vector3(selected.position.x,selected.position.y,selected.position.z));
        }
        else
        {
            if(selected != null)
            {
                selected.userData.cube.material.visible = false;
                selected = null;
            }
        }
    }
}

function onDocumentMouseUp( event ) 
{
    var mpos = {};
    mpos.x = event.clientX - (window.innerWidth / 2);
    mpos.y = (window.innerHeight / 2) - event.clientY;
    
    if(bractiv)
    {
        brvis = 0;
    }
    else
    {
        mouseofadown = false;
        if(isintersect == false)
        {
            selected.position.copy(oldpos);
            selected.userData.box.setFromObject(selected);
            var pos = new THREE.Vector3();
            selected.userData.box.getCenter(pos);
            selected.userData.obb.position.copy(pos);
            selected.userData.cube.position.copy(pos);
            for(var i = 0; i< objectList.length; i++)
            {
                if(selected.userData.cube != objectList[i])
                {
                    objectList[i].material.visible = false;
                    objectList[i].material.color = {r:0,g:1,b:0};
                    selected.userData.cube.material.color = {r:0,g:1,b:0};
                }
            }
            isintersect = true;
        }
    }

    for(var i = 0; i<3; i++)
    {
        clickButton(mpos, buttons[i]);
    }
}

function addcircle()
{
    var material = new THREE.LineBasicMaterial( { 
        color: 0xffff00,
    } );
    var segments = 128;
    var circleGeometry = new THREE.CircleGeometry( radius, segments );				
    
    for (var i = 0; i < circleGeometry.vertices.length; i++)
    {
        circleGeometry.vertices[i].z = circleGeometry.vertices[i].y;
        circleGeometry.vertices[i].y = 0;
    }
    circleGeometry.vertices.shift();
    circler = new THREE.Line( circleGeometry, material );
    scene.add(circler);
    circler.position.set(N/2, 0.03, N/2);
    circler.visible = false;
}

function addcylinder()
{
    var geometry = new THREE.CylinderGeometry( 1.5, 0, 5, 64 );
    var material = new THREE.MeshLambertMaterial( {color: 0x888888} );
    ccylinder = new THREE.Mesh( geometry, material );
    scene.add(ccylinder);
    ccylinder.position.set(N/2, 2.5, N/2);
    ccylinder.visible = false;
}

function geodraw(brvis, delta)
{
    for ( i = 0; i < terra.geometry.vertices.length; i++)
    {
        var x1 = ccylinder.position.x;
        var z1 = ccylinder.position.z;
        var r = radius;
        var x2 = terra.geometry.vertices[i].x;
        var z2 = terra.geometry.vertices[i].z;

        var h = r*r - ((x2-x1)*(x2-x1) + (z2-z1)*(z2-z1));

        if (h>0)
        {
            terra.geometry.vertices[i].y += Math.sqrt(h) * delta * brvis;
        }
    }

    terra.geometry.computeFaceNormals();
    terra.geometry.computeVertexNormals();
    terra.geometry.verticesNeedUpdate = true;
    terra.geometry.normalsNeedUpdate = true;

    
}

function GUI()
{
    gui = new dat.GUI();
    gui.width = 200;
    var params =
    {
    sx: 0, sy: 0, sz: 0,
    wind: 0,
    brush: false,
    rain: false,
    addHouse: function() { addMesh('house') },
    addTree: function() { addMesh('tree') },
    addPalma: function() { addMesh('palma') },
    addBush: function() { addMesh('bush') },
    del: function() { delMesh() }
    };
    var folder1 = gui.addFolder('Scale');
    var meshSX = folder1.add( params, 'sx' ).min(0).max(360).step(1).listen();
    var meshSY = folder1.add( params, 'sy' ).min(0).max(360).step(1).listen();
    var meshSZ = folder1.add( params, 'sz' ).min(0).max(360).step(1).listen();
    folder1.open();

    meshSX.onChange(function(value) {rotMesh(value, 'x')});
    meshSY.onChange(function(value) {rotMesh(value, 'y')});
    meshSZ.onChange(function(value) {rotMesh(value, 'z')});

    var particlesVisible = gui.add( params, 'rain' ).name('rain').listen();
    particlesVisible.onChange(function(value)
    {
        partVis = value;
    });

    var meshWIND = gui.add( params, 'wind' ).min(-100).max(100).step(1).listen();
    meshWIND.onChange(function(value) {
        var count = value;
        wind.set(count, 0, 0);
    });

    var cubeVisible = gui.add( params, 'brush' ).name('brush').listen();
    cubeVisible.onChange(function(value)
    {
        bractiv = value;
        circler.visible = value;
        ccylinder.visible = value;
    });
    
    gui.add( params, 'addHouse' ).name( "add house" );
    gui.add( params, 'addTree' ).name( "add tree" );
    gui.add( params, 'addPalma' ).name( "add palma" );
    gui.add( params, 'addBush' ).name( "add bush" );
    gui.add( params, 'del' ).name( "delete" );
    gui.open();
}

function addMesh(name)
{
    var model = objects.get(name).clone();
    var box = new THREE.Box3();
    box.setFromObject(model);
    model.userData.box = box;

    var cubegeo = new THREE.BoxGeometry(1,1,1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
    var cube = new  THREE.Mesh(cubegeo, material);
    scene.add(cube);

    var pos = new THREE.Vector3();
    box.getCenter(pos);
    var size = new THREE.Vector3();
    box.getSize(size);
    cube.position.copy(pos);
    cube.scale.set(size.x, size.y, size.z);

    model.userData.cube = cube;
    cube.userData.model = model;
    cube.material.visible = false;

    var obb = {};

    obb.basis = new THREE.Matrix4();
    obb.halfSize = new THREE.Vector3();
    obb.position = new THREE.Vector3();

    box.getCenter(obb.position);
    box.getSize(obb.halfSize).multiplyScalar(0.5);
    obb.basis.extractRotation(model.matrixWorld);
    model.userData.obb = obb;

    scene.add(model);
    objectList.push(cube);
}

function loadModel(path, oname, mname, sc, name)
{
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) { console.log(xhr); };

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( path );

    mtlLoader.load ( mname, function( materials )
    {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials ( materials );
        objLoader.setPath( path );

        objLoader.load ( oname, function ( object )
        {
            
            object.castShadow = true;
            object.traverse( function ( child )
            {
                if ( child instanceof THREE.Mesh )
                {
                    child.castShadow = true;
                    child.parent = object;
                }
            } );
            object.parent = object;
            var x = Math.random()*N;
            var z = Math.random()*N;
            var y = geometry.vertices[Math.round(x) + Math.round(z)*N].y;

            object.position.x = x;
            object.position.y = y;
            object.position.z = z;
                
            object.scale.set(sc, sc, sc);
            objects.set(name,object);
            
        }, onProgress, onError ); 
    });
    console.log(name); 
}

function rotMesh(value, coord)
{
    if(selected != null)
    {
        if(coord == 'x')
        {
            selected.rotation.x = ((Math.PI/180)*value);
            selected.userData.cube.rotation.x = ((Math.PI/180)*value);
            selected.userData.box.setFromObject(selected);
            var pos = new THREE.Vector3();
            selected.userData.box.getCenter(pos);
            selected.userData.obb.position.copy(pos);
            selected.userData.cube.position.copy(pos);
        }
        if(coord == 'y')
        {
            selected.rotation.y = ((Math.PI/180)*value);
            selected.userData.cube.rotation.y = ((Math.PI/180)*value);
            selected.userData.box.setFromObject(selected);
            var pos = new THREE.Vector3();
            selected.userData.box.getCenter(pos);
            selected.userData.obb.position.copy(pos);
            selected.userData.cube.position.copy(pos);
        }
        if(coord == 'z')
        {
            selected.rotation.z = ((Math.PI/180)*value);
            selected.userData.cube.rotation.z = ((Math.PI/180)*value);
            selected.userData.box.setFromObject(selected);
            var pos = new THREE.Vector3();
            selected.userData.box.getCenter(pos);
            selected.userData.obb.position.copy(pos);
            selected.userData.cube.position.copy(pos);
        }
        
    }
}

function addDrop(pos)
{
    var texture = loader.load('pics/raindrop.png');
    var material = new THREE.SpriteMaterial( {map: texture} );

    sprite = new THREE.Sprite( material );
    sprite.center.set(0.5, 0.5);
    sprite.scale.set(1, 1, 1);

    sprite.position.copy( pos );

    scene.add( sprite );

    var SSprite = {};
    SSprite.sprite = sprite;
    SSprite.v = new THREE.Vector3(0, 0, 0);

    particles.push( SSprite );

    return SSprite;
}

function rain(delta)
{
    if (particles.length < N)
    {
        var x = Math.random()*N;
        var z = Math.random()*N;

        var pos = new THREE.Vector4(x, 150, z);
        addDrop(pos);
    }

    for (var i = 0; i < particles.length; i++)
    {
        particles[i].v = particles[i].v.add(g); 
        particles[i].sprite.position = particles[i].sprite.position.add(particles[i].v.multiplyScalar(delta * 10));
    }

    for (var i = 0; i < particles.length; i++)
    {
                
        if (particles[i].sprite.position.y < -5)
        {
            particles[i].sprite.position.y = Math.random()*N;
            particles[i].sprite.position.x = Math.random()*N;
        }
    }            

    for (var i = 0; i < particles.length; i++)
    {
        if (partVis == true)
        {
            particles[i].sprite.visible = true;
        }
        else
        {
            particles[i].sprite.visible = false;
        }

        var v = new THREE.Vector3(0, 0, 0);
        var w = new THREE.Vector3(0, 0, 0);
        
        w.copy(wind);
        w.multiplyScalar(delta);
        
        v.copy(particles[i].v);
        v.add(w);
        
        particles[i].sprite.position.add(v);
    }
}

function addSprite(name1, name2)
{
    var type;

    if (name1 == 'pics/house1.png')
    {
        type = 'house';
    }
    if (name1 == 'pics/tree1.png')
    {
        type = 'tree'
    }
    if (name1 == 'pics/palm1.png')
    {
        type = 'palm'
    }

    var texture1 = loader.load(name1);
    var material1 = new THREE.SpriteMaterial( { map: texture1 } );

    var texture2 = loader.load(name2);
    var material2 = new THREE.SpriteMaterial( { map: texture2 } );

    sprite = new THREE.Sprite( material1);

    sprite.center.set( 0.0, 1.0 );
    sprite.scale.set( 100, 100, 1 );

    sprite.position.set( 0, 0, 1 );
    sceneOrtho.add(sprite);

    var SSprite = {};
    SSprite.sprite = sprite;
    SSprite.mat1 = material1;
    SSprite.mat2 = material2;
    SSprite.type = type;

    if (type == "house")
    {
        sprite.position.set(-window.innerWidth/ 2, window.innerHeight / 2, 1);
    }
    if (type == "tree")
    {
        sprite.position.set(-window.innerWidth / 2.5, window.innerHeight / 2, 1);
    }
    if (type == "palm")
    {
        sprite.position.set(-window.innerWidth / 3.5, window.innerHeight / 2, 1);
    }

    buttons.push(SSprite);
}

function hitButton(mPos, sprite)
{
    var pw = sprite.sprite.position.x;
    var ph = sprite.sprite.position.y;
    var sw = pw + sprite.sprite.scale.x;
    var sh = ph - sprite.sprite.scale.y;

    if (mPos.x > pw && mPos.x < sw)
    {
        if (mPos.y < ph && mPos.y > sh)
        {
            sprite.sprite.material = sprite.mat2;
        }
        else
            sprite.sprite.material = sprite.mat1;
    }
    else
        sprite.sprite.material = sprite.mat1;
}

function clickButton(mpos, sprite)
{
    var pw = sprite.sprite.position.x;
    var ph = sprite.sprite.position.y;
    var sw = pw + sprite.sprite.scale.x;
    var sh = ph - sprite.sprite.scale.y;

    if (mpos.x > pw && mpos.x < sw)
    {
        if (mpos.y < ph && mpos.y > sh)
        {
            BClick(sprite.type);
        }
    }
}

function BClick(type)
{
    if(type == 'house')
    {
        addMesh('house');
    }
    if(type == 'tree')
    {
        addMesh('tree');
    }
    if(type == 'palm')
    {
        addMesh('palma');
    }

}

function intersect(ob1, ob2)
{
    var xAxisA = new THREE.Vector3();
    var yAxisA = new THREE.Vector3();
    var zAxisA = new THREE.Vector3();
    var xAxisB = new THREE.Vector3();
    var yAxisB = new THREE.Vector3();
    var zAxisB = new THREE.Vector3();
    var translation = new THREE.Vector3();
    var vector = new THREE.Vector3();

    var axisA = [];
    var axisB = [];
    var rotationMatrix = [ [], [], [] ];
    var rotationMatrixAbs = [ [], [], [] ];
    var _EPSILON = 1e-3;

    var halfSizeA, halfSizeB;
    var t, i;

    ob1.obb.basis.extractBasis( xAxisA, yAxisA, zAxisA );
    ob2.obb.basis.extractBasis( xAxisB, yAxisB, zAxisB );

    axisA.push( xAxisA, yAxisA, zAxisA );
    axisB.push( xAxisB, yAxisB, zAxisB );
    vector.subVectors( ob2.obb.position, ob1.obb.position );

    for ( i = 0; i < 3; i++ )
    {
        translation.setComponent( i, vector.dot( axisA[ i ] ) );
    }
    
    for ( i = 0; i < 3; i++ )
    {
        for ( var j = 0; j < 3; j++ )
        {
            rotationMatrix[ i ][ j ] = axisA[ i ].dot( axisB[ j ] );
            rotationMatrixAbs[ i ][ j ] = Math.abs( rotationMatrix[ i ][ j ] ) + _EPSILON;
        }
    }
    
    for ( i = 0; i < 3; i++ )
    {
        vector.set( rotationMatrixAbs[ i ][ 0 ], rotationMatrixAbs[ i ][ 1 ], rotationMatrixAbs[ i ][ 2 ]
        );
        halfSizeA = ob1.obb.halfSize.getComponent( i );
        halfSizeB = ob2.obb.halfSize.dot( vector );
        
        
        if ( Math.abs( translation.getComponent( i ) ) > halfSizeA + halfSizeB )
        {
            return false;
        }
    }
    
    for ( i = 0; i < 3; i++ )
    {
        vector.set( rotationMatrixAbs[ 0 ][ i ], rotationMatrixAbs[ 1 ][ i ], rotationMatrixAbs[ 2 ][ i ] );
        halfSizeA = ob1.obb.halfSize.dot( vector );
        halfSizeB = ob2.obb.halfSize.getComponent( i );
        vector.set( rotationMatrix[ 0 ][ i ], rotationMatrix[ 1 ][ i ], rotationMatrix[ 2 ][ i ] );
        t = translation.dot( vector );
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
    }
    
    halfSizeA = ob1.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 0 ] + ob1.obb.halfSize.z *
    rotationMatrixAbs[ 1 ][ 0 ];
    halfSizeB = ob2.obb.halfSize.y * rotationMatrixAbs[ 0 ][ 2 ] + ob2.obb.halfSize.z *
    rotationMatrixAbs[ 0 ][ 1 ];
    t = translation.z * rotationMatrix[ 1 ][ 0 ] - translation.y * rotationMatrix[ 2 ][ 0 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 1 ] + ob1.obb.halfSize.z *
    rotationMatrixAbs[ 1 ][ 1 ];
    halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 0 ][ 2 ] + ob2.obb.halfSize.z *
    rotationMatrixAbs[ 0 ][ 0 ];
    t = translation.z * rotationMatrix[ 1 ][ 1 ] - translation.y * rotationMatrix[ 2 ][ 1 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 2 ] + ob1.obb.halfSize.z *
    rotationMatrixAbs[ 1 ][ 2 ];
    halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 0 ][ 1 ] + ob2.obb.halfSize.y *
    rotationMatrixAbs[ 0 ][ 0 ];
    t = translation.z * rotationMatrix[ 1 ][ 2 ] - translation.y * rotationMatrix[ 2 ][ 2 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 0 ] + ob1.obb.halfSize.z *
    rotationMatrixAbs[ 0 ][ 0 ];
    halfSizeB = ob2.obb.halfSize.y * rotationMatrixAbs[ 1 ][ 2 ] + ob2.obb.halfSize.z *
    rotationMatrixAbs[ 1 ][ 1 ];
    t = translation.x * rotationMatrix[ 2 ][ 0 ] - translation.z * rotationMatrix[ 0 ][ 0 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 1 ] + ob1.obb.halfSize.z *
    rotationMatrixAbs[ 0 ][ 1 ];
    halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 2 ] + ob2.obb.halfSize.z *
    rotationMatrixAbs[ 1 ][ 0 ];
    t = translation.x * rotationMatrix[ 2 ][ 1 ] - translation.z * rotationMatrix[ 0 ][ 1 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 2 ] + ob1.obb.halfSize.z *
    rotationMatrixAbs[ 0 ][ 2 ];
    halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 1 ] + ob2.obb.halfSize.y *
    rotationMatrixAbs[ 1 ][ 0 ];
    t = translation.x * rotationMatrix[ 2 ][ 2 ] - translation.z * rotationMatrix[ 0 ][ 2 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 0 ] + ob1.obb.halfSize.y *
    rotationMatrixAbs[ 0 ][ 0 ];
    halfSizeB = ob2.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 2 ] + ob2.obb.halfSize.z *
    rotationMatrixAbs[ 2 ][ 1 ];
    t = translation.y * rotationMatrix[ 0 ][ 0 ] - translation.x * rotationMatrix[ 1 ][ 0 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 1 ] + ob1.obb.halfSize.y *
    rotationMatrixAbs[ 0 ][ 1 ];
    halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 2 ] + ob2.obb.halfSize.z *
    rotationMatrixAbs[ 2 ][ 0 ];
    t = translation.y * rotationMatrix[ 0 ][ 1 ] - translation.x * rotationMatrix[ 1 ][ 1 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 2 ] + ob1.obb.halfSize.y *
    rotationMatrixAbs[ 0 ][ 2 ];
    halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 1 ] + ob2.obb.halfSize.y *
    rotationMatrixAbs[ 2 ][ 0 ];
    t = translation.y * rotationMatrix[ 0 ][ 2 ] - translation.x * rotationMatrix[ 1 ][ 2 ];

    if ( Math.abs( t ) > halfSizeA + halfSizeB )
    {
        return false;
    }
    
    return true;
}

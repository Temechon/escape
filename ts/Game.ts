class Game {

    private engine  : BABYLON.Engine;
    public sounds   : Array<any> = [];
    public scene    : BABYLON.Scene;
    public assets   : Array<any> = [];

    constructor(canvasId:string) {
        
        let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById(canvasId);
        this.engine         = new BABYLON.Engine(canvas, true);
        this.scene          = null;
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
        this.run();
    }
    
    private initScene() { 
        let scene = new BABYLON.Scene(this.engine);
        var camera = new BABYLON.FreeCamera("default", new BABYLON.Vector3(0,1,0), scene);
        camera.position = new BABYLON.Vector3(12.8,10.4,-9.8);
        camera.rotation = new BABYLON.Vector3(0.48,-1,0);
        camera.attachControl(this.engine.getRenderingCanvas(), true);
        var light = new BABYLON.HemisphericLight("default", new BABYLON.Vector3(0, 1, 0), scene);  
        light.intensity = 0.5;                     
        
        // Background
        new BABYLON.Layer('', 'assets/back.jpg', scene, true);
                 
        this.scene = scene;
    }

    /**
     * Setup the Asset Manager and register all resources to be loaded.
     */
    private loadResources(loader) {
        let sounds = [
            {name:'ambient',    path:'assets/sounds/ambient.wav', loop:true, playOnLoaded : true, volume:0.35}
        ];
        
        sounds.forEach((s) => {
            let task = loader.addBinaryFileTask(s.name, s.path);
            task.onSuccess = (t) => {
                this.sounds[t.name] = new BABYLON.Sound(t.name, t.data, this.scene, () => {
                    // Set volume
                    this.sounds[t.name].setVolume(s.volume);
                    // Play on load ? useful for ambient track
                    if (s.playOnLoaded) {
                        this.sounds[t.name].play()
                    }
                }, 
                {loop: s.loop });
            }
        });
    }
    
    /**
     * Run the game
     */
    private run() {        
        
        this.initScene();         
        let loader =  new BABYLON.AssetsManager(this.scene);
        this.loadResources(loader);  
                
        loader.onFinish = () => {
            
            this.scene.executeWhenReady(() => {
                this.engine.runRenderLoop(() => {
                    this.scene.render();
                });
            });      
                  
            this.initGame();
        };
        
        loader.load();
    }

     private initGame() {
         
         this.scene.debugLayer.show();
         let player = BABYLON.MeshBuilder.CreateBox('player', {width:1, height:1, depth:1}, this.scene);
         player.position = new BABYLON.Vector3(0, 0.5, -10);
         let b = BABYLON.MeshBuilder.CreateBox('', {width:5, height:50, depth:100}, this.scene);
         
         b.position.y -=25;
         b.position.z += 25;
         
         this._applyShadows();
    }  
    
    private _applyShadows() {
        
        let dir = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-0.5,-1,-0.5), this.scene);          
        dir.position = new BABYLON.Vector3(40, 60, 40);
        
        let shadowGenerator = new BABYLON.ShadowGenerator(512, dir); 
        shadowGenerator.useBlurVarianceShadowMap = true;
       
        // Shadows
        this.scene.meshes.forEach((m) => {
            if (m.name.indexOf('player') !== -1) {
                shadowGenerator.getShadowMap().renderList.push(m);
                m.receiveShadows = false;
            } else {
                m.receiveShadows = true;
            }
        });
    }
    

    ///**
    // * Returns an integer in [min, max[
    // */
    //static randomInt(min, max) {
    //    if (min === max) {
    //        return (min);
    //    }
    //    let random = Math.random();
    //    return Math.floor(((random * (max - min)) + min));
    //}
    //
    //static randomNumber(min, max) {
    //    if (min === max) {
    //        return (min);
    //    }
    //    let random = Math.random();
    //    return (random * (max - min)) + min;
    //}
    //
    ///**
    // * Create an instance model from the given name.
    // */
    //createModel(name, parent) {
    //    if (! this.assets[name]) {
    //        console.warn('No asset corresponding.');
    //    } else {
    //        if (!parent) {
    //            parent = new GameObject(this);
    //        }
    //
    //        let obj = this.assets[name];
    //        //parent._animations = obj.animations;
    //        let meshes = obj.meshes;
    //
    //        for (let i=0; i<meshes.length; i++ ){
    //            // Don't clone mesh without any vertices
    //            if (meshes[i].getTotalVertices() > 0) {
    //
    //                let newmesh = meshes[i].clone(meshes[i].name, null, true);
    //                parent.addChildren(newmesh);
    //
    //                if (meshes[i].skeleton) {
    //                    newmesh.skeleton = meshes[i].skeleton.clone();
    //                    this.scene.stopAnimation(newmesh);
    //                }
    //            }
    //        }
    //    }
    //    return parent;
    //}
}

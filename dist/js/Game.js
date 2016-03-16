var Game = (function () {
    function Game(canvasId) {
        var _this = this;
        this.sounds = [];
        this.assets = [];
        var canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = null;
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.run();
    }
    Game.prototype.initScene = function () {
        var scene = new BABYLON.Scene(this.engine);
        var camera = new BABYLON.FreeCamera("default", new BABYLON.Vector3(0, 1, 0), scene);
        camera.position = new BABYLON.Vector3(12.8, 10.4, -9.8);
        camera.rotation = new BABYLON.Vector3(0.48, -1, 0);
        camera.attachControl(this.engine.getRenderingCanvas(), true);
        var light = new BABYLON.HemisphericLight("default", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.5;
        // Background
        new BABYLON.Layer('', 'assets/back.jpg', scene, true);
        this.scene = scene;
    };
    /**
     * Setup the Asset Manager and register all resources to be loaded.
     */
    Game.prototype.loadResources = function (loader) {
        var _this = this;
        var sounds = [
            { name: 'ambient', path: 'assets/sounds/ambient.wav', loop: true, playOnLoaded: true, volume: 0.35 }
        ];
        sounds.forEach(function (s) {
            var task = loader.addBinaryFileTask(s.name, s.path);
            task.onSuccess = function (t) {
                _this.sounds[t.name] = new BABYLON.Sound(t.name, t.data, _this.scene, function () {
                    // Set volume
                    _this.sounds[t.name].setVolume(s.volume);
                    // Play on load ? useful for ambient track
                    if (s.playOnLoaded) {
                        _this.sounds[t.name].play();
                    }
                }, { loop: s.loop });
            };
        });
    };
    /**
     * Run the game
     */
    Game.prototype.run = function () {
        var _this = this;
        this.initScene();
        var loader = new BABYLON.AssetsManager(this.scene);
        this.loadResources(loader);
        loader.onFinish = function () {
            _this.scene.executeWhenReady(function () {
                _this.engine.runRenderLoop(function () {
                    _this.scene.render();
                });
            });
            _this.initGame();
        };
        loader.load();
    };
    Game.prototype.initGame = function () {
        this.scene.debugLayer.show();
        var player = BABYLON.MeshBuilder.CreateBox('player', { width: 1, height: 1, depth: 1 }, this.scene);
        player.position = new BABYLON.Vector3(0, 0.5, -10);
        var b = BABYLON.MeshBuilder.CreateBox('', { width: 5, height: 50, depth: 100 }, this.scene);
        b.position.y -= 25;
        b.position.z += 25;
        this._applyShadows();
    };
    Game.prototype._applyShadows = function () {
        var dir = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-0.5, -1, -0.5), this.scene);
        dir.position = new BABYLON.Vector3(40, 60, 40);
        var shadowGenerator = new BABYLON.ShadowGenerator(512, dir);
        shadowGenerator.useBlurVarianceShadowMap = true;
        // Shadows
        this.scene.meshes.forEach(function (m) {
            if (m.name.indexOf('player') !== -1) {
                shadowGenerator.getShadowMap().renderList.push(m);
                m.receiveShadows = false;
            }
            else {
                m.receiveShadows = true;
            }
        });
    };
    return Game;
})();
//# sourceMappingURL=Game.js.map
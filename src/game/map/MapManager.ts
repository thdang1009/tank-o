import { Scene } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';

export enum MapType {
    GRASS = 'grass',
    SAND = 'sand',
    MIXED = 'mixed'
}

export class MapManager {
    scene: Scene;
    map: Phaser.GameObjects.TileSprite[] = [];
    obstacles: Phaser.Physics.Arcade.StaticGroup;
    mapSize: { width: number, height: number };
    tileSize: number = 64; // Size of each tile
    
    constructor(scene: Scene, mapType: MapType = MapType.GRASS) {
        this.scene = scene;
        
        // Determine map size based on the game canvas
        this.mapSize = {
            width: scene.sys.canvas.width,
            height: scene.sys.canvas.height
        };
        
        // Create the base terrain
        this.createBaseTerrain(mapType);
        
        // Check if physics system is initialized
        if (!scene.physics) {
            console.error('Physics system not initialized in the scene!');
            return;
        }
        
        // Create obstacles group
        this.obstacles = scene.physics.add.staticGroup();
        
        // Add some random obstacles
        this.addRandomObstacles(mapType);
    }
    
    createBaseTerrain(mapType: MapType) {
        let baseTexture: string;
        
        // Determine base texture based on map type
        switch(mapType) {
            case MapType.SAND:
                baseTexture = AssetsEnum.TILE_SAND_1;
                break;
            case MapType.MIXED:
                // For mixed, we'll use grass as base and add sand patches later
                baseTexture = AssetsEnum.TILE_GRASS_1;
                break;
            case MapType.GRASS:
            default:
                baseTexture = AssetsEnum.TILE_GRASS_1;
                break;
        }
        
        // Create a TileSprite to cover the entire game area
        const baseLayer = this.scene.add.tileSprite(
            this.mapSize.width / 2,
            this.mapSize.height / 2,
            this.mapSize.width,
            this.mapSize.height,
            baseTexture
        );
        baseLayer.setDepth(0);
        
        this.map.push(baseLayer);
        
        // For mixed terrain, add some patches of the other terrain type
        if (mapType === MapType.MIXED) {
            this.addTerrainPatches(
                mapType === MapType.MIXED ? AssetsEnum.TILE_SAND_1 : AssetsEnum.TILE_GRASS_1
            );
        }
    }
    
    addTerrainPatches(textureKey: string) {
        // Add 3-5 patches of the alternate terrain
        const numPatches = Phaser.Math.Between(3, 5);
        
        for (let i = 0; i < numPatches; i++) {
            // Random patch size
            const patchWidth = Phaser.Math.Between(3, 6) * this.tileSize;
            const patchHeight = Phaser.Math.Between(3, 6) * this.tileSize;
            
            // Random position (making sure it's not too close to the edges)
            const patchX = Phaser.Math.Between(
                patchWidth / 2 + this.tileSize,
                this.mapSize.width - patchWidth / 2 - this.tileSize
            );
            const patchY = Phaser.Math.Between(
                patchHeight / 2 + this.tileSize,
                this.mapSize.height - patchHeight / 2 - this.tileSize
            );
            
            // Create the patch
            const patch = this.scene.add.tileSprite(
                patchX,
                patchY,
                patchWidth,
                patchHeight,
                textureKey
            );
            patch.setDepth(0);
            
            this.map.push(patch);
        }
    }
    
    addRandomObstacles(mapType: MapType) {
        // Determine the types of obstacles to add based on map type
        let treeTextures: string[] = [];
        let barrierTextures: string[] = [];
        
        switch(mapType) {
            case MapType.SAND:
                treeTextures = [
                    AssetsEnum.TREE_BROWN_SMALL,
                    AssetsEnum.TREE_BROWN_LARGE,
                    AssetsEnum.TREE_BROWN_LEAF,
                    AssetsEnum.TREE_BROWN_TWIGS
                ];
                barrierTextures = [
                    AssetsEnum.BARREL_RUST_SIDE,
                    AssetsEnum.SANDBAG_BEIGE,
                    AssetsEnum.SANDBAG_BEIGE_OPEN,
                    AssetsEnum.CRATE_WOOD
                ];
                break;
            case MapType.MIXED:
                // Mix of both types
                treeTextures = [
                    AssetsEnum.TREE_BROWN_SMALL,
                    AssetsEnum.TREE_GREEN_SMALL,
                    AssetsEnum.TREE_BROWN_LEAF,
                    AssetsEnum.TREE_GREEN_LEAF
                ];
                barrierTextures = [
                    AssetsEnum.BARREL_GREEN_SIDE,
                    AssetsEnum.BARREL_RED_SIDE,
                    AssetsEnum.SANDBAG_BROWN,
                    AssetsEnum.SANDBAG_BEIGE,
                    AssetsEnum.CRATE_WOOD,
                    AssetsEnum.CRATE_METAL
                ];
                break;
            case MapType.GRASS:
            default:
                treeTextures = [
                    AssetsEnum.TREE_GREEN_SMALL,
                    AssetsEnum.TREE_GREEN_LARGE,
                    AssetsEnum.TREE_GREEN_LEAF,
                    AssetsEnum.TREE_GREEN_TWIGS
                ];
                barrierTextures = [
                    AssetsEnum.BARREL_GREEN_SIDE,
                    AssetsEnum.SANDBAG_BROWN,
                    AssetsEnum.SANDBAG_BROWN_OPEN,
                    AssetsEnum.CRATE_METAL
                ];
                break;
        }
        
        // Add trees (8-12)
        const numTrees = Phaser.Math.Between(8, 12);
        this.addObstacles(treeTextures, numTrees, 0.8);
        
        // Add barriers (10-15)
        const numBarriers = Phaser.Math.Between(10, 15);
        this.addObstacles(barrierTextures, numBarriers, 1.0);
    }
    
    addObstacles(textureKeys: string[], count: number, scale: number) {
        const margin = this.tileSize * 2; // Margin from edges
        const centerMargin = this.tileSize * 4; // Margin from center (to avoid spawning on player)
        const centerX = this.mapSize.width / 2;
        const centerY = this.mapSize.height / 2;
        
        for (let i = 0; i < count; i++) {
            // Choose a random texture from the available ones
            const textureKey = textureKeys[Phaser.Math.Between(0, textureKeys.length - 1)];
            
            // Find a position that's not too close to the center (where player spawns)
            let x, y;
            let tooCloseToCenter = true;
            
            // Keep trying until we find a suitable position
            while (tooCloseToCenter) {
                x = Phaser.Math.Between(margin, this.mapSize.width - margin);
                y = Phaser.Math.Between(margin, this.mapSize.height - margin);
                
                // Check if it's too close to the center
                const distanceToCenter = Phaser.Math.Distance.Between(x, y, centerX, centerY);
                if (distanceToCenter > centerMargin) {
                    tooCloseToCenter = false;
                }
            }
            
            // Create the obstacle
            const obstacle = this.obstacles.create(x, y, textureKey);
            obstacle.setScale(scale);
            
            // Adjust collision box to be appropriate for the obstacle
            if (obstacle.body) {
                // For most obstacles, we want a slightly smaller hitbox than the sprite
                const width = obstacle.width * 0.7;
                const height = obstacle.height * 0.7;
                obstacle.body.setSize(width, height);
            }
            
            // Set depth to ensure obstacles appear above the ground but below tanks
            obstacle.setDepth(0.5);
        }
    }
    
    getObstaclesGroup(): Phaser.Physics.Arcade.StaticGroup {
        // Ensure obstacles group is initialized
        if (!this.obstacles && this.scene.physics) {
            this.obstacles = this.scene.physics.add.staticGroup();
        }
        return this.obstacles;
    }
} 
import { Scene } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { makeAssetPath } from '../../app/utils/asset-utils';
export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.image(AssetsEnum.BARREL_BLACK_SIDE, makeAssetPath(AssetsEnum.BARREL_BLACK_SIDE));
        this.load.image(AssetsEnum.BARREL_BLACK_TOP, makeAssetPath(AssetsEnum.BARREL_BLACK_TOP));
        this.load.image(AssetsEnum.BARREL_GREEN_SIDE, makeAssetPath(AssetsEnum.BARREL_GREEN_SIDE));
        this.load.image(AssetsEnum.BARREL_GREEN_TOP, makeAssetPath(AssetsEnum.BARREL_GREEN_TOP));
        this.load.image(AssetsEnum.BARREL_RED_SIDE, makeAssetPath(AssetsEnum.BARREL_RED_SIDE));
        this.load.image(AssetsEnum.BARREL_RED_TOP, makeAssetPath(AssetsEnum.BARREL_RED_TOP));
        this.load.image(AssetsEnum.BARREL_RUST_SIDE, makeAssetPath(AssetsEnum.BARREL_RUST_SIDE));
        this.load.image(AssetsEnum.BARREL_RUST_TOP, makeAssetPath(AssetsEnum.BARREL_RUST_TOP));
        this.load.image(AssetsEnum.BARRICADE_METAL, makeAssetPath(AssetsEnum.BARRICADE_METAL));
        this.load.image(AssetsEnum.BARRICADE_WOOD, makeAssetPath(AssetsEnum.BARRICADE_WOOD));
        this.load.image(AssetsEnum.BULLET_BLUE_1, makeAssetPath(AssetsEnum.BULLET_BLUE_1));
        this.load.image(AssetsEnum.BULLET_BLUE_1_OUTLINE, makeAssetPath(AssetsEnum.BULLET_BLUE_1_OUTLINE));
        this.load.image(AssetsEnum.BULLET_BLUE_2, makeAssetPath(AssetsEnum.BULLET_BLUE_2));
        this.load.image(AssetsEnum.BULLET_BLUE_2_OUTLINE, makeAssetPath(AssetsEnum.BULLET_BLUE_2_OUTLINE));
        this.load.image(AssetsEnum.BULLET_BLUE_3, makeAssetPath(AssetsEnum.BULLET_BLUE_3));
        this.load.image(AssetsEnum.BULLET_BLUE_3_OUTLINE, makeAssetPath(AssetsEnum.BULLET_BLUE_3_OUTLINE));
        this.load.image(AssetsEnum.BULLET_DARK_1, makeAssetPath(AssetsEnum.BULLET_DARK_1));
        this.load.image(AssetsEnum.BULLET_DARK_1_OUTLINE, makeAssetPath(AssetsEnum.BULLET_DARK_1_OUTLINE));
        this.load.image(AssetsEnum.BULLET_DARK_2, makeAssetPath(AssetsEnum.BULLET_DARK_2));
        this.load.image(AssetsEnum.BULLET_DARK_2_OUTLINE, makeAssetPath(AssetsEnum.BULLET_DARK_2_OUTLINE));
        this.load.image(AssetsEnum.BULLET_DARK_3, makeAssetPath(AssetsEnum.BULLET_DARK_3));
        this.load.image(AssetsEnum.BULLET_DARK_3_OUTLINE, makeAssetPath(AssetsEnum.BULLET_DARK_3_OUTLINE));
        this.load.image(AssetsEnum.BULLET_GREEN_1, makeAssetPath(AssetsEnum.BULLET_GREEN_1));
        this.load.image(AssetsEnum.BULLET_GREEN_1_OUTLINE, makeAssetPath(AssetsEnum.BULLET_GREEN_1_OUTLINE));
        this.load.image(AssetsEnum.BULLET_GREEN_2, makeAssetPath(AssetsEnum.BULLET_GREEN_2));
        this.load.image(AssetsEnum.BULLET_GREEN_2_OUTLINE, makeAssetPath(AssetsEnum.BULLET_GREEN_2_OUTLINE));
        this.load.image(AssetsEnum.BULLET_GREEN_3, makeAssetPath(AssetsEnum.BULLET_GREEN_3));
        this.load.image(AssetsEnum.BULLET_GREEN_3_OUTLINE, makeAssetPath(AssetsEnum.BULLET_GREEN_3_OUTLINE));
        this.load.image(AssetsEnum.BULLET_RED_1, makeAssetPath(AssetsEnum.BULLET_RED_1));
        this.load.image(AssetsEnum.BULLET_RED_1_OUTLINE, makeAssetPath(AssetsEnum.BULLET_RED_1_OUTLINE));
        this.load.image(AssetsEnum.BULLET_RED_2, makeAssetPath(AssetsEnum.BULLET_RED_2));
        this.load.image(AssetsEnum.BULLET_RED_2_OUTLINE, makeAssetPath(AssetsEnum.BULLET_RED_2_OUTLINE));
        this.load.image(AssetsEnum.BULLET_RED_3, makeAssetPath(AssetsEnum.BULLET_RED_3));
        this.load.image(AssetsEnum.BULLET_RED_3_OUTLINE, makeAssetPath(AssetsEnum.BULLET_RED_3_OUTLINE));
        this.load.image(AssetsEnum.BULLET_SAND_1, makeAssetPath(AssetsEnum.BULLET_SAND_1));
        this.load.image(AssetsEnum.BULLET_SAND_1_OUTLINE, makeAssetPath(AssetsEnum.BULLET_SAND_1_OUTLINE));
        this.load.image(AssetsEnum.BULLET_SAND_2, makeAssetPath(AssetsEnum.BULLET_SAND_2));
        this.load.image(AssetsEnum.BULLET_SAND_2_OUTLINE, makeAssetPath(AssetsEnum.BULLET_SAND_2_OUTLINE));
        this.load.image(AssetsEnum.BULLET_SAND_3, makeAssetPath(AssetsEnum.BULLET_SAND_3));
        this.load.image(AssetsEnum.BULLET_SAND_3_OUTLINE, makeAssetPath(AssetsEnum.BULLET_SAND_3_OUTLINE));
        this.load.image(AssetsEnum.CRATE_METAL, makeAssetPath(AssetsEnum.CRATE_METAL));
        this.load.image(AssetsEnum.CRATE_METAL_SIDE, makeAssetPath(AssetsEnum.CRATE_METAL_SIDE));
        this.load.image(AssetsEnum.CRATE_WOOD, makeAssetPath(AssetsEnum.CRATE_WOOD));
        this.load.image(AssetsEnum.CRATE_WOOD_SIDE, makeAssetPath(AssetsEnum.CRATE_WOOD_SIDE));
        this.load.image(AssetsEnum.EXPLOSION_1, makeAssetPath(AssetsEnum.EXPLOSION_1));
        this.load.image(AssetsEnum.EXPLOSION_2, makeAssetPath(AssetsEnum.EXPLOSION_2));
        this.load.image(AssetsEnum.EXPLOSION_3, makeAssetPath(AssetsEnum.EXPLOSION_3));
        this.load.image(AssetsEnum.EXPLOSION_4, makeAssetPath(AssetsEnum.EXPLOSION_4));
        this.load.image(AssetsEnum.EXPLOSION_5, makeAssetPath(AssetsEnum.EXPLOSION_5));
        this.load.image(AssetsEnum.EXPLOSION_SMOKE_1, makeAssetPath(AssetsEnum.EXPLOSION_SMOKE_1));
        this.load.image(AssetsEnum.EXPLOSION_SMOKE_2, makeAssetPath(AssetsEnum.EXPLOSION_SMOKE_2));
        this.load.image(AssetsEnum.EXPLOSION_SMOKE_3, makeAssetPath(AssetsEnum.EXPLOSION_SMOKE_3));
        this.load.image(AssetsEnum.EXPLOSION_SMOKE_4, makeAssetPath(AssetsEnum.EXPLOSION_SMOKE_4));
        this.load.image(AssetsEnum.EXPLOSION_SMOKE_5, makeAssetPath(AssetsEnum.EXPLOSION_SMOKE_5));
        this.load.image(AssetsEnum.FENCE_RED, makeAssetPath(AssetsEnum.FENCE_RED));
        this.load.image(AssetsEnum.FENCE_YELLOW, makeAssetPath(AssetsEnum.FENCE_YELLOW));
        this.load.image(AssetsEnum.OIL_SPILL_LARGE, makeAssetPath(AssetsEnum.OIL_SPILL_LARGE));
        this.load.image(AssetsEnum.OIL_SPILL_SMALL, makeAssetPath(AssetsEnum.OIL_SPILL_SMALL));
        this.load.image(AssetsEnum.SANDBAG_BEIGE, makeAssetPath(AssetsEnum.SANDBAG_BEIGE));
        this.load.image(AssetsEnum.SANDBAG_BEIGE_OPEN, makeAssetPath(AssetsEnum.SANDBAG_BEIGE_OPEN));
        this.load.image(AssetsEnum.SANDBAG_BROWN, makeAssetPath(AssetsEnum.SANDBAG_BROWN));
        this.load.image(AssetsEnum.SANDBAG_BROWN_OPEN, makeAssetPath(AssetsEnum.SANDBAG_BROWN_OPEN));
        this.load.image(AssetsEnum.SHOT_LARGE, makeAssetPath(AssetsEnum.SHOT_LARGE));
        this.load.image(AssetsEnum.SHOT_ORANGE, makeAssetPath(AssetsEnum.SHOT_ORANGE));
        this.load.image(AssetsEnum.SHOT_RED, makeAssetPath(AssetsEnum.SHOT_RED));
        this.load.image(AssetsEnum.SHOT_THIN, makeAssetPath(AssetsEnum.SHOT_THIN));
        this.load.image(AssetsEnum.SPECIAL_BARREL_1, makeAssetPath(AssetsEnum.SPECIAL_BARREL_1));
        this.load.image(AssetsEnum.SPECIAL_BARREL_1_OUTLINE, makeAssetPath(AssetsEnum.SPECIAL_BARREL_1_OUTLINE));
        this.load.image(AssetsEnum.SPECIAL_BARREL_2, makeAssetPath(AssetsEnum.SPECIAL_BARREL_2));
        this.load.image(AssetsEnum.SPECIAL_BARREL_2_OUTLINE, makeAssetPath(AssetsEnum.SPECIAL_BARREL_2_OUTLINE));
        this.load.image(AssetsEnum.SPECIAL_BARREL_3, makeAssetPath(AssetsEnum.SPECIAL_BARREL_3));
        this.load.image(AssetsEnum.SPECIAL_BARREL_3_OUTLINE, makeAssetPath(AssetsEnum.SPECIAL_BARREL_3_OUTLINE));
        this.load.image(AssetsEnum.SPECIAL_BARREL_4, makeAssetPath(AssetsEnum.SPECIAL_BARREL_4));
        this.load.image(AssetsEnum.SPECIAL_BARREL_4_OUTLINE, makeAssetPath(AssetsEnum.SPECIAL_BARREL_4_OUTLINE));
        this.load.image(AssetsEnum.SPECIAL_BARREL_5, makeAssetPath(AssetsEnum.SPECIAL_BARREL_5));
        this.load.image(AssetsEnum.SPECIAL_BARREL_5_OUTLINE, makeAssetPath(AssetsEnum.SPECIAL_BARREL_5_OUTLINE));
        this.load.image(AssetsEnum.SPECIAL_BARREL_6, makeAssetPath(AssetsEnum.SPECIAL_BARREL_6));
        this.load.image(AssetsEnum.SPECIAL_BARREL_6_OUTLINE, makeAssetPath(AssetsEnum.SPECIAL_BARREL_6_OUTLINE));
        this.load.image(AssetsEnum.SPECIAL_BARREL_7, makeAssetPath(AssetsEnum.SPECIAL_BARREL_7));
        this.load.image(AssetsEnum.SPECIAL_BARREL_7_OUTLINE, makeAssetPath(AssetsEnum.SPECIAL_BARREL_7_OUTLINE));
        this.load.image(AssetsEnum.TANK_BLUE_BARREL_1, makeAssetPath(AssetsEnum.TANK_BLUE_BARREL_1));
        this.load.image(AssetsEnum.TANK_BLUE_BARREL_1_OUTLINE, makeAssetPath(AssetsEnum.TANK_BLUE_BARREL_1_OUTLINE));
        this.load.image(AssetsEnum.TANK_BLUE_BARREL_2, makeAssetPath(AssetsEnum.TANK_BLUE_BARREL_2));
        this.load.image(AssetsEnum.TANK_BLUE_BARREL_2_OUTLINE, makeAssetPath(AssetsEnum.TANK_BLUE_BARREL_2_OUTLINE));
        this.load.image(AssetsEnum.TANK_BLUE_BARREL_3, makeAssetPath(AssetsEnum.TANK_BLUE_BARREL_3));
        this.load.image(AssetsEnum.TANK_BLUE_BARREL_3_OUTLINE, makeAssetPath(AssetsEnum.TANK_BLUE_BARREL_3_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_BIG_RED, makeAssetPath(AssetsEnum.TANK_BODY_BIG_RED));
        this.load.image(AssetsEnum.TANK_BODY_BIG_RED_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_BIG_RED_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_BLUE, makeAssetPath(AssetsEnum.TANK_BODY_BLUE));
        this.load.image(AssetsEnum.TANK_BODY_BLUE_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_BLUE_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_DARK, makeAssetPath(AssetsEnum.TANK_BODY_DARK));
        this.load.image(AssetsEnum.TANK_BODY_DARK_LARGE, makeAssetPath(AssetsEnum.TANK_BODY_DARK_LARGE));
        this.load.image(AssetsEnum.TANK_BODY_DARK_LARGE_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_DARK_LARGE_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_DARK_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_DARK_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_GREEN, makeAssetPath(AssetsEnum.TANK_BODY_GREEN));
        this.load.image(AssetsEnum.TANK_BODY_GREEN_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_GREEN_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_HUGE, makeAssetPath(AssetsEnum.TANK_BODY_HUGE));
        this.load.image(AssetsEnum.TANK_BODY_HUGE_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_HUGE_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_RED, makeAssetPath(AssetsEnum.TANK_BODY_RED));
        this.load.image(AssetsEnum.TANK_BODY_RED_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_RED_OUTLINE));
        this.load.image(AssetsEnum.TANK_BODY_SAND, makeAssetPath(AssetsEnum.TANK_BODY_SAND));
        this.load.image(AssetsEnum.TANK_BODY_SAND_OUTLINE, makeAssetPath(AssetsEnum.TANK_BODY_SAND_OUTLINE));
        this.load.image(AssetsEnum.TANK_DARK_BARREL_1, makeAssetPath(AssetsEnum.TANK_DARK_BARREL_1));
        this.load.image(AssetsEnum.TANK_DARK_BARREL_1_OUTLINE, makeAssetPath(AssetsEnum.TANK_DARK_BARREL_1_OUTLINE));
        this.load.image(AssetsEnum.TANK_DARK_BARREL_2, makeAssetPath(AssetsEnum.TANK_DARK_BARREL_2));
        this.load.image(AssetsEnum.TANK_DARK_BARREL_2_OUTLINE, makeAssetPath(AssetsEnum.TANK_DARK_BARREL_2_OUTLINE));
        this.load.image(AssetsEnum.TANK_DARK_BARREL_3, makeAssetPath(AssetsEnum.TANK_DARK_BARREL_3));
        this.load.image(AssetsEnum.TANK_DARK_BARREL_3_OUTLINE, makeAssetPath(AssetsEnum.TANK_DARK_BARREL_3_OUTLINE));
        this.load.image(AssetsEnum.TANK_GREEN_BARREL_1, makeAssetPath(AssetsEnum.TANK_GREEN_BARREL_1));
        this.load.image(AssetsEnum.TANK_GREEN_BARREL_1_OUTLINE, makeAssetPath(AssetsEnum.TANK_GREEN_BARREL_1_OUTLINE));
        this.load.image(AssetsEnum.TANK_GREEN_BARREL_2, makeAssetPath(AssetsEnum.TANK_GREEN_BARREL_2));
        this.load.image(AssetsEnum.TANK_GREEN_BARREL_2_OUTLINE, makeAssetPath(AssetsEnum.TANK_GREEN_BARREL_2_OUTLINE));
        this.load.image(AssetsEnum.TANK_GREEN_BARREL_3, makeAssetPath(AssetsEnum.TANK_GREEN_BARREL_3));
        this.load.image(AssetsEnum.TANK_GREEN_BARREL_3_OUTLINE, makeAssetPath(AssetsEnum.TANK_GREEN_BARREL_3_OUTLINE));
        this.load.image(AssetsEnum.TANK_RED_BARREL_1, makeAssetPath(AssetsEnum.TANK_RED_BARREL_1));
        this.load.image(AssetsEnum.TANK_RED_BARREL_1_OUTLINE, makeAssetPath(AssetsEnum.TANK_RED_BARREL_1_OUTLINE));
        this.load.image(AssetsEnum.TANK_RED_BARREL_2, makeAssetPath(AssetsEnum.TANK_RED_BARREL_2));
        this.load.image(AssetsEnum.TANK_RED_BARREL_2_OUTLINE, makeAssetPath(AssetsEnum.TANK_RED_BARREL_2_OUTLINE));
        this.load.image(AssetsEnum.TANK_RED_BARREL_3, makeAssetPath(AssetsEnum.TANK_RED_BARREL_3));
        this.load.image(AssetsEnum.TANK_RED_BARREL_3_OUTLINE, makeAssetPath(AssetsEnum.TANK_RED_BARREL_3_OUTLINE));
        this.load.image(AssetsEnum.TANK_SAND_BARREL_1, makeAssetPath(AssetsEnum.TANK_SAND_BARREL_1));
        this.load.image(AssetsEnum.TANK_SAND_BARREL_1_OUTLINE, makeAssetPath(AssetsEnum.TANK_SAND_BARREL_1_OUTLINE));
        this.load.image(AssetsEnum.TANK_SAND_BARREL_2, makeAssetPath(AssetsEnum.TANK_SAND_BARREL_2));
        this.load.image(AssetsEnum.TANK_SAND_BARREL_2_OUTLINE, makeAssetPath(AssetsEnum.TANK_SAND_BARREL_2_OUTLINE));
        this.load.image(AssetsEnum.TANK_SAND_BARREL_3, makeAssetPath(AssetsEnum.TANK_SAND_BARREL_3));
        this.load.image(AssetsEnum.TANK_SAND_BARREL_3_OUTLINE, makeAssetPath(AssetsEnum.TANK_SAND_BARREL_3_OUTLINE));
        this.load.image(AssetsEnum.TANK_BIG_RED, makeAssetPath(AssetsEnum.TANK_BIG_RED));
        this.load.image(AssetsEnum.TANK_BLUE, makeAssetPath(AssetsEnum.TANK_BLUE));
        this.load.image(AssetsEnum.TANK_DARK, makeAssetPath(AssetsEnum.TANK_DARK));
        this.load.image(AssetsEnum.TANK_DARK_LARGE, makeAssetPath(AssetsEnum.TANK_DARK_LARGE));
        this.load.image(AssetsEnum.TANK_GREEN, makeAssetPath(AssetsEnum.TANK_GREEN));
        this.load.image(AssetsEnum.TANK_HUGE, makeAssetPath(AssetsEnum.TANK_HUGE));
        this.load.image(AssetsEnum.TANK_RED, makeAssetPath(AssetsEnum.TANK_RED));
        this.load.image(AssetsEnum.TANK_SAND, makeAssetPath(AssetsEnum.TANK_SAND));
        this.load.image(AssetsEnum.TILE_GRASS_1, makeAssetPath(AssetsEnum.TILE_GRASS_1));
        this.load.image(AssetsEnum.TILE_GRASS_2, makeAssetPath(AssetsEnum.TILE_GRASS_2));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_CORNER_LL, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_CORNER_LL));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_CORNER_LR, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_CORNER_LR));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_CORNER_UL, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_CORNER_UL));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_CORNER_UR, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_CORNER_UR));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_CROSSING, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_CROSSING));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_CROSSING_ROUND, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_CROSSING_ROUND));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_EAST, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_EAST));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_NORTH, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_NORTH));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_SPLIT_E, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_SPLIT_E));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_SPLIT_N, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_SPLIT_N));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_SPLIT_S, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_SPLIT_S));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_SPLIT_W, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_SPLIT_W));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_E, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_E));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_E_DIRT, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_E_DIRT));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_N, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_N));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_N_DIRT, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_N_DIRT));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_S, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_S));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_S_DIRT, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_S_DIRT));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_W, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_W));
        this.load.image(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_W_DIRT, makeAssetPath(AssetsEnum.TILE_GRASS_ROAD_TRANSITION_W_DIRT));
        this.load.image(AssetsEnum.TILE_GRASS_TRANSITION_E, makeAssetPath(AssetsEnum.TILE_GRASS_TRANSITION_E));
        this.load.image(AssetsEnum.TILE_GRASS_TRANSITION_N, makeAssetPath(AssetsEnum.TILE_GRASS_TRANSITION_N));
        this.load.image(AssetsEnum.TILE_GRASS_TRANSITION_S, makeAssetPath(AssetsEnum.TILE_GRASS_TRANSITION_S));
        this.load.image(AssetsEnum.TILE_GRASS_TRANSITION_W, makeAssetPath(AssetsEnum.TILE_GRASS_TRANSITION_W));
        this.load.image(AssetsEnum.TILE_SAND_1, makeAssetPath(AssetsEnum.TILE_SAND_1));
        this.load.image(AssetsEnum.TILE_SAND_2, makeAssetPath(AssetsEnum.TILE_SAND_2));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_CORNER_LL, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_CORNER_LL));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_CORNER_LR, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_CORNER_LR));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_CORNER_UL, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_CORNER_UL));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_CORNER_UR, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_CORNER_UR));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_CROSSING, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_CROSSING));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_CROSSING_ROUND, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_CROSSING_ROUND));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_EAST, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_EAST));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_NORTH, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_NORTH));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_SPLIT_E, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_SPLIT_E));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_SPLIT_N, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_SPLIT_N));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_SPLIT_S, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_SPLIT_S));
        this.load.image(AssetsEnum.TILE_SAND_ROAD_SPLIT_W, makeAssetPath(AssetsEnum.TILE_SAND_ROAD_SPLIT_W));
        this.load.image(AssetsEnum.TRACKS_DOUBLE, makeAssetPath(AssetsEnum.TRACKS_DOUBLE));
        this.load.image(AssetsEnum.TRACKS_LARGE, makeAssetPath(AssetsEnum.TRACKS_LARGE));
        this.load.image(AssetsEnum.TRACKS_SMALL, makeAssetPath(AssetsEnum.TRACKS_SMALL));
        this.load.image(AssetsEnum.TREE_BROWN_LARGE, makeAssetPath(AssetsEnum.TREE_BROWN_LARGE));
        this.load.image(AssetsEnum.TREE_BROWN_LEAF, makeAssetPath(AssetsEnum.TREE_BROWN_LEAF));
        this.load.image(AssetsEnum.TREE_BROWN_SMALL, makeAssetPath(AssetsEnum.TREE_BROWN_SMALL));
        this.load.image(AssetsEnum.TREE_BROWN_TWIGS, makeAssetPath(AssetsEnum.TREE_BROWN_TWIGS));
        this.load.image(AssetsEnum.TREE_GREEN_LARGE, makeAssetPath(AssetsEnum.TREE_GREEN_LARGE));
        this.load.image(AssetsEnum.TREE_GREEN_LEAF, makeAssetPath(AssetsEnum.TREE_GREEN_LEAF));
        this.load.image(AssetsEnum.TREE_GREEN_SMALL, makeAssetPath(AssetsEnum.TREE_GREEN_SMALL));
        this.load.image(AssetsEnum.TREE_GREEN_TWIGS, makeAssetPath(AssetsEnum.TREE_GREEN_TWIGS));
        this.load.image(AssetsEnum.WIRE_CROOKED, makeAssetPath(AssetsEnum.WIRE_CROOKED));
        this.load.image(AssetsEnum.WIRE_STRAIGHT, makeAssetPath(AssetsEnum.WIRE_STRAIGHT));
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}

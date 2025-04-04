import { Component, Input, OnInit } from "@angular/core";
import Phaser from "phaser";
import StartGame from "./main";
import { PhaserAngularEventBus } from "./PhaserAngularEventBus";

@Component({
    selector: 'phaser-game',
    template: '<div id="game-container"></div>',
    standalone: true,
})
export class PhaserGame implements OnInit
{

    scene: Phaser.Scene;
    game: Phaser.Game;

    sceneCallback: (scene: Phaser.Scene) => void;

    ngOnInit()
    {
        this.game = StartGame('game-container');

        PhaserAngularEventBus.on('current-scene-ready', (scene: Phaser.Scene) => {

            this.scene = scene;

            if (this.sceneCallback)
            {

                this.sceneCallback(scene);

            }

        });
    }

    // Component unmounted
    ngOnDestroy()
    {

        if (this.game)
        {

            this.game.destroy(true);

        }
    }
}

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PhaserGame } from '../game/phaser-game.component';
import { MainMenu } from '../game/scenes/MainMenu';
import { CommonModule } from '@angular/common';
import { EventBus } from '../game/EventBus';
import { AssetsEnum } from './constants/assets-enum';
import { Game } from '../game/scenes/Game';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, PhaserGame],
    templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {

    public spritePosition = { x: 0, y: 0 };
    public canMoveSprite = false;

    // This is a reference from the PhaserGame component
    @ViewChild(PhaserGame) phaserRef!: PhaserGame;

    ngAfterViewInit() {
        EventBus.on('current-scene-ready', (scene: Phaser.Scene) => {
            this.canMoveSprite = scene.scene.key !== 'MainMenu';
        });
    }
}

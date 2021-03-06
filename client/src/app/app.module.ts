import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Ng4LoadingSpinnerModule } from "ng4-loading-spinner";
import { ToastrModule } from "ngx-toastr";
import { AdminViewComponent } from "./admin-view/admin-view.component";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CreateGameFreeViewComponent } from "./create-game-free-view/create-game-free-view.component";
import { CreateGameSimpleViewComponent } from "./create-game-simple-view/create-game-simple-view.component";
import { EndGameComponent } from "./end-game/end-game.component";
import { GameViewFreeComponent } from "./game-view-free/game-view-free.component";
import { GameViewSimpleComponent } from "./game-view-simple/game-view-simple.component";
import { GamesCardViewComponent } from "./games-card-view/games-card-view.component";
import { GamesListViewComponent } from "./games-list-view/games-list-view.component";
import { InitialViewComponent } from "./initial-view/initial-view.component";
import { GameCardLoaderService } from "./services/gameCard/gameCardLoader.service";
import { WaitingViewComponent } from "./waiting-view/waiting-view.component";

@NgModule({
    declarations: [
        AppComponent,
        InitialViewComponent,
        AdminViewComponent,
        CreateGameSimpleViewComponent,
        GamesCardViewComponent,
        GamesListViewComponent,
        GameViewSimpleComponent,
        CreateGameFreeViewComponent,
        GameViewFreeComponent,
        WaitingViewComponent,
        EndGameComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        Ng4LoadingSpinnerModule.forRoot(),
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
    ],
    providers: [InitialViewComponent, GameCardLoaderService],
    bootstrap: [AppComponent],
    entryComponents: [GamesCardViewComponent],
})
export class AppModule { }

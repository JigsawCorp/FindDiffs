import { Component, HostListener } from "@angular/core";
import { Message } from "../../../../common/communication/message";
import { InitialViewService } from "../initial-view.service";

@Component({
  selector: "app-initial-view",
  templateUrl: "./initial-view.component.html",
  styleUrls: ["./initial-view.component.css"],
})
export class InitialViewComponent {

  public constructor(public initialViewService: InitialViewService) { }
  public title: string = "Spot the Differences";
  public button: string = "Accept";

  public verifyUsername(): void {
    const username: string = (document.getElementById("usernameInput") as HTMLInputElement).value;

    console.log("sending Username");
    this.socketService.sendUsername(username);

    console.log("waiting for the event................................................");
    this.socketService.validationInfo();

    // this.initialViewService.getUsernameValidation(username).subscribe(this.correctUsername);
  }

  @HostListener("window:unload") public UnloadHander(): void {
    const user: string = JSON.parse(localStorage.getItem("user") || "{}");
    this.initialViewService.getDeleteUsername(user).subscribe();
  }
  public correctUsername(message: Message): void {
    console.log("============================================================");
    console.log("tryin to enter correctUsername function!!!");
    if (message != null) {
      console.log("entered in if of correctUsername!!");
      // localStorage.setItem("user", message.body);
      // this.socketService.sendUsername(message.body);
    }
    console.log("=============================================================");
  }
}

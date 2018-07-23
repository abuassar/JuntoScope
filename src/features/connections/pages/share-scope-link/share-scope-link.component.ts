import { Component, OnInit, Input } from "@angular/core";

import { NavParams, NavController } from "ionic-angular";

import { PopupService } from "../../../../shared/popup.service";
import { DashboardComponent } from "../../../dashboard/pages/dashboard/dashboard.component";
import { SessionScopingComponent } from "../../../scoping/pages/session-scoping/session-scoping.component";

@Component({
  selector: "app-share-scope-link",
  templateUrl: "./share-scope-link.component.html"
})
export class ShareScopeLinkComponent implements OnInit {
  connectionName;
  projectName;
  sessionUrl;
  accessCode;

  constructor(
    private params: NavParams,
    private popupSvc: PopupService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.connectionName = this.params.data.connectionName;
    this.projectName = this.params.data.projectName;
    this.sessionUrl = this.params.data.sessionUrl;
    this.accessCode = this.params.data.accessCode;
  }

  startScoping() {
    console.log("Going scoping");
    this.popupSvc.closeModal();
    // this.routerFacade.navigate({ path: [`/scoping/${this.sessionUrl}`] });
    this.navCtrl.push(SessionScopingComponent, { sessionUrl: this.sessionUrl });
  }

  goDashboard() {
    this.popupSvc.closeModal();
    // this.routerFacade.navigate({
    //   path: ["/dashboard"]
    // });
    this.navCtrl.push(DashboardComponent);
  }
}
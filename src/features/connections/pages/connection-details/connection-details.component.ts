import { Component, OnInit } from "@angular/core";
import { RouterFacade } from "../../../../store/router.facade";

import { take } from "rxjs/operators";
import { Observable } from "@firebase/util";
import { Connection } from "../../../../models/connection";
import { ConnectionFacade } from "../../store/connection.facade";

@Component({
  selector: "app-connection-details",
  templateUrl: "./connection-details.component.html",
  styleUrls: ["./connection-details.component.scss"]
})
export class ConnectionDetailsComponent implements OnInit {
  params$ = this.routerFacade.params$;
  connection: Connection;

  constructor(
    private routerFacade: RouterFacade,
    private connectionFacade: ConnectionFacade
  ) {}

  ngOnInit() {
    this.connectionFacade.getConnections();
    this.params$.pipe(take(1)).subscribe(params => {
      this.connectionFacade.connections$.subscribe(
        (connections: Connection[]) => {
          if (connections) {
            this.connection = connections.filter(
              c => c.id === params.connectionId
            )[0];
          }
        }
      );
    });
  }
}

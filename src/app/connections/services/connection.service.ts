import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AngularFirestore } from 'angularfire2/firestore';

import { switchMap, map, tap, catchError } from 'rxjs/operators';

import * as _ from 'lodash';

import { environment } from '@env/environment';
import { Project } from '@models/project';
import { TaskList } from '@models/task-list';
import { Connection } from '@models/connection';
import { AppFacade } from '@app/state/app.facade';

@Injectable()
export class ConnectionService {
  constructor(
    private appFacade: AppFacade,
    private afs: AngularFirestore,
    private http: HttpClient
  ) {}

  addConnection(connection: Connection) {
    return this.http.post(`${environment.apiBaseUrl}/connections`, connection);
  }

  getProjects(connectionId: string) {
    return this.http
      .get<{ projects: Project[] }>(
        `${environment.apiBaseUrl}/connections/${connectionId}/projects/`
      )
      .pipe(map(response => _.keyBy(response.projects, 'id')));
  }

  getTaskLists(connectionId: string, projectId: string) {
    return this.http
      .get<{ taskLists: TaskList[] }>(
        `${
          environment.apiBaseUrl
        }/connections/${connectionId}/projects/${projectId}/taskLists`
      )
      .pipe(map(response => _.keyBy(response.taskLists, 'id')));
  }

  getConnections() {
    return this.appFacade.connectionsClnPath$.pipe(
      switchMap(clnPath => this.afs.collection(clnPath).stateChanges())
    );
  }
}

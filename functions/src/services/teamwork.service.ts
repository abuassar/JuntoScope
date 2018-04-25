import * as request from 'request-promise-native';

export class TeamworkService {
  validateToken(token: string) {
    const uri = 'https://authenticate.teamwork.com/authenticate.json';
    const headers = this.getReqHeaders(token);

    const options: request.OptionsWithUri = {
      uri,
      method: 'GET',
      headers,
      json: true,
    };

    return request(options)
      .then(response => {
        const { account } = response;

        return {
          id: account.id,
          baseUrl: account.URL,
          userId: account.userId,
          name: `${account.firstname} ${account.lastname}`,
          company: account.companyname,
          companyId: account.companyid,
        };
      })
      .catch(error => { throw new Error('Unable to authenticate with Teamwork. Please verify your token and try again later.') });
  }

  getProjects(token: string, baseUrl: string) {
    const uri = `${baseUrl}projects.json`;
    const headers = this.getReqHeaders(token);
    
    const options: request.OptionsWithUri = {
      uri,
      method: 'GET',
      headers,
      json: true
    };

    return request(options)
      .then(response => {
        const projects = response.projects;

        return {
          projects: projects.map(
            p => {
              return {
                id: p.id,
                name: p.name,
                description: p.description,
                created: p['created-on']
              };
            }
          )
        };
      })
      .catch(error => { throw new Error('Unable to get projects from Teamwork. Please verify your token and  try again later.') });
  }

  async getTaskLists(token: string, projectId: string, page: number) {
    let authData;
    try {
      authData = await this.validateToken(token);
      const uri = `${authData.baseUrl}projects/${projectId}/tasklists.json?page=${page}`;
      const headers = this.getReqHeaders(token);
      
      const options: request.OptionsWithUri = {
        uri,
        method: 'GET',
        headers,
        json: true,
        resolveWithFullResponse: true,
      };

      return request(options)
        .then(response => {
          const tasklists = response.body.tasklists;
          const responseHeaders = response.headers;

          return {
            page: responseHeaders['x-page'],
            pages: responseHeaders['x-pages'],
            tasklists: tasklists.map(
              t => {
                return {
                  id: t.id,
                  name: t.name,
                  description: t.description
                };
              }
            )
          };
        })
        .catch(error => { throw new Error('Unable to get task lists from Teamwork. Please verify your token and project id and  try again later.') });
    } catch (error) {
      throw error;
    }
  }

  async getTasks(token: string, tasklistId: string) {
    try {
      const tasksData = await this.getTasksData(token, tasklistId, 1);
      let tasks = tasksData.tasks;

      if (tasksData.pages > 1) {
        let taskPromises = [];
        for (var i = 2; i <= tasksData.pages; i++) {
          taskPromises.push(this.getTasksData(token, tasklistId, 1));
        };
        const moreTasksData = await Promise.all(taskPromises);
        moreTasksData.map(
          t => {
            tasks = tasks.concat(t.tasks);
          }
        );
      }

      const tasksTree = tasks.filter(t => t.parent == '');
      this.fillChildTasks(tasksTree, tasks);
      
      return tasksTree;
      
    } catch (error) {
      throw error;
    }
  }

  private fillChildTasks(tasks, allTasks) {
    tasks.map(
      t => {
        t.childTasks = allTasks.filter(c => c.parent == t.id);
        if(t.childTasks.length > 0) {
          this.fillChildTasks(t.childTasks, allTasks);
        } 
      }
    );
  }

  private async getTasksData(token: string, tasklistId: string, page: number) {
    let authData;
    try {
      authData = await this.validateToken(token);
      const uri = `${authData.baseUrl}tasklists/${tasklistId}/tasks.json?page=${page}`;
      const headers = this.getReqHeaders(token);
      
      const options: request.OptionsWithUri = {
        uri,
        method: 'GET',
        headers,
        json: true,
        resolveWithFullResponse: true,
      };

      return request(options)
        .then(response => {
          const tasks = response.body['todo-items'];
          const responseHeaders = response.headers;

          return {
            page: responseHeaders['x-page'],
            pages: responseHeaders['x-pages'],
            tasks: tasks.map(
              t => {
                const estimatedHours = +t['estimated-minutes']/60;
                return {
                  id: t.id,
                  name: t.content,
                  description: t.description,
                  parent: t.parentTaskId,
                  estimation: estimatedHours
                };
              }
            )
          };
        })
        .catch(error => { throw new Error('Unable to get tasks from Teamwork. Please verify your token and task list id and try again later.') });
    } catch (error) {
      throw error;
    }
  }

  async getTask(token: string, taskId: string) {
    let authData;
    try {
      authData = await this.validateToken(token);
      const uri = `${authData.baseUrl}tasks/${taskId}.json`;
      const headers = this.getReqHeaders(token);
      
      const options: request.OptionsWithUri = {
        uri,
        method: 'GET',
        headers,
        json: true
      };

      return request(options)
        .then(response => {
          const task = response['todo-item'];
          const estimatedHours = +task['estimated-minutes']/60;
                
          return {
            id: task.id,
            name: task.content,
            description: task.description,
            parent: task.parentTaskId,
            estimation: estimatedHours
          };
        })
        .catch(error => { throw new Error('Unable to get task from Teamwork. Please verify your token and task id and try again later.') });
    } catch (error) {
      throw error;
    }
  }

  async putEstimation(token: string, taskId: string, hours: number) {
    let authData;
    try {
      authData = await this.validateToken(token);
      const uri = `${authData.baseUrl}tasks/${taskId}.json`;
      const headers = this.getReqHeaders(token);
      
      const estimatedMinutes = hours*60;
      const options: request.OptionsWithUri = {
        uri,
        method: 'PUT',
        headers,
        json: true,
        body: {
          'todo-item': {
            'estimated-minutes': `${estimatedMinutes}`
          }
        }
      };

      return request(options)
        .then(response => {
          return true;
        })
        .catch(error => { throw new Error('Unable to update task on Teamwork. Please verify your token and task id try again later.') });
    } catch (error) {
      throw error;
    }
  }

  private getReqHeaders(token: string) {
    const encodedToken = new Buffer(`${token}:X`).toString('base64');
    return {
      'Content-Type': 'application/json',
      Authorization: `BASIC ${encodedToken}`,
    };
  }
}

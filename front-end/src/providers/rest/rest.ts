import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class RestProvider {

  apiUrl: any = "https://kingtirebuffalo.com/server/";
  noSql: any = "http://localhost:3000/";
  authToken: any;
  user: any;
  
  constructor(public http: HttpClient) {
  }

  getNodes(parentId?: any)
  {
    return new Promise((resolve, reject) => {
      this.http.get(this.noSql+'api/hello?parentId='+parentId, {})
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  addNode(data: any) {
    return new Promise((resolve, reject) => {
      this.http.post(this.noSql+'api/hello',data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  updateNode(data: any) {
    return new Promise((resolve, reject) => {
      this.http.patch(this.noSql+'api/hello',data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  delNode(id: any) {
    let httpParams = new HttpParams().set('node_id', id);
    let options = { body: httpParams };
    return new Promise((resolve, reject) => {
      this.http.delete(this.noSql+'api/hello',options)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
}

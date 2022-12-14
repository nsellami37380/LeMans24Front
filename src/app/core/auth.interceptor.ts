import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const tokenkId = localStorage.getItem("tokenId")
    console.log("Mon token " + tokenkId);

    if(tokenkId){

      const cloned = request.clone({
        headers: request.headers.set(
          "Authorization",
          "Bearer " + tokenkId
        )
      });

      return next.handle(cloned)
      .pipe(
        catchError((err:HttpErrorResponse) =>{
          if(err.status === 401){
            if(err.error.is_token_expired) {
              return throwError(() => new Error("Vous avez été déconnecté"));
            } 
          }
          if(err.status === 403){
            return throwError(()=> new Error ("Pas autorisé car il manque les infos de connexion"))
          }
          return throwError(()=> new Error("Y'a un token mais aussi un probleme " + err.status + " " + err.message))
        })
      )


    }
    else{
      return  next.handle(request)
      .pipe(
        catchError((err:HttpErrorResponse) =>{
          return throwError(()=> new Error ("Pas de token fourni"))
        }
        )
      )
    }

  }
}

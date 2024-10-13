import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, mergeMap, Observable, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthStatus, CheckTokenResponse, LoginResponse, RegisterBody, RegisterResponse, User } from '../interfaces/auth';


@Injectable({
    providedIn: 'root'
})

export class AuthService {

    private readonly apiUrl: string = environment.apiUrl;
    private http = inject( HttpClient );

    private _currentUser = signal<User|null>(null);
    private _authStatus = signal<AuthStatus>(AuthStatus.checking);

    public currentUser = computed( () => this._currentUser() );
    public authStatus = computed( () => this._authStatus() );

    constructor() {
        this.checkAuthStatus().subscribe();
    }

    private setAuthentication(user: User, token:string): boolean {

        this._currentUser.set( user );
        this._authStatus.set( AuthStatus.authenticated );
        localStorage.setItem('token', token);

        return true;
    }

    login(email: string, password: string): Observable<boolean> {
        const url = `${this.apiUrl}/auth/login`;
        const body = { email, password };

        return this.http.post<LoginResponse>( url, body )
        .pipe(
            map( ({ payload, token }) => this.setAuthentication( payload, token )),
            catchError( err => throwError( () => err.error.message ))
        );
    }

    checkAuthStatus(): Observable<boolean> {
        const url = `${this.apiUrl}/auth/check-token`;
        const token = localStorage.getItem('token');

        if ( !token ) {
            this.logout();
            return of( false );
        }

        const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`);

        return this.http.get<CheckTokenResponse>(url, { headers })
        .pipe(
            map( ({ payload, token }) => this.setAuthentication( payload, token )),
            catchError( () => {
                this._authStatus.set(AuthStatus.notAuthenticated);
                return of(false);
            })
        );
    }

    logout(): void {
        this._currentUser.set(null);
        this._authStatus.set(AuthStatus.notAuthenticated);
        localStorage.removeItem('token');
    }

    register(body: RegisterBody): Observable<RegisterBody> {
        const url = `${this.apiUrl}/usuarios/register`;

        return this.http.post<RegisterResponse>(url, body);

    }
}

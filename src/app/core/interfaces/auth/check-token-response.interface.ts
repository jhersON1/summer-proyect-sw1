export interface CheckTokenResponse {
    payload: UserCheckToken;
    token:   string;
}

export interface UserCheckToken {
    email:    string;
    nombre:   string;
    apellido: string;
}

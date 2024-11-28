export interface CheckTokenResponse {
    payload: UserCheckToken;
    token:   string;
}

export interface UserCheckToken {
    id: number;
    email:    string;
    nombre:   string;
    apellido: string;
}

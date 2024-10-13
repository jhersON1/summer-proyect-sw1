export interface LoginResponse {
    payload: User;
    token:   string;
}

export interface User {
    email:    string;
    nombre:   string;
    apellido: string;
}

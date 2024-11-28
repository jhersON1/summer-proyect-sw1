export interface LoginResponse {
    payload: User;
    token:   string;
}

export interface User {
    id: number;
    email:    string;
    nombre:   string;
    apellido: string;
}

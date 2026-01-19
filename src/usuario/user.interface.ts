export interface UserDto {
  codigoUsuario: string;
  nickUsuario: string;
  password: string;
  fechaRegistro: string;
  marcaBaja?: number;
  estado?: number;
  tipo?: number;
}

export interface LoginUserDto {
  username: string; // Puede ser nickUsuario o mailUsuario
  password: string;
}

export class LoginUserResponseDTO {
  status: number;
  username?: string;
  tipo?: number;
  token?: string;
  message?: string;
  dispositivo?: {
    codigo: number;
    descripcion: string;
    api_url: string;
  } | null;
}

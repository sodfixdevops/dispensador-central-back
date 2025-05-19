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

export interface LoginUserResponseDTO {
  username?: string;
  token?: string;
  tipo?: number;
  status: number;
  message?: string;
}

export interface LiacsCreateDto {
  liacsUsrn: string;
  liacsDisp: number;
  liacsNrip: string;
}

export interface LiacsInterface extends Partial<LiacsCreateDto> {
  liacsSeri?: number;
  liacsMrcb?: number;
  liacsFreg?: Date;
  liacsFult?: Date | null;
  liacsUact?: Date | null;
  liacsNrip?: string;
}

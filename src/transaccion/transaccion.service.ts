// src/transaccion/transaccion.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource } from 'typeorm';
import { RegistrarTransaccionDto } from './transaccion.interface';
import { Dptrn } from './dptrn.entity';
import { Dptrd } from './dptrd.entity';
import { DpsrlService } from 'src/serial/dpsrl.service';
import { Dpaut } from 'src/autorizacion/dpaut.entity';
import { Dpsrl } from 'src/serial/dpsrl.entity';
import { DesembolsoService } from 'src/desembolso/desembolso.service';
import { Dpdes } from 'src/desembolso/desembolso.entity';

@Injectable()
export class TransaccionService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly dpsrlService: DpsrlService,
  ) {}

  async registrarTransaccion(dto: RegistrarTransaccionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const now = new Date();
      const total = dto.detalle.reduce(
        (acc, d) => acc + d.gbcucyvlor * d.gbcucycant,
        0,
      );
      console.log(dto);
      const dptrn = new Dptrn();
      dptrn.dptrnndes = 0;
      dptrn.dptrncmon = dto.moneda;
      dptrn.dptrnftra = now;
      dptrn.dptrnimpo = total;
      dptrn.dptrnmrcb = 0;
      dptrn.dptrnstat = 1;
      dptrn.dptrnfreg = now;
      dptrn.dptrnusrn = dto.usuario;

      const trnInsert = await queryRunner.manager.save(Dptrn, dptrn);
      let item = 1;
      for (const det of dto.detalle.filter((d) => d.gbcucycant > 0)) {
        const dptrd = new Dptrd();
        dptrd.dptrdntra = trnInsert.dptrnntra;
        dptrd.dptrnitem = item++;
        dptrd.dptrdvlor = det.gbcucyvlor;
        dptrd.dptrdcant = det.gbcucycant;
        dptrd.dptrdimpo = det.gbcucyvlor * det.gbcucycant;
        //console.log('Insertando detalle:', dptrd);
        await queryRunner.manager.save(Dptrd, dptrd);
      }

      await queryRunner.commitTransaction();
      return { success: true, ntra: trnInsert.dptrnntra };
    } catch (error) {
      console.error('Error durante transacción:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error al registrar la transacción',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async solicitudDesembolso(
    usuarioSolicitante: string,
    dispositivo: number,
  ): Promise<{
    success: boolean;
    message: string;
    ndes?: number;
    cantidad?: number;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Paso 1: Obtener número de desembolso (serial)
      const dpsrlService = new DpsrlService(
        this.dataSource.getRepository(Dpsrl),
      ); // TODO: inyectar en versión final
      const serialRecolecta = await dpsrlService.incrementSerial('recolecta');
      const nroDesembolso = serialRecolecta.dpsrlSeri;

      // Paso 2: Obtener transacciones activas
      const transacciones = await queryRunner.manager.find(Dptrn, {
        where: { dptrnstat: 1 },
      });

      if (transacciones.length === 0) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: 'No hay transacciones activas para solicitud de desembolso.',
        };
      }

      // Paso 3: Calcular importe total
      const importeTotal = transacciones.reduce(
        (acc, trx) => acc + Number(trx.dptrnimpo || 0),
        0,
      );

      // Paso 4: Crear registro en tabla `dpdes`
      const desembolsoService = new DesembolsoService(
        this.dataSource.getRepository(Dpdes),
        this.dataSource,
      ); // TODO: inyectar en versión final

      await desembolsoService.crearDesembolsoTransaccional(
        {
          dpdesndes: nroDesembolso,
          dpdesfsol: new Date(),
          dpdesstat: 1,
          dpdesimpt: importeTotal,
          dpdesusrs: usuarioSolicitante,
          dpdesdisp: dispositivo,
          dpdesmrcb: 0,
        },
        queryRunner.manager,
      );

      // Paso 5: Actualizar transacciones
      for (const trx of transacciones) {
        trx.dptrnndes = nroDesembolso;
        trx.dptrnstat = 2;
        await queryRunner.manager.save(Dptrn, trx);
      }

      // Paso 6: Crear registro en dpaut
      const dpaut = queryRunner.manager.create(Dpaut, {
        dpautFsol: new Date(),
        dpautNdes: nroDesembolso,
        dpautUsrs: usuarioSolicitante,
        dpautStat: 1,
      });

      await queryRunner.manager.save(Dpaut, dpaut);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Solicitud de desembolso registrada correctamente.',
        ndes: nroDesembolso,
        cantidad: transacciones.length,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en solicitudDesembolso:', error);
      return {
        success: false,
        message: 'Error interno al procesar la solicitud de desembolso.',
      };
    } finally {
      await queryRunner.release();
    }
  }

  async actualizarEstadoAutorizacion(
    numeroDesembolso: number,
    usuarioAutorizador: string,
    nuevoEstado: number, // 2: aprobado, 3: rechazado
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar y actualizar dpaut
      const dpautRepo = queryRunner.manager.getRepository(Dpaut);
      const dpaut = await dpautRepo.findOneBy({ dpautNdes: numeroDesembolso });

      if (!dpaut) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: `No se encontró registro de autorización para el desembolso ${numeroDesembolso}.`,
        };
      }

      dpaut.dpautUsra = usuarioAutorizador;
      dpaut.dpautFaut = new Date();
      dpaut.dpautStat = 2; // Siempre marcar como "procesado"

      await dpautRepo.save(dpaut);

      // Actualizar dpdes con el estado recibido
      const dpdesRepo = queryRunner.manager.getRepository(Dpdes);
      const dpdes = await dpdesRepo.findOneBy({ dpdesndes: numeroDesembolso });

      if (!dpdes) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: `No se encontró registro de desembolso con número ${numeroDesembolso}.`,
        };
      }

      dpdes.dpdesstat = nuevoEstado; // 2: aprobado, 3: rechazado
      await dpdesRepo.save(dpdes);

      //Actualizar dptrn asociados a este desembolso
      const dptrnRepo = queryRunner.manager.getRepository(Dptrn);
      const transacciones = await dptrnRepo.find({
        where: { dptrnndes: numeroDesembolso },
      });

      for (const trn of transacciones) {
        if (nuevoEstado === 2) {
          // ✅ Aprobado → solo cambiar el estado
          trn.dptrnstat = 3;
        } else if (nuevoEstado === 3) {
          // ❌ Rechazado → volver a estado activo y limpiar vínculo
          trn.dptrnstat = 1;
          trn.dptrnndes = 0;
        }

        await dptrnRepo.save(trn);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message:
          nuevoEstado === 2
            ? 'Solicitud de desembolso autorizada correctamente.'
            : 'Solicitud de desembolso rechazada correctamente.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en actualizarEstadoAutorizacion:', error);
      return {
        success: false,
        message: 'Error interno al actualizar la autorización.',
      };
    } finally {
      await queryRunner.release();
    }
  }

  async realizarRecoleccion(
    numeroDesembolso: number,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dptrnRepo = queryRunner.manager.getRepository(Dptrn);

      const transacciones = await dptrnRepo.find({
        where: { dptrnndes: numeroDesembolso },
      });

      if (transacciones.length === 0) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: `No se encontraron transacciones para el desembolso ${numeroDesembolso}.`,
        };
      }

      for (const trn of transacciones) {
        trn.dptrnstat = 4; // estado 4 = recolectado
        await dptrnRepo.save(trn);
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: `Recolección registrada correctamente para el desembolso ${numeroDesembolso}.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en realizarRecoleccion:', error);
      return {
        success: false,
        message: 'Error interno al registrar la recolección.',
      };
    } finally {
      await queryRunner.release();
    }
  }

  async listarTransaccionesActivas(): Promise<Dptrn[]> {
    return this.dataSource.getRepository(Dptrn).find({
      where: { dptrnstat: 1 },
      order: { dptrnntra: 'DESC' }, // Opcional: orden por número de transacción descendente
    });
  }
  async listarPorEstado(stat: number): Promise<Dptrn[]> {
    return this.dataSource.getRepository(Dptrn).find({
      where: { dptrnstat: stat },
      order: { dptrnntra: 'DESC' },
    });
  }
  async listarPorFiltros(
    fechaInicio: Date,
    fechaFinal: Date,
    estado: number,
  ): Promise<Dptrn[]> {
    const repo = this.dataSource.getRepository(Dptrn);

    const where: any = {
      dptrnftra: Between(fechaInicio, fechaFinal),
    };

    if (estado !== 0) {
      where.dptrnstat = estado;
    }

    return repo.find({
      where,
      order: { dptrnntra: 'DESC' },
    });
  }
}

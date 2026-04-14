// src/transaccion/transaccion.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource, In, QueryRunner } from 'typeorm';
import { RegistrarTransaccionDto } from './transaccion.interface';
import { Dptrn } from './dptrn.entity';
import { Dptrd } from './dptrd.entity';
import { Dpaut } from 'src/autorizacion/dpaut.entity';
import { Dpsrl } from 'src/serial/dpsrl.entity';
import { Dpdes } from 'src/desembolso/desembolso.entity';

@Injectable()
export class TransaccionService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private logDbError(context: string, error: any): void {
    console.error(`[${context}] Error:`, error?.message || error);
    if (error?.code) console.error(`[${context}] Code:`, error.code);
    if (error?.number) console.error(`[${context}] Number:`, error.number);
    if (error?.state) console.error(`[${context}] State:`, error.state);
    if (error?.lineNumber)
      console.error(`[${context}] Line:`, error.lineNumber);
    if (error?.detail) console.error(`[${context}] Detail:`, error.detail);
    if (error?.query) console.error(`[${context}] Query:`, error.query);
    if (error?.parameters)
      console.error(`[${context}] Parameters:`, error.parameters);
    if (error?.originalError)
      console.error(`[${context}] OriginalError:`, error.originalError);
  }

  private async rollbackSafely(
    queryRunner: QueryRunner,
    context: string,
  ): Promise<void> {
    if (!queryRunner.isTransactionActive) {
      console.warn(`[${context}] Rollback omitido: transaccion no activa.`);
      return;
    }

    try {
      await queryRunner.rollbackTransaction();
      console.warn(`[${context}] Rollback ejecutado.`);
    } catch (rollbackError) {
      this.logDbError(`${context} - rollback`, rollbackError);
    }
  }

  private async construirDetalleBoucherRecolecta(
    queryRunner: QueryRunner,
    ntras: number[],
  ): Promise<{
    detalle: { valor: number; piezas: number; importe: number }[];
    totalPiezas: number;
  }> {
    if (!ntras.length) {
      return { detalle: [], totalPiezas: 0 };
    }

    const detalleRows = await queryRunner.manager.find(Dptrd, {
      where: { dptrdntra: In(ntras) },
    });

    const agrupado = new Map<number, { piezas: number; importe: number }>();
    for (const d of detalleRows) {
      const valor = Number(d.dptrdvlor || 0);
      const piezas = Number(d.dptrdcant || 0);
      const importe = Number(d.dptrdimpo || 0);
      const prev = agrupado.get(valor) || { piezas: 0, importe: 0 };
      prev.piezas += piezas;
      prev.importe += importe;
      agrupado.set(valor, prev);
    }

    const detalle = Array.from(agrupado.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([valor, data]) => ({
        valor,
        piezas: data.piezas,
        importe: data.importe,
      }));

    const totalPiezas = detalle.reduce((acc, d) => acc + d.piezas, 0);
    return { detalle, totalPiezas };
  }

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
      dptrn.dptrndisp = dto.dispositivo;

      const trnInsert = await queryRunner.manager.save(Dptrn, dptrn);
      let item = 1;
      for (const det of dto.detalle.filter((d) => d.gbcucycant > 0)) {
        const dptrd = new Dptrd();
        dptrd.dptrdntra = trnInsert.dptrnntra;
        dptrd.dptrnitem = item++;
        dptrd.dptrdvlor = det.gbcucyvlor;
        dptrd.dptrdcant = det.gbcucycant;
        dptrd.dptrdimpo = det.gbcucyvlor * det.gbcucycant;
        await queryRunner.manager.save(Dptrd, dptrd);
      }

      await queryRunner.commitTransaction();
      return { success: true, ntra: trnInsert.dptrnntra };
    } catch (error) {
      console.error('Error durante transaccion:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error al registrar la transaccion',
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
    detalle?: { valor: number; piezas: number; importe: number }[];
    totalPiezas?: number;
    totalImporte?: number;
    moneda?: number;
    dispositivo?: number;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(
      `[solicitudDesembolso] Inicio - usuario=${usuarioSolicitante}, dispositivo=${dispositivo}`,
    );

    try {
      // Paso 1: Obtener numero de desembolso (serial)
      const serialRepo = queryRunner.manager.getRepository(Dpsrl);
      let serialRecolecta = await serialRepo.findOne({
        where: { dpsrlTbla: 'recolecta' },
      });

      if (serialRecolecta) {
        serialRecolecta.dpsrlSeri = Number(serialRecolecta.dpsrlSeri || 0) + 1;
      } else {
        serialRecolecta = serialRepo.create({
          dpsrlTbla: 'recolecta',
          dpsrlSeri: 1,
        });
      }

      serialRecolecta = await serialRepo.save(serialRecolecta);
      const nroDesembolso = serialRecolecta.dpsrlSeri;
      console.log(
        `[solicitudDesembolso] Serial asignado - nroDesembolso=${nroDesembolso}`,
      );

      // Paso 2: Obtener transacciones activas del dispositivo seleccionado
      const transacciones = await queryRunner.manager.find(Dptrn, {
        where: { dptrnstat: 1, dptrnmrcb: 0, dptrndisp: dispositivo },
      });
      console.log(
        `[solicitudDesembolso] Transacciones activas encontradas=${transacciones.length}`,
      );

      if (transacciones.length === 0) {
        await this.rollbackSafely(
          queryRunner,
          'solicitudDesembolso - sin transacciones',
        );
        return {
          success: false,
          message:
            'No hay transacciones activas para el dispositivo seleccionado.',
        };
      }

      // Paso 3: Calcular importe total
      const importeTotal = transacciones.reduce(
        (acc, trx) => acc + Number(trx.dptrnimpo || 0),
        0,
      );

      const ntras = transacciones.map((t) => t.dptrnntra);
      const { detalle, totalPiezas } =
        await this.construirDetalleBoucherRecolecta(queryRunner, ntras);

      // Paso 4: Crear registro en tabla dpdes
      const dpdes = queryRunner.manager.create(Dpdes, {
        dpdesndes: nroDesembolso,
        dpdesfsol: new Date(),
        dpdesstat: 1,
        dpdesimpt: importeTotal,
        dpdesusrs: usuarioSolicitante,
        dpdesdisp: dispositivo,
        dpdesmrcb: 0,
      });
      await queryRunner.manager.save(Dpdes, dpdes);
      console.log(
        `[solicitudDesembolso] Registro creado en dpdes - ndes=${nroDesembolso}`,
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
      console.log(
        `[solicitudDesembolso] Registro creado en dpaut - ndes=${nroDesembolso}`,
      );

      await queryRunner.commitTransaction();
      console.log(
        `[solicitudDesembolso] Commit exitoso - ndes=${nroDesembolso}, total=${importeTotal}`,
      );

      return {
        success: true,
        message: 'Solicitud de desembolso registrada correctamente.',
        ndes: nroDesembolso,
        cantidad: transacciones.length,
        detalle,
        totalPiezas,
        totalImporte: importeTotal,
        moneda: transacciones[0]?.dptrncmon,
        dispositivo,
      };
    } catch (error) {
      this.logDbError('solicitudDesembolso - error original', error);
      await this.rollbackSafely(queryRunner, 'solicitudDesembolso');
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
    nuevoEstado: number,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dpautRepo = queryRunner.manager.getRepository(Dpaut);
      const dpaut = await dpautRepo.findOneBy({ dpautNdes: numeroDesembolso });

      if (!dpaut) {
        await this.rollbackSafely(
          queryRunner,
          'actualizarEstadoAutorizacion - sin dpaut',
        );
        return {
          success: false,
          message: `No se encontro registro de autorizacion para el desembolso ${numeroDesembolso}.`,
        };
      }

      dpaut.dpautUsra = usuarioAutorizador;
      dpaut.dpautFaut = new Date();
      dpaut.dpautStat = 2;
      await dpautRepo.save(dpaut);

      const dpdesRepo = queryRunner.manager.getRepository(Dpdes);
      const dpdes = await dpdesRepo.findOneBy({ dpdesndes: numeroDesembolso });

      if (!dpdes) {
        await this.rollbackSafely(
          queryRunner,
          'actualizarEstadoAutorizacion - sin dpdes',
        );
        return {
          success: false,
          message: `No se encontro registro de desembolso con numero ${numeroDesembolso}.`,
        };
      }

      dpdes.dpdesstat = nuevoEstado;
      await dpdesRepo.save(dpdes);

      const dptrnRepo = queryRunner.manager.getRepository(Dptrn);
      const transacciones = await dptrnRepo.find({
        where: { dptrnndes: numeroDesembolso, dptrnmrcb: 0 },
      });

      for (const trn of transacciones) {
        if (nuevoEstado === 2) {
          trn.dptrnstat = 3;
        } else if (nuevoEstado === 3) {
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
      this.logDbError('actualizarEstadoAutorizacion - error original', error);
      await this.rollbackSafely(queryRunner, 'actualizarEstadoAutorizacion');
      console.error('Error en actualizarEstadoAutorizacion:', error);
      return {
        success: false,
        message: 'Error interno al actualizar la autorizacion.',
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
        where: { dptrnndes: numeroDesembolso, dptrnmrcb: 0 },
      });

      if (transacciones.length === 0) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: `No se encontraron transacciones para el desembolso ${numeroDesembolso}.`,
        };
      }

      for (const trn of transacciones) {
        trn.dptrnstat = 4;
        await dptrnRepo.save(trn);
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: `Recoleccion registrada correctamente para el desembolso ${numeroDesembolso}.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en realizarRecoleccion:', error);
      return {
        success: false,
        message: 'Error interno al registrar la recoleccion.',
      };
    } finally {
      await queryRunner.release();
    }
  }

  async listarTransaccionesActivas(): Promise<Dptrn[]> {
    return this.dataSource.getRepository(Dptrn).find({
      where: { dptrnstat: 1, dptrnmrcb: 0 },
      order: { dptrnntra: 'DESC' },
    });
  }

  async listarPorEstado(stat: number, dispositivo?: number): Promise<Dptrn[]> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('dptrn.dptrnntra', 'dptrnntra')
      .addSelect('dptrn.dptrnndes', 'dptrnndes')
      .addSelect('dptrn.dptrncmon', 'dptrncmon')
      .addSelect('dptrn.dptrnftra', 'dptrnftra')
      .addSelect('dptrn.dptrnimpo', 'dptrnimpo')
      .addSelect('dptrn.dptrnmrcb', 'dptrnmrcb')
      .addSelect('dptrn.dptrnstat', 'dptrnstat')
      .addSelect('dptrn.dptrnfreg', 'dptrnfreg')
      .addSelect('dptrn.dptrnusrn', 'dptrnusrn')
      .addSelect('adusr.adusrnick', 'dptrnusrnick')
      .addSelect('dptrn.dptrndisp', 'dptrndisp')
      .from('dptrn', 'dptrn')
      .leftJoin('aduser', 'adusr', 'adusr.adusrusrn = dptrn.dptrnusrn')
      .where('dptrn.dptrnstat = :stat', { stat })
      .andWhere('dptrn.dptrnmrcb = 0');

    if (dispositivo !== undefined) {
      qb.andWhere('dptrn.dptrndisp = :dispositivo', { dispositivo });
    }

    const rows = await qb.orderBy('dptrn.dptrnntra', 'DESC').getRawMany();
    return rows.map((r) => ({
      dptrnntra: Number(r.dptrnntra),
      dptrnndes: Number(r.dptrnndes || 0),
      dptrncmon: Number(r.dptrncmon || 0),
      dptrnftra: r.dptrnftra,
      dptrnimpo: Number(r.dptrnimpo || 0),
      dptrnmrcb: Number(r.dptrnmrcb || 0),
      dptrnstat: Number(r.dptrnstat || 0),
      dptrnfreg: r.dptrnfreg,
      dptrnusrn: r.dptrnusrn,
      dptrnusrnick: r.dptrnusrnick || r.dptrnusrn,
      dptrndisp: Number(r.dptrndisp || 0),
    })) as Dptrn[];
  }

  async listarPorFiltros(
    fechaInicio: Date,
    fechaFinal: Date,
    estado: number,
  ): Promise<Dptrn[]> {
    const repo = this.dataSource.getRepository(Dptrn);

    const where: any = {
      dptrnftra: Between(fechaInicio, fechaFinal),
      dptrnmrcb: 0,
    };

    if (estado !== 0) {
      where.dptrnstat = estado;
    }

    return repo.find({
      where,
      order: { dptrnntra: 'DESC' },
    });
  }

  async obtenerMonitorCortesBoveda(dispositivo?: number): Promise<{
    limite: number | null;
    items: { dispositivo: number; cantidad: number }[];
  }> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('dptrn.dptrndisp', 'dispositivo')
      .addSelect('COALESCE(SUM(dptrd.dptrdcant),0)', 'cantidad')
      .from('dptrn', 'dptrn')
      .innerJoin('dptrd', 'dptrd', 'dptrd.dptrdntra = dptrn.dptrnntra')
      .where('dptrn.dptrnstat = :estado', { estado: 1 })
      .andWhere('dptrn.dptrnmrcb = 0');

    if (dispositivo !== undefined && Number.isFinite(dispositivo)) {
      qb.andWhere('dptrn.dptrndisp = :dispositivo', { dispositivo });
    }

    const rows = await qb.groupBy('dptrn.dptrndisp').getRawMany();

    const limiteRaw = await this.dataSource
      .createQueryBuilder()
      .select('gbcon.gbconabre', 'limite')
      .from('gbcon', 'gbcon')
      .where('gbcon.gbconpref = :pref', { pref: 1 })
      .andWhere('gbcon.gbconcorr = :corr', { corr: 101 })
      .andWhere('gbcon.gbconmrcb = 0')
      .orderBy('gbcon.gbcongnid', 'DESC')
      .getRawOne();

    const limiteNumero = limiteRaw?.limite !== undefined ? Number(limiteRaw.limite) : NaN;
    const limite = Number.isFinite(limiteNumero) && limiteNumero > 0 ? limiteNumero : null;

    return {
      limite,
      items: (rows || []).map((r: any) => ({
        dispositivo: Number(r.dispositivo || 0),
        cantidad: Number(r.cantidad || 0),
      })),
    };
  }

  async descartarTransaccion(
    ntra: number,
    _usuario?: string,
    motivo?: string,
  ): Promise<{ success: boolean; message: string }> {
    const repo = this.dataSource.getRepository(Dptrn);
    const trx = await repo.findOneBy({ dptrnntra: ntra });

    if (!trx) {
      return { success: false, message: 'Transaccion no encontrada' };
    }

    trx.dptrnmrcb = 9;
    await repo.save(trx);

    return {
      success: true,
      message: `Transaccion ${ntra} descartada (mrcb=9)${motivo ? ` - ${motivo}` : ''}`,
    };
  }
}

import { DataSource } from 'typeorm';

export function Transactional() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
  //   const originalMethod = descriptor.value;

  //   descriptor.value = async function (...args: any[]) {
  //     const dataSource: DataSource = this.dataSource;
  //     const queryRunner = dataSource.createQueryRunner();

  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();

  //     try {
  //       const result = await originalMethod.apply(this, args);
  //       await queryRunner.commitTransaction();
  //       return result;
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       throw error;
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   };

    return descriptor;
  };
}

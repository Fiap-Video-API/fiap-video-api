import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VideoEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string | null;

  @Column({ length: 20 })
  status: string;
  
  @Column({ length: 50 })
  pathVideo: string;

  @Column({ length: 50 })
  pathZip: string;

}